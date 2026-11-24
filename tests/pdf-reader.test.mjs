import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {projects} from '../data.js';
import {caseStudies} from '../case-studies.js';
import {pdfDocuments} from '../pdf-documents.js';
import {loadNamedPdf} from '../pdf-reader.js';

const fetcher = async path => new Response(await readFile(new URL('../' + path, import.meta.url)));

for (const [id, document] of Object.entries(pdfDocuments)) {
  test(`${id}: preserve source bytes, multipart order and canonical filename`, async () => {
    const source = projects.find(project => project.id === id.replace('-storyboard', ''));
    const project = {...source, ...caseStudies[id]};
    const file = await loadNamedPdf(project, document, {fetcher});
    assert.equal(file.name, document.filename);
    assert.equal(file.type, 'application/pdf');
    const original = await file.slice(0, document.sourceSize).arrayBuffer();
    assert.equal(createHash('sha256').update(Buffer.from(original)).digest('hex'), document.sourceSha256);
    const appended = Buffer.from(await file.slice(document.sourceSize).arrayBuffer());
    assert.equal(appended.toString('base64'), document.append);
    assert.match(await file.slice(-100).text(), /%%EOF/);
  });
}

test('reject a missing source instead of opening an error page as a PDF', async () => {
  await assert.rejects(loadNamedPdf({pdf:'missing.pdf'}, pdfDocuments.bridge, {
    fetcher:async () => new Response('Not found', {status:404}),
  }), /source unavailable/);
});

test('reject a replaced or truncated source before applying offset-dependent metadata', async () => {
  await assert.rejects(loadNamedPdf({pdf:'truncated.pdf'}, pdfDocuments.bridge, {
    fetcher:async () => new Response('%PDF-short'),
  }), /does not match/);
});

test('reject a different PDF even if its byte length has not changed', async () => {
  const replaced = Buffer.alloc(pdfDocuments.bridge.sourceSize);
  replaced.write('%PDF-');
  await assert.rejects(loadNamedPdf({pdf:'replaced.pdf'}, pdfDocuments.bridge, {
    fetcher:async () => new Response(replaced),
  }), /does not match/);
});
