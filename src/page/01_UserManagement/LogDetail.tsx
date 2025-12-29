import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useLocation,
  useParams,
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import CommonTable from "../../component/CommonTable";
import CustomButton from "../../component/CustomButton";
import Alert from "../../component/Alert";
import {
  getHistoryDetail,
  recollectItem,
  recollectWork,
} from "../../API/05_HistoryApi";
import { parseResultValue } from "../../utils/resultValueParser";

// 새로운 Header 파일 import
import {
  DETAIL_SETTING_COLUMNS,
  getFailureColumns,
  createHistoryColumnsFromParsedRow,
} from "../../Types/TableHeaders/HistoryDetailHeader";

// API로부터 받는 수집 데이터 행의 타입을 정의
interface ApiCollectionRow {
  id: number;
  itemId: number;
  seq: number;
  state: "SUCCESS" | "FAILED";
  resultValue: string; // 파싱 전의 원본 JSON 문자열
}

export default function LogDetail() {
  const { userId } = useParams();
  const { state } = useLocation();
  const username = state?.username;
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();

  // --- 상태 변수 ---
  const [detailData, setDetailData] = useState<any | null>(null);
  const [failureRows, setFailureRows] = useState<any[]>([]);
  const [collectionRows, setCollectionRows] = useState<any[]>([]);
  const [collectionColumns, setCollectionColumns] = useState<GridColDef[]>([]);

  // 재수집 관련 상태
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<"single" | "batch">("single");
  const [selectedRecollect, setSelectedRecollect] = useState<{
    itemId: string;
    seq: string;
  } | null>(null);

  // 계산된 값: 백엔드에서 받은 detailData를 신뢰의 원천으로 사용
  const totalCount = detailData?.totalCount ?? 0;
  const failCount = detailData?.failCount ?? 0;
  const collectCount = detailData?.collectCount ?? 0;

  // --- 재수집 관련 핸들러 ---
  const handleRecollectClick = useCallback(
    (itemId: string, seq: string) => {
      setSelectedRecollect({ itemId, seq });
      setAlertType("single");
      setAlertOpen(true);
    },
    []
  );

  const handleBatchRecollectClick = () => {
    setAlertType("batch");
    setAlertOpen(true);
  };

  const handleConfirm = async () => {
    setAlertOpen(false);
    if (alertType === "single" && selectedRecollect) {
      await recollectItem(selectedRecollect.itemId);
    } else if (alertType === "batch" && workId) {
      await recollectWork(workId);
    }
    setSelectedRecollect(null);
  };

  const handleCancel = () => {
    setAlertOpen(false);
    setSelectedRecollect(null);
  };

  // --- 컬럼 정의 (useMemo로 getFailureColumns 호출) ---
  const failureColumns = useMemo(
    () => getFailureColumns({ handleRecollectClick }),
    [handleRecollectClick]
  );

  // --- 데이터 로딩 로직 ---
  useEffect(() => {
    const fetchHistoryDetail = async () => {
      if (!workId) {
        return;
      }
      try {
        const data = await getHistoryDetail(workId);

        setDetailData({
          ...data.basicInfo,
          id: data.basicInfo.workId,
          totalCount: data.progress.totalCount,
          failCount: data.progress.failCount,
          collectCount: data.progress.collectCount,
        });
        setFailureRows(
          data.failureList.map((row: any) => ({
            id: row.id || row.itemId,
            ...row,
          }))
        );

        if (data.collectionData && data.collectionData.rows.length > 0) {
          const parsedRows = data.collectionData.rows.map(
            (row: ApiCollectionRow) => {
              const rowId = row.id || row.itemId;
              const additionalData =
                row.state === "SUCCESS"
                  ? parseResultValue(row.resultValue)
                  : {};
              return {
                id: rowId,
                itemId: rowId,
                seq: row.seq,
                state: row.state,
                ...additionalData,
              };
            }
          );
          setCollectionRows(parsedRows);

          const firstSuccessRow = parsedRows.find(
            (row: ApiCollectionRow) => row.state === "SUCCESS"
          );
          if (firstSuccessRow) {
            setCollectionColumns(
              createHistoryColumnsFromParsedRow(firstSuccessRow)
            );
          } else if (parsedRows.length > 0) {
            setCollectionColumns(
              createHistoryColumnsFromParsedRow(parsedRows[0])
            );
          }
        } else {
          setCollectionRows([]);
          setCollectionColumns([]);
        }
      } catch (error) {
        console.error("이력 상세 조회 오류:", error);
      }
    };

    if (workId) {
      fetchHistoryDetail();
    }
  }, [workId]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        color: "black",
      }}
    >
      {/* BreadCrumbs */}
      <Box sx={{ paddingLeft: 2, marginTop: 1 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/user"
            underline="hover"
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            유저관리
          </Link>
          <Link
            component={RouterLink}
            to={`/user/${userId}/history`}
            underline="hover"
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: 16 }}
            state={{ username }}
          >
            {username} 이력
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            상세 조회
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
        데이터 수집이력 상세 조회
      </Typography>
      <Box
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          color: "black",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          gap: 4,
        }}
      >
        {/* Work */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            기본 정보
          </Typography>
          <CommonTable
            columns={DETAIL_SETTING_COLUMNS}
            rows={detailData ? [detailData] : []}
            pageSize={1}
            hideFooter={true}
          />
        </Box>

        {/* 실패 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                수집 실패
              </Typography>
              <Typography>
                {failCount}/{totalCount}
              </Typography>
            </Box>
            <CustomButton
              text="일괄재수집"
              width="100px"
              onClick={handleBatchRecollectClick}
              radius={2}
              disabled={failCount === 0}
              border="1px solid #CDBAA6"
            />
          </Box>
          <CommonTable
            columns={failureColumns}
            rows={failureRows}
            pageSize={3}
          />
        </Box>
        {/* 수집데이터 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {/* Text */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              수집 데이터
            </Typography>
            <Typography>
              {collectCount}/{totalCount}
            </Typography>
          </Box>
          {/* Table */}
          <CommonTable
            columns={collectionColumns}
            rows={collectionRows}
            pageSize={5}
            // height="370px"
          />
        </Box>
        {/* 닫기버튼 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <CustomButton 
            text="이전"
            backgroundColor="#fff"
            border="1px solid #CDBAA6"
            onClick={()=>
              navigate(`/user/${userId}/history`, {
                state: { username: username },
              })
            }
            radius={2}
            width="80px"
            hoverStyle={{
              backgroundColor: '#F0F0F0',
              border: "1px solid #CDBAA6"
            }}
          />
        </Box>
      </Box>

      <Alert
        open={alertOpen}
        type="question"
        text={
          alertType === "single"
            ? `${selectedRecollect?.seq}번 항목을 재수집하시겠습니까?`
            : "모든 실패 항목을 재수집하시겠습니까?"
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
}
