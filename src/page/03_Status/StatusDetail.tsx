import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import CommonTable from "../../component/CommonTable";
// import Alert from "../../component/Alert";
// import CustomButton from "../../component/CustomButton";
import { type StatusTableRows } from "../../Types/TableHeaders/StatusHeader";
import { type StatusDetailResponse } from "../../API/03_StatusApi";
import {
  type FailureRow,
  DETAIL_SETTING_COLUMNS,
  FAILURE_COLUMNS,
  createCollectionColumns,
} from "../../Types/TableHeaders/StatusDetailHeader";
import {
  getStatusDetail,
  // recollectWork,
  // recollectItem,
} from "../../API/03_StatusApi";
import useWebSocketStore, { ReadyState } from "../../Store/WebSocketStore";
import { type CrawlingMessage } from "../../Types/WebSocket";
import useCrawlingProgress from "../../hooks/useCrawlingProgress";
import { useAuthStore } from "../../Store/authStore";
import type { Subscription } from "stompjs";
import {
  parseResultValue,
  parseResultValueRows,
} from "../../utils/resultValueParser";

function StatusDetail() {
  // 라우팅
  const workId = Number(useParams().workId);
  const navigate = useNavigate();

  // workId 검증
  useEffect(() => {
    if (!workId || isNaN(workId) || workId <= 0) {
      alert("잘못된 접근입니다.");
      navigate("/status");
    }
  }, [workId, navigate]);

  // WebSocket
  const userId = useAuthStore((state) => state.user?.userId);
  const userRole = useAuthStore((state) => state.user?.role);
  const { connect, subscribe, readyState } = useWebSocketStore();
  const { progressMap, handleCrawlingProgress, resetCrawlingState } =
    useCrawlingProgress();
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  // 데이터 상태
  const [detailData, setDetailData] = useState<StatusTableRows | null>(null);
  const [failureRows, setFailureRows] = useState<FailureRow[]>([]);
  // 파싱된 수집 데이터 (동적 필드: title, writer 등)
  const [collectionRows, setCollectionRows] = useState<
    Array<Record<string, any>>
  >([]);
  const [collectionColumns, setCollectionColumns] = useState<GridColDef[]>([]);

  // 중복 체크용 ID
  const collectionIdSet = useRef(new Set<number>());
  const failureIdSet = useRef(new Set<number>());

  // 재수집 관련 상태
  // const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  // const [alertOpen, setAlertOpen] = useState(false);
  // const [alertType, setAlertType] = useState<"single" | "batch">("single");

  // 진행도 정보 (Source of Truth for counts)
  const currentProgress = progressMap.get(workId) ?? null;

  // 실패 여부가 포함된 수집 데이터 (state 기반)
  const collectionRowsWithFailure = collectionRows.map((row) => ({
    ...row,
    isFailure: row.state === "FAILURE",
  }));

  // UI 표시용 값 (currentProgress를 신뢰)
  const totalCount = currentProgress?.totalCount ?? 0;
  const collectCount = currentProgress?.collectCount ?? 0;
  const failCount = currentProgress?.failCount ?? 0;
  const expectEndAt = currentProgress?.expectEndAt ?? "계산 중...";
  const progress = currentProgress?.progress ?? 0;

  const handleBack = () => navigate("/status");

  // ========== 재수집 핸들러 ==========
  // const handleRecollectItem = async (itemId: number) => {
  //   try {
  //     await recollectItem(itemId);
  //     alert("재수집 요청이 완료되었습니다.");
  //   } catch (error) {
  //     console.error("개별 재수집 요청 실패:", error);
  //     alert("재수집 요청에 실패했습니다.");
  //   }
  // };

  // const handleBatchRecollect = async () => {
  //   try {
  //     await recollectWork(workId);
  //     alert("일괄 재수집 요청이 완료되었습니다.");
  //   } catch (error) {
  //     console.error("일괄 재수집 요청 실패:", error);
  //     alert("일괄 재수집 요청에 실패했습니다.");
  //   }
  // };

  // const handleRecollectClick = (itemId: number) => {
  //   setSelectedItemId(itemId);
  //   setAlertType("single");
  //   setAlertOpen(true);
  // };

  // const handleBatchRecollectClick = () => {
  //   setAlertType("batch");
  //   setAlertOpen(true);
  // };

  // const handleConfirm = async () => {
  //   setAlertOpen(false);
  //   if (alertType === "single" && selectedItemId !== null) {
  //     await handleRecollectItem(selectedItemId);
  //   } else if (alertType === "batch") {
  //     await handleBatchRecollect();
  //   }
  //   setSelectedItemId(null);
  // };

  // const handleCancel = () => {
  //   setAlertOpen(false);
  //   setSelectedItemId(null);
  // };

  // workId 변경 시 상태 초기화
  useEffect(() => {
    setDetailData(null);
    setFailureRows([]);
    setCollectionRows([]);
    setCollectionColumns([]);
    collectionIdSet.current.clear();
    failureIdSet.current.clear();
  }, [workId]);

  const fetchDetailData = useCallback(async () => {
    if (!workId) return;
    try {
      const data = await getStatusDetail(workId);

      // 기본 정보 설정 (MUI DataGrid를 위해 id 추가)
      setDetailData({ ...data.basicInfo, id: data.basicInfo.workId });

      // 실패 목록 설정 (id: itemId로 매핑, state 필드 추가)
      const failureList = data.failureList.map((row) => ({
        ...row,
        id: row.itemId,
        itemId: row.itemId,
        state: "FAILURE" as const,
        // onRecollect: handleRecollectClick, // 재수집 버튼 클릭 핸들러
      }));
      setFailureRows(failureList);
      failureList.forEach((row) => failureIdSet.current.add(row.itemId));

      // ✅ 초기 수집 데이터 파싱 (이미 수집된 데이터 표시)
      if (data.collectionData.rows.length > 0) {
        const parsedRows = parseResultValueRows(
          data.collectionData.rows,
          (row: any) => ({ id: row.itemId, itemId: row.itemId, seq: row.seq })
        );
        setCollectionRows(parsedRows);
        parsedRows.forEach((row) => collectionIdSet.current.add(row.itemId));

        // 동적 컬럼 생성
        setCollectionColumns(createCollectionColumns(data.collectionData.rows));
      }

      // 진행률 정보 초기화 (API 응답으로 받은 DB 집계값을 사용)
      handleCrawlingProgress({
        type: "COLLECT_UPDATE",
        workId,
        data: {
          ...data.progress,
          state: data.basicInfo.state, // API 응답의 최신 state 사용
          progress:
            data.progress.totalCount > 0
              ? ((data.progress.collectCount + data.progress.failCount) /
                  data.progress.totalCount) *
                100
              : 0,
        },
      });
    } catch (error) {
      console.error("상세 정보 조회 실패:", error);
      alert("상세 정보를 불러오는 데 실패했습니다.");
      navigate("/status");
    }
  }, [workId, navigate, handleCrawlingProgress]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      fetchDetailData();
    }
  }, [readyState, fetchDetailData]);

  // WebSocket 연결
  useEffect(() => {
    if (userId) {
      connect(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws");
    }
  }, [userId, connect]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN && userId && !subscriptionRef.current) {
      // 역할에 따라 구독 경로 분기
      const destination =
        userRole === "ROLE_ADMIN"
          ? `/topic/crawling-progress/${workId}` // 관리자: 공개 토픽
          : `/user/queue/crawling-progress/${workId}`; // 일반 유저: 개인 큐

      console.log(`[WebSocket] 구독 시작: ${destination}`);
      subscriptionRef.current = subscribe(destination, (message) => {
        const data: CrawlingMessage = JSON.parse(message.body);

        // COLLECT_UPDATE 메시지 처리 (집계 데이터 + 개별 행 데이터)

        // 1. 집계 데이터 업데이트 (useCrawlingProgress 훅)
        handleCrawlingProgress(data);

        // 2. 개별 행 데이터 처리 (state로 성공/실패 구분)
        if (data.crawlResultItem) {
          const item = data.crawlResultItem;

          // collectionRows: 모든 항목 추가 (FAILURE는 seq만, SUCCESS는 전체 데이터)
          if (!collectionIdSet.current.has(item.itemId)) {
            collectionIdSet.current.add(item.itemId);

            // SUCCESS일 때만 resultValue 파싱, FAILURE는 비움
            let additionalData = {};
            if (item.state === "SUCCESS") {
              if (typeof item.resultValue === "string") {
                additionalData = parseResultValue(item.resultValue);
              } else {
                additionalData = item.resultValue || {};
              }
            }

            const collectionItem = {
              id: item.itemId,
              itemId: item.itemId,
              seq: item.seq,
              state: item.state,
              ...additionalData,
            };
            setCollectionRows((prev) => [...prev, collectionItem]);
          }

          // failureRows: FAILURE만 추가 (상세 정보)
          if (
            item.state === "FAILURE" &&
            !failureIdSet.current.has(item.itemId)
          ) {
            failureIdSet.current.add(item.itemId);
            setFailureRows((prev) => [
              ...prev,
              { ...item, id: item.itemId, itemId: item.itemId } as FailureRow,
            ]);
          }
        }

        // 3. 완료 메시지 처리 (endAt 업데이트)
        if (data.data.endAt && detailData) {
          console.log(`[크롤링 완료] workId: ${workId}, endAt: ${data.data.endAt}`);
          setDetailData((prev) =>
            prev ? { ...prev, endAt: data.data.endAt } : prev
          );
        }
      });
    }
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = undefined;
        console.log("[WebSocket] 구독 해제: Status Detail Page");
      }
    };
  }, [workId, readyState, subscribe, handleCrawlingProgress, detailData, userRole]);

  // 컴포넌트 언마운트 시 해당 workId의 progress만 초기화
  useEffect(() => {
    return () => {
      resetCrawlingState(workId);
    };
  }, [workId, resetCrawlingState]);

  return (
    <Box sx={{ height: "97%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ paddingLeft: 2, marginTop: 1 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/status"
            underline="hover"
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            데이터 수집 현황
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            상세조회
          </Typography>
        </Breadcrumbs>
      </Box>
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: 5,
        }}
      >
        데이터 수집 현황 상세조회
      </Typography>
      <Box
        sx={{ padding: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Paper
          elevation={3}
          sx={{ padding: 4, flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", marginBottom: 1 }}
              >
                기본 정보
              </Typography>
              <CommonTable
                columns={DETAIL_SETTING_COLUMNS}
                rows={
                  detailData
                    ? [
                        {
                          ...detailData,
                          progress: currentProgress?.progress ?? 0,
                          state: currentProgress?.state ?? detailData.state,
                        },
                      ]
                    : []
                }
                pageSize={1}
                hideFooter={true}
              />
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    수집 실패
                  </Typography>
                  <Typography>
                    {failCount}/{totalCount}
                  </Typography>
                </Box>
                {/* <CustomButton
                  text="일괄 재수집"
                  onClick={handleBatchRecollectClick}
                  radius={2}
                /> */}
              </Box>
              <CommonTable
                columns={FAILURE_COLUMNS}
                rows={failureRows}
                pageSize={5}
              />
            </Box>
            <Box sx={{ marginTop: "auto" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    수집 데이터
                  </Typography>
                  <Typography>
                    {collectCount}/{totalCount}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: "bold" }}>
                  수집완료 예상시간 : {expectEndAt}
                </Typography>
              </Box>
              <CommonTable
                columns={collectionColumns}
                rows={collectionRowsWithFailure}
                pageSize={5}
              />
            </Box>
            <Box
              sx={{
                marginTop: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button variant="contained" onClick={handleBack}>
                닫기
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* <Alert
        open={alertOpen}
        type="question"
        text={
          alertType === "single"
            ? `선택한 항목을 재수집하시겠습니까?`
            : `모든 실패 항목을 재수집하시겠습니까?`
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      /> */}
    </Box>
  );
}

export default StatusDetail;
