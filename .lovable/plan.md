# GitHub Pages 정적 배포 설정 (smartseongji-hub)

사용자가 정적 배포의 한계(급식 API·관리자 인증 등 서버 기능 미동작)를 감수하고 진행하기로 확정.

## 목표

`https://<사용자명>.github.io/smartseongji-hub/` 에서 정적 버전 앱이 열리도록 GitHub Actions 자동 배포를 구성한다.

## 변경 사항

### 1. vite.config.ts — base 경로
- `base: "/smartseongji-hub/"` 추가 (GitHub Pages 프로젝트 사이트 경로).
- TanStack Start의 prerender(정적 생성) 옵션을 켜서 각 라우트를 정적 HTML로 출력하고, 산출물이 `.output/public`에 모이도록 설정.

### 2. src/router.tsx — 라우터 basepath
- `createRouter({ basepath: "/smartseongji-hub", ... })` 추가. base 없이 배포하면 페이지 내 링크/탭 이동이 404가 되므로 필수.
- 개발 환경에서는 basepath가 있어도 로컬 프리뷰가 정상 동작하는지 확인(프리뷰는 `/smartseongji-hub` 경로로 접근). 필요하면 `import.meta.env` 기반으로 환경별 분기.

### 3. .github/workflows/deploy.yml — 자동 배포
- 트리거: `main` 브랜치 push + 수동 실행(workflow_dispatch).
- 권한: `pages: write`, `id-token: write`.
- 잡 구성: checkout → bun install(또는 npm ci) → `vite build` → `actions/upload-pages-artifact`로 `.output/public` 업로드 → `actions/deploy-pages`.
- GitHub 저장소 Settings → Pages → Source를 "GitHub Actions"로 바꾸는 안내 포함(저장소에서 1회 설정 필요).

### 4. 정적 환경 동작 정리
- 급식(NEIS)·관리자 인증 등 서버 함수는 Pages에서 실행되지 않음 → 급식 카드가 "불러올 수 없음" 안내로 떨어지는지 확인하고, 필요 시 친화적 메시지 유지.
- 공지·시간표·과제·건의 조회는 브라우저 Supabase 클라이언트로 동작 가능(RLS가 anon 조회 허용) — 정적 빌드에서도 표시되는지 확인.
- SPA 새로고침 대응: Pages는 404 시 index로 라우팅되지 않으므로 `404.html`을 index와 동일하게 출력하는 단계 추가(빌드 후 복사).

## 검증
- 로컬 `vite build` 성공 및 `.output/public` 산출물 확인.
- 빌드 로그(build-errors.log) 오류 없음 확인.
- 프리뷰에서 basepath 적용 후 화면 렌더 확인.

## 사전 조건 (사용자)
- GitHub 연동(저장소 `smartseongji-hub`)이 되어 있어야 워크플로가 push됨. 아직이면 Plus(+) → GitHub → Connect project로 연결 필요.
