import test from 'node:test';
import assert from 'node:assert/strict';
import {isFormspreeEndpoint, sendContactMessage} from '../contact.js';

const endpoint = 'https://formspree.io/f/testform';
const message = {name: ' 테스트 ', email: ' visitor@example.com ', message: ' 한글 & 문의\n두 번째 줄 '};

test('accepts only the public HTTPS Formspree endpoint', () => {
  assert(isFormspreeEndpoint(endpoint));
  for (const url of ['', 'http://formspree.io/f/testform', 'https://formspree.io:123/f/testform', 'https://formspree.io.example.com/f/testform', 'https://user:password@formspree.io/f/testform', endpoint + '?token=secret']) {
    assert.equal(isFormspreeEndpoint(url), false, url);
  }
});

test('sends the complete message with the expected field names and JSON response negotiation', async () => {
  const result = await sendContactMessage(endpoint, message, {fetcher: async (url, options) => {
    assert.equal(url, endpoint);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Accept, 'application/json');
    assert.deepEqual(Object.fromEntries(options.body), {
      name: '테스트', email: 'visitor@example.com', message: '한글 & 문의\n두 번째 줄', _subject: '정서영 포트폴리오 문의',
    });
    return Response.json({ok: true});
  }});
  assert.deepEqual(result, {ok: true});
});

test('server rejection and rate limits never report success', async () => {
  for (const [status, reason] of [[400, 'service'], [500, 'service'], [429, 'limit']]) {
    const result = await sendContactMessage(endpoint, message, {fetcher: async () => Response.json({errors: [{message: 'Rejected'}]}, {status})});
    assert.deepEqual(result, {ok: false, reason});
  }
  assert.deepEqual(await sendContactMessage(endpoint, message, {fetcher: async () => Response.json({ok: false})}), {ok: false, reason: 'service'});
});

test('network uncertainty and request timeout are distinct from API acceptance', async () => {
  assert.deepEqual(await sendContactMessage(endpoint, message, {fetcher: async () => {throw new TypeError('offline');}}), {ok: false, reason: 'network'});
  const result = await sendContactMessage(endpoint, message, {
    timeoutMs: 5,
    fetcher: (_url, {signal}) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')), {once: true})),
  });
  assert.deepEqual(result, {ok: false, reason: 'timeout'});
});

test('an unconfigured form makes no outbound request', async () => {
  let requested = false;
  assert.deepEqual(await sendContactMessage('', message, {fetcher: async () => {requested = true;}}), {ok: false, reason: 'configuration'});
  assert.equal(requested, false);
});
