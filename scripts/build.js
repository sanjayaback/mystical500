#!/usr/bin/env node
/**
 * MysticTools Build Script
 * Generates all 498 tool pages, category indexes, sitemap, robots.txt
 */
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mystictools.com'; // ← CHANGE TO YOUR DOMAIN
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT  = ROOT; // output to project root for GitHub Pages

// ── READ CATEGORIES ──────────────────────────────
const { categories } = JSON.parse(fs.readFileSync(path.join(DATA, 'categories.json'), 'utf8'));
const TOOL_TEMPLATE  = fs.readFileSync(path.join(ROOT, 'templates', 'tool.html'), 'utf8');

// ── HELPERS ──────────────────────────────────────
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function loadTools(catId) {
  const file = path.join(DATA, 'tools', `${catId}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function faqsHtml(faqs) {
  return faqs.map(f => `
  <div class="faq-item">
    <button class="faq-question" aria-expanded="false">${escHtml(f.q)}</button>
    <div class="faq-answer" hidden><p>${escHtml(f.a)}</p></div>
  </div>`).join('');
}

function faqsSchema(faqs) {
  return JSON.stringify(faqs.map(f => ({
    '@type': 'Question',
    'name': f.q,
    'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
  })));
}

function relatedHtml(relatedIds, allToolMap) {
  return relatedIds.slice(0, 6).map(id => {
    const t = allToolMap[id];
    if (!t) return '';
    return `<li><a href="/${t.category}/${t.slug}/">${t.name}</a></li>`;
  }).join('');
}

function catToolsHtml(tools, currentSlug, catSlug) {
  return tools.slice(0, 8).filter(t => t.slug !== currentSlug).slice(0, 6).map(t =>
    `<li><a href="/${catSlug}/${t.slug}/">${t.name}</a></li>`
  ).join('');
}

function howToUse(tool, catName) {
  return `<ol>
    <li>Enter your details in the ${tool.name} tool above.</li>
    <li>Click the calculate or submit button to get your instant result.</li>
    <li>Read your personalized ${catName.toLowerCase()} reading carefully.</li>
    <li>Use the results for guidance, reflection and self-discovery.</li>
  </ol>
  <p>The ${tool.name} is completely free and works entirely in your browser — no data is ever sent to a server.</p>`;
}

function aboutContent(tool, cat) {
  return `<p>The <strong>${tool.name}</strong> is a free online tool that ${tool.description}. It is part of our collection of ${cat.name.toLowerCase()} designed to help you gain deeper insight into yourself and the world around you.</p>
  <p>${tool.tagline}. This tool uses traditional ${cat.name.toLowerCase().replace(' tools','')} methods and calculations to provide accurate, meaningful readings.</p>
  <p>Whether you are new to ${cat.id} or an experienced practitioner, this tool offers valuable guidance for reflection, decision-making and personal growth.</p>
  <p>All calculations happen instantly in your browser. We never store your personal data or require account creation.</p>`;
}

function useCases(tool, catName) {
  const cases = [
    `Personal daily guidance and reflection`,
    `Understanding yourself and your natural tendencies`,
    `Exploring ${catName.toLowerCase()} traditions and their meaning`,
    `Sharing insights with friends and family`,
    `Decision-making support and clarity`,
    `Self-discovery and spiritual growth`,
  ];
  return `<ul>${cases.map(c => `<li>${c}</li>`).join('')}</ul>
  <p>The ${tool.name} is used by thousands of people around the world each day for personal insight, entertainment and spiritual exploration.</p>`;
}

// ── BUILD ALL TOOLS ───────────────────────────────
let totalBuilt = 0;
let sitemapUrls = [`  <url><loc>${BASE_URL}/</loc><priority>1.0</priority><changefreq>weekly</changefreq></url>`];
const allToolMap = {};

// Build global tool map first
categories.forEach(cat => {
  const tools = loadTools(cat.id);
  tools.forEach(t => { allToolMap[t.id] = { ...t, category: cat.id }; });
});

console.log(`\n🔨 Building MysticTools — ${Object.keys(allToolMap).length} tools\n`);

categories.forEach(cat => {
  const tools = loadTools(cat.id);
  if (!tools.length) return;

  const catDir = path.join(OUT, cat.slug);
  ensureDir(catDir);

  // ── BUILD EACH TOOL PAGE ──
  tools.forEach(tool => {
    const toolDir = path.join(catDir, tool.slug);
    ensureDir(toolDir);

    const faqs = tool.faqs || [
      { q: `Is the ${tool.name} free?`, a: `Yes — completely free. No signup or account needed.` },
      { q: `How accurate is this tool?`, a: `This tool uses traditional ${cat.name.toLowerCase().replace(' tools','')} methods for its calculations.` },
      { q: `Can I use this on my phone?`, a: `Yes, the ${tool.name} works perfectly on all devices including phones and tablets.` },
    ];

    const title = `${tool.name} — Free Online Tool | MysticTools`;
    const metaDesc = tool.description.slice(0, 160);

    let html = TOOL_TEMPLATE
      .replaceAll('{{BASE_URL}}', BASE_URL)
      .replaceAll('{{TOOL_SLUG}}', tool.slug)
      .replaceAll('{{TOOL_NAME}}', tool.name)
      .replaceAll('{{TOOL_TITLE}}', title)
      .replaceAll('{{TOOL_TAGLINE}}', tool.tagline)
      .replaceAll('{{TOOL_META_DESC}}', metaDesc)
      .replaceAll('{{TOOL_KEYWORDS}}', (tool.keywords || []).join(', '))
      .replaceAll('{{CATEGORY_SLUG}}', cat.slug)
      .replaceAll('{{CATEGORY_NAME}}', cat.name)
      .replaceAll('{{CATEGORY_ICON}}', cat.icon)
      .replaceAll('{{TOOL_FAQS_HTML}}', faqsHtml(faqs))
      .replaceAll('{{TOOL_FAQS_SCHEMA}}', faqsSchema(faqs))
      .replaceAll('{{RELATED_TOOLS_HTML}}', relatedHtml(tool.relatedTools || [], allToolMap))
      .replaceAll('{{CATEGORY_TOOLS_HTML}}', catToolsHtml(tools, tool.slug, cat.slug))
      .replaceAll('{{HOW_TO_USE}}', howToUse(tool, cat.name))
      .replaceAll('{{ABOUT_CONTENT}}', aboutContent(tool, cat))
      .replaceAll('{{USE_CASES}}', useCases(tool, cat.name));

    fs.writeFileSync(path.join(toolDir, 'index.html'), html);
    totalBuilt++;

    const priority = tool.priority || 0.7;
    sitemapUrls.push(`  <url><loc>${BASE_URL}/${cat.slug}/${tool.slug}/</loc><priority>${priority}</priority><changefreq>monthly</changefreq></url>`);

    if (totalBuilt % 50 === 0) process.stdout.write(`  ✓ ${totalBuilt} pages...\n`);
  });

  // ── BUILD CATEGORY INDEX ──
  const catHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${cat.name} — Free Online Tools | MysticTools</title>
<meta name="description" content="${cat.description}">
<link rel="canonical" href="${BASE_URL}/${cat.slug}/">
<link rel="stylesheet" href="/assets/css/styles.css">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"${cat.name}","url":"${BASE_URL}/${cat.slug}/","description":"${cat.description}"}</script>
</head>
<body>
<header class="site-header"><div class="header-inner"><a href="/" class="logo">✨ MysticTools</a><nav class="main-nav"><a href="/astrology/">⭐ Astrology</a><a href="/numerology/">🔢 Numerology</a><a href="/love/">💕 Love</a><a href="/lucky/">🍀 Lucky</a><a href="/birthday/">🎂 Birthday</a><a href="/tarot/">🃏 Tarot</a></nav><button class="menu-toggle" aria-label="Toggle menu">☰</button></div></header>
<div style="max-width:1200px;margin:0 auto;padding:1.5rem 1.25rem">
<div class="cat-hero"><div class="cat-icon">${cat.icon}</div><h1>${cat.name}</h1><p>${cat.description}</p></div>
<div class="tools-grid">
${tools.map(t => `<a href="/${cat.slug}/${t.slug}/" class="tool-card"><div class="card-badge">${cat.icon} ${cat.name.replace(' Tools','')}</div><div class="card-name">${t.name}</div><div class="card-desc">${t.tagline}</div></a>`).join('\n')}
</div>
</div>
<footer class="site-footer"><div class="footer-inner"><div><div class="footer-brand">✨ MysticTools</div><p class="footer-tagline">Free mystical tools. 498 tools. No signup needed.</p></div><div class="footer-col"><h4>Categories</h4><a href="/astrology/">⭐ Astrology</a><a href="/numerology/">🔢 Numerology</a><a href="/love/">💕 Love</a><a href="/lucky/">🍀 Lucky</a></div><div class="footer-col"><h4>More</h4><a href="/birthday/">🎂 Birthday</a><a href="/tarot/">🃏 Tarot</a><a href="/dream/">🌙 Dream</a><a href="/chinese/">🐉 Chinese</a></div></div><div class="footer-bottom">© <span id="footer-year"></span> MysticTools</div></footer>
<script>document.getElementById('footer-year').textContent=new Date().getFullYear();</script>
</body></html>`;

  fs.writeFileSync(path.join(catDir, 'index.html'), catHtml);
  sitemapUrls.push(`  <url><loc>${BASE_URL}/${cat.slug}/</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>`);
  console.log(`  ✓ ${cat.name} — ${tools.length} tools`);
});

// ── HOMEPAGE ──────────────────────────────────────
const homeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MysticTools — 498 Free Astrology, Numerology & Spiritual Tools</title>
<meta name="description" content="Free online mystical tools: astrology charts, numerology readings, love compatibility, tarot cards, lucky numbers and more. 498 tools. No signup required.">
<link rel="canonical" href="${BASE_URL}/">
<link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
<header class="site-header"><div class="header-inner"><a href="/" class="logo">✨ MysticTools</a><nav class="main-nav"><a href="/astrology/">⭐ Astrology</a><a href="/numerology/">🔢 Numerology</a><a href="/love/">💕 Love</a><a href="/lucky/">🍀 Lucky</a><a href="/birthday/">🎂 Birthday</a><a href="/tarot/">🃏 Tarot</a></nav><button class="menu-toggle" aria-label="Toggle menu">☰</button></div></header>
<div class="home-hero">
  <h1>✨ MysticTools</h1>
  <p>498 free mystical tools for astrology, numerology, love, tarot, lucky numbers and more. No signup. Instant results.</p>
  <div class="cat-grid">
    ${categories.map(cat => {
      const tools = loadTools(cat.id);
      return `<a href="/${cat.slug}/" class="cat-card"><div class="cat-icon">${cat.icon}</div><div class="cat-name">${cat.name.replace(' Tools','')}</div><div class="cat-count">${tools.length} tools</div></a>`;
    }).join('')}
  </div>
</div>
<footer class="site-footer"><div class="footer-inner"><div><div class="footer-brand">✨ MysticTools</div><p class="footer-tagline">Free mystical tools. 498 tools. No signup. No data collected.</p></div><div class="footer-col"><h4>Categories</h4><a href="/astrology/">⭐ Astrology</a><a href="/numerology/">🔢 Numerology</a><a href="/love/">💕 Love</a><a href="/lucky/">🍀 Lucky</a></div><div class="footer-col"><h4>More</h4><a href="/birthday/">🎂 Birthday</a><a href="/tarot/">🃏 Tarot</a><a href="/dream/">🌙 Dream</a><a href="/chinese/">🐉 Chinese</a></div></div><div class="footer-bottom">© <span id="footer-year"></span> MysticTools · Free forever</div></footer>
<script>document.getElementById('footer-year').textContent=new Date().getFullYear();</script>
</body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), homeHtml);

// ── SITEMAP ───────────────────────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join('\n')}
</urlset>`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);

// ── ROBOTS.TXT ────────────────────────────────────
fs.writeFileSync(path.join(OUT, 'robots.txt'),
`User-agent: *\nAllow: /\nDisallow: /data/\nDisallow: /scripts/\nDisallow: /templates/\nDisallow: /src/\nSitemap: ${BASE_URL}/sitemap.xml\n`);

// ── COPY ASSETS ───────────────────────────────────
const cssDir = path.join(OUT, 'assets', 'css');
const jsDir  = path.join(OUT, 'assets', 'js');
ensureDir(cssDir); ensureDir(jsDir);
fs.copyFileSync(path.join(ROOT, 'src', 'ui', 'styles.css'), path.join(cssDir, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'src', 'engine', 'engine.js'), path.join(jsDir, 'engine.js'));

console.log(`\n✅ Build complete!`);
console.log(`   📄 ${totalBuilt} tool pages generated`);
console.log(`   🗺  sitemap.xml — ${sitemapUrls.length} URLs`);
console.log(`   🤖 robots.txt`);
console.log(`   🏠 index.html (homepage)`);
console.log(`\n👉 Serve: python3 -m http.server 8000\n`);
