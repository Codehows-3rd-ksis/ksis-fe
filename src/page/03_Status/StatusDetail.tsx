import { useEffect, useState } from "react";
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
import { type StatusTableRows } from "../../Types/TableHeaders/StatusHeader";

import { getStatusDetail } from "./Api";
import useWebSocketStore from "../../store/useWebSocketStore";

// 기본 정보 테이블 컬럼 정의 (고정값)
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

// 실패 테이블 컬럼 정의 (고정값)
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

/**
 * 수집 데이터 동적 컬럼 생성 함수
 * @param source - 백엔드 컬럼 정보 배열 또는 샘플 데이터 객체
 */
const createCollectionColumns = (
  source: Array<{ field: string; headerName: string }> | Record<string, any>
): GridColDef[] => {
  // source가 배열이면 그대로 사용, 객체면 키 추출
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
    ...fields.map(({ field, headerName }) => ({
      field,
      headerName,
      flex: field === "context" ? 4 : 1,
      headerAlign: "center" as const,
      align: (field === "context" ? "left" : "center") as const,
    })),
  ];
};

function StatusDetail() {
  // ========== 1. 라우터 훅 ==========
  const { workId: workIdParam } = useParams<{
    workId: string;
  }>();
  const workId = workIdParam ? Number(workIdParam) : undefined;
  const navigate = useNavigate();

  const { connect, subscribe, readyState } = useWebSocketStore();

  const [detailData, setDetailData] = useState<StatusTableRows | null>(null);
  const [failureRows, setFailureRows] = useState<
    Array<{ id: number; progressNo: string; url: string }>
  >([]);
  const [collectionRows, setCollectionRows] = useState<
    Array<{ id: number; progressNo: string; [key: string]: any }>
  >([]);
  const [collectionColumns, setCollectionColumns] = useState<GridColDef[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");

  // 실패한 진행번호 Set 생성
  const failureProgressNos = new Set(failureRows.map((row) => row.progressNo));

  // 실패한 row의 데이터 비우기
  const collectionRowsWithFailure = collectionRows.map((row) => {
    const isFailed = failureProgressNos.has(row.progressNo);
    if (isFailed) {
      return {
        id: row.id,
        progressNo: row.progressNo,
        title: "",
        writer: "",
        date: "",
        context: "",
        isFailure: true,
      };
    }
    return { ...row, isFailure: false };
  });

  const failureCount = failureRows.length;
  const collectionCount = collectionRows.length;
  const handleBack = () => {
    navigate("/status");
  };

  // 페이지 진입 시 초기 데이터 로딩
  useEffect(() => {
    const fetchDetailData = async () => {
      if (!workId) return;

      try {
        const data = await getStatusDetail(workId);
        setDetailData(data.basicInfo);
        setFailureRows(data.failureList);
        setCollectionRows(data.collectionData.rows);
        setTotalCount(data.progress.totalCount);
        setEstimatedTime(data.progress.estimatedTime);

        if (data.collectionData.columns.length > 0) {
          setCollectionColumns(
            createCollectionColumns(data.collectionData.columns)
          );
        }
      } catch (error) {
        console.error("상세 정보 조회 실패:", error);
      }
    };

    fetchDetailData();
  }, [workId]);

  // WebSocket 연결
  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";
    if (readyState !== 1) {
      connect(WS_URL);
    }
  }, [readyState]);

  // 크롤링 작업 구독
  useEffect(() => {
    if (!workId || readyState !== 1) return;

    console.log(`크롤링 작업 ${workId} 구독 시작`);

    const subscription = subscribe(
      `/user/queue/crawling/${workId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("수신된 메시지:", data);

          switch (data.type) {
            case "PROGRESS":
              if (data.totalCount !== undefined) {
                setTotalCount(data.totalCount);
              }
              if (data.estimatedTime) {
                setEstimatedTime(data.estimatedTime);
              }
              break;

            case "COLLECTION":
              if (data.row) {
                setCollectionRows((prev) => [...prev, data.row]);
              } else if (data.rows) {
                setCollectionRows(data.rows);
              }

              if (
                collectionColumns.length === 0 &&
                (data.row || (data.rows && data.rows.length > 0))
              ) {
                const sampleRow = data.row || data.rows[0];
                setCollectionColumns(createCollectionColumns(sampleRow));
              }
              break;

            case "FAILURE":
              if (data.failure) {
                setFailureRows((prev) => [...prev, data.failure]);
              } else if (data.rows) {
                setFailureRows(data.rows);
              }
              break;

            case "COMPLETE":
              console.log("크롤링 완료!");
              break;

            default:
              console.warn("알 수 없는 메시지 타입:", data.type);
          }
        } catch (error) {
          console.error("메시지 파싱 오류:", error);
        }
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        console.log(`크롤링 작업 ${workId} 구독 해제`);
      }
    };
  }, [workId, readyState]);

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
