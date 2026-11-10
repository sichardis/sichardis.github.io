import { projects as sourceProjects, featuredIds } from './data.js';

import { bridgeMarkup, processMarkup } from './bridge.js?v=20261110-1';
const projects = sourceProjects.map(p => ({...p, documentType: ['chak','bridge','bluedog'].includes(p.id) ? 'plan' : p.id === 'korail' ? 'report' : 'proposal'}));
for (const id of ['chak','lotte','bluedog','rocketfresh','kaywon']) {
  const original = projects.find(p => p.id === id);
  projects.push({...original, id: id+'-storyboard', title: `[${original.title}] 화면설계서`, subtitle: '화면 구성과 기능, 이용 단계별 연결을 정리한 설계서', documentType:'storyboard', pdf:null, detail:null, role:'화면설계서', pending:true, lead:'화면별 목적과 기능, 이용 흐름을 정리한 문서입니다. 상세 자료는 준비 중입니다.', question:'', approach:'', outcome:''});
}
const documentOrder = ['chak','bridge','bluedog','korail','lotte','rocketfresh','kaywon','chak-storyboard','lotte-storyboard','bluedog-storyboard','rocketfresh-storyboard','kaywon-storyboard'];
projects.sort((a,b)=>documentOrder.indexOf(a.id)-documentOrder.indexOf(b.id));
const filters = [['all','전체'],['featured','대표'],['plan','기획서'],['report','보고서'],['proposal','제안서'],['storyboard','화면설계서']];
let listScroll = 0;
let previousPage = '';
let processIndex = 0;
const $ = (selector) => document.querySelector(selector);
const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const projectUrl = (id) => `#/project/${encodeURIComponent(id)}`;
let activeFilter = 'all';

const summaries = {
  chak: '작은 선행을 함께 실천하고 주고받은 배려를 기록하며, 즐거움을 발견하는 챌린지 서비스',
  bridge: '시니어의 경험을 기업 맞춤 언어로 번역하는 커리어 브랜딩 서비스',
  bluedog: '은퇴견의 입양, 산책 참여 등을 종합적으로 관리하여 은퇴견과 과천 지역사회를 연결하는 지역 상생 서비스',
  korail: '빠르고 편리한 예약내역 확인을 위해 분산된 기능, 정보구조를 통합한 개선안 보고서',
  rocketfresh: '상품을 살펴보고 선택하는 과정에 맞춰 메인페이지의 정보 배치와 탐색 구조를 리뉴얼한 제안서',
  kaywon: '학교 정보를 목적에 따라 쉽게 찾을 수 있도록 메인페이지의 콘텐츠 배치와 메뉴 구조를 정리한 제안서',
  lotte: '영화 탐색부터 예매 확인까지의 기능과 이용 흐름을 개선하기 위한 제안서',
};

const featuredSlogans = {
  chak: '함께 선행을 실천하는 챌린지',
  bridge: '시니어 커리어 브랜딩 서비스',
  lotte: '영화 탐색·예매 흐름 개선 제안',
};

function card(project, featured = false) {
  const description = featured ? featuredSlogans[project.id] : summaries[project.id];
  const ongoing = project.filter === 'ongoing' || project.status === 'ongoing';
  const image = project.cover
    ? `<img src="${escape(project.cover)}" alt="${escape(project.title)} 프로젝트 표지" loading="lazy" width="800" height="450">`
    : `<span class="project-cover-type">${escape(project.word || project.title)}</span>`;
  let title = project.documentType === 'storyboard' ? project.title : project.id === 'chak' ? '착! (Chak!)' : project.id === 'bridge' ? '브릿지 (Bridge)' : project.id === 'lotte' ? '[롯데시네마] 탐색 및 예매 기능 개선 제안서' : project.title;
  if (!featured) title = ({bluedog:'블루독 (Blue Dog)',korail:'[코레일톡] 기능 분산 구조 및 탐색 혼란 기능 개선 보고서',rocketfresh:'[쿠팡 로켓프레시] 메인페이지 UX 리뉴얼 제안서',kaywon:'[계원예술대학교] 메인페이지 UX 리뉴얼 제안서'})[project.id] || title;
  let meta = !featured ? `${featuredIds.includes(project.id) ? '대표 | ' : ''}${filters.find(([id])=>id===project.documentType)?.[1] || ''}` : featured ? `대표 | ${project.id === 'lotte' ? '제안서' : '기획서'}` : escape(project.role || project.type);
  if (project.id === 'bridge') meta = '대표 | 기획서 | 커뮤니케이션디자인 공모전 특별상';
  const sourceId = project.id.replace('-storyboard','');
  const date = featured ? (project.id === 'chak' ? '2026.09–12 · 진행 중' : project.id === 'bridge' ? '2026.03–06' : '2026.09–12 · 진행 중') : ['bridge','bluedog','korail'].includes(sourceId) ? '2026.03–06' : sourceId === 'lotte' || sourceId === 'chak' || sourceId === 'kaywon' ? '2026.09–12' : sourceId === 'rocketfresh' ? '2025.09–12' : project.id === 'chak' ? '2026.09–12 · 진행 중' : project.id === 'bridge' ? '2026.03–06' : project.id === 'lotte' ? '2026.09–12' : project.year || '';
  return `<article class="project-card"><a class="project-card-link" href="${projectUrl(project.id)}">
    <div class="project-image">${image}${ongoing ? '<span class="project-status">진행 중</span>' : ''}</div>
    <h3>${escape(title)}</h3>
    <p class="project-card-description">${escape(description || project.subtitle)}</p>
    <p class="project-card-meta"><span>${meta}</span>${date ? `<span>${escape(date)}</span>` : ''}</p>
  </a></article>`;
}

function renderProjects() {
  const featured = featuredIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean);
  $('#featured-grid').innerHTML = featured.map((project) => card(project, true)).join('');
  const visible = projects.filter(p => activeFilter === 'all' || (activeFilter === 'featured' ? featuredIds.includes(p.id) : p.documentType === activeFilter));
  $('.filters').innerHTML = filters.map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="${id===activeFilter}">${label} ${projects.filter(p=>id==='all'||(id==='featured'?featuredIds.includes(p.id):p.documentType===id)).length}</button>`).join('');
  $('#work-grid').innerHTML = visible.map((project) => card(project)).join('');
  $('#project-count').textContent = `${activeFilter === 'all' ? '전체' : '해당'} ${visible.length}개`;
}

function renderDetail(id) {
  const index = projects.findIndex((project) => project.id === id);
  const project = projects[index];
  const download = $('.detail-pdf');
  download.hidden = !project?.pdf;
  if (project?.pdf) download.href = project.pdf;
  else download.removeAttribute('href');
  if (!project) {
    $('#detail-content').innerHTML = '<div class="not-found"><h1 id="detail-title">프로젝트를 찾을 수 없습니다.</h1><p>프로젝트 목록에서 작업을 다시 선택해 주세요.</p></div>';
    return '프로젝트를 찾을 수 없습니다';
  }
  if (id === 'bridge') { $('#detail-content').innerHTML = bridgeMarkup(); return '브릿지 (Bridge)'; }
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
    <div class="detail-actions">${project.pdf ? `<a class="solid-link" href="${escape(project.pdf)}" target="_blank" rel="noopener noreferrer">프로젝트 원본 PDF 보기 <span aria-hidden="true">↗</span></a><a class="arrow-link" href="${escape(project.pdf)}" download>내려받기 <span aria-hidden="true">↓</span></a>` : `<p class="detail-note">${(project.filter === 'ongoing' || project.status === 'ongoing') ? '현재 진행 중인 프로젝트입니다. 최종 결과물과 검증 내용은 작업 완료 후 업데이트합니다.' : '상세 내용과 작업 자료를 정리하고 있습니다.'}</p>`}</div>
    <nav class="detail-next" aria-label="다른 프로젝트">${previous ? `<a href="${projectUrl(previous.id)}">← ${escape(previous.title)}</a>` : '<span></span>'}${next ? `<a href="${projectUrl(next.id)}">${escape(next.title)} →</a>` : ''}</nav>`;
  return project.title;
}

// Keep the section index in sync with both click navigation and manual scrolling.
let bridgeIndexFrame = 0;
function setBridgeSection(id) {
  document.querySelectorAll('.section-index [data-section]').forEach(button => {
    if (button.dataset.section === id) button.setAttribute('aria-current','location');
    else button.removeAttribute('aria-current');
  });
}
function queueBridgeIndexUpdate() {
  if (bridgeIndexFrame) return;
  bridgeIndexFrame = requestAnimationFrame(() => {
    bridgeIndexFrame = 0;
    if (!$('#content').classList.contains('bridge-page')) return;
    const sections = [...document.querySelectorAll('.bridge-section')];
    if (!sections.length) return;
    const header = $('.site-header').getBoundingClientRect().bottom;
    const index = $('.section-index');
    const mobile = matchMedia('(max-width:800px)').matches;
    const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const sectionMargin = parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0;
    const threshold = Math.max(header + (mobile ? index.getBoundingClientRect().height : 0) + 12, scrollPadding + sectionMargin + 4);
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) current = section;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
    setBridgeSection(current.id);
  });
}
window.addEventListener('scroll',queueBridgeIndexUpdate,{passive:true});
window.addEventListener('resize',queueBridgeIndexUpdate,{passive:true});

function renderRoute({ focus = false } = {}) {
  if (previousPage === 'projects') listScroll = window.scrollY;
  if ($('#process-dialog').open) $('#process-dialog').close();
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
  let name = page === 'projects' ? '프로젝트' : page === 'about' ? '자기소개' : '정서영';
  if (detail) {
    let id;
    try { id = decodeURIComponent(route[1] || ''); } catch { id = ''; }
    name = renderDetail(id);
  }
  $('#content').classList.toggle('bridge-page', page === 'detail' && route[1] === 'bridge');
  const restoreList = page === 'projects' && previousPage === 'detail';
  previousPage = page;
  queueBridgeIndexUpdate();
  document.title = `${name} | 정서영 포트폴리오`;
  if (sectionLink) requestAnimationFrame(() => $('#selected').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
  else { window.scrollTo({top:restoreList ? listScroll : 0,behavior:'instant'}); if (focus) $('#content').focus({preventScroll:true}); }
}

$('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  renderProjects();
  $(`[data-filter="${activeFilter}"]`).focus({preventScroll:true});
});
const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
$('.explore-link').addEventListener('click', (event) => {
  event.preventDefault();
  $('#selected-title').focus({preventScroll:true});
  $('#selected').scrollIntoView({behavior:motion()});
});
document.querySelectorAll('.back-to-top').forEach(button => button.addEventListener('click', () => {
  window.scrollTo({top:0,behavior:motion()});
  $('.site-header .brand').focus({preventScroll:true});
}));
document.querySelectorAll('a[href="#/projects"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (link.classList.contains('back-link')) return;
    activeFilter = 'all';
    document.querySelectorAll('[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
    renderProjects();
    if (location.hash === '#/projects') window.scrollTo({top:0,behavior:motion()});
  });
});
document.querySelectorAll('a[href="#/"], a[href="#/about"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (location.hash === link.getAttribute('href') || (!location.hash && link.getAttribute('href') === '#/')) window.scrollTo({top:0,behavior:motion()});
  });
});
const processDialog = $('#process-dialog');
function openProcess(index) {
  processIndex = Math.max(0, Math.min(5, index));
  $('.process-dialog-meta').textContent = `브릿지 · 기획 과정 ${String(processIndex+1).padStart(2,'0')} / 06`;
  $('#process-content').innerHTML = processMarkup(processIndex);
  if (!processDialog.open) processDialog.showModal();
  processDialog.scrollTop = 0;
  $('#process-title').setAttribute('tabindex','-1');
  $('#process-title').focus({preventScroll:true});
}
$('#detail-content').addEventListener('click', event => {
  const process = event.target.closest('[data-process]');
  if (process) openProcess(Number(process.dataset.process));
  const jump = event.target.closest('[data-section]');
  if (jump) {
    setBridgeSection(jump.dataset.section);
    const target = document.getElementById(jump.dataset.section);
    target.focus({preventScroll:true}); target.scrollIntoView({behavior:motion()});
  }
  if (event.target.closest('[data-detail-top]')) window.scrollTo({top:0,behavior:motion()});
});
processDialog.querySelector('.process-close').addEventListener('click',()=>processDialog.close());
processDialog.addEventListener('click',event=>{
  if (event.target.closest('[data-process-next]')) openProcess((processIndex+1)%6);
  if (event.target.closest('[data-process-prev]')) openProcess(Math.max(0,processIndex-1));
  if (event.target === processDialog) {
    const b=processDialog.getBoundingClientRect();
    if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom) processDialog.close();
  }
});
window.addEventListener('hashchange' , () => renderRoute({focus:true}));
renderProjects();
renderRoute();

// The thread can be explored by pointer, keyboard, or touch.
const threadStops = [...document.querySelectorAll('.thread-stop')];
threadStops.forEach(stop => {
  stop.addEventListener('click', () => {
    const expanded = stop.getAttribute('aria-expanded') !== 'true';
    threadStops.forEach(item => item.setAttribute('aria-expanded', String(item === stop && expanded)));
  });
  stop.addEventListener('keydown', event => {
    if (event.key === 'Escape') { stop.setAttribute('aria-expanded','false'); stop.blur(); }
  });
});
document.addEventListener('click', event => {
  if (!event.target.closest('.thread-stop')) threadStops.forEach(stop => stop.setAttribute('aria-expanded','false'));
});
