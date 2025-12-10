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
import {
  getDetailSettingColumns,
  getFailureColumns,
  getCollectionColumns,
} from "../../Types/TableHeaders/HistoryHeader";
import CustomButton from "../../component/CustomButton";
import Alert from "../../component/Alert";
import {
  getHistoryDetail,
  recollectItem,
  recollectWork,
} from "../../API/05_HistoryApi";

export default function HistoryDetail() {
  // 1. 라우터 훅
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 2. State 선언 (데이터) -서버/API에서 받아오는 실제 데이터
  const [detailData, setDetailData] = useState<StatusTableRows | null>(null); // 기본 정보
  const [failureRows, setFailureRows] = useState<
    Array<{ id: number; itemId: string; progressNo: string; url: string }>
  >([]); // 실패 목록

  const [collectionRows, setCollectionRows] = useState<
    Array<{ id: number; progressNo: string; [key: string]: any }>
  >([]); // 수집 데이터

  // 전체 개수 state (또는 API에서 받아오기)
  const [totalCount, setTotalCount] = useState(10); //전체 개수

  // 3. State 선언 (UI 상태) - 화면 동작을 제어하는 상태 (모달 열림, 선택된 항목 등)
  const [alertOpen, setAlertOpen] = useState(false); // Alert 열림 여부
  const [alertType, setAlertType] = useState<"single" | "batch">("single"); // 'single' or 'batch'
  const [selectedRecollect, setSelectedRecollect] = useState<{
    itemId: string;
    progressNo: string;
    url: string;
  } | null>(null); // 선택된 row

  // 4. 파생 데이터 (useMemo) - 기존 state를 가공/변환한 데이터(의존성 변경 시에만 재계산)
  // 실패한 진행번호 Set 생성
  const failureProgressNos = useMemo(
    () => new Set(failureRows.map((row) => row.progressNo)),
    [failureRows]
  );

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

  // 컬럼 정의
  const detailSettingColumns = useMemo(() => getDetailSettingColumns(), []);
  const collectionColumns = useMemo(() => getCollectionColumns(), []);

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

  // 이벤트 핸들러 먼저 정의 (failureColumns에서 사용)
  const handleRecollectClick = (
    itemId: string,
    progressNo: string,
    url: string
  ) => {
    setSelectedRecollect({ itemId, progressNo, url });
    setAlertType("single");
    setAlertOpen(true);
  };

  // 수집실패 테이블 컬럼
  const failureColumns = useMemo(
    () => getFailureColumns({ handleRecollectClick }),
    []
  );

  // 5. 계산된 값 (단순 변수)
  // 수집 실패 개수
  const failureCount = failureRows.length; // 1 // 단순 길이
  // 수집 데이터 개수
  const collectionCount = collectionRows.length; // 5

  // 6. API 함수
  // API 호출 함수 -   서버와 통신하는 비동기 함수
  const fetchHistoryDetail = async (workId: string) => {
    try {
      const data = await getHistoryDetail(workId);

      // 기본 정보 설정
      setDetailData(data.detailData);

      // 수집 실패 데이터 설정
      if (data.failures) {
        // itemId 존재 여부 확인
        const hasItemId = data.failures.every((item: any) => item.itemId);
        if (!hasItemId) {
          console.warn(
            "⚠️ 실패 목록에 itemId가 없는 항목이 있습니다:",
            data.failures
          );
        }
        setFailureRows(data.failures);
      }

      // 수집 데이터 설정
      if (data.collections) {
        setCollectionRows(data.collections);
      }

      // 전체 개수 설정
      if (data.totalCount !== undefined) {
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error("이력 상세 조회 오류:", error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  // 재수집 버튼 클릭 핸들러
  const handleRecollect = async (itemId: string) => {
    try {
      await recollectItem(itemId);
      console.log("재수집 요청 성공:", itemId);
      // 성공 메시지 표시 (옵션)
      // alert('재수집 요청이 완료되었습니다.')
    } catch (error) {
      console.error("재수집 요청 중 오류:", error);
      // alert('재수집 요청 중 오류가 발생했습니다.')
    }
  };

  //일괄재수집 버튼 클릭 핸들러
  const handleBatchRecollect = async () => {
    try {
      if (!workId) {
        console.error("workId가 없습니다.");
        return;
      }

      await recollectWork(workId);
      console.log("일괄 재수집 요청 성공");
      // 성공 메시지 표시 (옵션)
      // alert('재수집 요청이 완료되었습니다.')
    } catch (error) {
      console.error("일괄 재수집 요청 중 오류:", error);
      // alert('재수집 요청 중 오류가 발생했습니다.')
    }
  };

  // 7. 이벤트 핸들러

  const handleBack = () => {
    navigate("/history");
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
      await handleRecollect(selectedRecollect.itemId);
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
    } else if (workId) {
      // state가 없으면 workId로 데이터를 가져옴 (API 호출 등)
      // API 호출로 데이터 가져오기
      fetchHistoryDetail(workId);
      console.log("Fetching data for workId:", workId);
    }
  }, [workId, location.state]);

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
