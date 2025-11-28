# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

KSIS Frontend - 역할 기반 접근 제어가 적용된 데이터 수집 관리 웹 애플리케이션입니다. Vite, Material-UI (MUI), React Router를 사용하는 React + TypeScript 프로젝트입니다.

## 개발 명령어

```bash
# Vite 개발 서버 시작 (기본 포트 5173)
npm run dev

# 프로덕션 빌드 (TypeScript 컴파일 + Vite 빌드)
npm run build

# 코드 린트 실행
npm run lint

# 프로덕션 빌드 미리보기
npm run preview
```

## 아키텍처 및 주요 패턴

### 인증 및 권한

**JWT 기반 인증:**
- Access Token은 `localStorage`에 저장
- Axios 인터셉터를 통해 API 요청에 자동으로 토큰 추가 (src/API/AxiosInstance.tsx)
- 로그인 프로세스 (src/App.tsx:47-69):
  1. 사용자가 LoginPage를 통해 로그인 정보 제출
  2. `/api/login`에서 JWT access token 수신
  3. `jwt-decode`를 사용하여 토큰에서 `sub`, `role`, `exp` 추출
  4. `/api/profile` 엔드포인트에서 사용자 프로필 정보 조회
  5. `accessToken`과 `userInfo` 모두 `localStorage`에 저장
  6. 역할에 따라 리디렉션: `ROLE_ADMIN` → `/user`, 일반 사용자 → `/status`
- 페이지 새로고침 시 `localStorage.getItem("userInfo")`를 통해 사용자 정보 유지

**역할 기반 데이터 접근:**
- **관리자 (`ROLE_ADMIN`)**: 모든 유저의 데이터를 조회 가능 (크롤링 설정, 수집현황, 스케줄, 이력)
- **일반 유저**: 본인이 설정한 데이터만 조회 가능 (본인의 크롤링 설정, 수집현황, 스케줄, 이력만 표시)
- 데이터 필터링은 API 레벨에서 구현되어야 하며 UI에서도 적용되어야 함

### 보호된 라우트

- 모든 인증이 필요한 라우트는 `ProtectedRoute` 컴포넌트 사용 (src/component/ProtectedRoute.tsx)
- `accessToken`과 `userInfo` 존재 여부 모두 확인
- 관리자 전용 라우트는 `requiredRole="ROLE_ADMIN"` prop 필요
- 권한 없는 접근 시 상황에 따라 `/login` 또는 `/status`로 리디렉션

### API 아키텍처

- 기본 URL은 환경 변수 `VITE_API_URL=/api`로 설정 (`http://localhost:8080`으로 프록시)
- Vite 개발 서버가 `/api` 요청을 백엔드 `localhost:8080`으로 프록시 (vite.config.ts:7-13)
- 두 가지 Axios 패턴:
  1. `AxiosInstance` (src/API/AxiosInstance.tsx): 인증된 요청에 Authorization 헤더 자동 추가
  2. 직접 `axios` 사용: 로그인 엔드포인트 등 인증 헤더가 필요 없는 경우
- API 파일은 `src/API/` 및 `src/page/*/Api.tsx`에 기능별로 구성

### 페이지 구조

페이지는 번호가 매겨진 기능 모듈로 구성:
- `00_Login`: 인증
- `01_UserManagement`: 사용자 CRUD 작업 (관리자 전용) + 사용자 활동 로그
- `02_Setting`: 데이터 수집 설정 (일반 유저는 본인 설정만 표시)
- `03_Status`: 데이터 수집 현황 모니터링 및 상세 보기 (일반 유저는 본인 현황만 표시)
- `05_History`: 데이터 수집 이력 및 상세 보기 (일반 유저는 본인 이력만 표시)

### 컴포넌트 패턴

**레이아웃**: 로그인 페이지를 제외한 2단 레이아웃 (Side + Content)
- Side (14.5vw, 최소 260px): 로고, 사용자 정보, 네비게이션 메뉴
- Content (84.5vw): 중첩 라우트가 있는 메인 콘텐츠 영역

**CRUD 패턴**: 모든 관리 페이지가 일관된 패턴 따름:
1. 마운트 시 데이터 조회
2. `SearchHeader` 컴포넌트를 통한 검색/필터링
3. `CommonTable` (MUI DataGrid 래퍼)로 데이터 표시
4. MUI Dialog 오버레이를 통한 작업 수행 (RegPage, EditPage)
5. `Alert` 컴포넌트를 통한 확인/성공 피드백
6. 상태 관리: `baseRows` (원본) + `filteredRows` (검색 결과)

**테이블 헤더**: `src/Types/TableHeaders/*.tsx`에 컬럼 정의 중앙화
- 컬럼, 너비, 커스텀 렌더러 정의
- 액션 버튼(수정, 삭제, 로그)은 콜백으로 전달

**커스텀 컴포넌트**: `src/component/`의 래퍼 컴포넌트를 통한 일관된 테마:
- `CustomTextField`, `CustomButton`, `CustomIconButton`, `CustomSelect`
- `CommonTable`: 행 스타일링이 적용된 MUI DataGrid (짝수 행, 비활성 상태, 실패 상태)
- `SearchHeader`: 재사용 가능한 검색바 + 액션 버튼 조합

### 타입 정의

`src/Types/`에 중앙화:
- `Components.tsx`: User, Menu, Button, TextField, Select, Alert, SearchBar 핵심 타입
- `Layout.tsx`: 레이아웃 컴포넌트 props
- `Table.tsx`: 테이블 설정 타입
- `TableHeaders/*.tsx`: 테이블 컬럼 정의 및 행 타입
- `Search.tsx`: 검색 카테고리 설정

### 역할 기반 네비게이션

`userInfo.role`에 따라 메뉴 항목 조건부 렌더링 (src/component/Menu.tsx:100):
- 관리자 전용: 유저 관리 (모든 유저에 대한 전체 접근)
- 모든 사용자: 수집현황, 수집설정, 스케줄러, 수집이력 (일반 유저는 본인 데이터로 필터링)
- 활성 라우트는 주황색 배경 (`#FFE6C5`)과 주황색 텍스트 (`#BB510C`)로 강조 표시

## 일반적인 개발 패턴

### 새 페이지 추가하기

1. 페이지 디렉터리 생성: `src/page/XX_FeatureName/`
2. 페이지 컴포넌트 생성: `FeatureName.tsx`, `RegPage.tsx`, `EditPage.tsx`
3. API 파일 생성: `Api.tsx`에 CRUD 작업 정의
4. 테이블 헤더 생성: `src/Types/TableHeaders/FeatureNameHeader.tsx`
5. `src/App.tsx`에 `ProtectedRoute` 래퍼와 함께 라우트 추가
6. 필요시 `src/component/Menu.tsx`에 메뉴 항목 추가
7. 일반 유저를 위해 API가 사용자 소유권으로 데이터를 필터링하는지 확인

### API 통합

- 인증된 엔드포인트에는 `AxiosInstance` 사용
- 로그인/공개 엔드포인트에만 직접 `axios` 사용
- API 기본 URL: `import.meta.env.VITE_API_URL` (기본값 `/api`)
- 에러 처리: try-catch로 `console.error` 및 사용자 피드백을 위한 `alert` 사용
- 데이터 쿼리: 백엔드는 일반 유저의 경우 userId로 필터링해야 함

### 상태 관리

- 외부 상태 관리 라이브러리 없음 (Redux/MobX 없음)
- UI 상태는 `useState`로 로컬 컴포넌트 상태 관리
- 인증 지속성은 `localStorage` 사용
- 상태 공유는 props drilling (예: App → Menu의 `userInfo`)
- 라우트 상태는 `useNavigate('/path', { state: {...} })` 및 `useLocation().state` 사용

### 스타일링

- 인라인 스타일은 Material-UI (MUI) `sx` prop 사용
- 일관된 색상 체계:
  - 배경: `#FEF4EA`, `#FCF7F2`
  - 테두리: `#CDBAA6`
  - 주요 강조색: `#FFC98B`, `#FFE6C5`, `#FEC88B`
  - 텍스트/아이콘: `#BB510C` (활성), 검정 (기본)
- 외부 CSS 모듈이나 styled-components 없음

## 백엔드 통합 참고사항

- 백엔드는 `http://localhost:8080`에서 실행
- 로그인 엔드포인트: `POST /api/login` → `{ accessToken, refreshToken, user? }` 반환
- 프로필 엔드포인트: `GET /api/profile` → 사용자 정보 반환
- 다른 모든 엔드포인트는 `Authorization: Bearer <token>` 헤더 필요
- CRUD 엔드포인트는 REST 규칙 따름: GET, POST, PUT, DELETE (경로에 ID 포함)
- 백엔드는 일반 유저를 위해 사용자 소유권 필터링을 구현해야 함

## 알려진 패턴 및 컨벤션

- 파일 확장자: 모든 React 컴포넌트는 `.tsx`, src에 `.ts` 파일 없음
- 컴포넌트 내보내기: `export default ComponentName` (컴포넌트에 named export 없음)
- Props 타입: `_Type` 접미사가 있는 인터페이스 정의 (예: `Button_Type`)
- 이벤트 핸들러: `handle` 접두사 사용 (예: `handleEdit`, `handleDelete`)
- 상태 새로고침: CRUD 작업 후 `BoardRefresh()` 함수 패턴
- 목 데이터: 종종 주석 처리된 fallback으로 포함됨 (UserManagement.tsx:58-67 참조)
