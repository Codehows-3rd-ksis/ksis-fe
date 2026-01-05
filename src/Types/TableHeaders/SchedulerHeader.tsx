import { type GridColDef } from "@mui/x-data-grid";
import CustomIconButton from "../../component/CustomIconButton";
import type { WeekOfMonth } from "../../utils/cronUtils";
import { Box } from "@mui/material";

export interface SchedulerTableRows {
  id: number; // DataGrid row 식별용 (필수)
  scheduleId: number; // 실제 DB ID
  settingName: string; // "데이터 수집명"
  collectAt: string; // "수집시간"
  period: string; // "기간"
  cycle: string; // "주기"
  // 수정 페이지에서 필요한 원본 데이터
  settingId: number;
  userId: number;
  startDate: string;
  endDate: string;
  cronExpression: string; // 시간 정보만
  daysOfWeek: string; // "MON,WED,FRI" (문자열)
  weekOfMonth: WeekOfMonth; // "0": 매주 | "1"~"4": n번째 주 | "L": 마지막 주
  createAt: string;
  updateAt: string;
}

export interface SchedulerTableColumnHandlers {
  handleEditOpen: (row: SchedulerTableRows) => void;
  handleDeleteOpen: (row: SchedulerTableRows) => void;
}

export const getColumns = ({
  handleEditOpen,
  handleDeleteOpen,
}: SchedulerTableColumnHandlers): GridColDef[] => [
  {
    field: "settingName",
    headerName: "데이터 수집명",
    flex: 1.5,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "period",
    headerName: "기간",
    flex: 1.5,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "cycle",
    headerName: "주기",
    flex: 1.5,
    headerAlign: "center",
    renderCell: (params) => {
      const text = params.value || "";
      const parts = text
        .split(/(일요일|월요일|화요일|수요일|목요일|금요일|토요일)/)
        .filter((part: string) => part.trim()); // 빈 문자열과 공백 제거

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            fontSize: "0.875rem",
          }}
        >
          {parts.map((part: string, index: number) => {
            // 요일이면 첫 글자만 동그라미 배지로 렌더링
            if (part.endsWith("요일")) {
              return (
                <Box
                  key={index}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 600, // 글자를 두껍게 하여 가독성 확보
                    bgcolor: "#FFF7ED",
                    color: "#c27413ff",
                    border: "1px solid #FFEDD5", // 미세한 테두리로 형태감 부여
                    mr: 0.5,
                  }}
                >
                  {part[0]}
                </Box>
              );
            }
            // '매주', '첫번째 주' 등 일반 텍스트는 간격 추가
            return (
              <span key={index} style={{ marginRight: "0.5rem" }}>
                {part}
              </span>
            );
          })}
        </Box>
      );
    },
  },
  {
    field: "collectAt",
    headerName: "시간",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },

  {
    field: "edit",
    headerName: "수정",
    width: 120,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => (
      <CustomIconButton
        icon="edit"
        onClick={() => handleEditOpen(params.row)}
      />
    ),
  },
  {
    field: "delete",
    headerName: "삭제",
    width: 120,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => (
      <CustomIconButton
        icon="delete"
        onClick={() => handleDeleteOpen(params.row)}
      />
    ),
  },
];
