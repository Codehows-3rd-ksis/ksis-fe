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
  IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { type GridColDef } from "@mui/x-data-grid";
import CommonTable from "../../component/CommonTable";
import { type StatusTableRows } from "../../Types/TableHeaders/StatusHeader";
import CustomButton from "../../component/CustomButton";
import Alert from "../../component/Alert";

export default function HistoryDetail() {
  // 1. 라우터 훅
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 2. State 선언 (데이터) -서버/API에서 받아오는 실제 데이터
  const [detailData, setDetailData] = useState<StatusTableRows | null>(null); // 기본 정보
  const [failureRows, setFailureRows] = useState<
    Array<{ id: number; progressNo: string; url: string }>
  >([{ id: 1, progressNo: "4", url: "https://example.com/failed-page" }]); // 실패 목록

  const [collectionRows, setCollectionRows] = useState<
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
  ]); // 수집 데이터

  const [collectionColumns /*setCollectionColumns*/] = useState<GridColDef[]>([
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

  // 전체 개수 state (또는 API에서 받아오기)
  const [totalCount, setTotalCount] = useState(10); //전체 개수

  // 3. State 선언 (UI 상태) - 화면 동작을 제어하는 상태 (모달 열림, 선택된 항목 등)
  const [alertOpen, setAlertOpen] = useState(false); // Alert 열림 여부
  const [alertType, setAlertType] = useState<"single" | "batch">("single"); // 'single' or 'batch'
  const [selectedRecollect, setSelectedRecollect] = useState<{
    progressNo: string;
    url: string;
  } | null>(null); // 선택된 row

  // 4. 파생 데이터 (useMemo) - 기존 state를 가공/변환한 데이터(의존성 변경 시에만 재계산)
  // 실패한 진행번호 Set 생성
  const failureProgressNos = useMemo(
    () => new Set(failureRows.map((row) => row.progressNo)),
    [failureRows]
  ); // failureRows가 바뀔 때만 다시 계산

  // - 빈 값으로 설정: 실패 = 데이터 없음을 명확히 표현
  // - 값 유지: 부분 수집된 데이터가 있을 수 있는 경우
  // 일반적으로는 실패 시 빈 값이 자연스럽지만, 실제 백엔드에서 데이터를 받을 때는 서버가 보내주는 대로 표시

  // collectionRows에 isFailure 플래그만 추가
  // const collectionRowsWithFailure = useMemo(() =>
  //   collectionRows.map(row => ({
  //     ...row, //기존 row의 모든 필드 복사
  //     isFailure: failureProgressNos.has(row.progressNo) //해당 progressNo가 실패 Set에 있으면 true
  //   })),
  //   [collectionRows, failureProgressNos]
  // )

  //실패한 row의 데이터 비우기
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

  // 수집실패 테이블 컬럼 (고정)
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
        flex: 6,
        headerAlign: "center",
        align: "left",
      },
      {
        field: "recollect",
        headerName: "재수집",
        flex: 1,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <IconButton
            color="primary"
            size="small"
            onClick={() =>
              handleRecollectClick(params.row.progressNo, params.row.url)
            }
            title="재수집"
          >
            <RefreshIcon />
          </IconButton>
        ),
      },
    ],
    []
  );

  // 5. 계산된 값 (단순 변수)
  // 수집 실패 개수
  const failureCount = failureRows.length; // 1 // 단순 길이
  // 수집 데이터 개수
  const collectionCount = collectionRows.length; // 5

  // 6. API 함수
  // API 호출 함수 -   서버와 통신하는 비동기 함수
  const fetchHistoryDetail = async (historyId: string) => {
    try {
      // TODO: 실제 API 엔드포인트로 변경
      const response = await fetch(`/api/history/${historyId}`);

      if (!response.ok) {
        throw new Error("데이터 조회 실패");
      }

      const data = await response.json();

      // 기본 정보 설정
      setDetailData(data.detailData);

      // 수집 실패 데이터 설정
      setFailureRows(data.failures);

      // 수집 데이터 설정
      setCollectionRows(data.collections);

      // 컬럼 설정 (동적 컬럼인 경우)
      // setCollectionColumns(data.columns)

      // 전체 개수 설정
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("이력 상세 조회 오류:", error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  // 재수집 버튼 클릭 핸들러
  const handleRecollect = async (progressNo: string, url: string) => {
    try {
      // TODO: API 엔드포인트 URL을 실제 백엔드 주소로 변경
      const response = await fetch("/api/recollect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settingId: id,
          progressNo,
          url,
        }),
      });

      if (response.ok) {
        console.log("재수집 요청 성공:", progressNo);
        // 성공 메시지 표시 (옵션)
        // alert('재수집 요청이 완료되었습니다.')
      } else {
        console.error("재수집 요청 실패");
        // 에러 메시지 표시 (옵션)
        // alert('재수집 요청에 실패했습니다.')
      }
    } catch (error) {
      console.error("재수집 요청 중 오류:", error);
      // alert('재수집 요청 중 오류가 발생했습니다.')
    }
  };

  //일괄재수집 버튼 클릭 핸들러
  const handleBatchRecollect = async () => {
    try {
      // TODO: API 엔드포인트 URL을 실제 백엔드 주소로 변경
      const response = await fetch("/api/recollect/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settingId: id,
          items: failureRows.map((row) => ({
            progressNo: row.progressNo,
            url: row.url,
          })),
        }),
      });

      if (response.ok) {
        console.log("일괄 재수집 요청 성공");
        // 성공 메시지 표시 (옵션)
        // alert('재수집 요청이 완료되었습니다.')
      } else {
        console.error("일괄 재수집 요청 실패");
        // 에러 메시지 표시 (옵션)
        // alert('재수집 요청에 실패했습니다.')
      }
    } catch (error) {
      console.error("일괄 재수집 요청 중 오류:", error);
      // alert('재수집 요청 중 오류가 발생했습니다.')
    }
  };

  // 7. 이벤트 핸들러

  const handleBack = () => {
    navigate("/history");
  };

  //개별 재수집버튼 클릭
  const handleRecollectClick = (progressNo: string, url: string) => {
    setSelectedRecollect({ progressNo, url }); //클릭한 row 정보 저장
    setAlertType("single"); //타입 'single' 설정
    setAlertOpen(true); //Alert열기
  };

  //일괄 재수집버튼 클릭
  const handleBatchRecollectClick = () => {
    setAlertType("batch");
    setAlertOpen(true);
  };

  //확인버튼 클릭
  const handleConfirm = async () => {
    setAlertOpen(false); //Alert닫기

    if (alertType === "single" && selectedRecollect) {
      //개별 재수집 : 저장된 row 1개만 전송
      await handleRecollect(
        selectedRecollect.progressNo,
        selectedRecollect.url
      );
    } else if (alertType == "batch") {
      //일괄재수집 : failureRows 전체 전송
      await handleBatchRecollect();
    }
  };

  //취소버튼 클릭
  const handleCancel = () => {
    setAlertOpen(false);
    setSelectedRecollect(null);
  };

  // 8. useEffect (부수 효과)
  useEffect(() => {
    // location.state로 전달된 데이터가 있으면 사용
    if (location.state && location.state.rowData) {
      setDetailData(location.state.rowData);
    } else if (id) {
      // state가 없으면 id로 데이터를 가져옴 (API 호출 등)
      // API 호출로 데이터 가져오기
      fetchHistoryDetail(id);
      console.log("Fetching data for id:", id);
    }
  }, [id, location.state]);

  // 9. JSX 반환
  return (
    <Box sx={{ height: "97%", display: "flex", flexDirection: "column" }}>
      {/* BreadCrumbs */}
      <Box sx={{ paddingLeft: 2, marginTop: 1 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/history"
            underline="hover"
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            데이터 수집 이력
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            상세조회
          </Typography>
        </Breadcrumbs>
      </Box>
      {/* <Typography sx={{ fontSize: 60, fontWeight: 'bold', color: 'black', paddingLeft: 2, marginTop: 5 }}> */}
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: 5,
        }}
      >
        데이터 수집이력 상세 조회
      </Typography>
      <Box
        sx={{ padding: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        {" "}
        {/*최상위 Box의 남은 공간을 모두 차지하게 */}
        <Paper
          elevation={3}
          sx={{ padding: 4, flex: 1, display: "flex", flexDirection: "column" }}
        >
          {/*Paper가 감싸는 Box의 높이를 꽉 채우게 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            {" "}
            {/*Paper 내부 콘텐츠가 Paper의 전체 높이를 사용하게 */}
            {/* <Box sx={{ padding: 2 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}> */}
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
            {/* 추가 정보 섹션 (필요시 확장) */}
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
                <CustomButton
                  text="일괄재수집"
                  width="100px"
                  onClick={handleBatchRecollectClick}
                  radius={2}
                />
              </Box>
              <CommonTable
                columns={failureColumns}
                rows={failureRows}
                pageSize={5}
                // hideFooter={false}
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
              </Box>
              <CommonTable
                columns={collectionColumns}
                rows={collectionRowsWithFailure}
                pageSize={5}
                //hideFooter={false}
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
      />
    </Box>
  );
}
