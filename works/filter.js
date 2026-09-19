const worksFilter = document.querySelector('.works-filter');
if (worksFilter) {
  const cards = [...document.querySelectorAll('.works-gallery-card')];
  const buttons = [...worksFilter.querySelectorAll('.works-filter__chips button')];
  const area = worksFilter.querySelector('[data-works-area]');
  const count = worksFilter.querySelector('[data-works-count]');
  function update() {
    const category = buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.textContent.trim() || 'すべて';
    const selectedArea = area.value;
    let visible = 0;
    for (const card of cards) {
      const tags = [...card.querySelectorAll('li')].map(el => el.textContent.trim());
      const place = card.querySelector('p').textContent;
      const matchesCategory = category === 'すべて' || tags.includes(category);
      const matchesArea = selectedArea === 'すべてのエリア' || (selectedArea === 'その他' ? !['宇都宮市', '小山市', '鹿沼市', '那須塩原市'].some(city => place.includes(city)) : place.includes(selectedArea));
      card.hidden = !(matchesCategory && matchesArea);
      if (!card.hidden) visible++;
    }
    count.textContent = `${visible}件表示／全${cards.length}件`;
  }
  for (const button of buttons) button.addEventListener('click', () => {
    for (const candidate of buttons) candidate.setAttribute('aria-pressed', String(candidate === button));
    update();
  });
  area.addEventListener('change', update);
  update();
}
