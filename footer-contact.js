export function isMobileContactDevice(device) {
  return device.userAgentData?.mobile === true
    || /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(device.userAgent || '')
    || (device.platform === 'MacIntel' && device.maxTouchPoints > 1);
}

async function copyContact(value, {clipboard, document}) {
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(value);
      return;
    } catch {
      // Local previews and browsers with clipboard access disabled use selection copying.
    }
  }
  const active = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection ? Array.from({length:selection.rangeCount}, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
  const input = document.createElement('textarea');
  input.value = value;
  input.readOnly = true;
  input.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px';
  document.body.append(input);
  try {
    input.select();
    if (!document.execCommand('copy')) throw new Error('Copy unavailable');
  } finally {
    input.remove();
    active?.focus({preventScroll:true});
    if (selection) {
      selection.removeAllRanges();
      ranges.forEach(range => selection.addRange(range));
    }
  }
}

export function initFooterContacts(footer, environment = {}) {
  if (!footer) return;
  const device = environment.device || navigator;
  const document = footer.ownerDocument;
  const clipboard = environment.clipboard || device.clipboard;
  const mobile = isMobileContactDevice(device);
  const status = footer.querySelector('[data-footer-contact-status]');
  let feedbackTimer;
  for (const contact of footer.querySelectorAll('[data-footer-contact]')) {
    const label = contact.dataset.footerContact;
    contact.title = `${label} ${mobile ? '연결' : '복사'}`;
    contact.setAttribute('aria-label', `${label} ${mobile ? '연결' : '복사'}: ${contact.textContent.trim()}`);
    if (mobile) continue;
    contact.removeAttribute('href');
    contact.setAttribute('role', 'button');
    contact.tabIndex = 0;
    contact.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        contact.click();
      }
    });
    contact.addEventListener('click', async event => {
      event.preventDefault();
      clearTimeout(feedbackTimer);
      try {
        await copyContact(contact.dataset.copyValue, {clipboard, document});
        if (status) status.textContent = `${label}${label === '이메일' ? '이' : '가'} 복사되었습니다.`;
      } catch {
        if (status) status.textContent = '연락처를 선택해 Ctrl+C 또는 ⌘C로 복사해 주세요.';
      }
      feedbackTimer = setTimeout(() => { if (status) status.textContent = ''; }, 4000);
    });
  }
}
