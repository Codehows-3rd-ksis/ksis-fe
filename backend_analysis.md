## 프론트엔드 크롤링 현황 및 WebSocket 연동 분석

백엔드 개발팀의 이해를 돕기 위해 데이터 수집 현황 페이지와 실시간 업데이트 기능 관련 프론트엔드 코드의 구조, 기능, 로직을 정리했습니다.

### 1. 전체 아키텍처

데이터 수집 현황 기능은 크게 3가지 파트로 구성됩니다.

1.  **페이지 UI (`Status.tsx`, `StatusDetail.tsx`):**
    *   `Status.tsx`는 현재 진행 중인 모든 크롤링 작업 목록을 보여줍니다.
    *   `StatusDetail.tsx`는 특정 크롤링 작업의 상세 정보(기본 정보, 진행률, 수집 데이터, 실패 목록)를 표시합니다.
2.  **API 통신 (`03_StatusApi.tsx`):**
    *   페이지 진입 시 초기 데이터는 REST API를 통해 조회합니다.
    *   `getStatusList()`: 전체 수집 현황 목록
    *   `getStatusDetail(workId)`: 특정 작업의 상세 정보
    *   `stopCrawl(workId)`: 수집 중지 요청
3.  **실시간 업데이트 (WebSocket):**
    *   초기 데이터 로드 후, WebSocket을 통해 크롤링 진행 상황(진행률, 수집/실패 카운트, 완료 상태 등)을 실시간으로 수신하여 UI에 반영합니다.
    *   `WebSocketStore.ts`가 연결 및 구독을 관리하고, `useCrawlingProgress.ts` 훅이 수신된 메시지를 해석하여 상태를 계산합니다.

---

### 2. 파일별 상세 분석

#### 2.1. `src/page/03_Status/Status.tsx`

*   **역할:** 데이터 수집 현황 목록 페이지
*   **주요 기능:**
    *   페이지 진입 시 `getStatusList` API를 호출하여 현재 진행 중인 모든 수집 작업 목록을 가져옵니다.
    *   WebSocket을 구독(`_`/user/queue/crawling-progress`_)하여 모든 작업의 진행 상황을 실시간으로 수신하고, `useCrawlingProgress` 훅을 통해 상태를 업데이트합니다.
    *   테이블의 각 행은 `baseRows` (API로 받은 기본 정보)와 `progressMap` (WebSocket으로 업데이트되는 실시간 정보)을 조합하여 표시됩니다.
    *   사용자는 '수집 중지' 버튼을 클릭하여 `stopCrawl` API를 호출할 수 있습니다.
    *   데이터수집명을 클릭하면 해당 작업의 상세 페이지(`StatusDetail`)로 이동합니다.

#### 2.2. `src/page/03_Status/StatusDetail.tsx`

*   **역할:** 데이터 수집 현황 상세 페이지
*   **주요 기능:**
    *   `workId`를 파라미터로 받아 `getStatusDetail` API를 호출하여 해당 작업의 상세 정보를 가져옵니다.
    *   WebSocket을 구독(`_`/user/queue/crawling-progress/{workId}`_)하여 **현재 보고 있는 특정 작업**의 진행 상황(수집 데이터, 실패 데이터, 진행률)을 실시간으로 수신합니다.
    *   수신된 데이터는 `CommonTable` 컴포넌트를 통해 '수집 실패' 및 '수집 데이터' 테이블에 실시간으로 추가됩니다.
    *   진행률(`LinearProgress`)과 카운트(성공/실패/전체)를 시각적으로 표시합니다.
    *   메모리 관리를 위해 수집 데이터는 최대 1000개까지만 유지합니다.

#### 2.3. `src/page/03_Status/03_StatusApi.tsx`

*   **역할:** '수집 현황' 관련 REST API 클라이언트
*   **제공 함수 (백엔드 API와 1:1 매칭):**
    *   `getStatusList()`: `GET /status` - 전체 수집 현황 목록 조회
    *   `getStatusDetail(workId)`: `GET /status/detail/{workId}` - 수집 현황 상세 정보 조회
    *   `stopCrawl(workId)`: `POST /crawl/stop` - 진행 중인 수집 작업 중지

#### 2.4. `src/Store/WebSocketStore.ts`

*   **역할:** Stomp over WebSocket 연결 및 구독 관리 (Zustand 상태 관리 라이브러리 사용)
*   **주요 기능:**
    *   `connect(url)`: 지정된 URL로 WebSocket 연결을 시도합니다.
        *   연결 시 `Authorization` 헤더에 JWT 토큰을 포함하여 인증합니다.
        *   연결 실패 시 지수 백오프(exponential backoff)를 적용하여 **최대 5회**까지 자동 재연결을 시도합니다.
    *   `disconnect()`: WebSocket 연결을 해제합니다.
    *   `subscribe(destination, callback)`: 특정 큐(destination)를 구독하고, 메시지 수신 시 실행될 콜백 함수를 등록합니다.

#### 2.5. `src/hooks/useCrawlingProgress.ts`

*   **역할:** WebSocket으로 수신된 크롤링 메시지를 해석하여 실시간 진행 상태를 계산하고 관리하는 커스텀 훅
*   **주요 기능:**
    *   `progressMap` ( `Map<number, CrawlingProgress>` ): 여러 크롤링 작업(`workId` 기준)의 상태를 동시에 관리하는 Map 객체입니다.
    *   `handleWebSocketMessage(message)`: `CrawlingMessage` 타입의 메시지를 받아 `progressMap`의 상태를 업데이트합니다.
        *   `PROGRESS`: 전체 카운트, 예상 시간 등 초기 정보 설정
        *   `COLLECTION`: 성공 카운트를 1 증가시키고 진행률 재계산
        *   `FAILURE`: 실패 카운트를 1 증가시키고 진행률 재계산
        *   `COMPLETE`: 진행률을 100%로, 상태를 '완료'로 변경
    *   `resetCrawlingState(workId?)`: 특정 작업 또는 전체 작업의 상태를 초기화합니다.

#### 2.6. `src/Types/Crawling.tsx`

*   **역할:** 크롤링 관련 데이터 모델(DTO) 정의
*   **주요 타입:**
    *   `CollectionRow`: DB에 저장된 수집 데이터 한 행의 형식
    *   `FailureRow`: 수집 실패 데이터 한 행의 형식
    *   `CrawlingMessage`: **WebSocket 통신 프로토콜.** `type` 필드에 따라 `PROGRESS`, `COLLECTION`, `FAILURE`, `COMPLETE`로 구분되며, 각 타입에 맞는 데이터를 포함합니다. 이 타입 정의는 **프론트-백엔드 간의 핵심 규약**입니다.

#### 2.7. `src/Types/TableHeaders/StatusHeader.tsx`

*   **역할:** '수집 현황' 및 '상세조회' 페이지에서 사용되는 테이블의 컬럼 구조와 데이터 형식을 정의
*   **주요 내용:**
    *   `StatusTableRows`: 테이블에 표시될 한 행의 데이터 타입. API 응답과 실시간 진행 상태를 포함합니다.
    *   `getColumns()`: 수집 현황 목록 테이블(`Status.tsx`)의 컬럼 정의. '진행도' 컬럼은 `LinearProgress` 컴포넌트와 '중지' 버튼을 포함하여 동적으로 렌더링됩니다.
    *   `DETAIL_SETTING_COLUMNS`: 상세 페이지의 '기본 정보' 테이블 컬럼
    *   `FAILURE_COLUMNS`: 상세 페이지의 '수집 실패' 테이블 컬럼
    *   `createCollectionColumns()`: 상세 페이지의 '수집 데이터' 테이블 컬럼을 동적으로 생성하는 함수 (백엔드에서 받은 컬럼 정보 기반)

---

### 3. 데이터 흐름 요약

1.  **초기 로드 (REST):**
    *   사용자가 '수집 현황' 페이지(`/status`)에 접속합니다.
    *   `Status.tsx`가 `getStatusList()` API를 호출하여 기본 데이터를 받아 테이블에 표시합니다.
    *   상세 페이지(`/status/detail/{workId}`) 접속 시, `getStatusDetail()` API를 호출하여 상세 데이터를 받아 표시합니다.

2.  **실시간 업데이트 (WebSocket):**
    *   페이지 로드 후 `WebSocketStore`가 WebSocket에 연결하고, `Status.tsx`와 `StatusDetail.tsx`는 각각 필요한 큐를 구독합니다.
    *   백엔드에서 크롤링 이벤트가 발생하면, 구독 중인 프론트엔드에 `CrawlingMessage`가 전송됩니다.
    *   `useCrawlingProgress` 훅이 메시지를 처리하여 `progressMap` 상태를 업데이트합니다.
    *   React의 상태 변화에 따라 UI(진행률 바, 카운트, 테이블 데이터)가 자동으로 다시 렌더링됩니다.

3.  **사용자 액션 (REST):**
    *   사용자가 '수집 중지' 버튼을 클릭하면 `stopCrawl()` API가 호출됩니다.
    *   요청 성공 시, `getStatusList()`를 다시 호출하여 목록을 갱신합니다.

---

### 4. 백엔드 팀 참고사항 (API 명세 및 WebSocket 프로토콜)

프론트엔드는 아래의 명세에 따라 백엔드와 통신합니다.

#### 4.1. REST API Endpoints

*   **`GET /status`**: `StatusTableRows[]` 형식의 배열을 반환합니다.
*   **`GET /status/detail/{workId}`**: `StatusDetailResponse` 객체를 반환합니다. 이 객체에는 기본 정보, 실패 목록, 수집 데이터, 초기 진행률 정보가 모두 포함되어야 합니다.
*   **`POST /crawl/stop`**: `{ workId: number }`를 body로 받아 `{ success: boolean, message?: string }` 형식의 결과를 반환합니다.

#### 4.2. WebSocket Protocol (`CrawlingMessage`)

*   **Destination (목록):** `/user/queue/crawling-progress`
    *   모든 진행 중인 작업의 상태 변경 시 이 큐로 메시지를 전송해야 합니다.
*   **Destination (상세):** `/user/queue/crawling-progress/{workId}`
    *   특정 작업의 상세 이벤트(개별 데이터 수집/실패 등) 발생 시 이 큐로 메시지를 전송해야 합니다.

*   **Message Format (Type: `CrawlingMessage`):**
    *   **`{ type: "PROGRESS", workId, totalCount, estimatedTime }`**: 작업 시작 시 전체 작업량과 예상 완료 시간을 알립니다.
    *   **`{ type: "COLLECTION", workId, row?: CollectionRow }`**: 데이터 수집 1건 성공 시. `row`에는 수집된 데이터 객체를 담아 보냅니다.
    *   **`{ type: "FAILURE", workId, row?: FailureRow }`**: 데이터 수집 1건 실패 시. `row`에는 실패 관련 정보(URL 등)를 담아 보냅니다.
    *   **`{ type: "COMPLETE", workId }`**: 해당 `workId`의 작업이 모두 완료되었음을 알립니다.
