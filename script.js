import { projects as sourceProjects, featuredIds } from './data.js?v=project-awards';
import { bridgeMarkup, steps as bridgeSteps } from './bridge.js?v=project-awards';
import { caseStudies } from './case-studies.js?v=optimized-images';
import { caseStudyMarkup, caseProcessMarkup } from './case-study.js?v=project-awards';

const allProjects = sourceProjects.map(p => ({...p, documentType: ['chak','bridge','bluedog'].includes(p.id) ? 'plan' : p.id === 'korail' ? 'report' : 'proposal'}));
for (const id of ['chak','lotte','bluedog','rocketfresh','kaywon']) {
  const original = allProjects.find(p => p.id === id);
  const storyboardId = id + '-storyboard';
  const storyboard = caseStudies[storyboardId];
  allProjects.push({...original, id:storyboardId, cover:storyboard?.cover ?? original.cover, coverThumb:storyboard?.coverThumb ?? original.coverThumb, title: `[${original.title}] 화면설계서`, subtitle: '화면 구성과 기능, 이용 단계별 연결을 정리한 설계서', documentType:'storyboard', award:null, pdf:null, detail:null, role:'화면설계서', pending:true, lead:'화면별 목적과 기능, 이용 단계별 연결을 정리한 문서입니다. 상세 자료는 준비 중입니다.', question:'', approach:'', outcome:''});
}
const projects = allProjects.filter(project => !project.hidden);
const documentOrder = ['chak','bridge','korail','bluedog','lotte','rocketfresh','kaywon','chak-storyboard','lotte-storyboard','bluedog-storyboard','rocketfresh-storyboard','kaywon-storyboard'];
projects.sort((a,b)=>documentOrder.indexOf(a.id)-documentOrder.indexOf(b.id));
const filters = [['all','전체'],['featured','대표'],['plan','기획서'],['report','보고서'],['proposal','제안서'],['storyboard','화면설계서']];
let listScroll = 0;
let previousPage = '';
let processIndex = 0;
let detailProject;
const $ = (selector) => document.querySelector(selector);
const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const projectUrl = (id) => `#/project/${encodeURIComponent(id)}`;
let activeFilter = 'all';

const summaries = {
  chak: '일상 속 선행을 발견하는 선행 챌린지 서비스',
  bridge: '시니어의 직무 맞춤 커리어 브랜딩 서비스',
  bluedog: '은퇴견과 시민을 잇는 산책·입양·돌봄',
  korail: '코레일톡 예약 승차권 조회 개선',
  rocketfresh: '목적별 상품 탐색을 돕는 장보기 UX',
  kaywon: '학사·입시 정보를 찾기 쉬운 대학 홈페이지',
  lotte: '특별관 비교를 돕는 영화 예매 UX',
  'chak-storyboard': '개인·그룹 챌린지 참여와 인증 설계',
  'lotte-storyboard': '영화 검색·특별관 비교·예매 화면 설계',
  'bluedog-storyboard': '은퇴견 산책·입양·돌봄 흐름 설계',
  'rocketfresh-storyboard': '상품 탐색과 레시피 장보기 화면 설계',
  'kaywon-storyboard': '학사·입시 정보와 퀵서비스 화면 설계',
};

function card(project, {featured = false, priority = 'auto'} = {}) {
  const description = escape(summaries[project.id] || project.subtitle);
  const image = project.cover
    ? `<img src="${escape(project.coverThumb || project.cover)}" alt="${escape(project.title)} 프로젝트 표지" width="768" height="432" loading="lazy" decoding="async" fetchpriority="${priority}">`
    : `<span class="project-cover-type">${escape(project.word || project.title)}</span>`;
  let title = project.documentType === 'storyboard' ? project.title : project.id === 'chak' ? '착! (Chak!)' : project.id === 'lotte' ? '[롯데시네마] 탐색 및 예매 기능 개선 제안서' : project.title;
  if (!featured) title = ({bluedog:'블루독 (Blue Dog)',korail:'[코레일톡] 기능 분산 구조 및 탐색 혼란 기능 개선 보고서',rocketfresh:'[쿠팡 로켓프레시] 메인페이지 UX 리뉴얼 제안서',kaywon:'[계원예술대학교] 메인페이지 UX 리뉴얼 제안서'})[project.id] || title;
  const documentLabel = filters.find(([id]) => id === project.documentType)?.[1] || '';
  const meta = [
    featuredIds.includes(project.id) ? '대표' : '',
    documentLabel,
    project.award?.shortTitle ?? project.award?.title,
  ].filter(Boolean).join(' | ');
  const sourceId = project.id.replace('-storyboard', '');
  const period = {
    chak: '2026.09–12',
    bridge: '2026.03–06',
    bluedog: '2026.03–06',
    korail: '2026.03–06',
    lotte: '2026.09–12',
    rocketfresh: '2025.09–12',
    kaywon: '2026.09–12',
  }[sourceId] || project.year || '';
  const ongoing = project.filter === 'ongoing' || project.status === 'ongoing';
  const date = featured && ongoing ? `${period} · 진행 중` : period;
  return `<article class="project-card"><a class="project-card-link" href="${projectUrl(project.id)}">
    <div class="project-image">${image}</div>
    <h3>${escape(title)}</h3>
    <p class="project-card-description">${description}</p>
    <p class="project-card-meta"><span>${escape(meta)}</span>${date ? `<span>${escape(date)}</span>` : ''}</p>
  </a></article>`;
}

function renderProjects() {
  const featured = featuredIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean);
  $('#featured-grid').innerHTML = featured.map((project, index) => card(project, {featured: true, priority: index === 0 ? 'high' : 'auto'})).join('');
  const visible = projects.filter(p => activeFilter === 'all' || (activeFilter === 'featured' ? featuredIds.includes(p.id) : p.documentType === activeFilter));
  $('.filters').innerHTML = filters.map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="${id===activeFilter}">${label} ${projects.filter(p=>id==='all'||(id==='featured'?featuredIds.includes(p.id):p.documentType===id)).length}</button>`).join('');
  $('#work-grid').innerHTML = visible.map((project, index) => card(project, {priority: index === 0 ? 'high' : 'auto'})).join('');
  $('#project-count').textContent = `${activeFilter === 'all' ? '전체' : '해당'} ${visible.length}개`;
}

function detailHero(project) {
  const coverClass = project.documentType === 'storyboard' ? 'detail-cover storyboard-cover' : 'detail-cover';
  return `
    <div class="detail-heading"><p class="eyebrow">${escape([project.year,project.type].filter(Boolean).join(' / '))}</p><h1 id="detail-title">${escape(project.title)}</h1><p class="detail-subtitle">${escape(project.subtitle)}</p></div>
    <p class="detail-lead">${escape(project.lead)}</p>
    <dl class="detail-facts">${project.role ? `<div><dt>담당 역할</dt><dd>${escape(project.role)}</dd></div>` : ''}<div><dt>프로젝트 유형</dt><dd>${escape(project.type)}</dd></div>${project.year ? `<div><dt>기간</dt><dd>${project.id === 'chak' ? '2026.09–12 · 진행 중' : escape(project.period || project.year)}</dd></div>` : ''}</dl>
    ${project.cover ? `<img class="${coverClass}" src="${escape(project.cover)}" alt="${escape(project.title)} 프로젝트 표지" width="1920" height="1080" fetchpriority="high" decoding="async">` : ''}`;
}

function renderDetail(id) {
  const baseProject = projects.find((project) => project.id === id);
  const project = baseProject && {...baseProject, ...caseStudies[id]};
  detailProject = project;
  const download = $('.detail-toolbar a.detail-pdf');
  $('.detail-toolbar [data-pdf-parts]').hidden = !project?.pdfParts;
  download.hidden = !project?.pdf;
  if (project?.pdf) download.href = project.pdf;
  else download.removeAttribute('href');
  if (!project) {
    $('#detail-content').innerHTML = '<div class="not-found"><h1 id="detail-title">프로젝트를 찾을 수 없습니다.</h1><p>프로젝트 목록에서 작업을 다시 선택해 주세요.</p></div>';
    return '프로젝트를 찾을 수 없습니다';
  }
  if (id === 'bridge') {
    $('#detail-content').innerHTML = bridgeMarkup(detailHero(project), project.award, escape);
    return project.title;
  }
  $('#detail-content').innerHTML = caseStudyMarkup(project, detailHero(project), escape);
  return project.title;
}

// Keep the section index in sync with both click navigation and manual scrolling.
let detailIndexFrame = 0;
function setDetailSection(id) {
  document.querySelectorAll('.section-index [data-section]').forEach(button => {
    if (button.dataset.section === id) button.setAttribute('aria-current','location');
    else button.removeAttribute('aria-current');
  });
}
function queueDetailIndexUpdate() {
  if (detailIndexFrame) return;
  detailIndexFrame = requestAnimationFrame(() => {
    detailIndexFrame = 0;
    if (!$('#content').classList.contains('case-study-page')) return;
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
    setDetailSection(current.id);
  });
}
window.addEventListener('scroll',queueDetailIndexUpdate,{passive:true});
window.addEventListener('resize',queueDetailIndexUpdate,{passive:true});

const skillMeters = document.querySelectorAll('.tool-level .skill-meter');
const skillMeterObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries, observer) => {
      for (const { target, intersectionRatio } of entries) {
        if (intersectionRatio < 0.5) continue;
        target.dataset.fill = 'visible';
        observer.unobserve(target);
      }
    }, { threshold: 0.5 })
  : null;

function renderRoute({ focus = false } = {}) {
  if (previousPage === 'projects') listScroll = window.scrollY;
  if (processDialog.open) processDialog.close();
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
  let id;
  if (detail) {
    try { id = decodeURIComponent(route[1] || ''); } catch { id = ''; }
    name = renderDetail(id);
  }
  $('#content').classList.toggle('case-study-page', detail && Boolean(detailProject));
  if (page === 'about' && previousPage !== 'about' && skillMeterObserver) {
    for (const meter of skillMeters) {
      meter.dataset.fill = 'waiting';
      skillMeterObserver.observe(meter);
    }
  }
  const restoreList = page === 'projects' && previousPage === 'detail';
  previousPage = page;
  queueDetailIndexUpdate();
  document.title = `${name} | 정서영 포트폴리오`;
  if (sectionLink) requestAnimationFrame(scrollToFeatured);
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
function scrollToFeatured() {
  const title = $('#selected-title');
  title.focus({preventScroll:true});
  title.scrollIntoView({behavior:motion(), block:'start'});
}
$('.explore-link').addEventListener('click', (event) => {
  event.preventDefault();
  scrollToFeatured();
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
let pdfPending = false;

async function downloadPdfParts({folder, count, size, filename}) {
  if (pdfPending) return;
  pdfPending = true;
  const controls = [...document.querySelectorAll('[data-pdf-parts]')];
  const labels = controls.map(button => button.firstElementChild.textContent);
  controls.forEach(button => {
    button.disabled = true;
    button.firstElementChild.textContent = 'PDF 받는 중…';
  });

  try {
    // The original PDF is stored in parts to fit the upload limit.
    const parts = await Promise.all(Array.from({length:count}, async (_, index) => {
      const number = String(index + 1).padStart(2, '0');
      const response = await fetch(`${folder}/${number}.bin`);
      if (!response.ok) throw new Error('PDF part unavailable');
      return response.blob();
    }));
    const pdf = new Blob(parts, {type:'application/pdf'});
    if (pdf.size !== size) throw new Error('Incomplete PDF');
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    window.alert('PDF를 내려받지 못했어요. 다시 시도해 주세요.');
  } finally {
    pdfPending = false;
    controls.forEach((button, index) => {
      button.disabled = false;
      button.firstElementChild.textContent = labels[index];
    });
  }
}

$('#content').addEventListener('click', event => {
  if (event.target.closest('[data-pdf-parts]') && detailProject?.pdfParts) {
    downloadPdfParts(detailProject.pdfParts);
  }
});

function openProcess(index) {
  const steps = detailProject.steps ?? bridgeSteps;
  const count = steps.length;
  processIndex = Math.max(0, Math.min(count - 1, index));
  const name = detailProject.id === 'bridge' ? '브릿지 · 기획 과정' : `${detailProject.title} · 과정`;
  $('.process-dialog-meta').textContent = name;
  $('.process-dialog-step').textContent = `${String(processIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
  $('#process-content').innerHTML = caseProcessMarkup(detailProject, steps, processIndex, escape);
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
    const target = document.getElementById(jump.dataset.section);
    target.focus({preventScroll:true});
    target.scrollIntoView({behavior:motion()});
  }
  if (event.target.closest('[data-detail-top]')) window.scrollTo({top:0,behavior:motion()});
});
processDialog.querySelector('.process-close').addEventListener('click',()=>processDialog.close());
processDialog.addEventListener('click',event=>{
  if (event.target.closest('[data-process-next]')) openProcess((processIndex+1)%(detailProject.steps ?? bridgeSteps).length);
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
