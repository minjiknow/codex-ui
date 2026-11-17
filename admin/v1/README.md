# 이음 시스템 관리자 화면

`index.html`을 브라우저에서 직접 여세요. 서버·빌드·패키지 설치는 필요하지 않습니다.

- `../v1/index.html`: 기존 모아 자료실
- `index.html`: 이미지 참고 + Hallmark로 만든 녹취 관리자
- `DESIGN.md`: 디자인 기준 및 동작 범위

모든 데이터는 샘플입니다. 메모·관심 등록은 현재 화면에서만 유지되며 실제 음성은 없습니다.

자동 검증은 Node와 Playwright가 있는 환경에서 `node qa/check.cjs`로 실행합니다(프로젝트 루트 기준). 외부 설치 경로를 사용할 경우 PLAYWRIGHT_MODULE 환경변수로 지정하세요. Chrome 실행 파일을 직접 지정하려면 CHROME_PATH를 사용하세요.
