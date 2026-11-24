// Reuse the native PDF reader, with the same document name for view and download.
export async function loadNamedPdf(project, document, {fetcher = fetch} = {}) {
  const sources = project.pdfParts
    ? Array.from({length:project.pdfParts.count}, (_, i) => `${project.pdfParts.folder}/${String(i + 1).padStart(2, '0')}.bin`)
    : [project.pdf];
  if (!document || sources.some(source => !source)) throw new Error('PDF source unavailable');
  const parts = await Promise.all(sources.map(async source => {
    const response = await fetcher(source);
    if (!response.ok) throw new Error('PDF source unavailable');
    return response.blob();
  }));
  const original = new Blob(parts, {type:'application/pdf'});
  if (original.size !== document.sourceSize || await original.slice(0, 5).text() !== '%PDF-') {
    throw new Error('PDF source does not match its title update');
  }
  const checksum = await crypto.subtle.digest('SHA-256', await original.arrayBuffer());
  const hash = [...new Uint8Array(checksum)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  if (hash !== document.sourceSha256) throw new Error('PDF source does not match its title update');
  const update = Uint8Array.from(atob(document.append), character => character.charCodeAt(0));
  return new File([original, update], document.filename, {type:'application/pdf'});
}
