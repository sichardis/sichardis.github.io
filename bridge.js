import { awardMarkup, detailIndexButtons, teamPhotosMarkup } from './case-study.js?v=compact-footer';

export const steps = [
  {title:'사용자 요구 분석·문제 정의',summary:'시니어의 경력 정리 부담을 살폈습니다.',sections:[['01 데스크 리서치 · 경험을 드러내기 어려운 구직 환경','시니어의 노동 참여와 디지털 구직 환경을 조사했습니다.\n복잡한 절차와 메뉴가 서비스 이용의 장벽이 될 수 있음을 파악하고, 경력 표현과 디지털 문서 작성의 부담에 주목했습니다.'],['02 사용자 설문 · 경력을 정리하고 표현하는 데 필요한 지원','50~60대 은퇴·재취업 관심자와 30~40대 경력보유자를 대상으로 온라인 설문을 진행했습니다.\n경력 정리의 어려움과 직무 언어 변환·프로필 생성에 대한 지원 요구를 확인했습니다.'],['03 문제 정의 · 경험을 채용 시장의 언어로 연결하기 어렵다','핵심 문제를 축적된 경험을 직무와 역량의 언어로 정리하고 전달하기 어렵다는 점으로 정의했습니다.\n이를 바탕으로 경험에서 강점을 찾고, 지원 직무에 맞는 프로필로 구성하도록 돕는 방향을 설정했습니다.']]},
  {title:'경쟁 서비스 분석·차별화 방향 수립',summary:'경쟁 서비스를 비교해 차별화 방향을 정했습니다.',sections:[['01 경쟁 서비스 비교','시니어 채용·전문가 매칭 서비스의 대상, 기능, 강점과 한계를 비교했습니다.'],['02 차별화 방향','단순한 일자리 추천을 넘어 대화로 경력을 정리하고 직무에 맞는 프로필로 연결하는 방향을 제안했습니다.']]},
  {title:'사용자 정의·페르소나 작성',summary:'경력 상황별 이용 목표를 정했습니다.',sections:[['01 주 사용자와 부 사용자','은퇴 후 재취업을 준비하는 시니어와 경력 공백 후 복귀를 준비하는 사용자의 상황을 정리했습니다.'],['02 요구와 목표','경험은 충분하지만 이를 현재 채용 시장의 언어로 정리하기 어려운 상황을 중심으로 페르소나를 작성했습니다.']]},
  {title:'사용자 여정 지도 작성',summary:'단계별 어려움과 지원책을 정리했습니다.',sections:[['01 예상 이용 단계','서비스 진입에서 경력 정리, 프로필 완성과 활용으로 이어지는 예상 경험을 정리했습니다.'],['02 지원 요소','각 단계의 어려움과 지원 요소를 연결했습니다.\n실제 사용성 검증 결과와 구분되는 기획 자료입니다.']]},
  {title:'서비스 정보 구조도 작성',summary:'사용자 유형별 메뉴와 핵심 기능을 연결했습니다.',sections:[['01 사용자 유형별 구조','전문가와 기업의 진입 경로를 구분하고 각 사용자에게 필요한 메뉴를 배치했습니다.'],['02 핵심 기능의 관계','브랜딩, 프로필 생성, 실무 인증과 맞춤 채용이 이어지는 정보 구조를 작성했습니다.']]},
  {title:'서비스 이용 흐름도 작성',summary:'대화에서 프로필 완성까지 설계했습니다.',sections:[['01 진입과 경력 정리','회원 유형과 프로필 보유 여부에 따라 경로를 나누고 대화와 키워드 확인·수정 단계를 연결했습니다.'],['02 프로필 완성','증빙자료 첨부 여부와 프로필 유형 선택 등 조건에 따른 분기를 정리했습니다.']]},
];
export function bridgeMarkup(hero, project, escape) {
 return `<div class="bridge-layout"><nav class="section-index" aria-label="브릿지 상세 목차">${detailIndexButtons('bridge')}</nav>
 <article class="bridge-article">
 <div class="bridge-hero">${hero}</div>
 <section id="bridge-summary" class="bridge-section" tabindex="-1"><h2>요약</h2>
 <dl class="bridge-facts"><div><dt>문서 유형</dt><dd>기획서</dd></div><div><dt>팀 구성</dt><dd>3인</dd></div></dl>
 ${awardMarkup(project.award, escape)}<h3>주요 수행 과업</h3><p>환경 및 경쟁 서비스 분석, 설문조사 결과 분석, 핵심 문제 정의, 서비스 방향 수립,<br>사용자 여정 지도 작성, 정보 구조도 작성, 서비스 이용 흐름도 작성</p></section>
 <section id="bridge-background" class="bridge-section" tabindex="-1"><h2>배경·목표</h2><h3 class="bridge-goal">시니어의 경험을 직무 언어로 정리합니다.</h3><p>데스크리서치와 온라인 설문조사를 바탕으로, 경력보유자가 자신의 경험을 이력서와 프로필로 정리하는 과정의 어려움을 살핀 후,<br>재취업을 준비하는 시니어가 경력과 강점을 직무에 맞는 표현으로 정리하도록 돕는 것을 서비스의 핵심 과제로 설정했습니다.<br>사용자가 대화로 경험을 설명하고, 정리된 내용을 확인·수정한 뒤 커리어 프로필을 완성하는 서비스의 흐름을 설계했습니다.</p></section>
 <section id="bridge-process" class="bridge-section" tabindex="-1"><h2>과정</h2><p>이미지를 클릭해 브릿지의 주요 과정을 확인해 보세요.</p><div class="process-grid">${steps.map((step,i)=>`<button type="button" class="process-card" data-process="${i}" aria-label="${String(i+1).padStart(2,'0')} ${step.title} 상세 보기"><img src="./assets/optimized/process/bridge-process-${i+1}.webp" alt="${step.title}" width="768" height="432" loading="lazy" decoding="async"><span>${String(i+1).padStart(2,'0')} ${step.title}</span></button>`).join('')}</div><a class="bridge-download" href="${escape(project.pdf)}" download="${escape(project.pdfFilename)}">브릿지(Bridge) 기획서 전체 보기 · PDF <span aria-hidden="true">↓</span></a></section>
 <section id="bridge-contribution" class="bridge-section" tabindex="-1"><h2>기여</h2><ul><li>조사 결과를 바탕으로 핵심 문제와 서비스 방향을 정했습니다.</li><li>사용자 요구와 서비스 목표에 따라 기능의 우선순위를 정했습니다.</li><li>사용자 여정 지도·정보 구조도·이용 흐름도를 작성했습니다.</li><li>화면별 목적과 필수 정보를 공유하고 검토 의견을 정리했습니다.</li></ul></section>
 <section id="bridge-result" class="bridge-section" tabindex="-1"><h2>결과</h2><p>경력 정리에 자동화를 활용하고 표현의 최종 결정권은 이용자에게 두는 서비스 원칙을 도출했습니다.<br>이를 통해 시니어의 경력 정리 부담을 줄이고,<br>기업이 지원자의 경험과 강점을 직무에 맞춰 이해하도록 도울 것으로 기대합니다.</p></section>
 ${teamPhotosMarkup('bridge')}
 </article></div>`;
}
