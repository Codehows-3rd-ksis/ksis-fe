import { type GridColDef } from "@mui/x-data-grid";
import CustomIconButton from "../../component/CustomIconButton";
import dayjs from "dayjs";

export interface UserTableRows {
  userId: number; // UserTable Id
  id?: number;
  index?: number;
  username?: string; // 사용자 ID (=login ID)
  password?: string; // 비밀번호
  name?: string; // 이름
  dept?: string; // 부서
  ranks?: string; // 직위
  loginAt?: string; // 접속일
  state?: string; // 승인상태
  role?: string; // 권한
}

// 외부에서 받을 핸들러들을 타입으로 정의
export interface UserTableColumnHandlers {
  handleEditOpen: (row: UserTableRows) => void;
  handleEditAccountOpen: (row: UserTableRows) => void;
  handleDeleteOpen: (row: UserTableRows) => void;
  handleShowLogOpen: (row: UserTableRows) => void;
}

// 핸들러를 주입받아 columns를 반환하는 함수
export const getColumns = ({
  handleEditOpen,
  handleEditAccountOpen,
  handleDeleteOpen,
  handleShowLogOpen,
}: UserTableColumnHandlers): GridColDef[] => [
  {
    field: "index",
    headerName: "번호",
    width: 70,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "username",
    headerName: "ID",
    flex: 1.5,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "name",
    headerName: "이름",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "dept",
    headerName: "부서",
    flex: 1.5,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "ranks",
    headerName: "직위",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "state",
    headerName: "상태",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "loginAt",
    headerName: "최근접속일",
    width: 150,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (!params.value) return ""; // 값 없으면 빈 문자열
      return dayjs(params.value).format("YY.MM.DD HH:mm");
    },
  },
  {
    field: "editInfo",
    headerName: "정보수정",
    width: 100,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => (
      <CustomIconButton
        icon="edit"
        onClick={() => handleEditOpen(params.row)}
      />
    ),
  },
  {
    field: "editAccount",
    headerName: "계정수정",
    width: 100,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => (
      <CustomIconButton
        icon="account"
        onClick={() => handleEditAccountOpen(params.row)}
      />
    ),
  },
  {
    field: "del",
    headerName: "삭제",
    width: 70,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => (
      <CustomIconButton
        icon="delete"
        onClick={() => handleDeleteOpen(params.row)}
      />
    ),
  },
  {
    field: "log",
    headerName: "이력조회",
    width: 100,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => (
      <CustomIconButton
        icon="log"
        onClick={() => handleShowLogOpen(params.row)}
      />
    ),
  },
];
