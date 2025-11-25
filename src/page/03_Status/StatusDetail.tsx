import { useEffect, useState, useMemo } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  Link as RouterLink,
} from "react-router-dom";
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

import { getStatusDetail, createStatusWebSocket } from "./Api";

function StatusDetail() {
  // ========== 1. 라우터 훅 ==========
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ========== 2. State 선언 (데이터) ==========
  const [detailData, setDetailData] = useState<StatusTableRows | null>(null);
  const [failureRows, setFailureRows] = useState<
    Array<{ id: number; progressNo: string; url: string }>
  >([]);
  const [collectionRows, setCollectionRows] = useState<
    Array<{ id: number; progressNo: string; [key: string]: any }>
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");

  // const [failureRows, setFailureRows] = useState<
  //   Array<{ id: number; progressNo: string; url: string }>
  // >([{ id: 1, progressNo: "4", url: "https://example.com/failed-page" }]);

  // const [collectionRows, setCollectionRows] = useState<
  //   Array<{ id: number; progressNo: string; [key: string]: any }>
  // >([
  //   {
  //     id: 1,
  //     progressNo: "1",
  //     title: "2025년 4분기",
  //     writer: "항만물류정책과",
  //     date: "2025-11-24 14:00",
  //     context: "올해 국토부의",
  //   },
  //   {
  //     id: 2,
  //     progressNo: "2",
  //     title: "2025년 대한민국",
  //     writer: "전략산업과",
  //     date: "2025-11-11 13:00",
  //     context: "창원특례시는 12일",
  //   },
  //   {
  //     id: 3,
  //     progressNo: "3",
  //     title: "2025년 4분기",
  //     writer: "농업정책과",
  //     date: "2025-11-10 11:30",
  //     context: "창원특례시는 2020년",
  //   },
  //   {
  //     id: 4,
  //     progressNo: "4",
  //     title: "창원특례시",
  //     writer: "투자유치단",
  //     date: "2025-11-09 12:00",
  //     context: "이번 행사는 해외 인사",
  //   },
  //   {
  //     id: 5,
  //     progressNo: "5",
  //     title: "경상남도",
  //     writer: "전략산업과",
  //     date: "2025-11-23 09:10",
  //     context: "경상남도는 2024년",
  //   },
  // ]);

  // const [collectionColumns, setCollectionColumns] = useState<GridColDef[]>([
  //   {
  //     field: "progressNo",
  //     headerName: "진행번호",
  //     flex: 1,
  //     headerAlign: "center",
  //     align: "center",
  //   },
  //   {
  //     field: "title",
  //     headerName: "제목",
  //     flex: 1,
  //     headerAlign: "center",
  //     align: "center",
  //   },
  //   {
  //     field: "writer",
  //     headerName: "작성자",
  //     flex: 1,
  //     headerAlign: "center",
  //     align: "center",
  //   },
  //   {
  //     field: "date",
  //     headerName: "작성일",
  //     flex: 1,
  //     headerAlign: "center",
  //     align: "center",
  //   },
  //   {
  //     field: "context",
  //     headerName: "본문",
  //     flex: 4,
  //     headerAlign: "center",
  //     align: "left",
  //   },
  // ]);

  // const [totalCount, setTotalCount] = useState(10);
  // const [estimatedTime, setEstimatedTime] = useState("2025-11-13 16:00:00");

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

  // collectionRows에 isFailure 플래그만 추가
  // const collectionRowsWithFailure = useMemo(() =>
  //   collectionRows.map(row => ({
  //     ...row, //기존 row의 모든 필드 복사
  //     isFailure: failureProgressNos.has(row.progressNo) //해당 progressNo가 실패 Set에 있으면 true
  //   })),
  //   [collectionRows, failureProgressNos]
  // )

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
      if (!id) return; // id가 없으면 실행 안 함

      try {
        const data = await getStatusDetail(Number(id)); // API 호출 // 받아온 데이터로 각 state 업데이트
        setDetailData(data.basicInfo); // 기본 정보
        setFailureRows(data.failureList); // 실패 목록
        setCollectionRows(data.collectionData.rows); // 수집 데이터
        setTotalCount(data.progress.totalCount); // 전체 개수
        setEstimatedTime(data.progress.estimatedTime); // 예상 시간

        // 동적 컬럼 생성 (수집 데이터 컬럼이 동적으로 변할 수 있음)
        if (data.collectionData.columns.length > 0) {
          const dynamicColumns = data.collectionData.columns.map((col) => ({
            field: col.field,
            headerName: col.headerName,
            flex: col.field === "context" ? 4 : 1,
            headerAlign: "center" as const,
            align:
              col.field === "context" ? ("left" as const) : ("center" as const),
          }));
          setCollectionColumns(dynamicColumns);
        }
      } catch (error) {
        console.error("상세 정보 조회 실패:", error);
      }
    };

    fetchDetailData();
  }, [id]); // id가 변경될 때마다 실행

  // useEffect(() => {
  //   if (location.state && location.state.rowData) {
  //     setDetailData(location.state.rowData);
  //   } else if (id) {
  //     // TODO: API 호출로 데이터 가져오기
  //     console.log("Fetching data for id:", id);
  //   }
  // }, [id, location.state]);

  // WebSocket 연결 및 실시간 데이터 수신
  useEffect(() => {
    if (!id) return; // id가 없으면 실행 안 함

    const ws = createStatusWebSocket(Number(id), {
      onMessage: (data) => {
        // 메시지 타입에 따라 다른 처리
        if (data.type === "failure") {
          // 실패 목록 실시간 업데이트
          setFailureRows(data.rows || []);
        } else if (data.type === "collection") {
          // 수집 데이터 실시간 업데이트
          setCollectionRows(data.rows || []);

          // 새로운 컬럼이 추가될 수 있으므로  동적 생성
          if (data.rows && data.rows.length > 0) {
            const keys = Object.keys(data.rows[0]).filter(
              (k) => k !== "id" && k !== "progressNo"
            );
            const dynamicColumns = [
              {
                field: "progressNo",
                headerName: "진행번호",
                flex: 1,
                headerAlign: "center" as const,
                align: "center" as const,
              },
              ...keys.map((key) => ({
                field: key,
                headerName: key,
                flex: key === "context" ? 4 : 1,
                headerAlign: "center" as const,
                align:
                  key === "context" ? ("left" as const) : ("center" as const),
              })),
            ];
            setCollectionColumns(dynamicColumns);
          }
        } else if (data.type === "progress") {
          // 진행률 정보 실시간 업데이트
          setTotalCount(data.totalCount || 0);
          setEstimatedTime(data.estimatedTime || "");
        }
      },
      onError: (error) => {
        console.error("WebSocket 오류:", error);
      },
      onClose: () => {
        console.log("WebSocket 연결 종료");
      },
    });

    // cleanup: 컴포넌트 언마운트 시 WebSocket 연결 종료
    return () => {
      ws.close();
    };
  }, [id]); // id가 변경될 때마다 재연결

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
