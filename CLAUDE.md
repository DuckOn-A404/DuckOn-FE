# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 명령어

```bash
npm run dev       # Vite 개발 서버 실행
npm run build     # TypeScript 검사 + Vite 프로덕션 빌드 (tsc -b && vite build)
npm run lint      # ESLint 검사
npm run preview   # 프로덕션 빌드 로컬 미리보기
```

테스트 러너는 설정되어 있지 않다. 타입 검사는 `build` 과정에서 `tsc -b`로 수행된다.

## 환경 변수

로컬 개발 시 `.env` 파일 생성 필요:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_OAUTH2_BASE_URL=http://localhost:8080
```

`VITE_YOUTUBE_API_KEY`는 YouTube 기능에 필요하며 CI에서 시크릿으로 관리된다.

## 아키텍처 개요

**DuckOn**은 K-POP 팬 커뮤니티 SPA로, 실시간 라이브 채팅룸·아티스트 탐색·팬 랭킹·관리자 대시보드를 제공한다.

**스택:** React 19 + TypeScript, Vite 7, Tailwind CSS 4, React Router v7, Zustand, Axios, STOMP over WebSocket, Capacitor(Android 네이티브)

### 주요 레이어

- **`/src/api/`** — 도메인별 Axios 서비스 모듈(`artistService.ts`, `roomService.ts`, `userService.ts` 등). 모든 HTTP 요청은 `axiosInstance.ts`를 통하며, 토큰 주입·401 → 토큰 갱신·`/translate` 엔드포인트 50초 타임아웃 처리를 담당한다.
- **`/src/store/`** — Zustand 스토어 2개:
  - `useUserStore` — 인증된 사용자 정보, 차단 유저 Set, 로그아웃; `localStorage`에 커스텀 merge 로직으로 영속화.
  - `useArtistFollowStore` — 팔로우한 일반·신인 아티스트 목록; 세션당 1회 지연 로딩.
- **`/src/hooks/`** — 모든 데이터 페칭을 커스텀 훅으로 캡슐화(React Query는 사실상 미사용). 주요 훅: `useArtistList`(무한 스크롤 + IntersectionObserver + 3회 재시도), `useChatSubscription`(STOMP 구독), `useUserActivity`(15분 비활동 자동 로그아웃 + 14분 토큰 갱신).
- **`/src/pages/`** — 라우트 단위 컴포넌트. 관리자 페이지는 `/src/pages/AdminPage/` 하위에 있다.
- **`/src/types/`** — 공용 TypeScript 인터페이스. `index.ts`에 핵심 `User`/`RecommendedUser` 타입이 있고, 도메인 타입은 별도 파일(`artist.ts`, `room.ts`, `chat.ts` 등)에 분리되어 있다.
- **`/src/socket.ts`** — STOMP 클라이언트 팩토리. `VITE_API_BASE_URL`을 변환(http → ws, `/api` → `/ws-chat`)하고, 5초마다 재연결, 액세스 토큰을 쿼리 파라미터로 전달한다.

### 라우팅

`App.tsx`에서 React Router v7 `BrowserRouter` 사용. 라우트 그룹:
- `MainLayout`(헤더 + 푸터): 홈, 아티스트 상세, 유저 프로필 페이지.
- `LayoutWithoutFooter`: 목록 페이지(아티스트 목록, 채팅룸 목록, 팔로우 아티스트).
- `PublicRoute`(비로그인 전용): `/login`, `/signup`.
- `AdminRouteGuard`(role `ADMIN` 필요): `/admin/*` 전체.
- 레이아웃 없음: `/live/:roomId`, `/oauth2/success`, 법적 고지 페이지.

### 인증

- 액세스 토큰 → `localStorage`(게스트는 `sessionStorage`).
- 리프레시 토큰 → HttpOnly 쿠키(서버 관리).
- Axios 인터셉터가 401 발생 시 자동 토큰 갱신; 갱신 실패 시 로그아웃 이벤트 발행.
- 게스트 유저는 ID가 `guest:` 접두사로 시작하며 `sessionStorage`에 저장.
- OAuth2 흐름: 백엔드가 `/oauth2/success`로 리다이렉트 → `OAuth2RedirectHandler`가 토큰 추출.

### 실시간 채팅

`/ws-chat` 경로로 WebSocket + STOMP 사용. `useChatSubscription`이 `/topic/chat/{roomId}`를 구독하고 `/app/room/chat`으로 메시지를 발행한다. 메모리에 최근 100개 메시지를 유지한다.

### 개발 서버 프록시 (Vite)

`vite.config.ts`에 설정:
- `/ws-chat` → `localhost:8080` WebSocket 프록시
- `/api` → `localhost:8080` HTTP 프록시(`/api` 접두사 제거)
- `/oauth2`, `/login/oauth2` → `localhost:8080` 프록시

### 상태 관리 패턴

- 팔로우·차단은 서버 응답 전에 Zustand 상태를 먼저 업데이트하는 낙관적 업데이트 방식.
- 유저 프로필 이미지 URL은 API 실패 시 폴백을 위해 `localStorage`에 캐싱.
- `blockedSet`은 채팅 메시지 필터링 시 O(1) 조회를 위해 `Set<string>` 사용.

### CI/CD

GitHub Actions(`.github/workflows/fe-ci-cd.yml`):
- PR: 빌드 검사만 수행.
- `develop` 푸시: 빌드 → dev S3 배포 + CloudFront 무효화.
- `main` 푸시: 빌드 → prod S3 배포 + CloudFront 무효화.
- HTML 파일은 `no-cache`, 정적 에셋은 1년 immutable 캐시 헤더로 배포.

### 모바일

Capacitor 7로 Android 타겟(`com.teamduck.duckon`). 웹/네이티브 분기 시 `Capacitor.isNativePlatform()` 사용. 빌드 아웃풋(`dist/`)이 Capacitor 웹 디렉토리다.
