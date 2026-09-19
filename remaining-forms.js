// The two new forms are UI previews until an actual POST endpoint is configured.
document.querySelectorAll('[data-preview-form]').forEach(form => {
  const button = form.querySelector('[data-preview-submit]');
  const status = form.querySelector('[data-preview-status]');
  button.disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    // Browser required/type validation runs before the submit event.
    status.textContent = '現在送信機能は準備中です。入力内容は送信されていません。お急ぎの場合はお電話でご連絡ください。';
    status.hidden = false;
  });
});
