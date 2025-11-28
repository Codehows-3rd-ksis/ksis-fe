import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import CommonTable from "../../component/CommonTable";
import {
  getColumns,
  type StatusTableRows,
} from "../../Types/TableHeaders/StatusHeader";
import Alert from "../../component/Alert";
import { getStatusList, stopCrawl } from "./Api";

function Status() {
  // ========== 1. 라우터 훅 ==========
  const navigate = useNavigate();

  // ========== 2. State 선언 (데이터) ==========
  const [baseRows, setBaseRows] = useState<StatusTableRows[]>([]);

  // ========== 3. State 선언 (UI 상태) ==========
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StatusTableRows | null>(null);

  // ========== 4. API 함수 ==========
  const handleStopCrawl = async (row: StatusTableRows) => {
    try {
      await stopCrawl(row.workId);
      console.log("수집 중지 성공:", row.settingName);
      // 목록 새로고침
      fetchStatusList();
    } catch (error) {
      console.error("수집 중지 요청 중 오류:", error);
    }
  };

  const fetchStatusList = async () => {
    try {
      const data = await getStatusList();
      setBaseRows(data);
    } catch (error) {
      console.error("수집 현황 목록 조회 실패:", error);
    }
  };

  // ========== 5. 이벤트 핸들러 ==========
  const handleDetailOpen = (row: StatusTableRows) => {
    navigate(`/status/detail/${row.workId}`);
  };

  const handleStopClick = (row: StatusTableRows) => {
    setSelectedRow(row);
    setAlertOpen(true);
  };

  const handleConfirm = async () => {
    setAlertOpen(false);
    if (selectedRow) {
      await handleStopCrawl(selectedRow);
    }
  };

  const handleCancel = () => {
    setAlertOpen(false);
    setSelectedRow(null);
  };

  // ========== 6. 파생 데이터 ==========
  const columns = getColumns({ handleDetailOpen, handleStopClick });

  // ========== 7. useEffect ==========
  useEffect(() => {
    fetchStatusList();
  }, []);

  // ========== 8. JSX ==========
  return (
    <Box sx={{ height: "97%", display: "flex", flexDirection: "column" }}>
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: 20,
        }}
      >
        데이터 수집 현황
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
            <Box sx={{ padding: 2, marginTop: "auto", marginBottom: "auto" }}>
              <CommonTable columns={columns} rows={baseRows} />
            </Box>
          </Box>
        </Paper>
      </Box>

      <Alert
        open={alertOpen}
        type="question"
        text={`"${selectedRow?.settingName}"의 수집을 중지하시겠습니까?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
}

export default Status;
