import test from 'node:test';
import assert from 'node:assert/strict';
import {projects} from '../data.js';
import {caseStudies} from '../case-studies.js';
import {pdfDocuments} from '../pdf-documents.js';
import {caseStudyMarkup, pdfDownloadMarkup} from '../case-study.js';
import {bridgeMarkup} from '../bridge.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const project = id => ({
  ...projects.find(item => item.id === id.replace('-storyboard', '')),
  ...caseStudies[id],
  id,
  documentType:id.endsWith('-storyboard') ? 'storyboard' : 'plan',
  pdfFilename:pdfDocuments[id].filename,
});

for (const id of Object.keys(pdfDocuments)) {
  test(`${id}: one overview and one lower download action`, () => {
    const p = project(id);
    const html = id === 'bridge' ? bridgeMarkup('hero', p, escape) : caseStudyMarkup(p, 'hero', escape);
    assert.equal((html.match(/class="summary-facts"/g) || []).length, 1);
    assert.equal((html.match(/class="detail-download-row"/g) || []).length, 1);
    assert.equal((html.match(/>PDF 다운로드</g) || []).length, 1);
    assert.doesNotMatch(html, /data-pdf-file-view|data-pdf-view/);
    assert(html.includes(p.pdfFilename));
    assert(html.includes('담당 역할'));
    assert(html.includes('팀 구성'));
    assert(html.includes('class="task-list"'));
  });
}

test('Bridge uses the shared layout with all six original process images', () => {
  const html = bridgeMarkup('hero', project('bridge'), escape);
  for (let i = 1; i <= 6; i++) assert(html.includes(`./assets/bridge-process-${i}.jpg`));
  assert.doesNotMatch(html, /bridge-team-photos|팀 활동 사진/);
  assert.equal((html.match(/data-process=/g) || []).length, 6);
});

test('screen design document authors and PDF page guidance remain visible', () => {
  const authors = {'chak-storyboard':'2인 공동 작성', 'bluedog-storyboard':'1인 작성', 'rocketfresh-storyboard':'5인 작성', 'kaywon-storyboard':'4인 작성'};
  for (const [id, author] of Object.entries(authors)) {
    const html = caseStudyMarkup(project(id), 'hero', escape);
    assert(html.includes(author));
  }
  assert(pdfDownloadMarkup(project('bluedog-storyboard'), escape).includes('화면설계 98–141쪽'));
});

test('projects without an available PDF do not show a download action', () => {
  assert.equal(pdfDownloadMarkup({}, escape), '');
});
