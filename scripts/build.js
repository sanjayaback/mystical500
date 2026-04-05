#!/usr/bin/env node
/**
 * MysticTools Build Script
 * Generates tool pages, category indexes, homepage, static pages, sitemap, robots.txt
 */
const fs = require('fs');
const path = require('path');
const { readSiteConfig } = require('./lib/site-config');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT = ROOT;

const site = readSiteConfig(ROOT);
const BASE_URL = site.baseUrl;

const { categories } = JSON.parse(fs.readFileSync(path.join(DATA, 'categories.json'), 'utf8'));
const TOOL_TEMPLATE = fs.readFileSync(path.join(ROOT, 'templates', 'tool.html'), 'utf8');

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function loadTools(categoryId) {
  const file = path.join(DATA, 'tools', `${categoryId}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function escHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function joinUrl(base, relativePath) {
  return `${base.replace(/\/$/, '')}/${String(relativePath).replace(/^\//, '')}`;
}

function renderNavLinks(links) {
  return (links || [])
    .map((link) => `<a href="${escHtml(link.href)}">${escHtml(link.label)}</a>`)
    .join('');
}

function renderFooterColumns(columns) {
  return (columns || [])
    .map((column) => {
      const links = (column.links || [])
        .map((link) => `<a href="${escHtml(link.href)}">${escHtml(link.label)}</a>`)
        .join('');
      return `<div class="footer-col"><h4>${escHtml(column.heading)}</h4>${links}</div>`;
    })
    .join('');
}

function renderToolBadges(badges) {
  return (badges || [])
    .map((badge) => `<span class="hero-badge">${escHtml(badge)}</span>`)
    .join('');
}

function faqsHtml(faqs) {
  return faqs
    .map(
      (faq) => `
  <div class="faq-item">
    <button class="faq-question" aria-expanded="false">${escHtml(faq.q)}</button>
    <div class="faq-answer" hidden><p>${escHtml(faq.a)}</p></div>
  </div>`
    )
    .join('');
}

function faqsSchema(faqs) {
  return JSON.stringify(
    faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    }))
  );
}

function relatedHtml(relatedIds, allToolMap) {
  return (relatedIds || [])
    .slice(0, 6)
    .map((id) => {
      const tool = allToolMap[id];
      if (!tool) return '';
      return `<li><a href="/${tool.category}/${tool.slug}/">${escHtml(tool.name)}</a></li>`;
    })
    .join('');
}

function categoryToolsHtml(tools, currentSlug, categorySlug) {
  return tools
    .slice(0, 8)
    .filter((tool) => tool.slug !== currentSlug)
    .slice(0, 6)
    .map((tool) => `<li><a href="/${categorySlug}/${tool.slug}/">${escHtml(tool.name)}</a></li>`)
    .join('');
}

function usefulLinksSection(tool) {
  if (!Array.isArray(tool.externalLinks) || !tool.externalLinks.length) return '';
  const links = tool.externalLinks
    .filter((link) => link && link.label && link.href)
    .map((link) => `<li><a href="${escHtml(link.href)}">${escHtml(link.label)}</a></li>`)
    .join('');

  if (!links) return '';

  return `<div class="content-section"><h2>Useful Links</h2><ul>${links}</ul></div>`;
}

function heroMediaHtml(tool) {
  if (!tool.imageUrl) return '';
  return `<div class="hero-media"><img src="${escHtml(tool.imageUrl)}" alt="${escHtml(tool.name)}" loading="lazy"></div>`;
}

function imageMetaHtml(imageUrl, title, description) {
  if (!imageUrl) return '';
  return `<meta property="og:image" content="${escHtml(imageUrl)}">
<meta property="og:image:alt" content="${escHtml(title)}">
<meta name="twitter:image" content="${escHtml(imageUrl)}">
<meta name="twitter:image:alt" content="${escHtml(description)}">`;
}

function howToUse(tool, categoryName) {
  return `<ol>
    <li>Enter your details in the ${escHtml(tool.name)} tool above.</li>
    <li>Click the calculate or submit button to get your instant result.</li>
    <li>Read your personalized ${escHtml(categoryName.toLowerCase())} reading carefully.</li>
    <li>Use the results for guidance, reflection and self-discovery.</li>
  </ol>
  <p>The ${escHtml(tool.name)} is completely free and works entirely in your browser. No data is ever sent to a server.</p>`;
}

function aboutContent(tool, category) {
  return `<p>The <strong>${escHtml(tool.name)}</strong> is a free online tool that ${escHtml(tool.description)} It is part of our collection of ${escHtml(category.name.toLowerCase())} designed to help you gain deeper insight into yourself and the world around you.</p>
  <p>${escHtml(tool.tagline)}. This tool uses traditional ${escHtml(category.name.toLowerCase().replace(' tools', ''))} methods and calculations to provide accurate, meaningful readings.</p>
  <p>Whether you are new to ${escHtml(category.id)} or an experienced practitioner, this tool offers valuable guidance for reflection, decision-making and personal growth.</p>
  <p>All calculations happen instantly in your browser. We never store your personal data or require account creation.</p>`;
}

function useCases(tool, categoryName) {
  const cases = [
    'Personal daily guidance and reflection',
    'Understanding yourself and your natural tendencies',
    `Exploring ${categoryName.toLowerCase()} traditions and their meaning`,
    'Sharing insights with friends and family',
    'Decision-making support and clarity',
    'Self-discovery and spiritual growth',
  ];

  return `<ul>${cases.map((item) => `<li>${escHtml(item)}</li>`).join('')}</ul>
  <p>The ${escHtml(tool.name)} is used by thousands of people around the world each day for personal insight, entertainment and spiritual exploration.</p>`;
}

function buildHeaderHtml() {
  return `<header class="site-header"><div class="header-inner"><a href="/" class="logo">${escHtml(site.logoText)}</a><div class="header-nav"><nav class="main-nav" id="main-nav">${renderNavLinks(site.navigation)}</nav><div class="search-container"><span class="search-icon">🔍</span><input type="text" class="search-bar" placeholder="Search tools..." autocomplete="off"><div class="search-results"></div></div></div><button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button></div></header>`;
}

function buildFooterHtml(tagline) {
  return `<footer class="site-footer"><div class="footer-inner"><div><div class="footer-brand">${escHtml(site.logoText)}</div><p class="footer-tagline">${escHtml(tagline)}</p></div>${renderFooterColumns(site.footerColumns)}</div><div class="footer-bottom">© <span id="footer-year"></span> ${escHtml(site.siteName)} · ${escHtml(site.footerBottomText)}</div></footer><script>document.getElementById('footer-year').textContent=new Date().getFullYear();</script>`;
}

function buildStaticPageHtml(pageConfig) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(pageConfig.title)} | ${escHtml(site.siteName)}</title>
<meta name="description" content="${escHtml(pageConfig.metaDescription)}">
<link rel="canonical" href="${joinUrl(BASE_URL, pageConfig.slug + '/')}">
<link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
${buildHeaderHtml()}
<div style="max-width:900px;margin:0 auto;padding:1.5rem 1.25rem 3rem">
  <div class="content-section">
    <h1>${escHtml(pageConfig.heading)}</h1>
    ${pageConfig.contentHtml || ''}
  </div>
</div>
${buildFooterHtml(site.toolPage.footerTagline)}
</body>
</html>`;
}

const totalTools = categories.reduce((sum, category) => sum + loadTools(category.id).length, 0);
let totalBuilt = 0;
let sitemapUrls = [`  <url><loc>${BASE_URL}/</loc><priority>1.0</priority><changefreq>weekly</changefreq></url>`];
const allToolMap = {};

categories.forEach((category) => {
  const tools = loadTools(category.id);
  tools.forEach((tool) => {
    allToolMap[tool.id] = { ...tool, category: category.id };
  });
});

console.log(`\n🔨 Building ${site.siteName} — ${Object.keys(allToolMap).length} unique tool ids\n`);

categories.forEach((category) => {
  const tools = loadTools(category.id);
  if (!tools.length) return;

  const categoryDir = path.join(OUT, category.slug);
  ensureDir(categoryDir);

  tools.forEach((tool) => {
    const toolDir = path.join(categoryDir, tool.slug);
    ensureDir(toolDir);

    const faqs =
      tool.faqs ||
      [
        { q: `Is the ${tool.name} free?`, a: 'Yes. It is completely free and requires no signup.' },
        { q: `How accurate is the ${tool.name}?`, a: `This tool uses traditional ${category.name.toLowerCase().replace(' tools', '')} methods for its calculations.` },
      ];

    const title = tool.seoTitle || `${tool.name} — Free Online Tool | ${site.siteName}`;
    const metaDesc = (tool.metaDescription || tool.description || '').slice(0, 160);
    const imageUrl = tool.imageUrl || site.defaultSocialImage || '';
    const twitterCard = imageUrl ? 'summary_large_image' : 'summary';
    const canonicalUrl = tool.canonicalUrl || joinUrl(BASE_URL, `${category.slug}/${tool.slug}/`);

    const html = TOOL_TEMPLATE
      .replaceAll('{{BASE_URL}}', BASE_URL)
      .replaceAll('{{TOOL_CANONICAL_URL}}', canonicalUrl)
      .replaceAll('{{SITE_NAME}}', site.siteName)
      .replaceAll('{{SITE_LOGO}}', site.logoText)
      .replaceAll('{{NAV_LINKS_HTML}}', renderNavLinks(site.navigation))
      .replaceAll('{{FOOTER_TAGLINE}}', site.toolPage.footerTagline)
      .replaceAll('{{FOOTER_COLUMNS_HTML}}', renderFooterColumns(site.footerColumns))
      .replaceAll('{{FOOTER_BOTTOM_TEXT}}', site.footerBottomText)
      .replaceAll('{{TOOL_BADGES_HTML}}', renderToolBadges(site.toolBadges))
      .replaceAll('{{TOOL_SLUG}}', tool.slug)
      .replaceAll('{{TOOL_NAME}}', tool.name)
      .replaceAll('{{TOOL_TITLE}}', title)
      .replaceAll('{{TOOL_TAGLINE}}', tool.tagline)
      .replaceAll('{{TOOL_META_DESC}}', metaDesc)
      .replaceAll('{{TOOL_KEYWORDS}}', (tool.keywords || []).join(', '))
      .replaceAll('{{CATEGORY_SLUG}}', category.slug)
      .replaceAll('{{CATEGORY_NAME}}', category.name)
      .replaceAll('{{CATEGORY_ICON}}', category.icon)
      .replaceAll('{{TOOL_FAQS_HTML}}', faqsHtml(faqs))
      .replaceAll('{{TOOL_FAQS_SCHEMA}}', faqsSchema(faqs))
      .replaceAll('{{RELATED_TOOLS_HTML}}', relatedHtml(tool.relatedTools || [], allToolMap))
      .replaceAll('{{CATEGORY_TOOLS_HTML}}', categoryToolsHtml(tools, tool.slug, category.slug))
      .replaceAll('{{HOW_TO_USE}}', howToUse(tool, category.name))
      .replaceAll('{{ABOUT_CONTENT}}', aboutContent(tool, category))
      .replaceAll('{{USE_CASES}}', useCases(tool, category.name))
      .replaceAll('{{TOOL_HERO_MEDIA}}', heroMediaHtml(tool))
      .replaceAll('{{TOOL_IMAGE_META}}', imageMetaHtml(imageUrl, tool.name, metaDesc))
      .replaceAll('{{TWITTER_CARD}}', twitterCard)
      .replaceAll('{{TOOL_USEFUL_LINKS_SECTION}}', usefulLinksSection(tool));

    fs.writeFileSync(path.join(toolDir, 'index.html'), html);
    totalBuilt += 1;

    const priority = tool.priority || 0.7;
    sitemapUrls.push(`  <url><loc>${joinUrl(BASE_URL, `${category.slug}/${tool.slug}/`)}</loc><priority>${priority}</priority><changefreq>monthly</changefreq></url>`);

    if (totalBuilt % 50 === 0) {
      process.stdout.write(`  ✓ ${totalBuilt} pages...\n`);
    }
  });

  const categoryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(category.name)} — Free Online Tools | ${escHtml(site.siteName)}</title>
<meta name="description" content="${escHtml(category.description)}">
<link rel="canonical" href="${joinUrl(BASE_URL, `${category.slug}/`)}">
<link rel="stylesheet" href="/assets/css/styles.css">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"${escHtml(category.name)}","url":"${joinUrl(BASE_URL, `${category.slug}/`)}","description":"${escHtml(category.description)}"}</script>
</head>
<body>
${buildHeaderHtml()}
<div style="max-width:1200px;margin:0 auto;padding:1.5rem 1.25rem">
<div class="cat-hero"><div class="cat-icon">${escHtml(category.icon)}</div><h1>${escHtml(category.name)}</h1><p>${escHtml(category.description)}</p></div>
<div class="tools-grid">
${tools
  .map(
    (tool) =>
      `<a href="/${category.slug}/${tool.slug}/" class="tool-card"><div class="card-badge">${escHtml(category.icon)} ${escHtml(category.name.replace(' Tools', ''))}</div><div class="card-name">${escHtml(tool.name)}</div><div class="card-desc">${escHtml(tool.tagline)}</div></a>`
  )
  .join('\n')}
</div>
</div>
${buildFooterHtml(site.categoryPage.footerTagline)}
</body></html>`;

  fs.writeFileSync(path.join(categoryDir, 'index.html'), categoryHtml);
  sitemapUrls.push(`  <url><loc>${joinUrl(BASE_URL, `${category.slug}/`)}</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>`);
  console.log(`  ✓ ${category.name} — ${tools.length} tools`);
});

const homeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(site.homepage.title)}</title>
<meta name="description" content="${escHtml(site.homepage.description)}">
<link rel="canonical" href="${BASE_URL}/">
<link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
${buildHeaderHtml()}
<div class="home-hero">
  <div class="hero-content">
    <h1>${escHtml(site.homepage.heroTitle)}</h1>
    <div class="subtitle">Discover Your Path with Ancient Wisdom</div>
    <p>${escHtml(site.homepage.heroDescription)}</p>
    <div class="home-stats">
      <div class="stat-item">
        <span class="stat-number">${totalTools}</span>
        <span class="stat-label">Free Tools</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${categories.length}</span>
        <span class="stat-label">Categories</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">100%</span>
        <span class="stat-label">Free Forever</span>
      </div>
    </div>
    <div class="cat-grid">
      ${categories
        .map((category) => {
          const tools = loadTools(category.id);
          return `<a href="/${category.slug}/" class="cat-card"><div class="cat-icon">${escHtml(category.icon)}</div><div class="cat-name">${escHtml(category.name.replace(' Tools', ''))}</div><div class="cat-count">${tools.length} tools</div></a>`;
        })
        .join('')}
    </div>
  </div>
</div>
<div class="feature-section">
  <div class="feature-container">
    <h2 class="feature-title">Why Choose MysticTools?</h2>
    <p class="feature-subtitle">Powerful, intuitive, and completely free mystical tools for modern spiritual exploration</p>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>Instant Results</h3>
        <p>Get immediate insights and calculations without waiting. All tools work instantly in your browser.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Privacy First</h3>
        <p>No signups, no data collection, no tracking. Your spiritual journey remains completely private.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3>Works Everywhere</h3>
        <p>Access all tools on any device - desktop, tablet, or mobile. No app installation required.</p>
      </div>
    </div>
  </div>
</div>
${buildFooterHtml(site.homepage.footerTagline)}
<script src="/assets/js/search.js"></script>
</body></html>`;

fs.writeFileSync(path.join(OUT, 'index.html'), homeHtml);

Object.entries(site.staticPages || {}).forEach(([slug, pageConfig]) => {
  const pageDir = path.join(OUT, slug);
  ensureDir(pageDir);
  fs.writeFileSync(path.join(pageDir, 'index.html'), buildStaticPageHtml({ ...pageConfig, slug }));
  sitemapUrls.push(`  <url><loc>${joinUrl(BASE_URL, `${slug}/`)}</loc><priority>0.4</priority><changefreq>monthly</changefreq></url>`);
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join('\n')}
</urlset>`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);

fs.writeFileSync(
  path.join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /data/\nDisallow: /scripts/\nDisallow: /templates/\nDisallow: /src/\nSitemap: ${BASE_URL}/sitemap.xml\n`
);

// Generate search data
const searchData = [];
categories.forEach((category) => {
  const tools = loadTools(category.id);
  tools.forEach((tool) => {
    searchData.push({
      name: tool.name,
      slug: tool.slug,
      category: category.slug,
      categoryName: category.name.replace(' Tools', ''),
      categoryIcon: category.icon,
      tagline: tool.tagline,
      keywords: (tool.keywords || []).join(' ')
    });
  });
});

fs.writeFileSync(path.join(OUT, 'search-data.json'), JSON.stringify(searchData, null, 2));

const cssDir = path.join(OUT, 'assets', 'css');
const jsDir = path.join(OUT, 'assets', 'js');
ensureDir(cssDir);
ensureDir(jsDir);
fs.copyFileSync(path.join(ROOT, 'src', 'ui', 'styles.css'), path.join(cssDir, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'src', 'engine', 'engine.js'), path.join(jsDir, 'engine.js'));
fs.copyFileSync(path.join(ROOT, 'src', 'ui', 'search.js'), path.join(jsDir, 'search.js'));

console.log(`\n✅ Build complete!`);
console.log(`   📄 ${totalBuilt} tool pages generated`);
console.log(`   🧮 ${totalTools} tool entries across ${categories.length} categories`);
console.log(`   🗺  sitemap.xml — ${sitemapUrls.length} URLs`);
console.log(`   🤖 robots.txt`);
console.log(`   🏠 index.html (homepage)`);
console.log(`   📄 static pages: ${Object.keys(site.staticPages || {}).join(', ') || 'none'}`);
console.log(`\n👉 Serve: python3 -m http.server 8000\n`);
