import { projects, featuredIds } from './data.js';

const $ = (selector) => document.querySelector(selector);
const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const projectUrl = (id) => `#/project/${encodeURIComponent(id)}`;
let activeFilter = 'all';

const summaries = {
  chak: '작은 선행을 함께 실천하고 주고받은 배려를 기록하며, 즐거움을 발견하는 챌린지 서비스',
  bridge: '시니어의 경험을 기업 맞춤 언어로 번역하는 커리어 브랜딩 서비스',
  lotte: '영화 탐색 및 예매 기능의 개선을 제안한 프로젝트',
};

function card(project, featured = false) {
  const ongoing = project.filter === 'ongoing';
  const image = project.cover
    ? `<img src="${escape(project.cover)}" alt="${escape(project.title)} 프로젝트 표지" loading="lazy" width="800" height="450">`
    : `<span class="project-cover-type">${escape(project.word || project.title)}</span>`;
  const title = project.id === 'chak' ? '착! (Chak!)' : project.id === 'bridge' && featured ? 'Bridge' : project.id === 'lotte' ? '[롯데시네마] 탐색 및 예매 기능 개선 제안서' : project.title;
  let meta = `${featured ? '대표 | ' : ''}${escape(project.role || project.type)}`;
  if (project.id === 'bridge' && featured) meta = '대표 | 기획서 | 커뮤니케이션디자인 공모전 특별상';
  const date = project.id === 'chak' ? '2026.09–12 · 진행 중' : project.id === 'bridge' ? '2026.03–06' : project.year || '';
  return `<article class="project-card"><a class="project-card-link" href="${projectUrl(project.id)}">
    <div class="project-image">${image}${ongoing ? '<span class="project-status">진행 중</span>' : ''}</div>
    <h3>${escape(title)}</h3>
    <p class="project-card-description">${escape(featured ? summaries[project.id] || project.subtitle : project.subtitle)}</p>
    <p class="project-card-meta"><span>${meta}</span>${date ? `<span>${escape(date)}</span>` : ''}</p>
  </a></article>`;
}

function renderProjects() {
  const featured = featuredIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean);
  $('#featured-grid').innerHTML = featured.map((project) => card(project, true)).join('');
  const visible = activeFilter === 'all' ? projects : projects.filter((project) => project.filter === activeFilter);
  $('#work-grid').innerHTML = visible.map((project) => card(project)).join('');
  $('#project-count').textContent = `${activeFilter === 'all' ? '전체' : '해당'} ${visible.length}개`;
}

function renderDetail(id) {
  const index = projects.findIndex((project) => project.id === id);
  const project = projects[index];
  if (!project) {
    $('#detail-content').innerHTML = '<div class="not-found"><h1 id="detail-title">프로젝트를 찾을 수 없습니다.</h1><p>프로젝트 목록에서 작업을 다시 선택해 주세요.</p><a href="#/projects" class="arrow-link">전체 프로젝트 보기 ↗</a></div>';
    return '프로젝트를 찾을 수 없습니다';
  }
  const stories = [['출발점',project.question],['접근과 선택',project.approach],[project.filter === 'ongoing' ? '진행 현황' : '결과와 배움',project.outcome]];
  const previous = projects[index - 1];
  const next = projects[index + 1];
  $('#detail-content').innerHTML = `
    <div class="detail-heading"><p class="eyebrow">${escape([project.year,project.type].filter(Boolean).join(' / '))}</p><h1 id="detail-title">${escape(project.title)}</h1><p class="detail-subtitle">${escape(project.subtitle)}</p></div>
    <p class="detail-lead">${escape(project.lead)}</p>
    <dl class="detail-facts">${project.role ? `<div><dt>담당 역할</dt><dd>${escape(project.role)}</dd></div>` : ''}<div><dt>프로젝트 유형</dt><dd>${escape(project.type)}</dd></div>${project.year ? `<div><dt>기간</dt><dd>${project.id === 'chak' ? '2026.09–12 · 진행 중' : project.id === 'bridge' ? '2026.03–06' : escape(project.year)}</dd></div>` : ''}</dl>
    ${project.cover ? `<img class="detail-cover" src="${escape(project.cover)}" alt="${escape(project.title)} 프로젝트 표지" width="1280" height="720">` : ''}
    ${stories.filter(([,body]) => body).map(([title,body]) => `<section class="detail-story"><h2>${escape(title)}</h2><p>${escape(body)}</p></section>`).join('')}
    ${project.detail ? `<img class="detail-image" src="${escape(project.detail)}" alt="${escape(project.title)} 기획서의 주요 산출물" loading="lazy">` : ''}
    <div class="detail-actions">${project.pdf ? `<a class="solid-link" href="${escape(project.pdf)}" target="_blank" rel="noopener noreferrer">프로젝트 원본 PDF 보기 <span aria-hidden="true">↗</span></a><a class="arrow-link" href="${escape(project.pdf)}" download>내려받기 <span aria-hidden="true">↓</span></a>` : `<p class="detail-note">${project.filter === 'ongoing' ? '현재 진행 중인 프로젝트입니다. 최종 결과물과 검증 내용은 작업 완료 후 업데이트합니다.' : '상세 내용과 작업 자료를 정리하고 있습니다.'}</p>`}</div>
    <nav class="detail-next" aria-label="다른 프로젝트">${previous ? `<a href="${projectUrl(previous.id)}">← ${escape(previous.title)}</a>` : '<span></span>'}${next ? `<a href="${projectUrl(next.id)}">${escape(next.title)} →</a>` : ''}</nav>`;
  return project.title;
}

function renderRoute({ focus = false } = {}) {
  const hash = location.hash || '#/';
  if (hash === '#content') {
    $('#content').focus({preventScroll:true});
    return;
  }
  const sectionLink = hash === '#selected';
  const route = hash.replace(/^#\/?/,'').split('/');
  const detail = route[0] === 'project';
  const page = detail ? 'detail' : ['projects','about'].includes(route[0]) ? route[0] : 'home';
  document.querySelectorAll('[data-page]').forEach((element) => { element.hidden = element.dataset.page !== page; });
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page || (detail && link.dataset.nav === 'projects')) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  let name = page === 'projects' ? '프로젝트' : page === 'about' ? '소개' : '정서영';
  if (detail) {
    let id;
    try { id = decodeURIComponent(route[1] || ''); } catch { id = ''; }
    name = renderDetail(id);
  }
  document.title = `${name} | 정서영 포트폴리오`;
  if ($('#document-dialog').open) $('#document-dialog').close();
  if (sectionLink) requestAnimationFrame(() => $('#selected').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
  else { window.scrollTo({top:0,behavior:'instant'}); if (focus) $('#content').focus({preventScroll:true}); }
}

const documents = {
  resume: `<h2 id="document-title">경험의 실</h2><p>관찰과 인터뷰에서 질문을 찾고, 화면의 흐름과 사용성 평가로 판단을 구체화해 왔습니다.</p><dl><div><dt>학력</dt><dd>계원예술대학교 디지털미디어디자인과 기획 세부전공<br>2027년 2월 졸업 예정</dd></div><div><dt>주요 경험</dt><dd>브릿지 서비스 기획 총괄 · 블루독 현장 관찰 및 인터뷰 · 코레일톡 사용성 평가 및 아이트래킹</dd></div><div><dt>수상</dt><dd>제32회 커뮤니케이션디자인 국제어워드 특별상<br>브릿지 · 디지털미디어디자인 부문 · 팀 수상</dd></div></dl>`,
  letter: `<h2 id="document-title">생각의 매듭</h2><p>사람의 필요에서 실마리를 찾고, 여러 의견을 엮어 화면의 흐름으로 정리합니다.</p><p>현장 관찰과 인터뷰에서 질문을 얻고, 스토리보드와 사용성 평가로 선택의 이유를 확인합니다. 코레일톡 프로젝트에서는 처음 예상했던 문제와 실제 이용자의 어려움이 다르다는 점을 확인하고 개선 방향을 바꾸었습니다.</p><p>직접 만들고 검증하며 배우는 과정에서 새 질문을 찾고, 처음의 판단을 다듬어 다음 설계로 이어가고자 합니다.</p><p>아래 파일에서 이력서와 자기소개서 원문을 확인할 수 있습니다.</p>`,
};

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.setAttribute('aria-pressed',String(item === button)));
    renderProjects();
  });
});
document.querySelectorAll('[data-document]').forEach((button) => {
  button.addEventListener('click', () => {
    $('#document-content').innerHTML = documents[button.dataset.document];
    $('#document-dialog').showModal();
  });
});
$('#document-close').addEventListener('click', () => $('#document-dialog').close());
$('#document-dialog').addEventListener('click', (event) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) event.currentTarget.close();
});
window.addEventListener('hashchange', () => renderRoute({focus:true}));
renderProjects();
renderRoute();
