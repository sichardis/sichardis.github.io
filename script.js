import { projects as sourceProjects, featuredIds } from './data.js?v=project-awards';
import { bridgeMarkup, steps as bridgeSteps } from './bridge.js?v=unified-trophy-20261124';
import { caseStudies } from './case-studies.js?v=storyboard-authors-20261118';
import { caseStudyMarkup, caseProcessMarkup } from './case-study.js?v=unified-trophy-20261124';
import { contactConfig } from './contact-config.js';
import { initContactForm } from './contact.js';
import { pdfDocuments } from './pdf-documents.js';
import { loadNamedPdf } from './pdf-reader.js';
import { initFooterContacts } from './footer-contact.js';

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
  allProjects.push({...original, pdf:null, detail:null, question:'', approach:'', outcome:'', ...storyboard, id:storyboardId, title:storyboard?.title || `[${original.title}] 화면설계서`, documentType:'storyboard', award:null, pending:!storyboard?.pdf && !storyboard?.pdfParts});
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
  const study = caseStudies[project.id] || {};
  const description = escape(study.cardSummary || summaries[project.id] || project.subtitle);
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
  const date = project.documentType === 'storyboard' ? study.period || period : period;
  const animationStyle = Number.isInteger(filterOrder) ? ` style="--filter-delay:${30 + filterOrder * 42}ms"` : '';
    const methods = project.documentType === 'storyboard'
      ? study.cardTags || ['화면설계', '이용 흐름']
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

// Home presents the reasoning and evidence; the full catalogue retains comparable cards.
const featuredNotes = {
  chak: {
    name: '착! (Chak!)', methods: '서비스 기획 · MVP 검증',
    headline: ['작은 선행이', '다음 참여로 이어지도록'],
    decision: '미션·인증·공감을 하나의 참여 흐름으로 연결',
    evidence: '두 차례 웹앱 시험 운영에서 선행 기록 32건·54건 확보',
    period: '2026.09–12',
  },
  bridge: {
    name: '브릿지 (Bridge)', methods: '사용자 조사 · 정보 구조',
    headline: ['수십 년의 경험이', '채용 시장에서 읽히도록'],
    decision: '대화로 경험을 정리하고 직무 맞춤 프로필로 전환',
    evidence: '사용자 조사부터 정보 구조·이용 흐름까지 기획서 완성',
    period: '2026.03–06',
  },
  korail: {
    name: '코레일톡', methods: '사용성 테스트 · 아이트래킹',
    headline: ['예약한 승차권을', '헤매지 않고 찾도록'],
    decision: '분산된 예약 정보를 ‘나의 티켓’으로 통합',
    evidence: '참가자 5명의 2차 평가에서 예약 내역 확인 평균 6.4초',
    period: '2026.03–06',
  },
};
function featuredCase(project) {
  const note = featuredNotes[project.id];
  const study = caseStudies[project.id] || {};
  const role = study.role || project.role;
  const leader = role.includes('팀장');
  const award = project.award?.shortTitle ?? project.award?.title;
  const team = study.team || (project.id === 'bridge' ? '3인' : '');
  return `<article class="featured-case featured-case--${escape(project.id)}" id="case-${escape(project.id)}" role="tabpanel" aria-labelledby="featured-tab-${escape(project.id)}">
    <div class="featured-case-visual">
      <img src="${escape(project.cover)}" alt="${escape(note.name)} 프로젝트 대표 이미지" width="1920" height="1080" loading="lazy" decoding="async">
    </div>
    <div class="featured-case-copy">
      <div class="featured-case-context"><p>${escape(note.name)}</p><span>${escape(note.methods)}</span></div>
      <h3 id="case-title-${escape(project.id)}" tabindex="-1"><a href="${projectUrl(project.id)}">${note.headline.map(line => `<span>${escape(line)}</span>`).join('')}</a></h3>
      <p class="featured-case-intro">${escape(study.lead || project.lead)}</p>
      ${award ? `<p class="featured-award"><span class="project-award-trophy" aria-hidden="true">🏆</span>${escape(award)}</p>` : ''}
      <dl class="featured-reasoning">
        <div><dt>담당 역할</dt><dd>${leader ? '<span class="featured-leader">팀장</span>' : ''}${escape(role.replace('팀장 · ', ''))}</dd></div>
        <div><dt>핵심 선택</dt><dd>${escape(note.decision)}</dd></div>
        <div class="featured-evidence"><dt>이뤄낸 결과</dt><dd>${escape(note.evidence)}</dd></div>
      </dl>
      <div class="featured-case-footer"><p>${escape(note.period)}<span>${escape(team)}</span></p><a href="${projectUrl(project.id)}">기획 과정 살펴보기</a></div>
    </div>
  </article>`;
}

function renderProjects({animate = false, focusFilter = false} = {}) {
  clearTimeout(filterUpdateTimer);
  const featured = featuredIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean);
  if (!$('#featured-grid').children.length) $('#featured-grid').innerHTML = featured.map(featuredCase).join('');
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
  return `
    <div class="detail-heading"><p class="eyebrow">${escape([project.year,detailType].filter(Boolean).join(' / '))}</p><h1 id="detail-title">${escape(project.title)}</h1><p class="detail-subtitle">${escape(project.subtitle)}</p></div>
    <p class="detail-lead">${escape(project.lead)}</p>
    ${project.cover ? `<img class="${coverClass}" src="${escape(project.cover)}" alt="${escape(project.title)} 프로젝트 표지" width="1920" height="1080" fetchpriority="high" decoding="async">` : ''}`;
}

function renderDetail(id) {
  const baseProject = projects.find((project) => project.id === id);
  const project = baseProject && {
    ...baseProject,
    ...caseStudies[id],
    pdfFilename: pdfDocuments[id]?.filename || `${baseProject.pdfProjectName}_정서영.pdf`,
  };
  detailProject = project;
  const preview = $('.detail-toolbar [data-pdf-file-view]');
  const previewParts = $('.detail-toolbar [data-pdf-view]');
  previewParts.hidden = !project?.pdfParts;
  preview.hidden = !project?.pdf || Boolean(project?.pdfParts);
  if (project?.pdf) preview.href = project.pdf + (Number.isInteger(project.pdfStartPage) ? `#page=${project.pdfStartPage}` : '');
  else preview.removeAttribute('href');
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
  const navigation = $('.section-index');
  const current = navigation?.querySelector('[aria-current="location"]');
  if (!current || !matchMedia('(max-width:800px)').matches) return;
  const item = current.getBoundingClientRect(), bounds = navigation.getBoundingClientRect();
  if (item.left < bounds.left) navigation.scrollLeft += item.left - bounds.left;
  else if (item.right > bounds.right) navigation.scrollLeft += item.right - bounds.right;
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
  const featuredLink = /^#case-(chak|bridge|korail)$/.exec(hash);
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
  if (page === 'home' && !featuredLink) requestAnimationFrame(() => selectFeaturedCase(activeFeatured, {instant:true}));
  document.title = `${name} | 정서영 포트폴리오`;
  if (sectionLink) requestAnimationFrame(scrollToFeatured);
  else if (featuredLink) requestAnimationFrame(() => scrollToFeaturedCase(featuredLink[1]));
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
// Project selection scrolls the track horizontally without moving the page.
const featuredTrack = $('#featured-grid');
const featuredTabs = [...document.querySelectorAll('[data-featured-jump]')];
let activeFeatured = featuredIds[0];
let featuredSlideFrame = 0;
let featuredResizeFrame = 0;
let featuredScrollTarget = null;
let featuredScrollTimer;

function updateFeaturedSelection(id) {
  activeFeatured = id;
  featuredTabs.forEach(tab => {
    const selected = tab.dataset.featuredJump === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  [...featuredTrack.children].forEach(panel => {
    const selected = panel.id === 'case-' + id;
    panel.inert = !selected;
    panel.setAttribute('aria-hidden', String(!selected));
  });
  const status = `${featuredNotes[id].name}, ${featuredTabs.length}개 중 ${featuredIds.indexOf(id) + 1}번째 프로젝트`;
  if ($('#featured-status').textContent !== status) $('#featured-status').textContent = status;
}
function featuredSlideLeft(panel) {
  return panel.offsetLeft - featuredTrack.firstElementChild.offsetLeft;
}
function selectFeaturedCase(id, {instant = false, focusTab = false} = {}) {
  const panel = document.getElementById('case-' + id);
  if (!panel || !featuredTrack.clientWidth) return;
  const left = featuredSlideLeft(panel);
  featuredScrollTarget = left;
  updateFeaturedSelection(id);
  if (focusTab) document.getElementById('featured-tab-' + id).focus({preventScroll:true});
  featuredTrack.scrollTo({left, behavior:instant ? 'instant' : motion()});
  if (Math.abs(featuredTrack.scrollLeft - left) < 2) featuredScrollTarget = null;
}
function queueFeaturedIndexUpdate() {
  if (featuredSlideFrame) return;
  featuredSlideFrame = requestAnimationFrame(() => {
    featuredSlideFrame = 0;
    if (!featuredTrack.clientWidth) return;
    if (featuredScrollTarget !== null) {
      if (Math.abs(featuredTrack.scrollLeft - featuredScrollTarget) > 2) return;
      featuredScrollTarget = null;
    }
    const panels = [...featuredTrack.children];
    if (!panels.length) return;
    const closest = panels.reduce((best, panel) => Math.abs(featuredSlideLeft(panel) - featuredTrack.scrollLeft) < Math.abs(featuredSlideLeft(best) - featuredTrack.scrollLeft) ? panel : best);
    updateFeaturedSelection(closest.id.replace('case-', ''));
  });
}
// Preserve old direct project anchors while tabs no longer jump vertically.
function scrollToFeaturedCase(id) {
  selectFeaturedCase(id, {instant:true});
  scrollToFeatured();
}
featuredTabs.forEach(tab => {
  tab.addEventListener('click', () => selectFeaturedCase(tab.dataset.featuredJump));
  tab.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = featuredTabs.indexOf(tab);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? featuredTabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + featuredTabs.length) % featuredTabs.length;
    selectFeaturedCase(featuredTabs[index].dataset.featuredJump, {focusTab:true});
  });
});
featuredTrack.addEventListener('scroll', () => {
  queueFeaturedIndexUpdate();
  clearTimeout(featuredScrollTimer);
  featuredScrollTimer = setTimeout(() => {
    featuredScrollTarget = null;
    queueFeaturedIndexUpdate();
  }, 150);
}, {passive:true});
for (const event of ['pointerdown', 'wheel']) featuredTrack.addEventListener(event, () => {
  featuredScrollTarget = null;
}, {passive:true});
window.addEventListener('resize', () => {
  cancelAnimationFrame(featuredResizeFrame);
  featuredResizeFrame = requestAnimationFrame(() => selectFeaturedCase(activeFeatured, {instant:true}));
}, {passive:true});

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

async function openProjectPdf(project, {preview = false} = {}) {
  if (pdfPending) return;
  const documentInfo = pdfDocuments[project.id];
  const reader = preview ? window.open('about:blank', '_blank') : null;
  if (preview && !reader) {
    window.alert('PDF 새 창을 열지 못했어요. 브라우저의 팝업 허용을 확인해 주세요.');
    return;
  }
  if (reader) {
    reader.opener = null;
    reader.document.title = project.pdfFilename;
    reader.document.body.textContent = `${project.pdfFilename} 문서를 불러오고 있습니다. 잠시만 기다려 주세요.`;
    reader.document.body.style.cssText = 'font:16px/1.8 sans-serif;padding:32px;color:#555';
  }
  pdfPending = true;
  const controls = [...document.querySelectorAll('[data-pdf-file-view], [data-pdf-view], [data-pdf-parts], [data-pdf-download]')];
  controls.forEach(control => {
    control.setAttribute('aria-disabled', 'true');
    if (control.tagName === 'BUTTON') control.disabled = true;
  });
  try {
    const key = `${documentInfo.sourceSha256}:${documentInfo.filename}`;
    let cached = pdfCache.get(key);
    if (!cached) {
      const file = await loadNamedPdf(project, documentInfo);
      cached = {file, url:URL.createObjectURL(file)};
      pdfCache.set(key, cached);
    }
    if (preview) {
      if (!reader.closed) reader.location.replace(cached.url + (Number.isInteger(project.pdfStartPage) ? `#page=${project.pdfStartPage}` : ''));
    } else {
      const link = document.createElement('a');
      link.href = cached.url;
      link.download = cached.file.name;
      document.body.append(link);
      link.click();
      link.remove();
    }
  } catch {
    if (reader && !reader.closed) reader.document.body.textContent = 'PDF를 열지 못했습니다. 포트폴리오에서 다시 시도해 주세요.';
    window.alert('PDF를 불러오지 못했어요. 다시 시도해 주세요.');
  } finally {
    pdfPending = false;
    controls.forEach(control => {
      control.removeAttribute('aria-disabled');
      if (control.tagName === 'BUTTON') control.disabled = false;
    });
  }
}

$('#content').addEventListener('click', event => {
  const view = event.target.closest('[data-pdf-file-view], [data-pdf-view]');
  const download = event.target.closest('[data-pdf-parts], [data-pdf-download]');
  if ((!view && !download) || !detailProject || !pdfDocuments[detailProject.id]) return;
  // Ordinary local file links still work when the browser blocks file:// fetch.
  if (location.protocol === 'file:' && !detailProject.pdfParts) return;
  event.preventDefault();
  openProjectPdf(detailProject, {preview:Boolean(view)});
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
  $('#process-navigation').innerHTML = `<p class="process-navigation-label">${detailProject.documentType === 'storyboard' ? '문서의 흐름' : '기획의 흐름'}</p>${steps.map((step, i) => `<button type="button" data-process-select="${i}"${i === processIndex ? ' aria-current="step"' : ''}><span class="process-step-node" aria-hidden="true"></span><span>${escape(step.title)}</span></button>`).join('')}`;
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
queueFeaturedIndexUpdate();

initContactForm($('#contact-form'), contactConfig);
initFooterContacts($('.site-footer'));

const threadScene = $('.identity-stage');
const threadSteps = [...threadScene.querySelectorAll('.identity-step')];
const threadArtwork = threadScene.querySelector('.thread-artwork');
const reducedThreadMotion = matchMedia('(prefers-reduced-motion: reduce)');
let threadPlaying = !reducedThreadMotion.matches;
let threadInView = false;
let threadStep = -1;
let threadTimer;
let threadImageReady = false;
const threadImage = new Image();
threadImage.src = threadArtwork.querySelector('image').getAttribute('href');
threadImage.decode().then(() => {
  threadImageReady = true;
  startThreadCycle();
}).catch(() => {
  // Keep the static illustration if the browser cannot decode the image.
  threadArtwork.classList.remove('is-tying');
});

function showThreadStep(step) {
  threadStep = step;
  threadSteps.forEach((item, i) => {
    item.classList.add('is-visible');
    item.classList.toggle('is-current', i === step);
    item.removeAttribute('aria-hidden');
  });
}

function threadStepDelay() {
  return threadStep === threadSteps.length - 1 ? 3400 : 1100;
}

function startThreadCycle() {
  clearTimeout(threadTimer);
  threadArtwork.classList.remove('is-tying');
  showThreadStep(-1);
  if (!threadImageReady || !threadPlaying || !threadInView || document.hidden) return;
  // Restart only when a new cycle begins, so returning to the page starts cleanly.
  void threadArtwork.offsetWidth;
  threadArtwork.classList.add('is-tying');
  scheduleThreadStep(4500);
}

function scheduleThreadStep(delay) {
  clearTimeout(threadTimer);
  if (!threadPlaying || !threadInView || document.hidden) return;
  threadTimer = setTimeout(() => {
    threadArtwork.classList.remove('is-tying');
    const next = threadStep + 1;
    if (next >= threadSteps.length) {
      startThreadCycle();
      return;
    }
    showThreadStep(next);
    scheduleThreadStep(threadStepDelay());
  }, delay);
}

reducedThreadMotion.addEventListener('change', event => {
  threadPlaying = !event.matches;
  startThreadCycle();
  if (event.matches) showThreadStep(threadSteps.length - 1);
});

document.addEventListener('visibilitychange', startThreadCycle);

showThreadStep(-1);

const threadObserver = new IntersectionObserver(([entry]) => {
  threadInView = entry.isIntersecting;
  startThreadCycle();
}, {threshold: 0.25});
threadObserver.observe(threadScene);
