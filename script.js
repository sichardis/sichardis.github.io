import { projects as sourceProjects, featuredIds } from './data.js?v=project-awards';
import { bridgeMarkup, steps as bridgeSteps } from './bridge.js?v=unified-trophy-20261124';
import { caseStudies } from './case-studies.js?v=storyboard-authors-20261118';
import { caseStudyMarkup, caseProcessMarkup } from './case-study.js?v=unified-trophy-20261124';

const pdfProjectNames = {
  chak: '착!(Chak!)',
  bluedog: '블루독(Blue Dog)',
  rocketfresh: '쿠팡 로켓프레시',
  kaywon: '계원예술대학교',
};
const allProjects = sourceProjects.map(p => ({
  ...p,
  pdfProjectName: pdfProjectNames[p.id] ?? p.title,
  documentType: ['chak','bridge','bluedog'].includes(p.id) ? 'plan' : p.id === 'korail' ? 'report' : 'proposal',
}));
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
let filterUpdateTimer;
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

function card(project, {featured = false, priority = 'auto', filterOrder} = {}) {
  const description = escape(summaries[project.id] || project.subtitle);
  const image = project.cover
    ? `<img src="${escape(project.coverThumb || project.cover)}" alt="${escape(project.title)} 프로젝트 표지" width="768" height="432" loading="lazy" decoding="async" fetchpriority="${priority}">`
    : `<span class="project-cover-type">${escape(project.word || project.title)}</span>`;
  let title = project.documentType === 'storyboard' ? project.title : project.id === 'chak' ? '착! (Chak!)' : project.id === 'lotte' ? '[롯데시네마] 탐색 및 예매 기능 개선 제안서' : project.title;
  if (!featured) title = ({bluedog:'블루독 (Blue Dog)',korail:'[코레일톡] 기능 분산 구조 및 탐색 혼란 기능 개선 보고서',rocketfresh:'[쿠팡 로켓프레시] 메인페이지 UX 리뉴얼 제안서',kaywon:'[계원예술대학교] 메인페이지 UX 리뉴얼 제안서'})[project.id] || title;
  const documentLabel = filters.find(([id]) => id === project.documentType)?.[1] || '';
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
  const date = period;
  const animationStyle = Number.isInteger(filterOrder) ? ` style="--filter-delay:${30 + filterOrder * 42}ms"` : '';
    const study = caseStudies[project.id] || {};
    const methods = project.documentType === 'storyboard'
      ? ['화면설계', '이용 흐름']
      : ({chak:['서비스 기획', 'MVP 검증'], bridge:['사용자 조사', '정보 구조'],
          korail:['사용성 테스트', '아이트래킹'], bluedog:['현장 조사', '서비스 기획'],
          rocketfresh:['UX 리뉴얼', '화면 제안'], kaywon:['UX 리뉴얼', '정보 구조']})[project.id] || [];
    const tags = [featuredIds.includes(project.id) ? '대표' : '', documentLabel, ...methods].filter(Boolean);
    const team = study.team || (project.id === 'bridge' ? '3인' : '');
    const introduction = study.lead || project.lead;
    const award = project.award?.shortTitle ?? project.award?.title;
    const icon = kind => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind === 'calendar'
      ? '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>'
      : '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-2-4"/>'}</svg>`;
    return `<article class="project-card project-card--panel"${animationStyle}><a class="project-card-link" href="${projectUrl(project.id)}">
      <div class="project-image">${image}</div>
      <div class="project-card-body">
        <div class="project-card-tags">${tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div>
        <h3>${escape(title)}</h3>
        <p class="project-card-description">${description}</p>
        <p class="project-card-introduction">${escape(introduction)}</p>
        ${award ? `<p class="project-card-award"><span class="project-award-trophy" aria-hidden="true">🏆</span><span>${escape(award)}</span></p>` : ''}
        <div class="project-card-meta">${date ? `<span>${icon('calendar')}<span>${escape(date)}</span></span>` : ''}${team ? `<span>${icon('team')}<span>${escape(team)}</span></span>` : ''}</div>
      </div>
    </a></article>`;
}

function renderProjects({animate = false, focusFilter = false} = {}) {
  clearTimeout(filterUpdateTimer);
  const featured = featuredIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean);
  $('#featured-grid').innerHTML = featured.map((project, index) => card(project, {featured: true, priority: index === 0 ? 'high' : 'auto'})).join('');
  const visible = projects.filter(p => activeFilter === 'all' || (activeFilter === 'featured' ? featuredIds.includes(p.id) : p.documentType === activeFilter));
  $('.filters').innerHTML = filters.map(([id,label])=>`<button type="button" data-filter="${id}" aria-pressed="${id===activeFilter}">${label} ${projects.filter(p=>id==='all'||(id==='featured'?featuredIds.includes(p.id):p.documentType===id)).length}</button>`).join('');
  const workGrid = $('#work-grid');
  workGrid.classList.remove('is-filtering', 'is-filter-prepared', 'is-filter-entering');
  workGrid.innerHTML = visible.map((project, index) => card(project, {priority: index === 0 ? 'high' : 'auto', filterOrder: index})).join('');
  if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    workGrid.classList.add('is-filter-prepared');
    void workGrid.offsetWidth;
    workGrid.classList.remove('is-filter-prepared');
    workGrid.classList.add('is-filter-entering');
  }
  $('#project-count').textContent = `${activeFilter === 'all' ? '전체' : '해당'} ${visible.length}개`;
  if (focusFilter) requestAnimationFrame(() => $(`[data-filter="${activeFilter}"]`)?.focus({preventScroll:true}));
}

function setProjectFilter(filter) {
  if (filter === activeFilter) return;
  activeFilter = filter;
  document.querySelectorAll('[data-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  const workGrid = $('#work-grid');
  clearTimeout(filterUpdateTimer);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderProjects({focusFilter:true});
    return;
  }
  workGrid.classList.remove('is-filter-prepared', 'is-filter-entering');
  workGrid.classList.add('is-filtering');
  filterUpdateTimer = setTimeout(() => renderProjects({animate:true, focusFilter:true}), 160);
}

function detailHero(project) {
  const coverClass = project.documentType === 'storyboard' ? 'detail-cover storyboard-cover' : 'detail-cover';
  const isStoryboard = project.documentType === 'storyboard';
  const detailType = isStoryboard ? '화면설계' : project.id === 'chak' ? project.type.replace(' · 진행 중', '') : project.type;
  const detailRole = isStoryboard ? '화면설계' : project.role;
  const detailPeriod = project.id === 'chak' ? '2026.09–12' : project.period || project.year;
  return `
    <div class="detail-heading"><p class="eyebrow">${escape([project.year,detailType].filter(Boolean).join(' / '))}</p><h1 id="detail-title">${escape(project.title)}</h1><p class="detail-subtitle">${escape(project.subtitle)}</p></div>
    <p class="detail-lead">${escape(project.lead)}</p>
    <dl class="detail-facts">${detailRole ? `<div><dt>담당 역할</dt><dd>${escape(detailRole)}</dd></div>` : ''}<div><dt>프로젝트 유형</dt><dd>${escape(detailType)}</dd></div>${project.year ? `<div><dt>기간</dt><dd>${escape(detailPeriod)}</dd></div>` : ''}</dl>
    ${project.cover ? `<img class="${coverClass}" src="${escape(project.cover)}" alt="${escape(project.title)} 프로젝트 표지" width="1920" height="1080" fetchpriority="high" decoding="async">` : ''}`;
}

function renderDetail(id) {
  const baseProject = projects.find((project) => project.id === id);
  const pdfTitleSuffix = baseProject?.documentType === 'storyboard' ? ' 화면설계서' : '';
  const project = baseProject && {
    ...baseProject,
    ...caseStudies[id],
    pdfFilename: `${baseProject.pdfProjectName}${pdfTitleSuffix}_정서영.pdf`,
  };
  detailProject = project;
  const download = $('.detail-toolbar a[download]');
  const preview = $('.detail-toolbar [data-pdf-file-view]');
  const previewParts = $('.detail-toolbar [data-pdf-view]');
  $('.detail-toolbar [data-pdf-parts]').hidden = !project?.pdfParts;
  previewParts.hidden = !project?.pdfParts;
  preview.hidden = !project?.pdf || Boolean(project?.pdfParts);
  if (project?.pdf) preview.href = project.pdf;
  else preview.removeAttribute('href');
  download.hidden = !project?.pdf;
  download.download = project?.pdfFilename || '';
  if (project?.pdf) download.href = project.pdf;
  else download.removeAttribute('href');
  if (!project) {
    $('#detail-content').innerHTML = '<div class="not-found"><h1 id="detail-title">프로젝트를 찾을 수 없습니다.</h1><p>프로젝트 목록에서 작업을 다시 선택해 주세요.</p></div>';
    return '프로젝트를 찾을 수 없습니다';
  }
  if (id === 'bridge') {
    $('#detail-content').innerHTML = bridgeMarkup(detailHero(project), project, escape);
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
    // Near the footer, scrolling can stop before the requested heading reaches the top.
    if (window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight) {
      const focused = document.activeElement;
      const focusedTop = focused.getBoundingClientRect().top;
      current = sections.includes(focused) && focusedTop >= header && focusedTop < window.innerHeight
        ? focused : sections.at(-1);
    }
    setDetailSection(current.id);
  });
}
window.addEventListener('scroll',queueDetailIndexUpdate,{passive:true});
window.addEventListener('resize',queueDetailIndexUpdate,{passive:true});

const skillMeters = document.querySelectorAll('.tool-level .skill-meter');
let skillMeterObserver;
function observeSkillMeters({ reset = false } = {}) {
  skillMeterObserver?.disconnect();
  if (reset) skillMeters.forEach(meter => { meter.dataset.fill = 'waiting'; });
  if (!('IntersectionObserver' in window)) {
    skillMeters.forEach(meter => { meter.dataset.fill = 'visible'; });
    return;
  }
  // The reference SVG's black line sits roughly two-thirds down the browser viewport.
  const triggerY = Math.round(window.innerHeight * (2 / 3));
  skillMeterObserver = new IntersectionObserver((entries, observer) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      target.dataset.fill = 'visible';
      observer.unobserve(target);
    }
  }, { rootMargin: `0px 0px -${window.innerHeight - triggerY}px 0px`, threshold: 0 });
  skillMeters.forEach(meter => {
    if (meter.dataset.fill === 'waiting') skillMeterObserver.observe(meter);
  });
}
window.addEventListener('resize', () => {
  if (previousPage === 'about') observeSkillMeters();
});

function renderRoute({ focus = false } = {}) {
  if (previousPage === 'projects') listScroll = window.scrollY;
  if (imageDialog.open) imageDialog.close();
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
  $('#contact-section').hidden = !['home', 'about'].includes(page);
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
  if (page === 'about' && previousPage !== 'about') observeSkillMeters({reset: true});
  else if (page !== 'about') skillMeterObserver?.disconnect();
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
  setProjectFilter(button.dataset.filter);
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
const imageDialog = $('#image-dialog');
let pdfPending = false;
const pdfCache = new Map();

async function downloadPdfParts({folder, count, size}, filename, {preview = false} = {}) {
  if (pdfPending) return;
  const reader = preview ? window.open('about:blank', '_blank') : null;
  if (preview && !reader) {
    window.alert('PDF 새 창을 열지 못했어요. 브라우저의 팝업 허용을 확인해 주세요.');
    return;
  }
  if (reader) {
    reader.opener = null;
    reader.document.title = 'PDF 불러오는 중';
    reader.document.body.textContent = 'PDF를 불러오고 있습니다. 잠시만 기다려 주세요.';
    reader.document.body.style.cssText = 'font:16px/1.7 sans-serif;padding:32px;color:#555';
  }
  pdfPending = true;
  const controls = [...document.querySelectorAll('[data-pdf-parts], [data-pdf-view]')];
  const labels = controls.map(button => button.firstElementChild.textContent);
  controls.forEach(button => {
    button.disabled = true;
    button.firstElementChild.textContent = 'PDF 불러오는 중…';
  });

  try {
    // The original PDF is stored in parts to fit the upload limit.
    let pdf = pdfCache.get(folder);
    if (!pdf) {
      const parts = await Promise.all(Array.from({length:count}, async (_, index) => {
        const number = String(index + 1).padStart(2, '0');
        const response = await fetch(`${folder}/${number}.bin`);
        if (!response.ok) throw new Error('PDF part unavailable');
        return response.blob();
      }));
      pdf = new Blob(parts, {type:'application/pdf'});
    }
    if (pdf.size !== size) throw new Error('Incomplete PDF');
    pdfCache.set(folder, pdf);
    const url = URL.createObjectURL(pdf);
    if (reader && !reader.closed) reader.location.replace(url);
    else if (!preview) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else URL.revokeObjectURL(url);
  } catch {
    if (reader && !reader.closed) reader.document.body.textContent = 'PDF를 열지 못했습니다. 포트폴리오에서 다시 시도해 주세요.';
    window.alert('PDF를 불러오지 못했어요. 다시 시도해 주세요.');
  } finally {
    pdfPending = false;
    controls.forEach((button, index) => {
      button.disabled = false;
      button.firstElementChild.textContent = labels[index];
    });
  }
}

$('#content').addEventListener('click', event => {
  if (event.target.closest('[data-pdf-view]') && detailProject?.pdfParts) {
    downloadPdfParts(detailProject.pdfParts, detailProject.pdfFilename, {preview: true});
  }
  if (event.target.closest('[data-pdf-parts]') && detailProject?.pdfParts) {
    downloadPdfParts(detailProject.pdfParts, detailProject.pdfFilename);
  }
});

let processOpener;
function openProcess(index) {
  const steps = detailProject.steps ?? bridgeSteps;
  const count = steps.length;
  processIndex = Math.max(0, Math.min(count - 1, index));
  const name = `${detailProject.title} 과정`;
  $('.process-dialog-meta').textContent = name;
  $('.process-dialog-step').textContent = `${String(processIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
  $('#process-content').innerHTML = caseProcessMarkup(detailProject, steps, processIndex, escape);
  $('#process-navigation').innerHTML = `<p class="process-navigation-label">기획의 흐름</p>${steps.map((step, i) => `<button type="button" data-process-select="${i}"${i === processIndex ? ' aria-current="step"' : ''}><span class="process-step-node" aria-hidden="true"></span><span>${escape(step.title)}</span></button>`).join('')}`;
  if (processDialog.open && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const content = $('#process-content');
    content.getAnimations().forEach(animation => animation.cancel());
    content.animate([
      {opacity: 0, transform: 'translateY(10px) scale(.99)'},
      {opacity: 1, transform: 'translateY(0) scale(1)'},
    ], {duration: 380, easing: 'cubic-bezier(.22, 1, .36, 1)'});
  }
  if (!processDialog.open) { processOpener = document.activeElement; processDialog.showModal(); }
  $('#process-content').scrollTop = 0;
  const navigation = $('#process-navigation');
  const current = navigation.querySelector('[aria-current]');
  if (current) {
    const item = current.getBoundingClientRect(), bounds = navigation.getBoundingClientRect();
    if (matchMedia('(max-width:800px)').matches) {
      if (item.left < bounds.left || item.right > bounds.right) navigation.scrollLeft += item.left - bounds.left - 16;
    } else {
      if (item.top < bounds.top) navigation.scrollTop -= bounds.top - item.top + 12;
      else if (item.bottom > bounds.bottom) navigation.scrollTop += item.bottom - bounds.bottom + 12;
    }
  }
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
    queueDetailIndexUpdate();
  }
});
processDialog.querySelector('.process-close').addEventListener('click',()=>processDialog.close());
processDialog.addEventListener('close', () => processOpener?.isConnected && processOpener.focus({preventScroll:true}));
processDialog.addEventListener('click',event=>{
  const selected = event.target.closest('[data-process-select]');
  if (selected) openProcess(Number(selected.dataset.processSelect));
  const zoom = event.target.closest('[data-process-zoom]');
  if (zoom) {
    const source = zoom.querySelector('img');
    $('#image-dialog-image').src = source.src;
    $('#image-dialog-image').alt = source.alt;
    $('#image-dialog-title').textContent = (detailProject.steps ?? bridgeSteps)[processIndex].title;
    imageDialog.classList.remove('is-original-size');
    $('[data-image-size]').setAttribute('aria-pressed', 'false');
    $('[data-image-size]').textContent = '원본 크기';
    imageDialog.showModal();
  }
  if (event.target.closest('[data-process-next]')) openProcess((processIndex+1)%(detailProject.steps ?? bridgeSteps).length);
  if (event.target.closest('[data-process-prev]')) openProcess(Math.max(0,processIndex-1));
  if (event.target === processDialog) {
    const b=processDialog.getBoundingClientRect();
    if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom) processDialog.close();
  }
});
processDialog.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const steps = detailProject.steps ?? bridgeSteps;
  openProcess(Math.max(0, Math.min(steps.length - 1, processIndex + (event.key === 'ArrowRight' ? 1 : -1))));
});
$('[data-image-close]').addEventListener('click', () => imageDialog.close());
$('[data-image-size]').addEventListener('click', event => {
  const original = imageDialog.classList.toggle('is-original-size');
  event.currentTarget.setAttribute('aria-pressed', String(original));
  event.currentTarget.textContent = original ? '화면에 맞추기' : '원본 크기';
});
window.addEventListener('hashchange' , () => renderRoute({focus:true}));
renderProjects();
renderRoute();

function contactMailUrl({name, email, message}) {
  const subject = `[포트폴리오 문의] ${name.trim()}님이 남긴 메시지`;
  const body = `이름: ${name.trim()}\r\n이메일: ${email.trim()}\r\n\r\n${message.trim()}`;
  return `mailto:richardis6551@naver.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const fields = Object.fromEntries(new FormData(form));
  if (!fields.name.trim() || !fields.message.trim()) {
    $('#contact-form-status').textContent = '이름과 메시지를 입력해 주세요.';
    return;
  }
  window.location.href = contactMailUrl(fields);
  $('#contact-form-status').textContent = '메일 작성창에서 내용을 확인한 뒤 전송해 주세요.';
});

const threadScene = $('.identity-stage');
const threadStops = [...threadScene.querySelectorAll('.thread-stop')];
const threadSteps = [...threadScene.querySelectorAll('.identity-step')];
const threadPlayback = $('#thread-playback');
const reducedThreadMotion = matchMedia('(prefers-reduced-motion: reduce)');
let threadPlaying = !reducedThreadMotion.matches;
let threadInView = false;
let threadStep = -1;
let threadTimer;

function showThreadStep(step) {
  threadStep = step;
  threadStops.forEach((stop, i) => {
    stop.setAttribute('aria-expanded', String(i <= step));
    if (i === step) stop.setAttribute('aria-current', 'step');
    else stop.removeAttribute('aria-current');
  });
  threadSteps.forEach((item, i) => {
    item.classList.toggle('is-visible', i <= step);
    item.classList.toggle('is-current', i === step);
    item.setAttribute('aria-hidden', String(i > step));
  });
}

function threadStepDelay() {
  return threadStep === -1 ? 1000 : threadStep === threadStops.length - 1 ? 3400 : 1100;
}

function scheduleThreadStep(delay) {
  clearTimeout(threadTimer);
  if (!threadPlaying || !threadInView) return;
  threadTimer = setTimeout(() => {
    const next = threadStep + 1;
    showThreadStep(next < threadStops.length ? next : -1);
    scheduleThreadStep(threadStepDelay());
  }, delay);
}

function setThreadPlaying(playing) {
  threadPlaying = playing;
  threadPlayback.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${playing ? '<rect x="6" y="6" width="12" height="12" rx="1"/>' : '<path d="m8 5 11 7-11 7V5Z"/>'}</svg>`;
  const label = playing ? '기획 과정 자동 재생 정지' : '기획 과정 자동 재생';
  threadPlayback.setAttribute('aria-label', label);
  threadPlayback.title = label;
  threadPlayback.setAttribute('aria-pressed', String(playing));
  scheduleThreadStep(threadStepDelay());
}

threadStops.forEach((stop, i) => {
  stop.addEventListener('click', () => {
    setThreadPlaying(false);
    showThreadStep(threadStep === i ? -1 : i);
  });
  stop.addEventListener('keydown', event => {
    if (event.key === 'Escape' && threadStep === i) {
      setThreadPlaying(false);
      showThreadStep(-1);
    }
  });
});
threadPlayback.addEventListener('click', () => {
  if (threadPlaying && threadStep === -1) showThreadStep(0);
  if (!threadPlaying && threadStep === threadStops.length - 1) showThreadStep(-1);
  setThreadPlaying(!threadPlaying);
});
reducedThreadMotion.addEventListener('change', event => {
  if (event.matches) showThreadStep(threadStops.length - 1);
  setThreadPlaying(!event.matches);
});

if (reducedThreadMotion.matches) showThreadStep(threadStops.length - 1);
threadPlayback.hidden = false;
setThreadPlaying(threadPlaying);

const threadObserver = new IntersectionObserver(([entry]) => {
  threadInView = entry.isIntersecting;
  if (!threadInView && threadPlaying) showThreadStep(-1);
  scheduleThreadStep(850);
}, {threshold: 0.25});
threadObserver.observe(threadScene);
