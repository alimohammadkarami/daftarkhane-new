const API_BASE = "http://localhost:4460/api/letters";
const SEARCH_URL = `${API_BASE}/get`;
const downloadUrl = (id) => `${API_BASE}/${id}/download`;

const LETTER_TYPE_LABELS = {
  incoming: "وارده",
  outgoing: "صادره",
  internal: "داخلی",
};

// =====================================================================
// مرجع عناصر
// =====================================================================
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchFieldError = document.getElementById("searchFieldError");
const statusBanner = document.getElementById("statusBanner");
const resultCard = document.getElementById("resultCard");
const typeBadge = document.getElementById("typeBadge");
const regNumberDisplay = document.getElementById("regNumberDisplay");
const infoList = document.getElementById("infoList");
const resultActions = document.getElementById("resultActions");

// =====================================================================
// توابع کمکی نمایش
// =====================================================================
function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

function showStatus(type, message) {
  statusBanner.className = `status-banner show ${type}`;
  statusBanner.textContent = message;
}

function hideStatus() {
  statusBanner.className = "status-banner";
  statusBanner.textContent = "";
}

function showFieldError(show) {
  searchInput.classList.toggle("has-error", show);
  searchFieldError.classList.toggle("show", show);
}

function addInfoRow(label, value, muted) {
  const row = document.createElement("div");
  row.className = "info-row";

  const labelEl = document.createElement("div");
  labelEl.className = "info-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("div");
  valueEl.className = "info-value" + (muted ? " muted" : "");
  valueEl.textContent = value;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  infoList.appendChild(row);
}

// =====================================================================
// ساخت کارت نتیجه از داده نامه
// =====================================================================
function renderLetter(letter) {
  typeBadge.textContent =
    LETTER_TYPE_LABELS[letter.letter_type] || letter.letter_type;
  typeBadge.className = `type-badge ${letter.letter_type}`;

  regNumberDisplay.textContent = letter.registration_number || "—";

  infoList.innerHTML = "";
  addInfoRow("تاریخ نامه", letter.letter_date_jalali || "—");
  addInfoRow("فرستنده", letter.sender || "—");
  addInfoRow("گیرنده", letter.receiver || "—");
  addInfoRow("موضوع / عنوان نامه", letter.subject || "—");
  addInfoRow(
    "تعداد برگ / پیوست",
    toPersianDigits(letter.attachments_count ?? 0),
  );
  addInfoRow(
    "توضیحات / پاراف اولیه",
    letter.description || "ثبت نشده",
    !letter.description,
  );
  addInfoRow("تاریخ ثبت در سیستم", letter.created_at || "—", true);

  renderDownloadArea(letter);

  resultCard.hidden = false;
}

function renderDownloadArea(letter) {
  resultActions.innerHTML = "";

  if (!letter.scan_file_path) {
    const note = document.createElement("div");
    note.className = "no-file-note";
    note.textContent = "برای این نامه فایل اسکنی ثبت نشده است.";
    resultActions.appendChild(note);
    return;
  }

  const box = document.createElement("div");
  box.className = "download-box";

  const fileName = document.createElement("div");
  fileName.className = "file-name";
  fileName.textContent = `📎 ${letter.scan_file_original_name || "فایل پیوست"}`;

  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.className = "btn btn-primary";
  downloadBtn.textContent = "دانلود فایل";
  downloadBtn.addEventListener("click", () =>
    downloadAttachment(letter.id, downloadBtn),
  );

  box.appendChild(fileName);
  box.appendChild(downloadBtn);
  resultActions.appendChild(box);

  const errorText = document.createElement("div");
  errorText.className = "download-error-text";
  errorText.id = "downloadErrorText";
  resultActions.appendChild(errorText);
}

// =====================================================================
// دانلود فایل پیوست
// پاسخ ممکن است فایل باینری (موفق) یا JSON خطا (نامه/فایل یافت نشد) باشد
// =====================================================================
async function downloadAttachment(letterId, buttonEl) {
  const errorText = document.getElementById("downloadErrorText");
  errorText.classList.remove("show");
  errorText.textContent = "";

  const originalText = buttonEl.textContent;
  buttonEl.disabled = true;
  buttonEl.textContent = "در حال دانلود...";

  try {
    const response = await fetch(downloadUrl(letterId));
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || contentType.includes("application/json")) {
      let message = "دانلود فایل با خطا مواجه شد.";
      try {
        const payload = await response.json();
        if (payload && payload.message) message = payload.message;
      } catch (e) {
        // پاسخ JSON نبود، از پیام پیش‌فرض استفاده می‌شود
      }
      errorText.textContent = message;
      errorText.classList.add("show");
      return;
    }
    console.log(response.headers.get("content-disposition"));
    console.log(response.headers.get("content-type"));
    const blob = await response.blob();

    let filename = "attachment";
    const disposition = response.headers.get("content-disposition");
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      if (match && match[1]) filename = decodeURIComponent(match[1]);
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    errorText.textContent = "برقراری ارتباط با سرور برای دانلود فایل ممکن نشد.";
    errorText.classList.add("show");
  } finally {
    buttonEl.disabled = false;
    buttonEl.textContent = originalText;
  }
}

// =====================================================================
// جستجوی نامه
// =====================================================================
async function searchLetter() {
  const stringId = searchInput.value.trim();

  hideStatus();
  showFieldError(false);
  resultCard.hidden = true;

  if (!stringId) {
    showFieldError(true);
    return;
  }

  searchBtn.disabled = true;
  const originalBtnText = searchBtn.textContent;
  searchBtn.textContent = "در حال جستجو...";

  try {
    const response = await fetch(SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stringId }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (e) {}

    if (!payload) {
      showStatus("error", "پاسخ نامعتبری از سرور دریافت شد.");
      return;
    }
    if (payload.message == "نامه با شماره مد نظر پیدا نشد") {
      showStatus("error", "نامه ای با شماره وارد شده یافت نشد");
      return;
    }

    showStatus(
      payload.success ? "success" : "error",
      payload.message || (payload.success ? "نامه یافت شد." : "نامه یافت نشد."),
    );

    if (payload.success && payload.data) {
      renderLetter(payload.data);
    }
  } catch (err) {
    showStatus(
      "error",
      "برقراری ارتباط با سرور ممکن نشد. اتصال شبکه یا آدرس سرور را بررسی کنید.",
    );
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = originalBtnText;
  }
}

searchBtn.addEventListener("click", searchLetter);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchLetter();
});
searchInput.addEventListener("input", () => {
  if (searchInput.value.trim()) showFieldError(false);
});
