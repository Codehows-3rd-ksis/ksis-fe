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
import { getStatusDetail } from "./Api";
import useWebSocketStore, {
  ReadyState,
  type CrawlingMessage,
} from "../../Store/WebSocketStore";
import useCrawlingData from "../../hooks/useCrawling";
import { useAuthStore } from "../../Store/authStore";
import type { Subscription } from "stompjs";

const DETAIL_SETTING_COLUMNS: GridColDef[] = [
  { field: "settingName", headerName: "데이터수집명", flex: 1, headerAlign: "center", align: "center" },
  { field: "state", headerName: "진행상태", flex: 1, headerAlign: "center", align: "center" },
  { field: "startAt", headerName: "수집시작", flex: 1, headerAlign: "center", align: "center" },
  { field: "endAt", headerName: "수집완료", flex: 1, headerAlign: "center", align: "center" },
  { field: "type", headerName: "실행타입", flex: 1, headerAlign: "center", align: "center" },
  { field: "period", headerName: "수집기간", flex: 1, headerAlign: "center", align: "center" },
  { field: "cycle", headerName: "수집주기", flex: 1, headerAlign: "center", align: "center" },
  { field: "userId", headerName: "유저ID", flex: 1, headerAlign: "center", align: "center" },
];

const FAILURE_COLUMNS: GridColDef[] = [
  { field: "progressNo", headerName: "진행번호", flex: 1, headerAlign: "center", align: "center" },
  { field: "url", headerName: "URL", flex: 7, headerAlign: "center", align: "left" },
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
    { field: "progressNo", headerName: "진행번호", flex: 1, headerAlign: "center", align: "center" },
    ...fields.map(({ field, headerName }): GridColDef => ({
      field,
      headerName,
      flex: field === "context" ? 4 : 1,
      headerAlign: "center",
      align: field === "context" ? "left" : "center",
    })),
  ];
};

function StatusDetail() {
  const { workId: workIdParam } = useParams<{ workId: string }>();
  const workId = workIdParam ? Number(workIdParam) : undefined;
  const navigate = useNavigate();

  const userId = useAuthStore((state) => state.user?.userId);
  const { connect, subscribe, readyState } = useWebSocketStore();
  const { progressMap, handleWebSocketMessage } = useCrawlingData();
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  const [detailData, setDetailData] = useState<StatusTableRows | null>(null);
  const [failureRows, setFailureRows] = useState<Array<{ id: number; progressNo: string; url: string }>>([]);
  const [collectionRows, setCollectionRows] = useState<Array<{ id: number; progressNo: string; [key: string]: any }>>([]);
  const [collectionColumns, setCollectionColumns] = useState<GridColDef[]>([]);

  const currentProgress = useMemo(() => {
    if (!workId) return null;
    return progressMap.get(workId) || null;
  }, [workId, progressMap]);

  const failureProgressNos = new Set(failureRows.map((row) => row.progressNo));
  const collectionRowsWithFailure = collectionRows.map((row) => {
    if (failureProgressNos.has(row.progressNo)) {
      return { id: row.id, progressNo: row.progressNo, title: "", writer: "", date: "", context: "", isFailure: true };
    }
    return { ...row, isFailure: false };
  });

  const totalCount = currentProgress?.totalCount ?? 0;
  const collectionCount = currentProgress?.collectionCount ?? collectionRows.length;
  const failureCount = currentProgress?.failureCount ?? failureRows.length;
  const estimatedTime = currentProgress?.estimatedTime ?? "";
  const progressValue = currentProgress?.progress ?? 0;

  const handleBack = () => navigate("/status");

  useEffect(() => {
    const fetchDetailData = async () => {
      if (!workId) return;
      try {
        const data = await getStatusDetail(workId);
        setDetailData(data.basicInfo);
        setFailureRows(data.failureList);
        setCollectionRows(data.collectionData.rows);
        if (data.collectionData.columns.length > 0) {
          setCollectionColumns(createCollectionColumns(data.collectionData.columns));
        }

        handleWebSocketMessage({ type: "PROGRESS", workId, totalCount: data.progress.totalCount, estimatedTime: data.progress.estimatedTime });
        if (data.collectionData.rows.length > 0) {
          handleWebSocketMessage({ type: "COLLECTION", workId, rows: data.collectionData.rows });
        }
        if (data.failureList.length > 0) {
          handleWebSocketMessage({ type: "FAILURE", workId, rows: data.failureList as any });
        }
      } catch (error) {
        console.error("상세 정보 조회 실패:", error);
      }
    };
    fetchDetailData();
  }, [workId, handleWebSocketMessage]);

  const setupWebSocketConnection = useCallback(() => {
    if (userId && (readyState === ReadyState.UNINSTANTIATED || readyState === ReadyState.CLOSED)) {
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
        handleWebSocketMessage(data);

        switch (data.type) {
          case "COLLECTION":
            if (data.row) {
              const newRow = data.row;
              setCollectionRows((prev) => [...prev, newRow]);
            }
            break;
          case "FAILURE":
            if (data.failure) {
              const newFailure = data.failure;
              setFailureRows((prev) => [...prev, newFailure]);
            }
            break;
          case "COMPLETE":
            console.log("크롤링 완료!");
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
          <Link component={RouterLink} to="/status" underline="hover" color="inherit" sx={{ fontWeight: "bold", fontSize: 16 }}>
            데이터 수집 현황
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: "bold", fontSize: 16 }}>
            상세조회
          </Typography>
        </Breadcrumbs>
      </Box>
      <Typography sx={{ fontSize: 60, fontWeight: "bold", color: "black", paddingLeft: 2, marginTop: 5 }}>
        데이터 수집 현황 상세조회
      </Typography>
      <Box sx={{ padding: 2, flex: 1, display: "flex", flexDirection: "column" }}>
        <Paper elevation={3} sx={{ padding: 4, flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                기본 정보
              </Typography>
              <CommonTable columns={DETAIL_SETTING_COLUMNS} rows={detailData ? [detailData] : []} pageSize={1} hideFooter={true} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                진행률:
              </Typography>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={progressValue} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(progressValue)}%`}</Typography>
              </Box>
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", marginBottom: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    수집 실패
                  </Typography>
                  <Typography>
                    {failureCount}/{totalCount}
                  </Typography>
                </Box>
              </Box>
              <CommonTable columns={FAILURE_COLUMNS} rows={failureRows} pageSize={5} />
            </Box>
            <Box sx={{ marginTop: "auto" }}>
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", marginBottom: 1 }}>
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
              <CommonTable columns={collectionColumns} rows={collectionRowsWithFailure} pageSize={5} />
            </Box>
            <Box sx={{ marginTop: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
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
