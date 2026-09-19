// Mechanical shared-footer contact correction and generated CTA path repair.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function allPages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'assets' || entry.name === 'scripts') return [];
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? allPages(target) : entry.name.endsWith('.html') ? [target] : [];
  });
}
let changed = 0;
for (const file of allPages(root)) {
  if (path.relative(root, file).replaceAll('\\', '/') === 'works/nakaniwa-no-aru-ie/index.html') continue;
  const original = fs.readFileSync(file, 'utf8');
  let next = original.replace('src="../assets/images/final-cta.webp" alt="木のダイニングテーブルと庭の緑"', 'src="/assets/images/final-cta.webp" alt="木のダイニングテーブルと庭の緑"');
  // Keep existing content unchanged except known common footer placeholders.
  next = next.replaceAll('href="tel:0280000000">TEL 028-XXX-XXXX', 'href="tel:0286121234">TEL 028-612-1234');
  next = next.replaceAll('10:00〜17:00 / 水曜定休', '10:00〜18:00 / 火・水曜定休');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (/^staff\/[^/]+\/index\.html$/.test(rel)) {
    next = next.replace(/(property="og:image" content="https:\/\/example\.com\/assets\/images\/)staff_0[1-6]\.webp/, '$1concept-living.webp');
    next = next.replace(/(<section class="remaining-hero"[\s\S]*?<img src=")\/assets\/images\/staff_0[1-6]\.webp/, '$1/assets/images/concept-living.webp');
  }
  const voiceImage = { 's-sama': 'voice-s-main.webp', 'k-sama': 'voice-k-main.webp', 'n-sama': 'voice-n-main.webp' }[rel.split('/')[1]];
  if (rel.startsWith('voice/') && voiceImage) {
    next = next.replace(/(property="og:image" content="https:\/\/example\.com\/assets\/images\/)voice_[skn]_(?:family|dining|sofa)\.webp/, `$1${voiceImage}`);
    next = next.replace(/(<section class="remaining-hero"[\s\S]*?<img src=")\/assets\/images\/voice_[skn]_(?:family|dining|sofa)\.webp/, `$1/assets/images/${voiceImage}`);
  }
  if (rel === 'news/index.html') {
    next = next.replaceAll('<span>イベント</span></p><h3>', '<span>イベント</span> <span>過去掲載</span></p><h3>');
  }
  if (rel === 'news/open-house-oyama/index.html' || rel === 'news/housing-consultation/index.html') {
    next = next.replace(/(class="remaining-article__meta"[^>]*><time[^>]*>[^<]*<\/time>　イベント)<\/p>/, '$1（過去掲載）</p>');
    next = next.replace('見学は予約制です。ご希望の日時を来場予約ページからお知らせください。日程・会場の詳細は、お申し込み後にスタッフからご案内いたします。小さなお子さまとご一緒の見学も歓迎しています。', 'こちらは2024年掲載の過去のお知らせです。現在の見学会日程については、お問い合わせください。小山モデルハウスの見学は別途ご相談いただけます。フォーム送信は準備中のため、現時点のご予約はお電話で承ります。');
    next = next.replace('ご参加は予約制です。ご希望日時を来場予約フォームからお知らせください。ご予約後にスタッフより確認のご連絡を差し上げる想定ですが、現在フォーム送信は準備中のため、お電話でご予約ください。', 'こちらは2024年掲載の過去のお知らせです。現在の相談会日程については、お問い合わせください。宇都宮モデルハウスでは通常の見学相談を承っています。フォーム送信は準備中のため、現時点のご予約はお電話で承ります。');
  }
  if (!next.includes('<a href="/document/">資料請求</a><a href="/contact/">お問い合わせ</a><a href="/privacy/">')) {
    next = next.replace('<a href="/privacy/">プライバシーポリシー</a>', '<a href="/document/">資料請求</a><a href="/contact/">お問い合わせ</a><a href="/privacy/">プライバシーポリシー</a>');
  }
  if (next !== original) { fs.writeFileSync(file, next); changed++; }
}
console.log(`Normalized ${changed} pages.`);
