import { type GridColDef } from "@mui/x-data-grid";
import CustomIconButton from "../../component/CustomIconButton";
import type { WeekOfMonth } from "../../utils/cronUtils";

export interface SchedulerTableRows {
  id: number; // DataGrid row 식별용 (필수)
  scheduleId: number; // 실제 DB ID
  settingName: string; // "데이터 수집명"
  startAt: string; // "수집시간"
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
    field: "period",
    headerName: "기간",
    flex: 1.5,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "cycle",
    headerName: "주기",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "startAt",
    headerName: "수집시간",
    flex: 1.5,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "settingName",
    headerName: "데이터 수집명",
    flex: 2,
    headerAlign: "center",
    align: "left",
  },
  {
    field: "edit",
    headerName: "수정",
    flex: 0.5,
    headerAlign: "center",
    align: "center",
    sortable: false,
    renderCell: (params) => (
      <CustomIconButton icon="edit" onClick={() => handleEditOpen(params.row)} />
    ),
  },
  {
    field: "delete",
    headerName: "삭제",
    flex: 0.5,
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
