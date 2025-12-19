# GEMINI.md

이 파일은 Gemini를 위한 프로젝트의 교육용 컨텍스트를 제공합니다.

## 프로젝트 개요

이 애플리케이션은 데이터 크롤링 서비스의 모니터링 및 관리를 위한 웹 애플리케이션입니다. React, TypeScript, Vite로 구축된 단일 페이지 애플리케이션(SPA)입니다. UI는 Material-UI를 사용하여 구축되었으며, 백엔드 API와 통신하여 데이터 및 인증을 처리합니다.

### 주요 기술

*   **프론트엔드 프레임워크:** React
*   **언어:** TypeScript
*   **빌드 도구:** Vite
*   **UI 라이브러리:** Material-UI (MUI)
*   **라우팅:** React Router
*   **HTTP 클라이언트:** Axios
*   **린팅:** ESLint

### 아키텍처

애플리케이션은 단일 페이지 애플리케이션으로 구성됩니다.
*   진입점은 `src/main.tsx`이며, 메인 `App` 컴포넌트를 렌더링합니다.
*   라우팅은 `react-router-dom`에 의해 처리되며, 라우트는 `App.tsx`에 정의되어 있습니다.
*   애플리케이션은 사이드바(`Side.tsx`)와 콘텐츠 영역(`Content.tsx`)이 있는 메인 레이아웃을 특징으로 합니다.
*   페이지는 `src/page` 디렉토리에 구성되어 있습니다.
*   API 통신은 `axios`를 통해 관리되며, `src/API/AxiosInstance.tsx`에 정의된 기본 인스턴스가 JWT 토큰을 자동으로 주입합니다.
*   `vite.config.ts`에 구성된 대로 개발 중에는 백엔드 API가 `localhost:8080`에서 실행될 것으로 예상됩니다.

## 빌드 및 실행

*   **의존성 설치:**
    ```bash
    npm install
    ```

*   **개발 서버 실행:**
    ```bash
    npm run dev
    ```
    이렇게 하면 Vite 개발 서버가 시작되고 `http://localhost:5173`(또는 5173이 사용 중인 경우 다른 포트)에서 애플리케이션을 사용할 수 있습니다.

*   **프로덕션 빌드:**
    ```bash
    npm run build
    ```
    이렇게 하면 `dist` 디렉토리에 프로덕션 준비가 된 빌드가 생성됩니다.

*   **코드 lint:**
    ```bash
    npm run lint
    ```

## 개발 컨벤션

*   **스타일링:** 이 프로젝트는 컴포넌트에 Material-UI를 사용하고 커스텀 스타일링에 `@emotion/styled`를 사용합니다.
*   **상태 관리:** 컴포넌트 상태는 React 훅(`useState`, `useCallback`)으로 관리됩니다. 사용자 인증 상태는 `App` 컴포ונ트에서 관리되며 `localStorage`에 유지됩니다.
*   **API 상호 작용:**
    *   모든 API 요청은 `axios`를 사용하여 이루어집니다.
    *   인증이 필요한 요청에는 `src/API/AxiosInstance.tsx`의 사전 구성된 `axios` 인스턴스를 사용해야 합니다. 자동으로 `Authorization: Bearer <token>` 헤더를 추가합니다.
*   **인증:**
    *   애플리ケーション은 인증을 위해 JWT(JSON 웹 토큰)를 사용합니다.
    *   액세스 토큰은 성공적인 로그인 후 `localStorage`에 저장됩니다.
*   **보호된 라우트:** `src/component/ProtectedRoute.tsx`의 `ProtectedRoute` 컴포넌트는 인증 상태 및 사용자 역할에 따라 특정 라우트에 대한 액세스를 제한하는 데 사용됩니다.
