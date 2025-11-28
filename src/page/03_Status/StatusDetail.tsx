import { useEffect, useState, useMemo, useCallback } from "react";
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

function StatusDetail() {
  // ========== 1. 라우터 훅 ==========
  const { workId: workIdParam } = useParams<{
    workId: string;
  }>();
  const workId = workIdParam ? Number(workIdParam) : undefined;
  const navigate = useNavigate();

  const { connect, subscribeCrawling, readyState, disconnect } =
    useWebSocketStore();

  // ========== 2. State 선언 (데이터) ==========
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

  // ========== 3. State 선언 (UI 상태) ==========

  // ========== 4. 파생 데이터 (useMemo) ==========
  //기본정보테이블
  const detailSettingColumns: GridColDef[] = useMemo(
    () => [
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
    ],
    []
  );

  const detailSettingRows = useMemo(() => {
    if (!detailData) return [];
    return [
      {
        id: detailData.id,
        settingName: detailData.settingName,
        state: detailData.state,
        startAt: detailData.startAt,
        endAt: detailData.endAt,
        type: detailData.type,
        period: detailData.period,
        cycle: detailData.cycle,
        userId: detailData.userId,
      },
    ];
  }, [detailData]);

  const failureColumns: GridColDef[] = useMemo(
    () => [
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
    ],
    []
  );

  // 실패한 진행번호 Set 생성
  const failureProgressNos = useMemo(
    () => new Set(failureRows.map((row) => row.progressNo)),
    [failureRows]
  );

  // 실패한 row의 데이터 비우기
  const collectionRowsWithFailure = useMemo(
    () =>
      collectionRows.map((row) => {
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
      }),
    [collectionRows, failureProgressNos]
  );

  // ========== 5. 계산된 값 ==========
  const failureCount = failureRows.length;
  const collectionCount = collectionRows.length;

  // ========== 6. API 함수 ==========

  // ========== 7. 이벤트 핸들러 ==========
  const handleBack = () => {
    navigate("/status");
  };

  // ========== 8. useEffect (부수 효과) ==========
  // 페이지 진입 시 초기 데이터 로딩
  useEffect(() => {
    const fetchDetailData = async () => {
      if (!workId) return; // workId가 없으면 실행 안 함

      try {
        const data = await getStatusDetail(workId); // API 호출 // 받아온 데이터로 각 state 업데이트
        setDetailData(data.basicInfo); // 기본 정보
        setFailureRows(data.failureList); // 실패 목록
        setCollectionRows(data.collectionData.rows); // 수집 데이터
        setTotalCount(data.progress.totalCount); // 전체 개수
        setEstimatedTime(data.progress.estimatedTime); // 예상 시간

        // 동적 컬럼 생성 (수집 데이터 컬럼이 동적으로 변할 수 있음)
        if (data.collectionData.columns.length > 0) {
          const dynamicColumns = data.collectionData.columns.map((col) => ({
            // 백엔드가 보내준 컬럼 정보
            field: col.field,
            headerName: col.headerName,
            flex: col.field === "context" ? 4 : 1,
            headerAlign: "center" as const,
            align:
              col.field === "context" ? ("left" as const) : ("center" as const),
          }));
          setCollectionColumns(dynamicColumns); //컬럼 한번에 생성
        }
      } catch (error) {
        console.error("상세 정보 조회 실패:", error);
      }
    };

    fetchDetailData();
  }, [workId]); // workId가 변경될 때마다 실행

  // WebSocket 연결 (앱 시작 시 한 번만)
  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";
    if (readyState !== 1) {
      // 1 = OPEN
      connect(WS_URL);
    }
    return () => {
      // cleanup 시 연결 유지 (다른 페이지에서도 사용 가능)
    };
  }, [connect, readyState]);

  // 크롤링 작업 구독 (workId가 있고 연결되었을 때)
  useEffect(() => {
    if (!workId || readyState !== 1) return; // readyState 1 = OPEN

    console.log(`크롤링 작업 ${workId} 구독 시작`);

    const subscription = subscribeCrawling(workId, (data) => {
      //
      console.log("수신된 메시지:", data);

      // 메시지 타입에 따라 처리
      switch (data.type) {
        case "PROGRESS":
          // 진행률 업데이트
          if (data.totalCount !== undefined) {
            setTotalCount(data.totalCount);
          }
          if (data.estimatedTime) {
            setEstimatedTime(data.estimatedTime);
          }
          break;

        case "COLLECTION":
          // 수집 데이터 업데이트
          if (data.row) {
            // 단일 row 추가
            setCollectionRows((prev) => [...prev, data.row]);
          } else if (data.rows) {
            // 여러 rows 교체
            setCollectionRows(data.rows);
          }

          // 동적 컬럼 생성
          if (
            collectionColumns.length === 0 &&
            (data.row || (data.rows && data.rows.length > 0))
          ) {
            // 크롤링 막 시작하여 컬럼 정보 없고 + 데이터가 있으면, 그 때 컬럼 생성"
            const sampleRow = data.row || data.rows[0];
            const keys = Object.keys(sampleRow).filter(
              (k) => k !== "id" && k !== "progressNo"
            );

            const dynamicColumns: GridColDef[] = [
              {
                field: "progressNo",
                headerName: "진행번호",
                flex: 1,
                headerAlign: "center",
                align: "center",
              },
              ...keys.map((key) => ({
                field: key,
                headerName: key,
                flex: key === "context" ? 4 : 1,
                headerAlign: "center" as const,
                align: (key === "context" ? "left" : "center") as
                  | "left"
                  | "center",
              })),
            ];
            setCollectionColumns(dynamicColumns);
          }
          break;

        case "FAILURE":
          // 실패 목록 업데이트
          if (data.failure) {
            // 단일 failure 추가
            setFailureRows((prev) => [...prev, data.failure]);
          } else if (data.rows) {
            // 여러 failures 교체
            setFailureRows(data.rows);
          }
          break;

        case "COMPLETE":
          // 크롤링 완료
          console.log("크롤링 완료!");
          break;

        default:
          console.warn("알 수 없는 메시지 타입:", data.type);
      }
    });

    // cleanup: 컴포넌트 언마운트 또는 workId 변경 시 구독 해제
    return () => {
      if (subscription) {
        subscription.unsubscribe();
        console.log(`크롤링 작업 ${workId} 구독 해제`);
      }
    };
  }, [workId, readyState, subscribeCrawling]);

  // ========== 9. JSX 반환 ==========
  return (
    <Box sx={{ height: "97%", display: "flex", flexDirection: "column" }}>
      {/* BreadCrumbs */}
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
                columns={detailSettingColumns}
                rows={detailSettingRows}
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
                columns={failureColumns}
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
