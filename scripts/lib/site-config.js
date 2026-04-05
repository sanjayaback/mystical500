const fs = require('fs');
const path = require('path');

const DEFAULT_SITE_CONFIG = {
  siteName: 'MysticTools',
  logoText: '✨ MysticTools',
  baseUrl: 'https://mystictools.com',
  defaultSocialImage: '',
  footerBottomText: 'Free forever · No data collected',
  
  // SEO Configuration
  metaKeywords: ['astrology', 'numerology', 'tarot', 'love compatibility', 'mystical tools', 'free online tools'],
  metaAuthor: 'MysticTools',
  metaRobots: 'index, follow',
  
  // Open Graph
  ogSiteName: 'MysticTools',
  ogType: 'website',
  ogDescription: 'Free online mystical tools: astrology charts, numerology readings, love compatibility, tarot cards, and more. No signup required.',
  ogImage: '',
  
  // Twitter Cards
  twitterCard: 'summary_large_image',
  twitterSite: '@mystictools',
  twitterCreator: '@mystictools',
  
  // Analytics
  googleAnalytics: '',
  gtmId: '',
  customTracking: '',
  
  toolBadges: [
    '⚡ Instant results',
    '🆓 100% Free',
    '🔒 No signup needed',
    '📱 Works on all devices',
  ],
  homepage: {
    title: 'MysticTools — 498 Free Astrology, Numerology & Spiritual Tools',
    description: 'Free online mystical tools: astrology charts, numerology readings, love compatibility, tarot cards, lucky numbers and more. 498 tools. No signup required.',
    heroTitle: '✨ MysticTools',
    heroDescription: '498 free mystical tools for astrology, numerology, love, tarot, lucky numbers and more. No signup. Instant results.',
    footerTagline: 'Free mystical tools. 498 tools. No signup. No data collected.',
  },
  categoryPage: {
    footerTagline: 'Free mystical tools. 498 tools. No signup needed.',
  },
  toolPage: {
    footerTagline: 'Free mystical tools for astrology, numerology, love, tarot and more. 498 tools. No signup. No ads tracking.',
  },
  navigation: [
    { label: '⭐ Astrology', href: '/astrology/' },
    { label: '🔢 Numerology', href: '/numerology/' },
    { label: '💕 Love', href: '/love/' },
    { label: '🍀 Lucky', href: '/lucky/' },
    { label: '🎂 Birthday', href: '/birthday/' },
    { label: '🃏 Tarot', href: '/tarot/' },
  ],
  footerColumns: [
    {
      heading: 'Categories',
      links: [
        { label: '⭐ Astrology', href: '/astrology/' },
        { label: '🔢 Numerology', href: '/numerology/' },
        { label: '💕 Love', href: '/love/' },
        { label: '🍀 Lucky', href: '/lucky/' },
        { label: '🎂 Birthday', href: '/birthday/' },
        { label: '🃏 Tarot', href: '/tarot/' },
      ],
    },
    {
      heading: 'More',
      links: [
        { label: '🌙 Dream', href: '/dream/' },
        { label: '🐉 Chinese', href: '/chinese/' },
        { label: '🧘 Wellness', href: '/wellness/' },
        { label: '✍️ Text Tools', href: '/text/' },
        { label: 'About', href: '/about/' },
        { label: 'Privacy', href: '/privacy/' },
      ],
    },
  ],
  staticPages: {
    about: {
      title: 'About MysticTools',
      metaDescription: 'Learn about MysticTools and how we build free browser-based tools for astrology, numerology, tarot, wellness, and more.',
      heading: 'About MysticTools',
      contentHtml: '<p>MysticTools is a collection of free browser-based calculators, readings and generators across astrology, numerology, tarot, wellness and text tools.</p><p>Everything is designed to be simple to use, fast to load and accessible without signup.</p>',
    },
    privacy: {
      title: 'Privacy Policy',
      metaDescription: 'Read the MysticTools privacy policy and learn how this site handles data.',
      heading: 'Privacy Policy',
      contentHtml: '<p>MysticTools is designed to run primarily in your browser. We do not require account creation to use the tools.</p><p>If you add analytics, ads or third-party integrations later, update this page so the published privacy policy matches the site behavior.</p>',
    },
  },
};

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, extra) {
  if (Array.isArray(base)) {
    return Array.isArray(extra) ? extra.slice() : base.slice();
  }

  if (!isPlainObject(base)) {
    return extra === undefined ? base : extra;
  }

  const merged = { ...base };
  if (!isPlainObject(extra)) return merged;

  for (const [key, value] of Object.entries(extra)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      merged[key] = value.slice();
    } else if (isPlainObject(value) && isPlainObject(base[key])) {
      merged[key] = deepMerge(base[key], value);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

function getSiteConfigPath(root) {
  return path.join(root, 'data', 'site.json');
}

function readSiteConfig(root) {
  const file = getSiteConfigPath(root);
  if (!fs.existsSync(file)) {
    return deepMerge(DEFAULT_SITE_CONFIG, {});
  }

  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  return deepMerge(DEFAULT_SITE_CONFIG, parsed);
}

function writeSiteConfig(root, config) {
  const file = getSiteConfigPath(root);
  const merged = deepMerge(DEFAULT_SITE_CONFIG, config);
  fs.writeFileSync(file, `${JSON.stringify(merged, null, 2)}\n`);
  return merged;
}

module.exports = {
  DEFAULT_SITE_CONFIG,
  getSiteConfigPath,
  readSiteConfig,
  writeSiteConfig,
};
