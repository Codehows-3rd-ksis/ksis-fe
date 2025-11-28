import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import CommonTable from "../../component/CommonTable";
import {
  getColumns,
  type StatusTableRows,
} from "../../Types/TableHeaders/StatusHeader";
import Alert from "../../component/Alert";

function Status() {
  // ========== 1. 라우터 훅 ==========
  const navigate = useNavigate();

  // ========== 2. State 선언 (데이터) ==========
  const [baseRows, setBaseRows] = useState<StatusTableRows[]>([]);
  const [filteredRows, setFilteredRows] = useState<StatusTableRows[]>([]);

  // ========== 3. State 선언 (UI 상태) ==========
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StatusTableRows | null>(null);

  // ========== 4. API 함수 ==========
  const handleStopCrawl = async (row: StatusTableRows) => {
    try {
      const response = await fetch(`/api/crawl/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settingId: row.id,
        }),
      });

      if (response.ok) {
        console.log("수집 중지 성공:", row.settingName);
        // TODO: 성공 후 상태 업데이트 또는 목록 새로고침
      } else {
        console.error("수집 중지 실패");
      }
    } catch (error) {
      console.error("수집 중지 요청 중 오류:", error);
    }
  };

  // ========== 5. 이벤트 핸들러 ==========
  const handleDetailOpen = (row: StatusTableRows) => {
    navigate(`/status/detail/${row.id}`, { state: { rowData: row } });
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
    const data = [
      {
        id: 1,
        settingName: "창원시청 공지사항 수집",
        startAt: "2025-10-24 09:00",
        type: "스케줄링",
        startDate: "2025.10.24",
        endDate: "2025.11.23",
        period: "2025.10.24 ~ 2025.11.23",
        cycle: "매주 월요일",
        state: "진행중",
        userId: "",
        progress: "50%",
      },
      {
        id: 2,
        settingName: "경상남도 보도자료 수집",
        startAt: "2025-10-04 09:00",
        type: "스케줄링",
        startDate: "2025.10.24",
        endDate: "2025.11.23",
        period: "2025.10.24 ~ 2025.11.23",
        cycle: "매주 월요일",
        state: "진행중",
        userId: "",
        progress: "70%",
      },
      {
        id: 3,
        settingName: "창원관광",
        startAt: "2025-11-24 09:00",
        type: "수동실행",
        startDate: "",
        endDate: "",
        period: "",
        cycle: "",
        state: "진행중",
        userId: "ksis1",
        progress: "10%",
      },
    ];

    setBaseRows(data);
    console.log('baseRows',baseRows)
    setFilteredRows(data);
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
              <CommonTable columns={columns} rows={filteredRows} />
            </Box>
          </Box>
        </Paper>
      </Box>

      <Alert
        open={alertOpen}
        type="question"
        text={`${selectedRow?.settingName} 수집을 중지하시겠습니까?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
}

export default Status;
