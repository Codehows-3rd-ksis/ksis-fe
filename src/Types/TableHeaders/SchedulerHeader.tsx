import { type GridColDef } from "@mui/x-data-grid";
import CustomIconButton from "../../component/CustomIconButton";

export interface SchedulerTableRows {
  id: number;
  settingName: string; // "데이터 수집명"
  startAt: string; // "수집시간"
  period: string; // "기간"
  cycle: string; // "주기"
  // 수정 페이지에서 필요한 원본 데이터
  settingId: number;
  startDate: string;
  endDate: string;
  cronExpression: string;
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
