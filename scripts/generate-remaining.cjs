// One-time, repeatable bulk build of the remaining static pages.
// Existing pages are never overwritten; edit their sources directly if needed.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'voice/index.html'), 'utf8');
const headerBase = source.match(/<header class="site-header"[\s\S]*?<\/header>/)[0];
const mobileBase = source.match(/<div class="mobile-menu"[\s\S]*?<\/div>/)[0];
const footerBase = source.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0]
  .replaceAll('href="../"', 'href="/"')
  .replace('href="tel:0280000000">TEL 028-XXX-XXXX', 'href="tel:0286121234">TEL 028-612-1234')
  .replace('10:00〜17:00 / 水曜定休', '10:00〜18:00 / 火・水曜定休')
  .replace('<a href="/privacy/">プライバシーポリシー</a>', '<a href="/document/">資料請求</a><a href="/contact/">お問い合わせ</a><a href="/privacy/">プライバシーポリシー</a>');
const staffSource = fs.readFileSync(path.join(root, 'staff/index.html'), 'utf8');
const ctaBase = staffSource.match(/<section class="final-cta staff-cta"[\s\S]*?<\/section>/)[0]
  .replaceAll('staff-cta', 'remaining-cta')
  .replace('src="../assets/images/final-cta.webp"', 'src="/assets/images/final-cta.webp"');

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const link = (url, text) => `<a href="${url}">${esc(text)}<span aria-hidden="true"> →</span></a>`;
const img = (file, alt, extra = '') => `<img src="/assets/images/${file}" alt="${esc(alt)}" width="1448" height="1086" ${extra.includes('loading=') ? '' : 'loading="lazy"'} ${extra}/>`;
const figure = (file, alt, cls = '') => `<figure class="remaining-image media-reveal ${cls}" data-reveal="image">${img(file, alt)}</figure>`;
const links = (items, cls = '') => `<div class="remaining-links ${cls}">${items.map(([url, title]) => link(url, title)).join('')}</div>`;
const cta = () => ctaBase;
const breadcrumb = (ancestors, title) => `<nav class="remaining-breadcrumb content-shell" aria-label="パンくずリスト"><ol><li><a href="/">TOP</a></li>${ancestors.map(([url, name]) => `<li><a href="${url}">${esc(name)}</a></li>`).join('')}<li aria-current="page">${esc(title)}</li></ol></nav>`;
const section = (title, body, cls = '') => `<section class="remaining-section content-shell ${cls}" data-reveal><h2>${esc(title)}</h2>${body}</section>`;
const p = text => `<p>${esc(text)}</p>`;
const dl = rows => `<dl class="remaining-dl">${rows.map(([name, value]) => `<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;

const created = [];
function write(route, title, english, description, heroImage, content, options = {}) {
  const file = path.join(root, route.replace(/^\//, ''), 'index.html');
  if (fs.existsSync(file)) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const nav = options.nav || route.split('/')[1];
  const markCurrent = markup => markup.replaceAll(' aria-current="page"', '')
    .replaceAll(`href="/${nav}/"`, `href="/${nav}/" aria-current="page"`)
    .replaceAll('href="../"', 'href="/"');
  const header = markCurrent(headerBase);
  const mobile = markCurrent(mobileBase);
  const hero = `<section class="remaining-hero" aria-labelledby="page-title"><div class="remaining-hero__media media-reveal" data-reveal="image" data-parallax>${img(heroImage, `${title}を紹介するKURAHAUSの風景`, 'fetchpriority="high" loading="eager"')}</div><div class="remaining-hero__shade" aria-hidden="true"></div><div class="content-shell remaining-hero__copy" data-reveal><p>${esc(english)}</p><h1 id="page-title">${esc(title)}</h1><span>${esc(description)}</span></div></section>`;
  const type = options.article ? 'article' : 'website';
  const html = `<!doctype html>
<html lang="ja"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${esc(description)}" /><meta name="theme-color" content="#1c1a17" />
<title>${esc(title)}｜KURAHAUS</title>
<!-- TODO: 公開ドメイン確定後に canonical と og:url を追加 -->
<meta property="og:type" content="${type}" /><meta property="og:site_name" content="KURAHAUS" /><meta property="og:title" content="${esc(title)}｜KURAHAUS" /><meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="https://example.com/assets/images/${heroImage}" />
<link rel="stylesheet" href="/styles.css" /><script>document.documentElement.classList.add("js");</script><script src="/script.js" defer></script>${options.form ? '<script src="/remaining-forms.js" defer></script>' : ''}
</head><body class="lower-page remaining-page"><a class="skip-link" href="#main-content">本文へ移動</a>
${header}${mobile}<main id="main-content">${hero}${breadcrumb(options.ancestors || [], title)}${content}${options.noCta ? '' : cta()}</main>${footerBase}</body></html>\n`;
  fs.writeFileSync(file, html, 'utf8');
  created.push(route);
}

const input = (id, label, type = 'text', required = true, autocomplete = '') => `<div class="remaining-field"><label for="${id}">${esc(label)}${required ? ' <small>必須</small>' : ''}</label><input id="${id}" name="${id}" type="${type}" ${required ? 'required' : ''} ${autocomplete ? `autocomplete="${autocomplete}"` : ''}/></div>`;
const select = (id, label, entries, required = false) => `<div class="remaining-field"><label for="${id}">${esc(label)}${required ? ' <small>必須</small>' : ''}</label><select id="${id}" name="${id}" ${required ? 'required' : ''}><option value="">選択してください</option>${entries.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select></div>`;
const textarea = (id, label, required = false) => `<div class="remaining-field"><label for="${id}">${esc(label)}${required ? ' <small>必須</small>' : ''}</label><textarea id="${id}" name="${id}" rows="6" ${required ? 'required' : ''}></textarea></div>`;
const form = (fields, title) => `<section class="remaining-section content-shell"><div class="remaining-form-wrap" data-reveal><h2>${title}</h2><p>「必須」の項目をご入力ください。送信機能は現在準備中です。</p><form action="#" method="post" data-preview-form>${fields}<p class="remaining-form-note">ご入力いただいた情報の取扱いは${link('/privacy/', 'プライバシーポリシー')}をご確認ください。</p><button type="submit" disabled data-preview-submit>この内容で送信する</button><p class="remaining-form-status" role="status" aria-live="polite" data-preview-status hidden></p><noscript><p>現在フォーム送信機能は準備中です。お電話でお問い合わせください。</p></noscript></form></div></section>`;

// Conversion pages: visible, labeled HTML forms with an explicit no-send preview state.
write('/document/', '資料請求', 'DOCUMENT', 'KURAHAUSの家づくりを、ご自宅でゆっくりご覧ください。', 'document_catalog_set.webp',
  section('資料で見る、KURAHAUSの家づくり', `<p class="remaining-lead">家づくりコンセプト、施工事例、素材、性能、モデルハウス。気になるテーマから、ご自宅でゆっくりご覧いただけます。</p><div class="remaining-gallery">${figure('document_catalog_set.webp', '家づくり資料のカタログ一式')}${figure('document_inside_spread.webp', '施工事例と設計思想を紹介する資料')}${figure('document_lifestyle.webp', '暮らしを紹介する資料')}</div><ul class="remaining-tags"><li>家づくりコンセプト</li><li>施工事例</li><li>自然素材</li><li>性能</li><li>モデルハウス</li></ul>`)
  + form(`<div class="remaining-form-grid">${input('name', 'お名前', 'text', true, 'name')}${input('name_kana', 'フリガナ')}${input('email', 'メールアドレス', 'email', true, 'email')}${input('phone', '電話番号', 'tel', true, 'tel')}${input('postal_code', '郵便番号', 'text', false, 'postal-code')}${input('address', '住所', 'text', true, 'street-address')}${select('consideration_stage', '検討状況', ['情報収集中', '土地探し中', '建築会社比較中', 'プラン検討中'])}</div><fieldset class="remaining-checks"><legend>希望資料</legend>${['総合カタログ', '施工事例集', '性能資料', 'モデルハウス案内'].map((v, i) => `<label><input type="checkbox" name="requested_documents" value="${esc(v)}" />${esc(v)}</label>`).join('')}</fieldset>${textarea('message', '相談内容')}`, '資料請求フォーム'), { form: true });

write('/contact/', 'お問い合わせ', 'CONTACT', '家づくりのこと、まずはお気軽にご相談ください。', 'contact_desk.webp',
  section('お話をお聞かせください', `<div class="remaining-split"><div><p>土地や間取り、素材や資金のことまで。まだ具体的に決まっていない段階でも大丈夫です。担当者が一つひとつ丁寧にお答えします。</p>${links([['/reserve/', 'モデルハウス来場予約'], ['/document/', '資料請求']])}</div>${figure('contact_typing.webp', '木の机でお問い合わせに対応する風景')}</div>`)
  + form(`<div class="remaining-form-grid">${input('name', 'お名前', 'text', true, 'name')}${input('name_kana', 'フリガナ')}${input('email', 'メールアドレス', 'email', true, 'email')}${input('phone', '電話番号', 'tel', true, 'tel')}${select('contact_type', 'お問い合わせ種別', ['家づくりについて', '土地について', 'モデルハウスについて', '資料請求について', '採用について', 'その他'], true)}</div>${textarea('message', 'お問い合わせ内容', true)}`, 'お問い合わせフォーム')
  + section('お電話でのお問い合わせ', `<div class="remaining-split"><div><p>お急ぎの場合は、営業時間内にお電話ください。</p><p class="remaining-call"><a href="tel:0286121234">028-612-1234</a><small>10:00〜18:00（火・水曜日定休）</small></p></div>${figure('contact_notebook.webp', 'ノートを広げてお話を伺う相談スペース')}</div>`), { form: true });

write('/company/', '会社情報', 'COMPANY', '人と自然に寄り添い、これからの暮らしをつくる。', 'company_exterior.webp',
  section('私たちの考え方', `<div class="remaining-split"><div><p>私たちは、住まいを完成させることだけを目的にしません。家族が歳月を重ねながら、自然とともに心地よく暮らせることを大切にしています。</p><p>素材を選ぶこと、光と風を読み解くこと、つくり手と住まい手の声をつなぐこと。一つひとつを丁寧に積み重ねます。</p>${links([['/concept/', 'コンセプトを見る'], ['/staff/', 'スタッフを見る']])}</div>${figure('company_interior.webp', '木の温もりを感じる社内の風景')}</div>`)
  + section('会社概要', dl([['会社名', '株式会社KURAHAUS'], ['所在地', '〒320-0851 栃木県宇都宮市松原3-14-2'], ['電話番号', '028-612-1234'], ['営業時間', '10:00〜18:00'], ['定休日', '火・水曜日'], ['代表者', '蔵本 直人'], ['事業内容', '注文住宅・住宅設計・リノベーション・住宅相談']]))
  + section('家づくりへの姿勢', `<div class="remaining-split">${figure('company_logo_wall.webp', 'KURAHAUSのロゴを掲げた室内')}<div><p>建物と庭、住まう人とつくる人。そのつながりが、家の表情を豊かにしていくと考えています。</p><p>設計から現場、完成後の相談まで、顔の見える関係を大切にしていきます。</p>${links([['/housing/', '家づくりについて'], ['/contact/', 'お問い合わせ']])}</div></div>`));

const news = [
  { slug: 'open-house-oyama', date: '2024.05.20', kind: 'イベント', title: '完成見学会のお知らせ（小山市）', image: 'news_newspaper.webp', body: [
    '小山市に完成した住まいの見学会を開催します。庭に向かって大きく開いた窓から、やわらかな光が室内に広がる平屋です。木の床や落ち着いた壁の質感、室内と庭を行き来する心地よさを、実際の空間で感じていただけます。',
    '家づくりを始めたばかりの方も、間取りや素材を具体的に検討されている方も、どうぞお気軽にお越しください。スタッフが見どころをご案内し、ご希望があれば資金計画や土地探しについてもご相談を承ります。',
    'こちらは2024年掲載の過去のお知らせです。現在の見学会日程については、お問い合わせください。小山モデルハウスの見学は別途ご相談いただけます。フォーム送信は準備中のため、現時点のご予約はお電話で承ります。' ], related: [['/reserve/?modelhouse=oyama', '小山モデルハウスの来場予約'], ['/works/', '施工事例を見る']] },
  { slug: 'works-update', date: '2024.05.10', kind: 'お知らせ', title: '施工事例を更新しました', image: 'news_books_model.webp', body: [
    'KURAHAUSの施工事例ページに、新しい住まいを掲載しました。今回ご紹介するのは、自然素材の表情を生かしながら、家族がそれぞれの時間を楽しめる住まいです。室内のどこにいても光や緑を感じられるよう、窓の位置と庭とのつながりを丁寧に考えました。',
    '写真だけでなく、間取りや素材の選び方、暮らしの背景も紹介しています。完成直後の美しさだけではなく、毎日の使いやすさや、時間とともに深まっていく木の風合いにも目を向けていただけたらうれしいです。',
    '家づくりのヒントを探している方は、ぜひ施工事例一覧からご覧ください。気になる住まいについては、お問い合わせやモデルハウスでのご相談も承っています。' ], related: [['/works/', '施工事例一覧'], ['/contact/', 'お問い合わせ']] },
  { slug: 'housing-consultation', date: '2024.04.28', kind: 'イベント', title: '家づくり相談会（宇都宮モデルハウス）', image: 'news_window_green.webp', body: [
    '宇都宮のモデルハウスで、家づくり相談会を開催します。これから住まいを考え始める方にも安心してご参加いただける、少人数の相談会です。土地探しから間取り、自然素材、予算のことまで、今気になっていることを自由にお話しください。',
    '具体的な計画や図面がなくても大丈夫です。まずは実際の室内を歩きながら、木の床の感触や庭から入る光、家事動線の工夫を体感してみてください。お話を伺いながら、ご家族に合った家づくりの進め方をご案内します。',
    'こちらは2024年掲載の過去のお知らせです。現在の相談会日程については、お問い合わせください。宇都宮モデルハウスでは通常の見学相談を承っています。フォーム送信は準備中のため、現時点のご予約はお電話で承ります。' ], related: [['/reserve/?modelhouse=utsunomiya', '宇都宮モデルハウスの来場予約'], ['/housing/flow/', '家づくりの流れ']] },
];
write('/news/', 'お知らせ・イベント', 'NEWS / EVENT', 'KURAHAUSの新しいお知らせとイベントをご案内します。', 'news_newspaper.webp',
  section('お知らせ一覧', `<div class="remaining-news-list">${news.map(item => `<article data-reveal><a href="/news/${item.slug}/">${figure(item.image, item.title)}<div><p><time datetime="${item.date.replaceAll('.', '-')}">${item.date}</time> <span>${item.kind}</span>${item.kind === 'イベント' ? ' <span>過去掲載</span>' : ''}</p><h3>${item.title}</h3><span>詳しく見る →</span></div></a></article>`).join('')}</div>`));
for (const item of news) write(`/news/${item.slug}/`, item.title, 'NEWS / EVENT', `${item.kind}｜${item.date}　${item.title}`, item.image,
  `<article class="remaining-section content-shell remaining-article" data-reveal><p class="remaining-article__meta"><time datetime="${item.date.replaceAll('.', '-')}">${item.date}</time>　${item.kind}${item.kind === 'イベント' ? '（過去掲載）' : ''}</p><h2>${item.title}</h2>${figure(item.image, item.title)}${item.body.map(p).join('')}<h3>関連リンク</h3>${links(item.related)}${links([['/news/', 'お知らせ一覧へ戻る']])}</article>`, { article: true, ancestors: [['/news/', 'お知らせ・イベント']], nav: 'news' });

const questions = [
  ['家づくり', [['相談は無料ですか？', 'はい。家づくりのご相談は無料です。具体的な計画が決まる前でもお気軽にお声がけください。'], ['土地がなくても相談できますか？', 'もちろんです。土地探しから間取りまで、一緒に進め方を考えます。']]],
  ['費用', [['予算はいつ決めればよいですか？', '最初の相談段階で大まかなご希望を伺い、土地・建物・諸費用を含めて整理します。'], ['見積もりはどのように進みますか？', 'ご要望と計画内容を確認し、内容をご説明したうえでお見積もりをご提示します。']]],
  ['土地', [['土地探しからお願いできますか？', 'はい。日当たりや周辺環境、建築条件を含めてご相談いただけます。'], ['狭い土地でも建てられますか？', '条件によって可能です。敷地を確認し、光と広がりを感じられる方法をご提案します。']]],
  ['性能', [['自然素材のお手入れは大変ですか？', '素材により方法は異なります。日常のお手入れと経年変化について、ご相談時にご案内します。'], ['断熱性能について教えてください。', '地域や敷地の条件を踏まえて、断熱仕様や窓の選び方を具体的にご説明します。'], ['気密測定はしますか？', '計画ごとの測定方針や仕様は個別にご案内します。詳しくは設計担当にお尋ねください。'], ['耐震等級はどのように考えていますか？', '構造計画に応じて安全性を検討します。等級の目標や確認方法は個別の計画でご説明します。']]],
  ['モデルハウス', [['小さな子ども連れで見学できますか？', 'はい。お子さまと一緒にご見学いただけます。'], ['予約の変更やキャンセルはできますか？', 'はい。お電話またはお問い合わせページからご連絡ください。']]],
  ['アフターサービス', [['完成後の点検はありますか？', '完成後も住まいのご相談を承ります。点検内容や時期は契約時に個別にご確認ください。'], ['リフォーム相談はできますか？', 'はい。現在の住まいのお悩みもお気軽にご相談ください。'], ['建築期間はどのくらいですか？', '規模や仕様により異なります。計画が具体的になった段階で目安の工程をご案内します。']]],
];
write('/faq/', 'よくあるご質問', 'FAQ', '家づくりの疑問に、一つひとつお答えします。', 'faq_qa_blocks.webp',
  section('まずは、気になることから', `<div class="remaining-split"><div><p>ご相談、費用、土地、性能、見学、完成後のこと。よくいただくご質問をまとめました。</p>${links([['/contact/', '個別に質問する'], ['/reserve/', '見学を予約する']])}</div>${figure('faq_notebook.webp', '家づくりの質問を整理するノート')}</div>`)
  + questions.map(([category, items]) => section(category, `<div class="remaining-faq">${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`)).join('')
  + section('まだ答えが見つからないときは', `<div class="remaining-split"><div><p>ご家族の状況に合わせて、一緒に整理します。小さな疑問からお聞かせください。</p>${links([['/contact/', 'お問い合わせ']])}</div>${figure('faq_green_window.webp', '庭の緑が見える明るい相談スペース')}</div>`));

const policy = [
  ['1. 個人情報の取得', '当サイトでは、お問い合わせ・資料請求・来場予約などの際に、お名前、連絡先、ご相談内容などをご提供いただく場合があります。'],
  ['2. 利用目的', 'ご連絡、資料のお届け、見学のご案内、家づくりに関するご相談への回答、およびご希望に応じたご案内のために利用します。'],
  ['3. 第三者への提供', '法令に基づく場合などを除き、ご本人の同意なく個人情報を第三者に提供しないよう努めます。業務委託時には適切な管理に配慮します。'],
  ['4. 安全管理', '個人情報への不正アクセス、紛失、漏えいなどを防ぐため、必要かつ適切な安全管理に努めます。'],
  ['5. Cookie等', '当サイトでは利便性の向上や利用状況の把握のため、Cookie等を使用する場合があります。ブラウザの設定でCookieを制限できます。'],
  ['6. お問い合わせ', '個人情報の取扱いについてのご質問は、お問い合わせページまたはお電話（028-612-1234）からご連絡ください。'],
  ['7. 方針の改定', '本方針は、運営上の必要に応じて見直す場合があります。変更内容はこのページでお知らせします。'],
];
write('/privacy/', 'プライバシーポリシー', 'PRIVACY POLICY', '個人情報の取扱いについてご案内します。', 'privacy_nature.webp',
  section('個人情報保護方針', `<p class="remaining-lead">株式会社KURAHAUSは、皆さまからお預かりする情報を大切に取り扱います。以下は当サイトにおける基本方針です。</p>${policy.map(([h, body]) => `<section class="remaining-policy"><h3>${h}</h3>${p(body)}</section>`).join('')}${links([['/contact/', 'お問い合わせ']])}`), { noCta: true });

const primaryMap = [
  ['はじめに', [['/', 'TOP'], ['/concept/', 'コンセプト'], ['/company/', '会社情報']]],
  ['家づくり', [['/housing/', '家づくり'], ['/housing/material/', '素材'], ['/housing/performance/', '性能'], ['/housing/flow/', '費用と流れ']]],
  ['実例と人', [['/works/', '施工事例'], ['/modelhouse/', 'モデルハウス'], ['/staff/', 'スタッフ'], ['/voice/', 'お客様の声']]],
  ['お知らせ・ご案内', [['/news/', 'NEWS'], ['/faq/', 'よくある質問'], ['/reserve/', '来場予約'], ['/document/', '資料請求'], ['/contact/', 'お問い合わせ']]],
  ['その他', [['/privacy/', 'プライバシーポリシー'], ['/sitemap/', 'サイトマップ']]],
];
// Works data is used by both the site map and detail templates.
const works = [
  ['niwa-to-tsunagaru-hiraya', '庭とつながる平屋', '宇都宮市', '112.6㎡', ['平屋','中庭','自然素材'], 'works-gallery-01.webp'],
  ['komorebi-no-ie', '木漏れ日を楽しむ家', '鹿沼市', '105.4㎡', ['平屋','木の家','コンパクト'], 'works-gallery-03.webp'],
  ['kazoku-no-jikan', '家族の時間を育む家', '宇都宮市', '138.2㎡', ['2階建て','木の家','子育て'], 'works-gallery-04.webp'],
  ['yama-o-nozomu-ie', '山を望む、静かな住まい', '那須塩原市', '119.8㎡', ['平屋','眺望','和モダン'], 'works-01.webp'],
  ['hikari-ga-meguru-ie', '光が巡る家', '小山市', '129.1㎡', ['2階建て','中庭','シンプル'], 'works-02.webp'],
  ['compact-rich-life', 'コンパクトに豊かに暮らす', '真岡市', '92.3㎡', ['平屋','コンパクト','暮らしやすさ'], 'works-03.webp'],
  ['doma-no-aru-kurashi', '土間のある暮らし', '宇都宮市', '117.6㎡', ['2階建て','土間','和モダン'], 'works-04.webp'],
  ['shumi-no-hanare', '趣味を楽しむ離れのある家', '小山市', '144.5㎡', ['2階建て','離れ','趣味の家'], 'works-05.webp'],
  ['koshiyane', '越屋根の家', '宇都宮市', '118.4㎡', ['越屋根','木の家'], 'works-a-exterior.webp'],
  ['garden-hiraya', '庭とつながる平屋', '小山市', '108.7㎡', ['平屋','庭'], 'works-b-exterior.webp'],
  ['green-courthouse', '緑を招く住まい', '鹿沼市', '123.0㎡', ['中庭','緑'], 'works-c-exterior.webp'],
  ['light-house', '光を受ける二階建て', '宇都宮市', '131.5㎡', ['2階建て','採光'], 'works-02.webp'],
  ['woodland-hiraya', '木立に寄り添う平屋', '那須町', '101.8㎡', ['平屋','木立'], 'works-01.webp'],
  ['ko-yane-no-ie', '木の香りを楽しむ家', '宇都宮市', '110.2㎡', ['木の家','子育て'], 'works_generic_exterior.webp'],
  ['ooyane-no-hiraya', '大屋根の平屋', '那須町', '116.8㎡', ['平屋','大屋根'], 'works_generic_garden.webp'],
  ['oyama-no-ie', '小山の家', '小山市', '120.1㎡', ['木の家','庭'], 'works-01.webp'],
  ['hiraya-model-house', '平屋のモデルハウス', '小山市', '106.8㎡', ['平屋','モデルハウス'], 'modelhouse-oyama-exterior.webp'],
];
write('/sitemap/', 'サイトマップ', 'SITEMAP', 'KURAHAUSのページをカテゴリからお探しいただけます。', 'sitemap_diagram.webp',
  `<div class="content-shell remaining-map" data-reveal>${primaryMap.map(([category, entries]) => `<section><h2>${category}</h2><ul>${entries.map(([url, title]) => `<li>${link(url, title)}</li>`).join('')}</ul></section>`).join('')}
  <section><h2>スタッフ詳細</h2><ul>${[['kuramoto','蔵本 直人'],['muroi','室井 遥'],['mimura','三村 かえで'],['takahashi','高橋 健吾'],['kogure','小暮 誠一'],['hayashi','林 未来']].map(([slug, name]) => `<li>${link(`/staff/${slug}/`, name)}</li>`).join('')}</ul></section>
  <section><h2>お客様の声・詳細</h2><ul>${[['s-sama','Sさまご家族'],['k-sama','Kさまご夫婦'],['n-sama','Nさまご家族']].map(([slug, name]) => `<li>${link(`/voice/${slug}/`, name)}</li>`).join('')}</ul></section>
  <section><h2>施工事例・詳細</h2><ul>${[['nakaniwa-no-aru-ie','中庭のある家'], ...works.map(([slug,title]) => [slug,title])].map(([slug,title]) => `<li>${link(`/works/${slug}/`, title)}</li>`).join('')}</ul></section>
  <section><h2>記事</h2><ul>${news.map(({slug,title}) => `<li>${link(`/news/${slug}/`, title)}</li>`).join('')}</ul></section></div>`, { noCta: true });

const staff = [
  ['kuramoto', '蔵本 直人', '代表・一級建築士', '暮らしに寄り添う設計を大切にしています。一緒に、心地よい家をつくりましょう。', '住む人の声を急がずに聞き、敷地や季節の表情と重ねること。', '休日は庭の手入れと街歩きを楽しみます。', '家族がそれぞれの居場所を持ち、自然と集まれる家。'],
  ['muroi', '室井 遥', '設計士', '日々の暮らしが、少しでも豊かになるような空間をつくりたいと思っています。', '窓から見える風景と暮らしの動線の両方を、丁寧に考えること。', '本を読んだり、小さな喫茶店を訪ねたりします。', '朝の光と庭の緑を身近に感じられる家。'],
  ['mimura', '三村 かえで', 'インテリアコーディネーター', '素材や色、暮らしのイメージを一緒に考え、心地よい空間づくりをお手伝いします。', '見た目だけでなく、手触りや使い続けたときの心地よさを選ぶこと。', '休日は器を見に出かけたり、季節の花を飾ったりします。', '好きな道具や家具が自然に馴染む、落ち着いた家。'],
  ['takahashi', '高橋 健吾', '工務', '現場での丁寧な仕事を心がけています。安心して暮らせる家を、確かな技術でつくります。', '図面の意図を職人と共有し、一つひとつの納まりを確かめること。', '休日は家族と外で過ごす時間を大切にしています。', '手入れをしながら、長く住み続けられる丈夫な家。'],
  ['kogure', '小暮 誠一', '大工棟梁', '木と向き合い、手を動かす。その先にある、長く愛される家をつくります。', '木の癖を見極め、見えない部分にも手を抜かないこと。', '休みの日も道具を整えたり、木工を楽しんだりします。', '木の表情が暮らしとともに深まっていく家。'],
  ['hayashi', '林 未来', '広報・企画', 'KURAHAUSの想いや、暮らしの魅力をたくさんの方に届けていきます。', '家づくりに関わる人たちの言葉を、飾らず丁寧に伝えること。', '写真を撮りながら街を歩く時間が好きです。', '何気ない日常の場面を大切にできる家。'],
];
for (let i = 0; i < staff.length; i++) {
  const [slug, name, role, intro, principle, hobby, wish] = staff[i];
  write(`/staff/${slug}/`, name, 'STAFF', `${role}。${intro}`, 'concept-living.webp',
    section('プロフィール', `<div class="remaining-person">${figure(`staff_0${i + 1}.webp`, `${role} ${name}のポートレート`)}<div><p class="remaining-eyebrow">${esc(role)}</p><h3>${esc(name)}</h3>${p(intro)}${dl([['家づくりで大切にしていること', principle], ['趣味・休日', hobby], ['担当したい家', wish]])}${links([['/staff/', 'スタッフ一覧へ戻る'], ['/contact/', '家づくりを相談する']])}</div></div>`),
    { ancestors: [['/staff/', 'スタッフ']], nav: 'staff' });
}

const voices = [
  ['s-sama', 'Sさまご家族', '宇都宮市／ご夫婦＋お子さま', '木の香りに包まれて、毎日が気持ちいいです。', '家族が集まる場所をつくりたかったものの、どんな間取りが自分たちに合うか分からずにいました。', '暮らし方の話を丁寧に聞いてくれたことと、素材の心地よさが決め手になりました。', '窓から見える庭や朝の光について、設計士と何度も話した時間が印象に残っています。', 'リビングで本を読んだり、食卓を囲んだり。家族で過ごす時間が自然と増えました。', 'voice_s_family.webp', 'voice-s-main.webp', 'ko-yane-no-ie'],
  ['k-sama', 'Kさまご夫婦', '小山市／ご夫婦', 'スタッフの皆さんが丁寧に寄り添ってくれました。', '土地探しと資金計画の進め方が分からず、家づくりの最初の一歩に迷っていました。', '一つひとつを整理しながら説明してくれたので、安心して計画を進められました。', '中庭を囲む暮らしを想像しながら、家具や素材を選んだことが楽しい思い出です。', '庭の緑を眺めながらお茶を飲む時間が、今では毎日の楽しみになっています。', 'voice_k_dining.webp', 'voice-k-main.webp', 'nakaniwa-no-aru-ie'],
  ['n-sama', 'Nさまご家族', '那須町／ご夫婦＋お子さま2人', '暮らしの中心に、家族の時間が生まれました。', '子どもがのびのび過ごせて、家事もしやすい住まいを探していました。', '家族の普段の過ごし方を尊重した提案に、これからの暮らしが想像できました。', 'みんなで模型を見ながら、窓や居場所について話し合った時間を覚えています。', '食事も遊びも自然と同じ場所に集まるようになり、毎日を気持ちよく過ごしています。', 'voice_n_sofa.webp', 'voice-n-main.webp', 'ooyane-no-hiraya'],
];
for (let i = 0; i < voices.length; i++) {
  const [slug, title, profile, quote, worry, why, memory, now, photo, secondary, work] = voices[i];
  const next = voices[(i + 1) % voices.length];
  write(`/voice/${slug}/`, title, 'VOICE', quote, secondary,
    section('暮らしの声', `<p class="remaining-eyebrow">${esc(profile)}</p><blockquote class="remaining-quote">「${esc(quote)}」</blockquote><div class="remaining-gallery remaining-gallery--two">${figure(photo, `${title}の暮らしの風景`)}${figure(secondary, `${title}の住まいと家族の時間`)}</div>`)
    + section('家づくり前の悩み', p(worry)) + section('KURAHAUSを選んだ理由', p(why)) + section('家づくりの思い出', p(memory)) + section('住んでみて感じたこと', p(now))
    + section('あわせて読む', links([[`/works/${work}/`, '関連施工事例を見る'], [`/voice/${next[0]}/`, `次のVoice：${next[1]}`], ['/voice/', 'お客様の声一覧へ戻る']])),
    { ancestors: [['/voice/', 'お客様の声']], nav: 'voice' });
}

for (let i = 0; i < works.length; i++) {
  const [slug, title, city, area, tags, exterior] = works[i];
  const prev = i === 0 ? ['nakaniwa-no-aru-ie', '中庭のある家'] : works[i - 1];
  const next = works[(i + 1) % works.length];
  const inside = ['works_generic_interior.webp', 'modelhouse-oyama-living.webp', 'concept-living.webp'][i % 3];
  const garden = ['works_generic_garden.webp', 'modelhouse-nook.webp', 'concept-garden.webp'][i % 3];
  write(`/works/${slug}/`, title, 'WORKS', `${title}。自然素材とともに暮らす、KURAHAUSの施工事例。`, exterior,
    section('住まいのご紹介', `<div class="remaining-split"><div>${dl([['所在地', `栃木県${city}`], ['延床面積', area]])}<ul class="remaining-tags">${tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul><p>土地の個性を読み取り、光や風、庭とのつながりを大切に設計した住まいです。自然素材の手触りと暮らしやすい動線を重ね、日々の時間が心地よく流れる場所を目指しました。</p></div>${figure(exterior, `${title}の外観`)}</div>`)
    + section('室内と庭の風景', `<div class="remaining-gallery">${figure(inside, `${title}の室内`)}${figure(garden, `${title}から望む庭`)}${figure('works_generic_interior.webp', `${title}の自然素材を生かした内観`)}</div>`)
    + section('使用素材', dl([['構造・造作', '木材を生かした構造・造作'], ['床', '無垢材のフローリング'], ['壁', '自然素材の仕上げ'], ['開口部', '庭の風景を取り込む窓']]))
    + `<nav class="remaining-section content-shell" aria-label="前後の施工事例" data-reveal><h2>ほかの施工事例</h2>${links([[`/works/${prev[0]}/`, `← PREV ${prev[1]}`], [`/works/${next[0]}/`, `NEXT ${next[1]} →`], ['/works/', '施工事例一覧へ戻る']])}</nav>`,
    { ancestors: [['/works/', '施工事例']], nav: 'works' });
}

if (!fs.existsSync(path.join(root, '404.html'))) {
  write('/404.html', 'ページが見つかりませんでした。', '404 NOT FOUND', 'お探しのページは移動または削除された可能性があります。', 'bg_leaf.webp',
    section('こちらからお探しください', links([['/', 'TOPへ戻る'], ['/works/', '施工事例を見る'], ['/contact/', 'お問い合わせ']])), { noCta: true });
  // The static host serves /404.html directly; move its generated index.html into the root.
  const fallbackDir = path.join(root, '404.html');
  const fallbackNested = path.join(fallbackDir, 'index.html');
  const fallbackHtml = fs.readFileSync(fallbackNested, 'utf8');
  fs.rmSync(fallbackNested);
  fs.rmdirSync(fallbackDir);
  fs.writeFileSync(path.join(root, '404.html'), fallbackHtml);
}

function listPages(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'assets' || entry.name === 'scripts') return [];
    const target = path.join(folder, entry.name);
    if (entry.isDirectory()) return listPages(target);
    if (entry.name !== 'index.html') return [];
    const route = path.relative(root, folder).replaceAll('\\', '/');
    return [route ? `/${route}/` : '/'];
  });
}
const allRoutes = listPages(root).sort();
fs.writeFileSync(path.join(root, 'robots.txt'), '# TODO: replace example.com with the production domain on launch.\nUser-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<!-- TODO: replace example.com with the production domain on launch. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allRoutes.map(route => `  <url><loc>https://example.com${route}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Created ${created.length} pages, robots.txt and sitemap.xml.`);
