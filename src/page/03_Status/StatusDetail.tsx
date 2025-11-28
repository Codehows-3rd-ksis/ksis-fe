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
  // IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";
// import RefreshIcon from "@mui/icons-material/Refresh";
import { type GridColDef } from "@mui/x-data-grid";
import CommonTable from "../../component/CommonTable";
import { type StatusTableRows } from "../../Types/TableHeaders/StatusHeader";
// import CustomButton from "../../component/CustomButton";
// import Alert from "../../component/Alert";

function StatusDetail() {
  // ========== 1. 라우터 훅 ==========
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ========== 2. State 선언 (데이터) ==========
  const [detailData, setDetailData] = useState<StatusTableRows | null>(null);

  const [failureRows, /*setFailureRows*/] = useState<
    Array<{ id: number; progressNo: string; url: string }>
  >([{ id: 1, progressNo: "4", url: "https://example.com/failed-page" }]);

  const [collectionRows, /*setCollectionRows*/] = useState<
    Array<{ id: number; progressNo: string; [key: string]: any }>
  >([
    {
      id: 1,
      progressNo: "1",
      title: "2025년 4분기",
      writer: "항만물류정책과",
      date: "2025-11-24 14:00",
      context: "올해 국토부의",
    },
    {
      id: 2,
      progressNo: "2",
      title: "2025년 대한민국",
      writer: "전략산업과",
      date: "2025-11-11 13:00",
      context: "창원특례시는 12일",
    },
    {
      id: 3,
      progressNo: "3",
      title: "2025년 4분기",
      writer: "농업정책과",
      date: "2025-11-10 11:30",
      context: "창원특례시는 2020년",
    },
    {
      id: 4,
      progressNo: "4",
      title: "창원특례시",
      writer: "투자유치단",
      date: "2025-11-09 12:00",
      context: "이번 행사는 해외 인사",
    },
    {
      id: 5,
      progressNo: "5",
      title: "경상남도",
      writer: "전략산업과",
      date: "2025-11-23 09:10",
      context: "경상남도는 2024년",
    },
  ]);

  const [collectionColumns, /*setCollectionColumns*/] = useState<GridColDef[]>([
    {
      field: "progressNo",
      headerName: "진행번호",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "title",
      headerName: "제목",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "writer",
      headerName: "작성자",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "date",
      headerName: "작성일",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "context",
      headerName: "본문",
      flex: 4,
      headerAlign: "center",
      align: "left",
    },
  ]);

  const [totalCount, /*setTotalCount*/] = useState(10);
  const [estimatedTime, /*setEstimatedTime*/] = useState("2025-11-13 16:00:00");

  // ========== 3. State 선언 (UI 상태) ==========
  // const [alertOpen, setAlertOpen] = useState(false);
  // const [alertType, setAlertType] = useState<"single" | "batch">("single");
  // const [selectedRecollect, setSelectedRecollect] = useState<{
  //   progressNo: string;
  //   url: string;
  // } | null>(null);

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
      // {
      //   field: "recollect",
      //   headerName: "재수집",
      //   flex: 1,
      //   headerAlign: "center",
      //   align: "center",
      //   renderCell: (params) => (
      //     <IconButton
      //       color="primary"
      //       size="small"
      //       onClick={() =>
      //         handleRecollectClick(params.row.progressNo, params.row.url)
      //       }
      //       title="재수집"
      //     >
      //       <RefreshIcon />
      //     </IconButton>
      //   ),
      // },
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
  // const handleRecollect = async (progressNo: string, url: string) => {
  //   try {
  //     // TODO: API 엔드포인트 URL을 실제 백엔드 주소로 변경
  //     const response = await fetch("/api/recollect", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         settingId: id,
  //         progressNo,
  //         url,
  //       }),
  //     });

  //     if (response.ok) {
  //       console.log("재수집 요청 성공:", progressNo);
  //     } else {
  //       console.error("재수집 요청 실패");
  //     }
  //   } catch (error) {
  //     console.error("재수집 요청 중 오류:", error);
  //   }
  // };

  // const handleBatchRecollect = async () => {
  //   try {
  //     // TODO: API 엔드포인트 URL을 실제 백엔드 주소로 변경
  //     const response = await fetch("/api/recollect/batch", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         settingId: id,
  //         items: failureRows.map((row) => ({
  //           progressNo: row.progressNo,
  //           url: row.url,
  //         })),
  //       }),
  //     });

  //     if (response.ok) {
  //       console.log("일괄 재수집 요청 성공");
  //     } else {
  //       console.error("일괄 재수집 요청 실패");
  //     }
  //   } catch (error) {
  //     console.error("일괄 재수집 요청 중 오류:", error);
  //   }
  // };

  // ========== 7. 이벤트 핸들러 ==========
  const handleBack = () => {
    navigate("/status");
  };

  // const handleRecollectClick = (progressNo: string, url: string) => {
  //   setSelectedRecollect({ progressNo, url });
  //   setAlertType("single");
  //   setAlertOpen(true);
  // };

  // const handleBatchRecollectClick = () => {
  //   setAlertType("batch");
  //   setAlertOpen(true);
  // };

  // const handleConfirm = async () => {
  //   setAlertOpen(false);

  //   if (alertType === "single" && selectedRecollect) {
  //     await handleRecollect(
  //       selectedRecollect.progressNo,
  //       selectedRecollect.url
  //     );
  //   } else if (alertType === "batch") {
  //     await handleBatchRecollect();
  //   }
  // };

  // const handleCancel = () => {
  //   setAlertOpen(false);
  //   setSelectedRecollect(null);
  // };

  // ========== 8. useEffect (부수 효과) ==========
  useEffect(() => {
    if (location.state && location.state.rowData) {
      setDetailData(location.state.rowData);
    } else if (id) {
      // TODO: API 호출로 데이터 가져오기
      console.log("Fetching data for id:", id);
    }
  }, [id, location.state]);

  // WebSocket 연결 및 실시간 데이터 수신
  useEffect(() => {
    // TODO: WebSocket 연결 및 데이터 수신
    // const ws = new WebSocket('ws://...')
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data)
    //   if (data.type === 'failure') {
    //     setFailureRows(data.rows)
    //   } else if (data.type === 'collection') {
    //     setCollectionRows(data.rows)
    //     const keys = Object.keys(data.rows[0] || {}).filter(k => k !== 'id' && k !== 'progressNo')
    //     const dynamicColumns = keys.map(key => ({
    //       field: key,
    //       headerName: key,
    //       flex: 1,
    //       headerAlign: 'center' as const,
    //       align: 'center' as const,
    //     }))
    //     setCollectionColumns([
    //       { field: 'progressNo', headerName: '진행번호', flex: 1, headerAlign: 'center', align: 'center' },
    //       ...dynamicColumns
    //     ])
    //   }
    // }
    // return () => ws.close()
  }, [id]);

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
                {/* <CustomButton
                  text="일괄 재수집"
                  onClick={handleBatchRecollectClick}
                  radius={2}
                /> */}
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
      {/* 
      <Alert
        open={alertOpen}
        type="question"
        text={
          alertType === "single"
            ? `${selectedRecollect?.progressNo}번 항목을 재수집하시겠습니까?`
            : "모든 실패 항목을 재수집하시겠습니까?"
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      /> */}
    </Box>
  );
}

export default StatusDetail;
