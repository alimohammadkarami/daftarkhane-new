
    const API_URL = 'http://localhost:4460/api/letters';
    function gregorianToJalali(gy, gm, gd) {
      const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const gy2 = (gm > 2) ? (gy + 1) : gy;

      let days = 355666 + (365 * gy)
        + Math.floor((gy2 + 3) / 4)
        - Math.floor((gy2 + 99) / 100)
        + Math.floor((gy2 + 399) / 400)
        + gd
        + gDaysInMonth.slice(0, gm - 1).reduce((a, b) => a + b, 0);

      let jy = -1595 + (33 * Math.floor(days / 12053));
      days %= 12053;
      jy += 4 * Math.floor(days / 1461);
      days %= 1461;

      if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
      }

      let jm, jd;
      if (days < 186) {
        jm = 1 + Math.floor(days / 31);
        jd = 1 + (days % 31);
      } else {
        jm = 7 + Math.floor((days - 186) / 30);
        jd = 1 + ((days - 186) % 30);
      }

      return { jy, jm, jd };
    }

    function toJalaliDateString(gregorianDateValue) {
      const [gy, gm, gd] = gregorianDateValue.split('-').map(Number);
      const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);
      const pad = (n) => String(n).padStart(2, '0');
      return `${jy}-${pad(jm)}-${pad(jd)}`;
    }
    const form = document.getElementById('letterForm');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formStatus = document.getElementById('formStatus');
    const registrationNumberInput = document.getElementById('registration_number');

    const letterDateInput = document.getElementById('letter_date');
    const senderInput = document.getElementById('sender');
    const receiverInput = document.getElementById('receiver');
    const subjectInput = document.getElementById('subject');
    const attachmentsCountInput = document.getElementById('attachments_count');
    const fileInput = document.getElementById('file_attachment');
    const notesInput = document.getElementById('notes');

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // ۱۰ مگابایت، هم‌سو با محدودیت بک‌اند

    function setFieldError(groupId, hasError) {
      const group = document.getElementById(groupId);
      group.classList.toggle('has-error', hasError);
    }

    function clearAllErrors() {
      document.querySelectorAll('.form-group.has-error').forEach((el) => {
        el.classList.remove('has-error');
      });
    }

    function showStatus(type, message, detailsList) {
      formStatus.className = `status-banner show ${type}`;
      let html = `<div>${message}</div>`;
      if (Array.isArray(detailsList) && detailsList.length) {
        html += '<ul>' + detailsList.map((d) => `<li>${d}</li>`).join('') + '</ul>';
      }
      formStatus.innerHTML = html;
      formStatus.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function hideStatus() {
      formStatus.className = 'status-banner';
      formStatus.innerHTML = '';
    }
    function validateForm() {
      clearAllErrors();
      let isValid = true;
      let firstInvalidEl = null;

      const letterType = document.querySelector('input[name="letter_type"]:checked');
      if (!letterType) {
        setFieldError('group-letter_type', true);
        isValid = false;
      }

      if (!letterDateInput.value) {
        setFieldError('group-letter_date', true);
        isValid = false;
        firstInvalidEl = firstInvalidEl || letterDateInput;
      }

      if (!senderInput.value.trim()) {
        setFieldError('group-sender', true);
        isValid = false;
        firstInvalidEl = firstInvalidEl || senderInput;
      }

      if (!receiverInput.value.trim()) {
        setFieldError('group-receiver', true);
        isValid = false;
        firstInvalidEl = firstInvalidEl || receiverInput;
      }

      if (!subjectInput.value.trim()) {
        setFieldError('group-subject', true);
        isValid = false;
        firstInvalidEl = firstInvalidEl || subjectInput;
      }

      if (fileInput.files.length && fileInput.files[0].size > MAX_FILE_SIZE) {
        setFieldError('group-file_attachment', true);
        isValid = false;
        firstInvalidEl = firstInvalidEl || fileInput;
      }

      if (firstInvalidEl) {
        firstInvalidEl.focus();
      }

      return isValid;
    }
    async function submitLetter() {
      const letterType = document.querySelector('input[name="letter_type"]:checked').value;
      const letterDateJalali = toJalaliDateString(letterDateInput.value);

      const formData = new FormData();
      formData.append('letterType', letterType);
      formData.append('letterDate', letterDateJalali);
      formData.append('sender', senderInput.value.trim());
      formData.append('receiver', receiverInput.value.trim());
      formData.append('subject', subjectInput.value.trim());
      formData.append('attachmentsCount', attachmentsCountInput.value || '0');
      formData.append('description', notesInput.value.trim());

      if (fileInput.files.length) {
        formData.append('scanFile', fileInput.files[0]);
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (e) {
      }

      if (!response.ok) {
        const message = (payload && payload.message) || 'ثبت نامه با خطا مواجه شد.';
        const details = payload && payload.errors;
        const error = new Error(message);
        error.details = details;
        throw error;
      }

      return payload;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideStatus();

      if (!validateForm()) {
        showStatus('error', 'لطفاً فیلدهای الزامی مشخص‌شده را تکمیل کنید.');
        return;
      }

      submitBtn.disabled = true;
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'در حال ثبت...';

      try {
        const result = await submitLetter();
        const registrationNumber = result?.data?.registrationNumber || '-';

        registrationNumberInput.value = registrationNumber;
        showStatus('success', `نامه با موفقیت ثبت شد. شماره ثبت: ${registrationNumber}`);

        form.reset();
        registrationNumberInput.value = registrationNumber;
      } catch (err) {
        showStatus('error', err.message, err.details);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });

    cancelBtn.addEventListener('click', () => {
      form.reset();
      clearAllErrors();
      hideStatus();
      registrationNumberInput.value = 'پس از ثبت نامه تولید می‌شود';
    });

    fileInput.addEventListener('change', () => {
      const label = document.getElementById('file_attachment_label');
      if (fileInput.files.length) {
        label.textContent = `📎 ${fileInput.files[0].name}`;
        setFieldError('group-file_attachment', false);
      } else {
        label.textContent = '📁 کلیک کنید یا فایل اسکن‌شده را اینجا رها کنید';
      }
    });