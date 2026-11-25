import test from 'node:test';
import assert from 'node:assert/strict';
import {isMobileContactDevice, initFooterContacts} from '../footer-contact.js';

test('phones and iPad desktop mode connect, desktop and touch laptops copy', () => {
  for (const device of [
    {userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'},
    {userAgent:'Mozilla/5.0 (Linux; Android 15)'},
    {userAgent:'Mozilla/5.0', userAgentData:{mobile:true}},
    {userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform:'MacIntel', maxTouchPoints:5},
  ]) assert.equal(isMobileContactDevice(device), true);
  for (const device of [
    {userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', maxTouchPoints:10},
    {userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform:'MacIntel', maxTouchPoints:0},
    {userAgent:'Mozilla/5.0 (X11; Linux x86_64)'},
  ]) assert.equal(isMobileContactDevice(device), false);
});

function fixture() {
  const status = {textContent:''};
  const values = [['전화번호','+82 10 9163 3356','tel:+821091633356'],['이메일','richardis6551@naver.com','mailto:richardis6551@naver.com']];
  const contacts = values.map(([label, value, href]) => ({
    dataset:{footerContact:label, copyValue:value}, textContent:value,
    attrs:{href}, handlers:{}, clickCount:0,
    setAttribute(name, value) { this.attrs[name]=value; },
    removeAttribute(name) { delete this.attrs[name]; },
    addEventListener(name, fn) { this.handlers[name]=fn; },
    click() { this.clickCount++; },
  }));
  return {status, contacts, footer:{ownerDocument:{}, querySelector:()=>status, querySelectorAll:()=>contacts}};
}

test('desktop contacts copy their exact values and announce success without opening an app', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  const f=fixture(), copied=[];
  initFooterContacts(f.footer, {device:{userAgent:'Desktop'}, clipboard:{writeText:async value=>copied.push(value)}});
  for (const contact of f.contacts) {
    assert.equal(contact.attrs.href, undefined);
    assert.equal(contact.attrs.role, 'button');
    assert.equal(contact.tabIndex, 0);
    let prevented=false;
    await contact.handlers.click({preventDefault(){ prevented=true; }});
    assert.equal(prevented,true);
    assert.match(f.status.textContent,/복사되었습니다/);
  }
  assert.deepEqual(copied,['+82 10 9163 3356','richardis6551@naver.com']);
  assert.equal(f.status.textContent,'이메일이 복사되었습니다.');
  t.mock.timers.tick(4000);
  assert.equal(f.status.textContent,'');
  for (const key of ['Enter',' ']) {
    let prevented=false;
    f.contacts[0].handlers.keydown({key,preventDefault(){prevented=true;}});
    assert(prevented);
  }
  assert.equal(f.contacts[0].clickCount,2);
});

test('mobile keeps native telephone and email links without intercepting clicks', () => {
  const f=fixture();
  initFooterContacts(f.footer, {device:{userAgent:'iPhone'}});
  assert.deepEqual(f.contacts.map(c=>c.attrs.href),['tel:+821091633356','mailto:richardis6551@naver.com']);
  assert(f.contacts.every(c=>!c.attrs.role&&!c.handlers.click));
});

test('clipboard rejection falls back to selection copying and reports failure honestly', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  const f=fixture();
  let selected='',removed=0,refocused=0,works=true;
  const document={
    activeElement:{focus(){refocused++;}}, getSelection:()=>null,
    createElement:()=>({style:{},select(){selected=this.value;},remove(){removed++;}}),
    body:{append(){}}, execCommand:command=>command==='copy'&&works,
  };
  f.footer.ownerDocument=document;
  initFooterContacts(f.footer,{device:{userAgent:'Desktop'},clipboard:{writeText:async()=>{throw new Error('Denied');}}});
  await f.contacts[0].handlers.click({preventDefault(){}});
  assert.equal(selected,'+82 10 9163 3356');
  assert.equal(f.status.textContent,'전화번호가 복사되었습니다.');
  works=false;
  await f.contacts[1].handlers.click({preventDefault(){}});
  assert.match(f.status.textContent,/선택해/);
  assert.equal(removed,2);
  assert.equal(refocused,2);
});
