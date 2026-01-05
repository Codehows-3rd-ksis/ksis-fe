import { useEffect, useState } from "react";
import {
  useLocation,
  useParams,
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";
import { Box, Typography, Breadcrumbs, Link, Paper } from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import CommonTable from "../../component/CommonTable";
import CustomButton from "../../component/CustomButton";
import { getHistoryDetail } from "../../API/05_HistoryApi";
import { parseResultValue } from "../../utils/resultValueParser";

// 새로운 Header 파일 import
import {
  DETAIL_SETTING_COLUMNS,
  FAILURE_COLUMNS,
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

  // 계산된 값: 백엔드에서 받은 detailData를 신뢰의 원천으로 사용
  const totalCount = detailData?.totalCount ?? 0;
  const failCount = detailData?.failCount ?? 0;
  const collectCount = detailData?.collectCount ?? 0;

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
          totalCount: data.progressInfo.totalCount,
          failCount: data.progressInfo.failCount,
          collectCount: data.progressInfo.collectCount,
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
            to="/user"
            underline="hover"
            color="inherit"
          >
            유저관리
          </Link>
          <Link
            component={RouterLink}
            to={`/user/${userId}/history`}
            underline="hover"
            color="inherit"
            state={{ username }}
          >
            {username} 이력
          </Link>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            상세 조회
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
          데이터 수집이력 상세 조회
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
              columns={DETAIL_SETTING_COLUMNS}
              rows={detailData ? [detailData] : []}
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
              <Typography
                sx={{ fontSize: 18, fontWeight: 700, color: "#44403c" }}
              >
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
                alignItems: "center",
                gap: 1.5,
                mb: 3,
              }}
            >
              <Typography
                sx={{ fontSize: 18, fontWeight: 700, color: "#44403c" }}
              >
                수집 데이터
              </Typography>
              <Typography sx={{ fontSize: 15, color: "#78716c" }}>
                {collectCount}/{totalCount}
              </Typography>
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
          onClick={() =>
            navigate(`/user/${userId}/history`, {
              state: { username: username },
            })
          }
          radius={2}
          width="100px"
          backgroundColor="#F2F2F2"
          border="1px solid #757575"
          hoverStyle={{
            backgroundColor: "transparent",
            border: "2px solid #373737ff",
          }}
        />
      </Box>
    </Box>
  );
}
