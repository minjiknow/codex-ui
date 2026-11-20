# UI 템플릿

## 현재 파일 구분

| 위치                   | 용도                                             |
| ---------------------- | ------------------------------------------------ |
| `user/pages/`          | 방문자용 CMS 화면                                |
| `user/resource/`       | CMS 스타일·스크립트와 에셋 출처 매핑        |
| `user/assets/`         | CMS 화면에서 사용하는 아이콘·이미지·폰트         |
| `admin/`               | 관리자용 화면 예약 영역. 현재 등록 화면 없음     |
| `excluded/recordings/` | 녹취 조회와 관련 자산 보관. 등록·배포 대상 제외  |

관리자에서 등록·관리하더라도 실제 방문자가 사용하는 화면은 `user`로 분류한다. `admin`은 운영자가 사용하는 화면의 분류이며 관리 기능 자체를 이번에 구현한 것은 아니다.

- 독립 기준 화면: `main1.html`, `main2.html`.
- 변형본: `main1-other.html`(main1 계열 변형).
- 실행 경로가 기존 `/pages/`에서 `/user/pages/`로 바뀌었다. 기존 URL 리다이렉트는 두지 않는다.
- CMS만 전달할 때는 `user/`와 필요한 문서를 묶는다. 제외 자료를 포함하는 저장소 전체를 그대로 ZIP으로 등록하지 않는다.

## main1

- 진입 파일: `user/pages/main1.html`
- 출처: cms-ui 스킬의 `references/examples/main1.html` 중 공통 헤더, 모바일 메뉴, 검색 팝업, 푸터 구조와 `assets/template/resource/` 자산.
- 가져온 날짜: 2026-11-16. 스킬에 포함된 원본은 2026-11-13 사본.
- CSS: `theme.css`, `common.css`, `main.css` 및 참조 폰트·아이콘·이미지를 원형대로 재사용.
- JS: `main1-data.js` → `template-data.js` → `common.js` → `main.js` 순으로 기존 데이터와 구현 재사용.
- 검색·로그인·번역과 기관 정보, 콘텐츠·링크는 시연용이며 운영 기능이 아님. 행사 이미지는 제공되지 않아 기존 빈 영역 스타일로 표시.
- Swiper 14.0.1 jsDelivr CDN 의존성 있음.
- 실행: 프로젝트 루트에서 `python -m http.server 5173 --bind 127.0.0.1` 후 `/user/pages/main1.html` 접속.

## main1-other

- 진입 파일: `user/pages/main1-other.html`. 메인 배너, 퀵 메뉴, 오늘의 선택, 소식·공지사항을 구성한 변형 화면.
- 데이터 로드 순서: `main1-data.js` → `main1-board-data.js` → `main1-other-data.js` → `template-data.js` → `common.js` → `main.js`. Swiper를 이들보다 먼저 로드한다.
- `main1-board-data.js`는 소식·공지사항 데이터 파일이다. 운영 게시판 API는 미연동.

## main2

- 진입 파일: `user/pages/main2.html`.
- 2026-11-16: cms-test의 메인2를 브라우저에서 PC·모바일로 확인하고 별도 HTML을 작성했다. 원본 `cms-test/html/main2.html`과 스킬의 대응 예제 HTML 소스는 읽거나 복사하지 않았다.
- 참고한 UI: 복합 헤더, 통합검색, 분류별 퀵 메뉴, 시설 요약, 문화·체육 서비스, 이용가이드, 소식·공지사항, 하단 배너.
- 현재 프로젝트의 `main1.html`에서 검색 팝업·푸터와 모바일 메뉴 상단 유틸리티를 재사용했다. PC 서브메뉴는 메인2의 소개·분류 탭·하위 메뉴 구조(`data-navigation="mega"`)로 구성하고, 모바일 전체메뉴는 왼쪽 분류 바로가기와 오른쪽 아코디언 목록으로 재구성했다.
- 기존 `theme.css`, `common.css`, `main.css`, `common.js`, `main.js`를 사용한다. `main2.css`는 원본 화면에서 확인한 모바일 메인 제목·분류 단위 크기 두 항목만 기존 토큰과 1280px 분기점으로 보정한다. 앞선 메뉴 수정에서 `template-data.js`에는 `.menu-tabs`가 있는 모바일 메뉴에서만 바로가기와 대상 ID를 같은 메뉴 데이터로 생성하는 처리를 추가했다.
- `main2-data.js`는 단독으로 CMSData를 제공한다. 공통 메뉴·검색 데이터와 소식·공지사항은 현재 프로젝트에서 재사용하고, 퀵 메뉴·서비스·이용가이드는 화면에 맞춰 구성했다. main1 데이터 스크립트를 함께 로드할 필요가 없다.
- JS 순서: Swiper 14.0.1 CDN → `main2-data.js` → `template-data.js` → `common.js` → `main.js`. 모두 body 닫기 직전에 defer로 로드한다.
- 추가 에셋: `main2-facility-illustration.png`, `main2-culture-banner.png`. cms-test 원본 PNG를 포맷 변경 없이 복사했으며 원본 파일명과 SHA-256은 `user/resource/asset-name-map.json`에 기록했다. 스포츠 배너는 기존 `main1-hero-banner-5.png`를 재사용한다.
- 메뉴·콘텐츠·기관 정보는 샘플이다. 검색은 기존 시연 이벤트를 사용하며 로그인·번역·상세 페이지·운영 API는 연결하지 않았다.
- 검증 범위와 제한은 `qa/main2/validation.md`, 화면 캡처는 같은 폴더의 `desktop.png`, `mobile.png`, `desktop-menu.png`, `mobile-menu.png`에 있다.

## 내부 UI 템플릿 관리 범위

- user에 보관한 메인 화면은 `main1.html`, `main1-other.html`, `main2.html`이다. 각 화면은 `user/pages/` 기준 상대 경로 `../resource/`를 사용하므로 `user/`를 한 묶음으로 보관한다.
- 녹취 조회 화면과 KWS 자산은 이번 CMS 템플릿 관리 대상에서 제외한다. 실행 파일은 `excluded/recordings/`로 이동했으며 동작 코드는 변경하지 않았다.
- `qa/`는 검증 기록 및 이전 화면 보관용이며 실행 템플릿 목록에 포함하지 않는다.
- 관리자 등록용 목록·버전 관리·ZIP 생성·관리자 내부 삽입 기능은 아직 구현하지 않았다.

## main2 화면 보정 (2026-11-16)

- 원본 HTML을 읽거나 복사하지 않고 렌더링된 PC·모바일 화면을 대조했다.
- 검색 분류를 전체/문화/체육/행사로 수정하고 시설 탭은 2개, 체육·대관 탭은 3개로 맞췄다. 대관 신청(체크리스트)과 시설 이용안내(안내 책자)의 기존 아이콘을 연결했다.
- 퀵 메뉴 글씨, 시설 분류 숫자, 서비스·이용가이드 제목과 바로가기 크기를 기존 클래스 조합으로 보정했다. 가이드 설명은 PC에서 줄을 나누고 모바일에서 이어서 표시한다.
- 검색 팝업 안 최근 검색어를 region으로 유지하면서 불필요한 section 마지막 여백을 제거했다. PC 검색 팝업 높이를 원본과 대조했다.
- 공통 CSS·런타임 JS와 다른 CMS 화면의 디자인은 변경하지 않았다. 데이터 전역 및 초기화 범위 개선은 별도 요청 후 진행할 제안이다.

## 공통 서브페이지 (2026-11-17)

- `user/pages/sub1.html`: cms-test `html/sub.html`의 좌측 메뉴형 본문과 현재 main1의 공통 영역을 조합.
- `user/pages/sub2.html`: cms-test `html/sub2.html`의 배너·breadcrumb형 본문과 현재 main2의 공통 영역을 조합. 원본 breadcrumb의 ul 직하위 div 구조는 nav/div 구조로 보정하고 클래스·동작 계약은 유지.
- user의 세 메인 화면 모두 공연장 → `./sub1.html`, 전시장 → `./sub2.html`로 연결. 메인별 서브페이지 사본은 없음. `submenu-links.js`가 데이터 파일 뒤, template-data.js 앞에서 메뉴 ID로 목적지를 설정.
- 원본은 cms-ui 스킬에 포함된 2026-11-13 사본. `sub.css`는 cms-test 현재 파일과도 SHA-256이 동일하며 수정 없이 복사. `sub-assets.css`는 기존 `arrow-right.svg` 파일 경로만 보정. `sub.js`는 스킬 원본을 복사해 sub2에서만 사용.
- sub1 홈은 main1, sub2 홈은 main2로 연결. 본문 회색 영역은 원본의 빈 콘텐츠 자리이며 운영 콘텐츠·API는 구현하지 않음. 나머지 미구현 메뉴는 기존 시연 상태 유지.
- 검증 결과: `qa/subpages/validation.md`.
