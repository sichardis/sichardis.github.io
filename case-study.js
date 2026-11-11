const teamPhotosLabel = '팀 활동 사진';

const sectionLabels = [
  ['summary', '요약'],
  ['background', '배경·목표'],
  ['process', '과정'],
  ['contribution', '기여'],
  ['result', '결과'],
  ['team-photos', teamPhotosLabel],
];

export function detailIndexButtons(projectId, hasTeamPhotos = true) {
  const labels = hasTeamPhotos ? sectionLabels : sectionLabels.slice(0, -1);
  return labels.map(([key, label]) =>
    `<button type="button" data-section="${projectId}-${key}">${label}</button>`).join('');
}

export function awardMarkup(award, escape) {
  if (!award) return '';
  return `<h3 class="project-award-heading">
    <span class="tool-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v2a3 3 0 0 0 4 3m8-5h4v2a3 3 0 0 1-4 3m-4 3v5m-5 3h10m-9 0v-3h8v3"/></svg></span>수상 내역
  </h3><p>${escape(award.title)}</p>`;
}

export function teamPhotosMarkup(projectId, photos, escape) {
  return `<section id="${projectId}-team-photos" class="bridge-section" tabindex="-1">
    <h2>${teamPhotosLabel}</h2>
    <div class="team-photo-grid">
      ${photos
        ? photos.map(({src, alt}) => `<img src="${escape(src)}" alt="${escape(alt)}" width="1050" height="700" loading="lazy" decoding="async">`).join('')
        : '<div class="team-photo-placeholder" lang="en">Image</div>'.repeat(3)}
    </div>
  </section>`;
}

function processMedia(step, escape, {loading = 'eager', placeholder = ''} = {}) {
  if (placeholder || !step.image) {
    return `<div class="case-process-media case-process-placeholder" role="img" aria-label="${escape(placeholder || '이미지 자료 준비 중')}">${escape(placeholder)}</div>`;
  }
  const thumbnail = loading === 'lazy' && step.thumbnail;
  const src = thumbnail || `./assets/case-studies/${step.image}`;
  return `<img class="case-process-media" src="${escape(src)}" alt="${escape(step.title)} 자료" width="${thumbnail ? 768 : 1600}" height="${thumbnail ? 432 : 900}" loading="${loading}" decoding="async">`;
}

export function caseStudyMarkup(project, hero, escape) {
  const hasTeamPhotos = project.documentType !== 'storyboard';
  const sectionId = key => `${project.id}-${key}`;
  const cards = project.steps.map((step, i) => {
    const label = `${String(i + 1).padStart(2, '0')} ${escape(step.title)}`;
    return `<button type="button" class="process-card" data-process="${i}" aria-label="${label} 상세 보기">
      ${processMedia(step, escape, {loading:'lazy', placeholder:project.processImagePlaceholder})}<span>${label}</span>
    </button>`;
  }).join('');
  const downloadLabel = `${escape(project.pdfLabel || project.title + ' 원본 전체 보기')} · PDF`;
  const download = project.pdfParts
    ? `<button class="bridge-download" type="button" data-pdf-parts><span>${downloadLabel}</span><span aria-hidden="true">↓</span></button>`
    : project.pdf
      ? `<a class="bridge-download" href="${escape(project.pdf)}" download="${escape(project.pdfFilename)}">${downloadLabel} <span aria-hidden="true">↓</span></a>`
      : '';
  const paragraphs = items => items.map(item => `<p>${escape(item)}</p>`).join('');

  const result = `<section id="${sectionId('result')}" class="bridge-section case-copy" tabindex="-1">
    <h2>결과</h2>${paragraphs(project.results)}
  </section>`;

  return `<div class="bridge-layout">
    <nav class="section-index" aria-label="${escape(project.title)} 상세 목차">${detailIndexButtons(project.id, hasTeamPhotos)}</nav>
    <article class="bridge-article">
      <div class="bridge-hero">${hero}</div>
      <section id="${sectionId('summary')}" class="bridge-section" tabindex="-1">
        <h2>요약</h2>
        <dl class="bridge-facts">
          <div><dt>문서 유형</dt><dd>${escape(project.documentLabel)}</dd></div>
          <div><dt>팀 구성</dt><dd>${escape(project.team)}</dd></div>
        </dl>
        ${awardMarkup(project.award, escape)}
        <h3>주요 수행 과업</h3><p>${escape(project.tasks)}</p>
      </section>
      <section id="${sectionId('background')}" class="bridge-section case-copy" tabindex="-1">
        <h2>배경·목표</h2><h3 class="bridge-goal">${escape(project.goal)}</h3>
        ${paragraphs(project.background)}
      </section>
      <section id="${sectionId('process')}" class="bridge-section" tabindex="-1">
        <h2>과정</h2><p>카드를 선택해 ${escape(project.processLabel)} 과정을 확인해 보세요.</p>
        <div class="process-grid">${cards}</div>${download}
      </section>
      <section id="${sectionId('contribution')}" class="bridge-section" tabindex="-1">
        <h2>기여</h2><ul>${project.contributions.map(item => `<li>${escape(item)}</li>`).join('')}</ul>
      </section>
      ${hasTeamPhotos ? result : ''}
      <div class="bridge-ending">
        ${hasTeamPhotos ? teamPhotosMarkup(project.id, project.teamPhotos, escape) : result}
        <div class="back-to-top-wrap"><button class="back-to-top" type="button" data-detail-top>상단으로 <span aria-hidden="true">↑</span></button></div>
      </div>
    </article>
  </div>`;
}

export function caseProcessMarkup(project, steps, index, escape) {
  const step = steps[index];
  const media = project.id === 'bridge'
    ? `<img class="case-process-media" src="./assets/bridge-process-${index + 1}.jpg" alt="브릿지 ${escape(step.title)} 원본 자료" width="1600" height="900" decoding="async">`
    : processMedia(step, escape, {placeholder:project.processImagePlaceholder});
  return `<h2 id="process-title">${escape(step.title)}</h2>
    <p class="process-summary">${escape(step.summary)}</p>
    <div class="process-media-row">
      <button class="process-arrow" type="button" data-process-prev aria-label="이전 단계"${index === 0 ? ' disabled' : ''}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>
      </button>
      ${media}
      <button class="process-arrow" type="button" data-process-next aria-label="${index + 1 === steps.length ? '첫 단계로' : '다음 단계'}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
      </button>
    </div>
    ${step.sections.map(([title, text]) => `<section class="process-explanation"><h3>${escape(title)}</h3><p>${escape(text)}</p></section>`).join('')}`;
}
