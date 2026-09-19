// Validate local links and referenced static files across every HTML page.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function allHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || ['assets', 'scripts', 'site-dist', 'monster-trail'].includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return allHtml(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}
const missing = new Map(), missingImages = new Map(), fragments = new Map();
const files = allHtml(root);
for (const file of files) {
  const route = '/' + path.relative(root, file).replaceAll('\\', '/').replace(/index\.html$/, '');
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  for (const match of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    const [, type, raw] = match;
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    const resolved = new URL(raw, 'https://local.test' + route);
    const pathname = decodeURIComponent(resolved.pathname);
    const target = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      const map = /\.(?:png|jpe?g|webp|svg|gif|avif)$/i.test(pathname) ? missingImages : missing;
      const key = `${route} → ${raw}`;
      map.set(key, (map.get(key) || 0) + 1);
      continue;
    }
    if (type === 'href' && resolved.hash) {
      const fragment = decodeURIComponent(resolved.hash.slice(1));
      const targetIds = pathname === route ? ids : new Set([...fs.readFileSync(target, 'utf8').matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
      if (fragment && !targetIds.has(fragment)) fragments.set(`${route} → ${raw}`, 1);
    }
  }
}
console.log(`Pages: ${files.length}`);
for (const [name, map] of [['Missing internal URLs', missing], ['Missing images', missingImages], ['Missing fragment targets', fragments]]) {
  console.log(`${name}: ${map.size}`);
  for (const key of map.keys()) console.log(`  ${key}`);
}
if (missing.size || missingImages.size || fragments.size) process.exitCode = 1;
