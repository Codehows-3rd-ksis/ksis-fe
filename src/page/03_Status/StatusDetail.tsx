import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  LinearProgress,
} from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import CommonTable from "../../component/CommonTable";
import { type StatusTableRows } from "../../Types/TableHeaders/StatusHeader";
import { getStatusDetail } from "./03_StatusApi";
import useWebSocketStore, { ReadyState } from "../../Store/WebSocketStore";
import { type CrawlingMessage } from "../../Types/Crawling";
import useCrawlingProgress from "../../hooks/useCrawlingProgress";
import { useAuthStore } from "../../Store/authStore";
import type { Subscription } from "stompjs";

const DETAIL_SETTING_COLUMNS: GridColDef[] = [
  {
    field: "settingName",
    headerName: "데이터수집명",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "state",
    headerName: "진행상태",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "startAt",
    headerName: "수집시작",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "endAt",
    headerName: "수집완료",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "type",
    headerName: "실행타입",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "period",
    headerName: "수집기간",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "cycle",
    headerName: "수집주기",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "userId",
    headerName: "유저ID",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
];

const FAILURE_COLUMNS: GridColDef[] = [
  {
    field: "progressNo",
    headerName: "진행번호",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "url",
    headerName: "URL",
    flex: 7,
    headerAlign: "center",
    align: "left",
  },
];

const createCollectionColumns = (
  source: Array<{ field: string; headerName: string }> | Record<string, any>
): GridColDef[] => {
  const fields = Array.isArray(source)
    ? source
    : Object.keys(source)
        .filter((k) => k !== "id" && k !== "progressNo")
        .map((key) => ({ field: key, headerName: key }));

  return [
    {
      field: "progressNo",
      headerName: "진행번호",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    ...fields.map(
      ({ field, headerName }): GridColDef => ({
        field,
        headerName,
        flex: field === "context" ? 4 : 1,
        headerAlign: "center",
        align: field === "context" ? "left" : "center",
      })
    ),
  ];
};

function StatusDetail() {
  const { workId: workIdParam } = useParams<{ workId: string }>();
  const workId = workIdParam ? Number(workIdParam) : undefined;
  const navigate = useNavigate();

  const userId = useAuthStore((state) => state.user?.userId);
  const { connect, subscribe, readyState } = useWebSocketStore();
  const { progressMap, handleWebSocketMessage } = useCrawlingProgress();
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  const [detailData, setDetailData] = useState<StatusTableRows | null>(null);
  const [failureRows, setFailureRows] = useState<
    Array<{ id: number; progressNo: string; url: string }>
  >([]);
  const [collectionRows, setCollectionRows] = useState<
    Array<{ id: number; progressNo: string; [key: string]: any }>
  >([]);
  const [collectionColumns, setCollectionColumns] = useState<GridColDef[]>([]);

  // 성능 최적화: Set으로 ID 관리
  const collectionIdSet = useRef(new Set<number>());
  const failureIdSet = useRef(new Set<number>());

  const currentProgress = useMemo(() => {
    if (!workId) return null;
    return progressMap.get(workId) || null;
  }, [workId, progressMap]);

  const failureProgressNos = useMemo(
    () => new Set(failureRows.map((row) => row.progressNo)),
    [failureRows]
  );

  const collectionRowsWithFailure = useMemo(() => {
    return collectionRows.map((row) => ({
      ...row,
      isFailure: failureProgressNos.has(row.progressNo),
    }));
  }, [collectionRows, failureProgressNos]);

  const totalCount = currentProgress?.totalCount ?? 0;
  const collectionCount =
    currentProgress?.collectionCount ?? collectionRows.length;
  const failureCount = currentProgress?.failureCount ?? failureRows.length;
  const estimatedTime = currentProgress?.estimatedTime ?? "계산 중...";
  const progressValue = currentProgress?.progress ?? 0;

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

  useEffect(() => {
    const fetchDetailData = async () => {
      if (!workId) return;
      try {
        const data = await getStatusDetail(workId);

        // 기본 정보 설정
        setDetailData(data.basicInfo);

        // 실패 목록 설정
        setFailureRows(data.failureList);
        data.failureList.forEach((row) => failureIdSet.current.add(row.id));

        // 수집 데이터 설정
        setCollectionRows(data.collectionData.rows);
        data.collectionData.rows.forEach((row) =>
          collectionIdSet.current.add(row.id)
        );

        // 컬럼 정의 설정
        if (data.collectionData.columns.length > 0) {
          setCollectionColumns(
            createCollectionColumns(data.collectionData.columns)
          );
        }

        // 진행률 정보 초기화 (WebSocket 메시지 형식으로 전달)
        handleWebSocketMessage({
          type: "PROGRESS",
          workId,
          totalCount: data.progress.totalCount,
          estimatedTime: data.progress.estimatedTime,
        });
      } catch (error) {
        console.error("상세 정보 조회 실패:", error);
      }
    };
    fetchDetailData();
  }, [workId, handleWebSocketMessage]);

  const setupWebSocketConnection = useCallback(() => {
    if (
      userId &&
      (readyState === ReadyState.UNINSTANTIATED ||
        readyState === ReadyState.CLOSED)
    ) {
      const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";
      connect(wsUrl);
    }
  }, [userId, connect, readyState]);

  useEffect(() => {
    setupWebSocketConnection();
  }, [setupWebSocketConnection]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN && userId && !subscriptionRef.current) {
      const destination = `/user/queue/crawling-progress`;
      subscriptionRef.current = subscribe(destination, (message) => {
        const data: CrawlingMessage = JSON.parse(message.body);
        if (data.workId !== workId) return;

        // 1. 진행도 업데이트
        handleWebSocketMessage(data);

        // 2. 실제 크롤링 데이터 처리 (성공/실패)
        switch (data.type) {
          case "COLLECTION":
            if (data.row && typeof data.row === "object" && "id" in data.row) {
              const newRow = data.row;

              // Set으로 O(1) 중복 체크
              if (collectionIdSet.current.has(newRow.id)) break;

              collectionIdSet.current.add(newRow.id);
              setCollectionRows((prev) => {
                const newRows = [...prev, newRow];
                // 1000개 제한 (메모리 관리)
                if (newRows.length > 1000) {
                  const removed = newRows.shift();
                  if (removed) collectionIdSet.current.delete(removed.id);
                }
                return newRows;
              });

              // 동적 컬럼 추가
              setCollectionColumns((prevCols) => {
                const existingFields = new Set(
                  prevCols.map((col) => col.field)
                );
                const newKeys = Object.keys(newRow).filter(
                  (key) =>
                    key !== "id" &&
                    key !== "progressNo" &&
                    !existingFields.has(key)
                );

                if (newKeys.length === 0) return prevCols;

                const newColDefs: GridColDef[] = newKeys.map((key) => ({
                  field: key,
                  headerName: key,
                  flex: key === "context" ? 4 : 1,
                  headerAlign: "center",
                  align: key === "context" ? "left" : "center",
                }));

                return [...prevCols, ...newColDefs];
              });
            }
            break;

          case "FAILURE":
            if (
              data.failure &&
              typeof data.failure === "object" &&
              "id" in data.failure
            ) {
              const newFailure = data.failure;

              // Set으로 O(1) 중복 체크
              if (failureIdSet.current.has(newFailure.id)) break;

              failureIdSet.current.add(newFailure.id);
              setFailureRows((prev) => [...prev, newFailure]);
            }
            break;

          case "COMPLETE":
            console.log(`[크롤링 완료] workId: ${workId}`);
            break;
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
  }, [workId, readyState, userId, subscribe, handleWebSocketMessage]);

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
                rows={detailData ? [detailData] : []}
                pageSize={1}
                hideFooter={true}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                진행률:
              </Typography>
              <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress variant="determinate" value={progressValue} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >{`${Math.round(progressValue)}%`}</Typography>
              </Box>
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
                    {failureCount}/{totalCount}
                  </Typography>
                </Box>
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
                    {collectionCount}/{totalCount}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: "bold" }}>
                  수집완료 예상시간 : {estimatedTime}
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
    </Box>
  );
}

export default StatusDetail;
