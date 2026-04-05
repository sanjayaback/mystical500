#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { spawnSync } = require('child_process');
const { readSiteConfig, writeSiteConfig } = require('./lib/site-config');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const TOOLS_DIR = path.join(DATA, 'tools');
const ADMIN_DIR = path.join(ROOT, 'admin');
const PORT = Number(process.env.PORT || 8000);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

// Authentication configuration
const ADMIN_CONFIG = {
  username: 'admin',
  // Default password: admin123 (should be changed in production)
  passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // SHA256 of 'admin123'
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
};

const sessions = new Map(); // Store active sessions

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function loadCategories() {
  return readJson(path.join(DATA, 'categories.json')).categories;
}

function saveCategories(categories) {
  writeJson(path.join(DATA, 'categories.json'), { categories });
}

function getToolFile(categoryId) {
  return path.join(TOOLS_DIR, `${categoryId}.json`);
}

function loadTools(categoryId) {
  const file = getToolFile(categoryId);
  if (!fs.existsSync(file)) return [];
  return readJson(file);
}

function saveTools(categoryId, tools) {
  writeJson(getToolFile(categoryId), tools);
}

function getToolIndex() {
  return loadCategories().map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    tools: loadTools(category.id).map((tool) => ({
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
    })),
  }));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 5 * 1024 * 1024) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function normalizeLinks(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      label: String(item.label || '').trim(),
      href: String(item.href || '').trim(),
    }))
    .filter((item) => item.label && item.href);
}

function normalizeFaqs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      q: String(item.q || '').trim(),
      a: String(item.a || '').trim(),
    }))
    .filter((item) => item.q && item.a);
}

// Authentication helper functions
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function validateSession(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies.sessionId;
  
  if (!sessionId || !sessions.has(sessionId)) {
    return false;
  }
  
  const session = sessions.get(sessionId);
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return false;
  }
  
  // Extend session timeout
  session.expiresAt = Date.now() + ADMIN_CONFIG.sessionTimeout;
  return true;
}

function createSession() {
  const sessionId = generateSessionToken();
  const expiresAt = Date.now() + ADMIN_CONFIG.sessionTimeout;
  
  sessions.set(sessionId, {
    sessionId,
    createdAt: Date.now(),
    expiresAt,
  });
  
  return sessionId;
}

function destroySession(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies.sessionId;
  if (sessionId) {
    sessions.delete(sessionId);
  }
}

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = {};
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = value;
    }
  });
  
  return cookies;
}

function normalizeTool(input, categoryId) {
  const tool = { ...(input || {}) };
  tool.id = String(tool.id || tool.slug || '').trim();
  tool.slug = String(tool.slug || tool.id || '').trim();
  tool.name = String(tool.name || '').trim();
  tool.tagline = String(tool.tagline || '').trim();
  tool.description = String(tool.description || '').trim();
  tool.category = categoryId;
  tool.seoTitle = String(tool.seoTitle || '').trim();
  tool.metaDescription = String(tool.metaDescription || '').trim();
  tool.imageUrl = String(tool.imageUrl || '').trim();
  tool.canonicalUrl = String(tool.canonicalUrl || '').trim();
  tool.keywords = Array.isArray(tool.keywords)
    ? tool.keywords.map((item) => String(item).trim()).filter(Boolean)
    : [];
  tool.relatedTools = Array.isArray(tool.relatedTools)
    ? tool.relatedTools.map((item) => String(item).trim()).filter(Boolean)
    : [];
  tool.externalLinks = normalizeLinks(tool.externalLinks);
  tool.faqs = normalizeFaqs(tool.faqs);
  tool.priority = Number.isFinite(Number(tool.priority)) ? Number(tool.priority) : 0.7;
  tool.monthlySearches = Number.isFinite(Number(tool.monthlySearches)) ? Number(tool.monthlySearches) : 0;
  tool.evergreen = Boolean(tool.evergreen);
  return tool;
}

function serveFile(res, baseDir, pathname) {
  const relativePath = pathname === '/' ? '/index.html' : pathname;
  const target = path.resolve(baseDir, `.${relativePath}`);
  const normalizedBase = path.resolve(baseDir);

  if (!target.startsWith(normalizedBase)) {
    sendError(res, 403, 'Forbidden');
    return;
  }

  let filePath = target;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    sendError(res, 404, 'Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res, requestUrl) {
  // Authentication endpoints
  if (req.method === 'POST' && requestUrl.pathname === '/api/login') {
    const body = await readBody(req);
    const { username, password } = body;
    
    console.log('Login attempt:', { username, passwordLength: password?.length });
    console.log('Expected username:', ADMIN_CONFIG.username);
    console.log('Password hash check:', hashPassword(password), '===', ADMIN_CONFIG.passwordHash);
    
    if (username === ADMIN_CONFIG.username && 
        hashPassword(password) === ADMIN_CONFIG.passwordHash) {
      const sessionId = createSession();
      console.log('Login successful, session ID:', sessionId);
      res.writeHead(200, { 
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=${ADMIN_CONFIG.sessionTimeout / 1000}`
      });
      res.end(JSON.stringify({ success: true, message: 'Login successful' }));
    } else {
      console.log('Login failed for username:', username);
      sendError(res, 401, 'Invalid username or password');
    }
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/logout') {
    destroySession(req);
    res.writeHead(200, { 
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0'
    });
    res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/check-auth') {
    const isAuthenticated = validateSession(req);
    sendJson(res, 200, { authenticated: isAuthenticated });
    return;
  }

  // Protect all other API endpoints
  if (!validateSession(req)) {
    sendError(res, 401, 'Authentication required');
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/bootstrap') {
    sendJson(res, 200, {
      site: readSiteConfig(ROOT),
      categories: loadCategories(),
      toolIndex: getToolIndex(),
    });
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/site') {
    sendJson(res, 200, readSiteConfig(ROOT));
    return;
  }

  if (req.method === 'PUT' && requestUrl.pathname === '/api/site') {
    const body = await readBody(req);
    console.log('Saving site config:', JSON.stringify(body, null, 2));
    
    try {
      const saved = writeSiteConfig(ROOT, body);
      console.log('Site config saved successfully');
      sendJson(res, 200, { ok: true, site: saved });
    } catch (error) {
      console.error('Error saving site config:', error);
      sendError(res, 500, 'Failed to save site configuration: ' + error.message);
    }
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/categories') {
    sendJson(res, 200, loadCategories());
    return;
  }

  if (req.method === 'PUT' && requestUrl.pathname === '/api/categories') {
    const body = await readBody(req);
    if (!Array.isArray(body.categories)) {
      sendError(res, 400, 'Expected a categories array.');
      return;
    }
    saveCategories(body.categories);
    sendJson(res, 200, { ok: true, categories: body.categories, toolIndex: getToolIndex() });
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/tools') {
    const category = requestUrl.searchParams.get('category');
    if (!category) {
      sendError(res, 400, 'Missing category.');
      return;
    }
    sendJson(res, 200, loadTools(category));
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/tool') {
    const category = requestUrl.searchParams.get('category');
    const slug = requestUrl.searchParams.get('slug');
    if (!category || !slug) {
      sendError(res, 400, 'Missing category or slug.');
      return;
    }
    const tool = loadTools(category).find((item) => item.slug === slug);
    if (!tool) {
      sendError(res, 404, 'Tool not found.');
      return;
    }
    sendJson(res, 200, tool);
    return;
  }

  if (req.method === 'PUT' && requestUrl.pathname === '/api/tool') {
    const category = requestUrl.searchParams.get('category');
    const slug = requestUrl.searchParams.get('slug');
    if (!category || !slug) {
      sendError(res, 400, 'Missing category or slug.');
      return;
    }

    const body = await readBody(req);
    const tools = loadTools(category);
    const index = tools.findIndex((item) => item.slug === slug);
    if (index === -1) {
      sendError(res, 404, 'Tool not found.');
      return;
    }

    const next = normalizeTool({ ...tools[index], ...(body.tool || {}) }, category);
    if (!next.slug || !next.name) {
      sendError(res, 400, 'Tool name and slug are required.');
      return;
    }

    const duplicate = tools.find((item, toolIndex) => toolIndex !== index && item.slug === next.slug);
    if (duplicate) {
      sendError(res, 409, 'Another tool already uses that slug in this category.');
      return;
    }

    tools[index] = next;
    saveTools(category, tools);
    sendJson(res, 200, { ok: true, tool: next, toolIndex: getToolIndex() });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/tool') {
    const body = await readBody(req);
    const category = String(body.category || '').trim();
    if (!category) {
      sendError(res, 400, 'Missing category.');
      return;
    }

    const tools = loadTools(category);
    const next = normalizeTool(body.tool || {}, category);
    if (!next.slug || !next.name) {
      sendError(res, 400, 'Tool name and slug are required.');
      return;
    }
    if (tools.some((item) => item.slug === next.slug)) {
      sendError(res, 409, 'Another tool already uses that slug in this category.');
      return;
    }

    tools.push(next);
    saveTools(category, tools);
    sendJson(res, 201, { ok: true, tool: next, toolIndex: getToolIndex() });
    return;
  }

  if (req.method === 'DELETE' && requestUrl.pathname === '/api/tool') {
    const category = requestUrl.searchParams.get('category');
    const slug = requestUrl.searchParams.get('slug');
    if (!category || !slug) {
      sendError(res, 400, 'Missing category or slug.');
      return;
    }

    const tools = loadTools(category);
    const nextTools = tools.filter((item) => item.slug !== slug);
    if (nextTools.length === tools.length) {
      sendError(res, 404, 'Tool not found.');
      return;
    }

    saveTools(category, nextTools);
    sendJson(res, 200, { ok: true, toolIndex: getToolIndex() });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/build') {
    const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.js')], {
      cwd: ROOT,
      encoding: 'utf8',
    });

    sendJson(res, 200, {
      ok: result.status === 0,
      status: result.status,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
    });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/reorder-tools') {
    const body = await readBody(req);
    const { category, toolIds } = body;
    
    if (!category || !Array.isArray(toolIds)) {
      sendError(res, 400, 'Category and toolIds array are required.');
      return;
    }

    const tools = loadTools(category);
    const reorderedTools = [];
    
    // Reorder tools based on the provided order
    toolIds.forEach(id => {
      const tool = tools.find(t => t.id === id);
      if (tool) {
        reorderedTools.push(tool);
      }
    });
    
    // Add any tools that weren't in the reorder list
    tools.forEach(tool => {
      if (!toolIds.includes(tool.id)) {
        reorderedTools.push(tool);
      }
    });

    saveTools(category, reorderedTools);
    sendJson(res, 200, { ok: true, tools: reorderedTools, toolIndex: getToolIndex() });
    return;
  }

  sendError(res, 404, 'API route not found.');
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);

    // Serve login page without authentication
    if (requestUrl.pathname === '/admin/login' || requestUrl.pathname === '/admin/login/') {
      serveFile(res, ADMIN_DIR, '/login.html');
      return;
    }

    // Serve login assets without authentication
    if (requestUrl.pathname.startsWith('/admin/login-')) {
      serveFile(res, ADMIN_DIR, requestUrl.pathname.replace('/admin', '') || '/login.html');
      return;
    }

    // API endpoints
    if (requestUrl.pathname.startsWith('/api/')) {
      await handleApi(req, res, requestUrl);
      return;
    }

    // Protect admin pages
    if (requestUrl.pathname === '/admin' || requestUrl.pathname === '/admin/' || 
        requestUrl.pathname.startsWith('/admin/')) {
      
      if (!validateSession(req)) {
        // Redirect to login page
        res.writeHead(302, { 'Location': '/admin/login' });
        res.end();
        return;
      }

      if (requestUrl.pathname === '/admin' || requestUrl.pathname === '/admin/') {
        serveFile(res, ADMIN_DIR, '/index.html');
        return;
      }

      serveFile(res, ADMIN_DIR, requestUrl.pathname.replace('/admin', '') || '/index.html');
      return;
    }

    serveFile(res, ROOT, requestUrl.pathname);
  } catch (error) {
    sendError(res, 500, error.message || 'Unexpected server error.');
  }
});

server.listen(PORT, () => {
  console.log(`MysticTools admin is running on http://localhost:${PORT}/admin/`);
  console.log(`Site preview is available at http://localhost:${PORT}/`);
});
