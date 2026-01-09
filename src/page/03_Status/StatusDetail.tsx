import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Breadcrumbs, Link, Paper } from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import CommonTable from "../../component/CommonTable";
import CustomButton from "../../component/CustomButton";
import Alert from "../../component/Alert";
import { type StatusTableRows } from "../../API/03_StatusApi";
import {
  type FailureRow,
  DETAIL_SETTING_COLUMNS,
  FAILURE_COLUMNS,
  createColumnsFromParsedRow,
} from "../../Types/TableHeaders/StatusDetailHeader";
import { getStatusDetail, stopCrawl } from "../../API/03_StatusApi";
import useWebSocketStore, { ReadyState } from "../../Store/WebSocketStore";
import { type CrawlingMessage } from "../../Types/WebSocket";
import useCrawlingProgress from "../../hooks/useCrawlingProgress";
import { useAuthStore } from "../../Store/authStore";
import type { Subscription } from "stompjs";
import { parseResultValue } from "../../utils/resultValueParser";
import dayjs from "dayjs";

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

  // 데이터
  const [detailData, setDetailData] = useState<StatusTableRows | null>(null);
  const [failureRows, setFailureRows] = useState<FailureRow[]>([]);
  const [collectionRows, setCollectionRows] = useState<
    Array<Record<string, any>>
  >([]);
  const [collectionColumns, setCollectionColumns] = useState<GridColDef[]>([]);

  // 중복 체크용 ID
  const collectionIdSet = useRef(new Set<number>());
  const failureIdSet = useRef(new Set<number>());

  // 진행도 정보
  const currentProgress = progressMap.get(workId) ?? null;
  const totalCount = currentProgress?.totalCount ?? 0;
  const collectCount = currentProgress?.collectCount ?? 0;
  const failCount = currentProgress?.failCount ?? 0;
  const expectEndAt = currentProgress?.expectEndAt ?? "계산 중...";

  // Alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("")
  const [alertStopResultOpen, setAlertStopResultOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StatusTableRows | null>(null);

  const handleBack = () => navigate("/status");

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

      // 기본 정보 (MUI DataGrid를 위해 id 추가)
      setDetailData({ ...data.basicInfo, id: data.basicInfo.workId });

      // 실패 목록
      const failureList = data.failureList.map((row: any) => ({
        id: row.itemId,
        seq: row.seq,
        url: row.url,
      }));
      setFailureRows(failureList);
      failureList.forEach((row) => failureIdSet.current.add(row.id)); // 중복 방지

      // 수집 데이터
      if (data.collectionData.rows.length > 0) {
        // 파싱(SUCCESS:데이터 전달, FAILED:null)
        const parsedRows = data.collectionData.rows.map((row: any) => {
          const rowId = row.itemId;
          let additionalData = {};
          if (row.state === "SUCCESS") {
            if (typeof row.resultValue === "string") {
              additionalData = parseResultValue(row.resultValue);
            } else {
              additionalData = row.resultValue || {};
            }
          }

          return {
            id: rowId,
            itemId: rowId,
            seq: row.seq,
            state: row.state,
            ...additionalData,
          };
        });

        setCollectionRows(parsedRows);
        parsedRows.forEach((row) => collectionIdSet.current.add(row.id)); // 중복 방지

        // API 데이터에서 컬럼 생성 (완료된 작업 조회 시)
        // 첫 번째 SUCCESS 행으로 동적 컬럼 생성
        const firstSuccessRow = parsedRows.find(
          (row) => row.state === "SUCCESS"
        );
        if (firstSuccessRow) {
          setCollectionColumns(createColumnsFromParsedRow(firstSuccessRow));
        }
      }

      handleCrawlingProgress({
        type: "COLLECT_UPDATE",
        workId,
        data: {
          ...data.progressInfo, // totalCount, collectCount, failCount, expectEndAt
          state: data.basicInfo.state, // API 응답의 최신 state 사용
          progressRate: data.basicInfo.progressRate, // API 응답의 진행률 사용
        },
      });
    } catch (error) {
      console.error("상세 정보 조회 실패:", error);
      alert("상세 정보를 불러오는 데 실패했습니다.");
      navigate("/status");
    }
  }, [workId, navigate, handleCrawlingProgress]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchDetailData();
  }, [fetchDetailData]);

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

      subscriptionRef.current = subscribe(destination, (message) => {
        const data: CrawlingMessage = JSON.parse(message.body);

        // COLLECT_UPDATE 메시지 처리 (집계 데이터 + 개별 행 데이터)

        // 1. 집계 데이터 업데이트 (useCrawlingProgress 훅)
        handleCrawlingProgress(data);

        // 2. 개별 행 데이터 처리 (state로 성공/실패 구분)
        if (data.crawlResultItem) {
          const item = data.crawlResultItem;

          // collectionRows: 모든 항목 추가 (FAILED는 seq만, SUCCESS는 전체 데이터)
          const itemId = item.itemId;
          if(itemId === 0) return;

          if (!collectionIdSet.current.has(itemId)) {
            collectionIdSet.current.add(itemId); // 중복 방지

            // SUCCESS일 때만 resultValue 파싱, FAILED는 비움
            let additionalData = {};
            if (item.state === "SUCCESS") {
              if (typeof item.resultValue === "string") {
                additionalData = parseResultValue(item.resultValue);
              } else {
                additionalData = item.resultValue || {};
              }
            }

            const collectionItem = {
              id: itemId,
              itemId: itemId,
              seq: item.seq,
              state: item.state,
              ...additionalData,
            };

            // 컬럼이 아직 없고 SUCCESS 데이터면 동적 컬럼 생성
            if (collectionColumns.length === 0 && item.state === "SUCCESS") {
              setCollectionColumns(createColumnsFromParsedRow(collectionItem));
            }

            setCollectionRows((prev) => [...prev, collectionItem]);
          }

          // failureRows: FAILED만 추가 (상세 정보)
          if (item.state === "FAILED" && !failureIdSet.current.has(itemId)) {
            failureIdSet.current.add(itemId);
            setFailureRows((prev) => [
              ...prev,
              {
                id: itemId,
                seq: item.seq,
                url: item.url,
              } as FailureRow,
            ]);
          }
        }

        // 3. 완료 메시지 처리 (endAt 업데이트)
        if (data.data.endAt) {
          // detailData 조건 제거 - setDetailData 내부에서 prev 체크
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
      }
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState, subscribe]);

  // 컴포넌트 언마운트 시 해당 workId의 progress만 초기화
  useEffect(() => {
    return () => {
      resetCrawlingState(workId);
    };
  }, [workId, resetCrawlingState]);

  // 수집 중지 API
  const handleStopCrawl = async (row: StatusTableRows) => {
    try {
      await stopCrawl(row.workId);
      setAlertStopResultOpen(true);
    } catch (error) {
      console.error("수집 중지 요청 실패:", error);
      setErrorMsg("수집 중지 요청에 실패했습니다.");
      setOpenErrorAlert(true);
    }
  };

  const handleStopClick = (row: StatusTableRows) => {
    setSelectedRow(row);
    setAlertOpen(true);
  };

  const handleConfirm = async () => {
    setAlertOpen(false);
    if (selectedRow) {
      await handleStopCrawl(selectedRow);
    }
  };

  const handleCancel = () => {
    setAlertOpen(false);
    setSelectedRow(null);
  };

  const baseColumns = DETAIL_SETTING_COLUMNS({ handleStopClick });

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafaf9",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* 상단 헤더 */}
      <Box sx={{ px: 4, pt: 3, pb: 2, flexShrink: 0 }}>
        <Breadcrumbs
          sx={{ mb: 0.5, "& .MuiTypography-root": { fontSize: 14 } }}
        >
          <Link
            component={RouterLink}
            to="/status"
            underline="hover"
            color="inherit"
          >
            데이터 수집 현황
          </Link>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            상세조회
          </Typography>
        </Breadcrumbs>
        <Typography
          sx={{
            fontSize: 32,
            fontWeight: 800,
            color: "#292524",
            letterSpacing: "-0.03em",
          }}
        >
          데이터 수집 현황 상세조회
        </Typography>
      </Box>

      {/* 본문 영역: 스크롤 구역 */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 4, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
        {/* 기본 정보 */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid #e7e5e4",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.04)",
            backgroundColor: "#fff",
          }}
        >
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, mb: 3, color: "#44403c" }}
          >
            기본 정보
          </Typography>
          <CommonTable
            columns={baseColumns}
            rows={
              detailData
                ? [
                    {
                      ...detailData,
                      progressRate: currentProgress?.progressRate ?? 0,
                      state: currentProgress?.state ?? detailData.state,
                      failCount: currentProgress?.failCount ?? 0,
                    },
                  ]
                : []
            }
            pageSize={1}
            hideFooter={true}
            disableHover={true}
          />
        </Paper>
        {/* 수집 실패 */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid #e7e5e4",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.04)",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#44403c" }}>
              수집 실패
            </Typography>
            <Typography sx={{ fontSize: 15, color: "#78716c" }}>
              {failCount}/{totalCount}
            </Typography>
          </Box>
          <CommonTable
            columns={FAILURE_COLUMNS}
            rows={failureRows}
            pageSize={3}
          />
        </Paper>
        {/* 수집 데이터 */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid #e7e5e4",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.04)",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#44403c" }}>
                수집 데이터
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#78716c" }}>
                {collectCount}/{totalCount}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2.5,
                py: 1.5,
                backgroundColor: "#f8f9fa",
                borderRadius: 1.5,
                border: "1px solid #dee2e6",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "#495057", fontWeight: 600 }}>
                수집완료 예상시간
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#adb5bd" }}>
                •
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#495057" }}>
                {expectEndAt &&
                expectEndAt !== "계산 중..." &&
                expectEndAt !== "완료" &&
                dayjs(expectEndAt).isValid()
                  ? dayjs(expectEndAt).format("YY-MM-DD HH:mm")
                  : expectEndAt}
              </Typography>
            </Box>
          </Box>
          <CommonTable
            columns={collectionColumns}
            rows={collectionRows}
            pageSize={5}
            disableHover={true}
          />
        </Paper>
        </Box>
      </Box>

      {/* 하단 푸터 */}
      <Box
        sx={{
          px: 4,
          py: 2,
          display: "flex",
          justifyContent: "flex-start",
          flexShrink: 0,
        }}
      >
        <CustomButton
          text="이전"
          backgroundColor="#F2F2F2"
          onClick={handleBack}
          radius={2}
          width="100px"
          border="1px solid #757575"
          hoverStyle={{
            backgroundColor: "transparent",
            border: "2px solid #373737ff",
          }}
        />
      </Box>

      {/* 수집 중지 요청 알람 */}
      <Alert
        open={alertOpen}
        type="question"
        text={`"수집을 중지하시겠습니까?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      {/* 수집 중지 결과 확인 알람 */}
      <Alert
        open={alertStopResultOpen}
        text="수집이 중지되었습니다."
        type="success"
        onConfirm={() => {
          setAlertStopResultOpen(false);
          handleBack()
        }}
      />
      {/* Error Alert */}
      <Alert
        open={openErrorAlert}
        text={errorMsg}
        type="error"
        onConfirm={() => {
          setOpenErrorAlert(false);
        }}
      />
    </Box>
  );
}

export default StatusDetail;
