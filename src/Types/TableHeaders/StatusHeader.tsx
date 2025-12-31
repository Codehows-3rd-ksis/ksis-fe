//StatusHeader = "컬럼 정의서"
//각 컬럼의 제목 + 모든 행의 표시 방식을 함께 정의
import { type GridColDef } from "@mui/x-data-grid";
import CustomIconButton from "../../component/CustomIconButton";
import { Box, LinearProgress } from "@mui/material";
import dayjs from "dayjs";

import { type StatusTableRows } from "../../API/03_StatusApi";

export interface StatusTableColumnHandlers {
  handleStopClick: (row: StatusTableRows) => void;
}

export const getColumns = ({
  handleStopClick,
}: StatusTableColumnHandlers): GridColDef[] => [
  {
    field: "settingName",
    headerName: "데이터수집명",
    flex: 2,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "startAt",
    headerName: "수집시작",
    width: 150,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (!params.value) return ""; // 값 없으면 빈 문자열
      return dayjs(params.value).format("YY-MM-DD HH:mm");
    },
  },
  {
    field: "type",
    headerName: "실행타입",
    width: 150,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "period",
    headerName: "수집기간",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (!params.value) return "-";
      else return params.value;
    },
  },
  {
    field: "searchText",
    headerName: "수집주기",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (!params.value) return "-";
      else return params.value;
    },
  },
  {
    field: "userId",
    headerName: "유저ID",
    width: 200,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (!params.value) return "-";
      else return params.value;
    },
  },
  {
    field: "progress",
    headerName: "진행도",
    flex: 1,
    minWidth: 300, // 최소 너비 지정
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      let progressValue: number;
      let progressLabel: string;

      if (typeof params.value === "number") {
        progressValue = params.value;
        progressLabel = `${Math.floor(progressValue)}%`;
      } else if (typeof params.value === "string") {
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
            width: "100%", // Box가 셀 너비를 모두 차지하도록 설정
          }}
        >
          <Box sx={{ minWidth: "50px", textAlign: "right" }}>
            <span>{progressLabel}</span>
          </Box>
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
                background: "#E0E0E0", // 트랙 배경을 연한 회색으로 변경
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#F5A623", // 채워진 바의 색상을 팀 색상으로 지정
                },
              }}
            />
          </Box>
          <Box
            sx={{ minWidth: "40px", display: "flex", justifyContent: "center" }}
          >
            <CustomIconButton
              icon="stop"
              onClick={() => handleStopClick(params.row)}
            />
          </Box>
        </Box>
      );
    },
  },
];
