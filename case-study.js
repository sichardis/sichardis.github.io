const teamPhotosLabel = '팀 활동 사진';

const sectionLabels = [
  ['summary', '요약'],
  ['background', '배경·목표'],
  ['process', '과정'],
  ['contribution', '기여'],
  ['result', '결과'],
  ['team-photos', teamPhotosLabel],
];

const storyboardLabels = {summary:'문서 범위', background:'설계 기준', process:'화면 정의', contribution:'작성 내용', result:'문서 결과'};

export function detailIndexButtons(projectId, hasTeamPhotos = true) {
  const labels = hasTeamPhotos ? sectionLabels : sectionLabels.slice(0, -1);
  return labels.map(([key, label]) =>
    `<button type="button" data-section="${projectId}-${key}">${projectId.endsWith('-storyboard') ? storyboardLabels[key] || label : label}</button>`).join('');
}

export function awardMarkup(award, escape) {
  if (!award) return '';
  return `<p class="summary-award" aria-label="수상 내역"><span class="project-award-trophy" aria-hidden="true">🏆</span><span>${escape(award.title)}</span></p>`;
}

export function summaryMarkup(project, escape) {
  const role = project.documentType === 'storyboard' ? '화면설계' : project.role;
  const period = project.id === 'chak' ? '2026.09–12' : project.period || project.year;
  const facts = [['기간', period], ['담당 역할', role], ['팀 구성', project.team], ['문서 유형', project.documentLabel]].filter(([, value]) => value);
  const tasks = (project.tasks || '').split(/[,\n]+/).map(item => item.trim()).filter(Boolean);
  return `<div class="detail-overview">
    ${awardMarkup(project.award, escape)}
    <dl class="summary-facts">${facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>
  </div>${tasks.length ? `<div class="detail-task-block"><h3>주요 수행 과업</h3><ul class="task-list">${tasks.map(task => `<li>${escape(task)}</li>`).join('')}</ul></div>` : ''}`;
}

export function pdfDownloadMarkup(project, escape) {
  if (!project.pdf && !project.pdfParts) return '';
  const pageHint = (project.pdfLabel || '').match(/화면설계\s*\d+\s*[–-]\s*\d+쪽/)?.[0];
  const control = project.pdfParts
    ? '<button class="bridge-download" type="button" data-pdf-parts>PDF 다운로드</button>'
    : `<a class="bridge-download" data-pdf-download href="${escape(project.pdf)}" download="${escape(project.pdfFilename)}">PDF 다운로드</a>`;
  return `<div class="detail-download-row"><p>원본 문서<span>${escape(project.pdfFilename)}</span>${pageHint ? `<small>${escape(pageHint)}</small>` : ''}</p>${control}</div>`;
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
  if (placeholder || (!step.image && !step.imageSrc)) {
    return `<div class="case-process-media case-process-placeholder" role="img" aria-label="${escape(placeholder || '이미지 자료 준비 중')}">${escape(placeholder)}</div>`;
  }
  const src = step.imageSrc || `./assets/case-studies/${step.image}`;
  return `<img class="case-process-media" src="${escape(src)}" alt="${escape(step.title)} 자료" width="1600" height="900" loading="${loading}" decoding="async">`;
}

export function caseStudyMarkup(project, hero, escape) {
  const hasTeamPhotos = project.documentType !== 'storyboard' && !['bridge', 'korail'].includes(project.id);
  const label = key => project.documentType === 'storyboard' ? storyboardLabels[key] : sectionLabels.find(([id]) => id === key)[1];
  const sectionId = key => `${project.id}-${key}`;
  const cards = project.steps.map((step, i) => {
    const label = `${String(i + 1).padStart(2, '0')} ${escape(step.title)}`;
    return `<button type="button" class="process-card" data-process="${i}" aria-label="${label} 상세 보기">
      ${processMedia(step, escape, {loading:'lazy', placeholder:project.processImagePlaceholder})}<span>${label}</span>
    </button>`;
  }).join('');
  const paragraphs = items => items.map(item => `<p>${escape(item)}</p>`).join('');

  const result = `<section id="${sectionId('result')}" class="bridge-section case-copy" tabindex="-1">
    <h2>${label('result')}</h2>${paragraphs(project.results)}
  </section>`;

  return `<div class="bridge-layout">
    <nav class="section-index" aria-label="${escape(project.title)} 상세 목차">${detailIndexButtons(project.id, hasTeamPhotos)}</nav>
    <article class="bridge-article">
      <div class="bridge-hero">${hero}</div>
      <section id="${sectionId('summary')}" class="bridge-section" tabindex="-1">
        <h2>${label('summary')}</h2>
        ${summaryMarkup(project, escape)}
      </section>
      <section id="${sectionId('background')}" class="bridge-section case-copy" tabindex="-1">
        <h2>${label('background')}</h2><h3 class="bridge-goal">${escape(project.goal)}</h3>
        ${paragraphs(project.background)}
      </section>
      <section id="${sectionId('process')}" class="bridge-section" tabindex="-1">
        <h2>${label('process')}</h2><p>${project.documentType === 'storyboard' ? '카드를 선택해 원본 화면과 설계 내용을 확인해 보세요.' : `카드를 선택해 ${escape(project.processLabel)} 과정을 확인해 보세요.`}</p>
        <div class="process-grid">${cards}</div>${pdfDownloadMarkup(project, escape)}
      </section>
      <section id="${sectionId('contribution')}" class="bridge-section" tabindex="-1">
        <h2>${label('contribution')}</h2><ul>${project.contributions.map(item => `<li>${escape(item)}</li>`).join('')}</ul>
      </section>
      ${result}
      ${hasTeamPhotos ? teamPhotosMarkup(project.id, project.teamPhotos, escape) : ''}
    </article>
  </div>`;
}

export function caseProcessMarkup(project, steps, index, escape) {
  const step = steps[index];
  const media = project.id === 'bridge'
    ? `<img class="case-process-media" src="./assets/bridge-process-${index + 1}.jpg" alt="브릿지 ${escape(step.title)} 원본 자료" width="1600" height="900" decoding="async">`
    : processMedia(step, escape, {placeholder:project.processImagePlaceholder});
  const canZoom = project.id === 'bridge' || (step.image && !project.processImagePlaceholder);
  return `<h2 id="process-title">${escape(step.title)}</h2>
    <p class="process-summary">${escape(step.summary)}${step.sourcePages ? `<span class="process-source">원본 PDF ${escape(step.sourcePages)}쪽</span>` : ''}</p>
    ${canZoom ? `<button class="process-zoom" type="button" data-process-zoom aria-label="${escape(step.title)} 자료 확대">${media}<span>자료 확대</span></button>` : media}
    ${step.sections.map(([title, text]) => `<section class="process-explanation"><h3>${escape(title)}</h3><p>${escape(text)}</p></section>`).join('')}`;
}
