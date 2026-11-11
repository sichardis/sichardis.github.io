const teamPhotosLabel = '팀 활동 사진';

const sectionLabels = [
  ['summary', '요약'],
  ['background', '배경·목표'],
  ['process', '과정'],
  ['contribution', '기여'],
  ['result', '결과'],
  ['team-photos', teamPhotosLabel],
];

export function detailIndexButtons(projectId) {
  return sectionLabels.map(([key, label]) =>
    `<button type="button" data-section="${projectId}-${key}">${label}</button>`).join('');
}

export function teamPhotosMarkup(projectId) {
  return `<section id="${projectId}-team-photos" class="bridge-section" tabindex="-1">
    <h2>${teamPhotosLabel}</h2>
    <div class="team-photo-grid">
      <div class="team-photo-placeholder" lang="en">Image</div>
      <div class="team-photo-placeholder" lang="en">Image</div>
      <div class="team-photo-placeholder" lang="en">Image</div>
    </div>
  </section>`;
}

function processMedia(step, escape, {loading = 'eager', placeholder = ''} = {}) {
  if (placeholder || !step.image) {
    return `<div class="case-process-media case-process-placeholder" role="img" aria-label="${escape(placeholder || '이미지 자료 준비 중')}">${escape(placeholder)}</div>`;
  }
  return `<img class="case-process-media" src="./assets/case-studies/${escape(step.image)}" alt="${escape(step.title)} 자료" width="1600" height="900" loading="${loading}">`;
}

export function caseStudyMarkup(project, hero, escape) {
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
      ? `<a class="bridge-download" href="${escape(project.pdf)}" download>${downloadLabel} <span aria-hidden="true">↓</span></a>`
      : '';
  const paragraphs = items => items.map(item => `<p>${escape(item)}</p>`).join('');

  return `<div class="bridge-layout">
    <nav class="section-index" aria-label="${escape(project.title)} 상세 목차">${detailIndexButtons(project.id)}</nav>
    <article class="bridge-article">
      <div class="bridge-hero">${hero}</div>
      <section id="${sectionId('summary')}" class="bridge-section" tabindex="-1">
        <h2>요약</h2>
        <dl class="bridge-facts">
          <div><dt>문서 유형</dt><dd>${escape(project.documentLabel)}</dd></div>
          <div><dt>팀 구성</dt><dd>${escape(project.team)}</dd></div>
        </dl>
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
      <section id="${sectionId('result')}" class="bridge-section case-copy" tabindex="-1">
        <h2>결과</h2>${paragraphs(project.results)}
      </section>
      <div class="bridge-ending">
        ${teamPhotosMarkup(project.id)}
        <div class="back-to-top-wrap"><button class="back-to-top" type="button" data-detail-top>상단으로 <span aria-hidden="true">↑</span></button></div>
      </div>
    </article>
  </div>`;
}

export function caseProcessMarkup(project, steps, index, escape) {
  const step = steps[index];
  const media = project.id === 'bridge'
    ? `<img class="case-process-media" src="./assets/bridge-process-${index + 1}.jpg" alt="브릿지 ${escape(step.title)} 원본 자료" width="1600" height="900">`
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
