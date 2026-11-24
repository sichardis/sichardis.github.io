export function isFormspreeEndpoint(value) {
  try {
    const url = new URL(value);
    return url.origin === 'https://formspree.io'
      && /^\/f\/[a-z0-9]+$/i.test(url.pathname)
      && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}

export async function sendContactMessage(endpoint, fields, {fetcher = fetch, timeoutMs = 20000} = {}) {
  if (!isFormspreeEndpoint(endpoint)) return {ok: false, reason: 'configuration'};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const body = new FormData();
  for (const name of ['name', 'email', 'message']) body.set(name, String(fields[name] || '').trim());
  body.set('_subject', '정서영 포트폴리오 문의');
  try {
    const response = await fetcher(endpoint, {
      method: 'POST', body, signal: controller.signal,
      headers: {Accept: 'application/json'},
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result?.ok !== false) return {ok: true};
    return {ok: false, reason: response.status === 429 ? 'limit' : 'service'};
  } catch (error) {
    return {ok: false, reason: error.name === 'AbortError' ? 'timeout' : 'network'};
  } finally { clearTimeout(timeout); }
}

export function initContactForm(form, config, {send = sendContactMessage} = {}) {
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('[role="status"]');
  const ready = isFormspreeEndpoint(config.endpoint);
  let submitting = false;
  button.disabled = !ready;
  if (ready) form.action = config.endpoint;
  else {
    status.dataset.state = 'pending';
    status.textContent = '메시지 전송 기능을 준비하고 있습니다.';
  }
  const setStatus = (state, message) => {
    status.dataset.state = state;
    status.textContent = message;
  };
  for (const name of ['name', 'message']) {
    form.elements[name].addEventListener('input', event => event.currentTarget.setCustomValidity(''));
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ready || submitting) return;
    for (const name of ['name', 'message']) {
      const field = form.elements[name];
      field.setCustomValidity(field.value.trim() ? '' : name === 'name' ? '이름을 입력해 주세요.' : '메시지를 입력해 주세요.');
    }
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    const inputs = [...form.querySelectorAll('input, textarea')];
    const previousReadOnly = inputs.map(input => input.readOnly);
    inputs.forEach(input => { input.readOnly = true; });
    submitting = true;
    button.disabled = true;
    button.textContent = '보내는 중…';
    form.setAttribute('aria-busy', 'true');
    setStatus('sending', '메시지를 보내고 있습니다.');
    let result;
    try { result = await send(config.endpoint, fields); }
    catch { result = {ok: false, reason: 'network'}; }
    finally {
      inputs.forEach((input, index) => { input.readOnly = previousReadOnly[index]; });
      submitting = false;
      button.disabled = false;
      button.textContent = '메시지 보내기';
      form.setAttribute('aria-busy', 'false');
    }
    if (result.ok) {
      form.reset();
      setStatus('success', '메시지가 접수되었습니다. 앞으로 이어갈 매듭에 대해 답변드리겠습니다. 감사합니다.');
    } else {
      const uncertain = ['network', 'timeout'].includes(result.reason);
      setStatus('error', uncertain
        ? '전송 결과를 확인하지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요. 입력한 내용은 그대로 남아 있습니다.'
        : '현재 메시지를 접수할 수 없습니다. 잠시 후 다시 시도하거나 이메일 주소로 연락해 주세요. 입력한 내용은 그대로 남아 있습니다.');
    }
    status.focus({preventScroll: true});
  });
}
