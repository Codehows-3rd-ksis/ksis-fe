//StatusHeader = "컬럼 정의서"
//각 컬럼의 제목 + 모든 행의 표시 방식을 함께 정의
import { type GridColDef } from "@mui/x-data-grid";
import CustomIconButton from "../../component/CustomIconButton";
import { Box, LinearProgress } from "@mui/material";
export interface StatusTableRows {
  // 기본 정보
  id: number;
  workId: number;
  settingId?: number;
  settingName?: string;
  type?: string;
  userId?: string;

  // 스케줄링 설정 (고정값)
  startDate?: string; // 스케줄 시작 날짜
  endDate?: string; // 스케줄 종료 날짜
  period?: string; // startDate ~ endDate
  cycle?: string; // 수집 주기

  // 실행 정보 (실시간)
  startAt?: string; // 크롤링 시작 시각
  endAt?: string; // 크롤링 완료 시각
  state?: string; // 진행 상태
  progress?: string; // 진행도
}

export interface StatusTableColumnHandlers {
  handleStopClick: (row: StatusTableRows) => void;
  handleDetailOpen: (row: StatusTableRows) => void;
}

export const getColumns = ({
  handleStopClick,
  handleDetailOpen,
}: StatusTableColumnHandlers): GridColDef[] => [
  {
    field: "settingName",
    headerName: "데이터수집명",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => (
      <span
        style={{
          cursor: "pointer",
          color: "#1976d2",
          textDecoration: "underline",
        }}
        onClick={() => handleDetailOpen(params.row)}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "startAt",
    headerName: "수집시작",
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
    valueGetter: (value, row) => {
      console.log('value', value)
      return `${row.startDate || ""} ~ ${row.endDate || ""}`
    },
    renderCell: (params) => {
      const startDate = params.row.startDate || "";
      const endDate = params.row.endDate || "";
      return startDate && endDate
        ? `${startDate} ~ ${endDate}`
        : startDate || endDate || "-";
    },
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
  {
    field: "progress",
    headerName: "진행도",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      let progressValue: number;
      let progressLabel: string;

      if (typeof params.value === 'number') {
        progressValue = params.value;
        if (progressValue === 100) {
          progressLabel = "완료";
        } else {
          progressLabel = `${Math.floor(progressValue)}%`;
        }
      } else if (typeof params.value === 'string') {
        progressLabel = params.value;
        progressValue = parseFloat(params.value.replace(/[^0-9.]/g, "")) || 0;
      } else {
        progressValue = 0;
        progressLabel = "-";
      }

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <span>{progressLabel}</span>
          <Box
            sx={{
              display: "inline-flex",
              height: "6px",
              paddingRight: "21.186px",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: "100px",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                background: "var(--Fills-Primary, rgba(120, 120, 120, 0.20))",
              }}
            />
          </Box>
          <CustomIconButton
            icon="stop"
            onClick={() => handleStopClick(params.row)}
          />
        </Box>
      );
    },
  },
];
