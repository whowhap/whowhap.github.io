# MEMORY

프로젝트 상태와 가드레일을 추적하기 위한 실행 메모리.

## Goal

- GitHub Pages용 프로페셔널 웹사이트 완성
- 반응형 데스크톱 및 모바일 지원
- `Games` 탭 구현
- 키보드와 모바일 터치로 조작 가능한 지렁이 게임 구현
- GitHub Pages 최초 배포
- Step 1의 `[게임 추가 기능:]` 반영

## Required Deliverables

- 프로젝트 루트의 `index.html`
- `styles.css`
- `script.js`
- 필요한 경우 별도 `game.js`
- 필요한 이미지 및 정적 assets
- `AORR.md`
- `MEMORY.md`

## Current Scope

- 정적 HTML, CSS, JavaScript
- 프로페셔널 웹사이트 콘텐츠
- 반응형 레이아웃
- `Games` 탭
- 지렁이 게임
- GitHub Pages 배포

## Out of Scope

- 백엔드 서버
- 데이터베이스
- 로그인 및 회원가입
- 결제
- 사용자 개인정보 수집
- 별도 승인 없는 외부 API
- 별도 승인 없는 프레임워크 전환

## Current State

| 항목 | 상태 |
|---|---|
| 현재 상태 | `READY` |
| 완료한 루프 | 1. 저장소 및 기존 파일 확인 후 기본 정적 구조 생성<br>2. 프로페셔널 웹사이트 기본 구조, 반응형 내비게이션, 지렁이 게임 초안 구현 |
| 다음 루프 | 프로필 콘텐츠 확정 또는 게임 세부 조정 |
| 현재 Retry 횟수 | 0 |
| 현재 오류 fingerprint | 없음 |
| Blocker | 없음 |
| 마지막 정상 상태 | 데스크톱 및 모바일 브라우저 검증에서 기본 사이트와 게임이 정상 동작함 |

## Guardrails

- 기존 개인 콘텐츠 임의 삭제 금지
- 확인되지 않은 경력이나 프로젝트 정보 생성 금지
- 테스트 삭제 또는 완화 금지
- 토큰 출력 금지
- 토큰을 HTML, CSS, JavaScript에 저장 금지
- 토큰을 Git에 커밋 금지
- `github_token.txt` 커밋 금지
- `env_settings.txt` 커밋 금지
- 백엔드 기능 추가 금지
- 대규모 리팩토링 금지
- 테스트를 통과시키기 위한 기능 제거 금지

## Acceptance Criteria

- 루트 `index.html` 존재
- 로컬 정적 서버에서 정상 로드
- CSS와 JavaScript 정상 로드
- 콘솔 오류 없음
- 모바일 및 데스크톱에서 레이아웃 정상
- `Games` 탭 정상 이동
- 지렁이 게임 정상 실행
- 키보드 조작 정상
- 모바일 터치 조작 정상
- 점수 및 재시작 정상
- GitHub Pages에서 HTTP 200 응답
- 배포된 사이트에서도 동일 기능 정상

## Retry Policy

- 하나의 오류당 최대 3회
- 동일 오류 fingerprint 2회 반복 시 중지
- 한 번의 Retry에서 하나의 원인만 수정
- Retry마다 동일 Verifier 재실행

## HITL Conditions

- 개인 프로필 내용 불명확
- 기존 콘텐츠 삭제 필요
- 요구사항 충돌
- GitHub 저장소 권한 부족
- GitHub Pages 설정 변경 필요
- 외부 서비스 추가 필요
- Retry 한계 도달

## Tool Policy

- Codex는 작업 제어, 파일 수정, 테스트 실행 담당
- 가능하면 Claude Code CLI를 독립 Verifier로 사용
- 실제 사용한 Claude 모델명 기록
- 토큰 값은 어떠한 실행 기록에도 남기지 않음

## Execution Log Template

| 항목 | 기록 |
|---|---|
| Loop ID |  |
| 시작 시각 |  |
| 목표 |  |
| 시작 상태 |  |
| 가설 |  |
| Act |  |
| 변경 파일 |  |
| Verifier |  |
| 테스트 결과 |  |
| exit code |  |
| 오류 fingerprint |  |
| Retry 횟수 |  |
| 종료 상태 |  |
| 다음 작업 |  |
| 사람 확인 필요 항목 |  |

## Notes

- 현재 저장소는 정적 웹사이트 소스가 아직 없으므로, 다음 구현 루프는 저장소 구조 확인부터 시작한다.
- Step 1의 `[게임 추가 기능:]`은 아직 구체화되지 않았으므로 `[사람 확인 필요]`로 유지한다.
- `github_token.txt`와 `env_settings.txt`는 작업 보조용일 뿐이며 커밋 대상이 아니다.

## Latest Loop Record

| 항목 | 기록 |
|---|---|
| Loop ID | 2 |
| 시작 시각 | 2026-07-14 |
| 목표 | GitHub Pages에서 실행 가능한 정적 웹사이트의 기본 구조와 지렁이 게임 초안 구현 |
| 시작 상태 | `READY` |
| 가설 | 구조 셸 위에 프로필 섹션과 게임 UI를 추가하고, 브라우저에서 반응형 및 게임 동작을 검증하면 다음 세부 루프로 안전하게 이어갈 수 있다 |
| Act | 프로필/경력/프로젝트/Contact 섹션 확장, Games 영역에 canvas와 조작 UI 추가, snake 게임 구현 |
| 변경 파일 | `index.html`, `styles.css`, `script.js`, `game.js`, `MEMORY.md` |
| Verifier | 파일 존재 확인, HTML 참조 확인, `node --check script.js`, `node --check game.js`, `python -m http.server`, Chrome headless CDP 브라우저 검증, `claude doctor`, `claude --model sonnet --print` |
| 테스트 결과 | 루트 파일 존재 확인, HTML 참조 확인, `node --check` 통과, 로컬 서버 `200` 응답 확인, 데스크톱/모바일 브라우저에서 콘솔 오류 없음, 가로 스크롤 없음, 모바일 메뉴 정상, 게임 시작/점수/일시정지/재시작/충돌/고득점 정상, 키보드 조작 정상, 모바일 탭 및 스와이프 정상. 비대화형 Claude 호출은 `Not logged in · Please run /login`으로 실패 |
| exit code | 0 |
| 오류 fingerprint | 없음 |
| Retry 횟수 | 0 |
| 종료 상태 | `PASSED` |
| 다음 작업 | 실제 개인 콘텐츠 확정 및 필요 시 게임 고급 기능 추가 |
| 사람 확인 필요 항목 | 이름, 소개, 경력, 프로젝트의 실제 내용 / Step 1의 `[게임 추가 기능:]` / Claude 로그인 상태 |
