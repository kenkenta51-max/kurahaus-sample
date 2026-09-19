// STEP19: scoped to the reservation form; replace this preview handler when a POST endpoint is ready.
const reserveForm = document.querySelector("[data-reserve-form]");

if (reserveForm) {
  const modelhouse = new URLSearchParams(window.location.search).get("modelhouse");
  const modelhouseSelect = reserveForm.elements.namedItem("modelhouse");
  if (modelhouse === "utsunomiya" || modelhouse === "oyama") {
    modelhouseSelect.value = modelhouse;
  }

  const submitButton = reserveForm.querySelector("[data-reserve-submit]");
  const status = reserveForm.querySelector("[data-reserve-status]");
  submitButton.disabled = false;

  reserveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // Native required/email validation runs before this submit event.
    status.textContent = "現在フォーム送信機能は準備中です。入力内容は送信されていません。お電話でご予約ください。";
    status.hidden = false;
  });
}

