import { type GridColDef } from "@mui/x-data-grid";
import CustomIconButton from "../../component/CustomIconButton";
import { Link, Typography } from "@mui/material";

export interface SettingTableRows {
  id: number;
  settingId?: number;
  userId?: string;
  settingName?: string;
  url?: string;
  type?: string;
  userAgent?: string;
  rate?: number;
  listArea?: string;
  pagingType?: string;
  pagingArea?: string;
  pagingNextbtn?: string;
  maxPage?: number;
  linkArea?: string;
}
const userAgentList = [
  {
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edg/120.0.0.0 Safari/537.36",
    name: "Windows / Edge",
  },
  {
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    name: "Windows / Chrome",
  },
  {
    value:
      "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/117.0",
    name: "Linux / Firefox",
  },
  {
    value:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    name: "Linux / Chrome",
  },
  {
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    name: "Mac / Chrome",
  },
];

// 외부에서 받을 핸들러들을 타입으로 정의
export interface SettingTableColumnHandlers {
  handleDetailOpen: (row: SettingTableRows) => void;
  handleEditOpen: (row: SettingTableRows) => void;
  handleDeleteOpen: (row: SettingTableRows) => void;
  handleRunCrawl: (row: SettingTableRows) => void;
}

// 선택용 컬럼 (스케줄러 등록/수정 페이지에서 사용)
export const getSettingSelectColumns = (
  handleDetailOpen?: (row: SettingTableRows) => void
): GridColDef[] => [
  {
    field: "id",
    headerName: "ID",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "settingName",
    headerName: "데이터수집명",
    flex: 2,
    headerAlign: "center",
    align: "center",
    renderCell: handleDetailOpen
      ? (params) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                cursor: "pointer",
                color: "black",
                textDecoration: "underline",
                fontWeight: "bold",
                fontSize: 16,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDetailOpen(params.row);
              }}
            >
              {params.value}
            </Typography>
          </div>
        )
      : undefined,
  },
  {
    field: "url",
    headerName: "URL",
    flex: 3,
    headerAlign: "center",
    align: "left",
    renderCell: (params) => {
      const url = params.value as string;

      return (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          onClick={(e) => e.stopPropagation()}
        >
          {url}
        </Link>
      );
    },
  },
  {
    field: "userAgent",
    headerName: "USER-AGENT",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (params.value) {
        return (
          userAgentList.find((item) => item.value === params.value)?.name ||
          params.value
        );
      }
    },
  },
];

// 핸들러를 주입받아 columns를 반환하는 함수
export const getColumns = ({
  handleDetailOpen,
  handleEditOpen,
  handleDeleteOpen,
  handleRunCrawl,
}: SettingTableColumnHandlers): GridColDef[] => [
  {
    field: "settingName",
    headerName: "데이터수집명",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => (
      <Typography
        variant="body2"
        sx={{
          cursor: "pointer",
          color: "black",
          textDecoration: "underline",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          fontWeight: "bold",
          fontSize: 16,
        }}
        onClick={() => handleDetailOpen(params.row)}
      >
        {params.value}
      </Typography>
    ),
  },
  {
    field: "url",
    headerName: "URL",
    flex: 2,
    headerAlign: "center",
    align: "left",
    renderCell: (params) => {
      const url = params.value as string;

      return (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          onClick={(e) => e.stopPropagation()}
        >
          {url}
        </Link>
      );
    },
  },
  {
    field: "userAgent",
    headerName: "USER_AGENT",
    flex: 0.7,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (params.value) {
        return (
          userAgentList.find((item) => item.value === params.value)?.name ||
          params.value
        );
      }
    },
  },
  {
    field: "rate",
    headerName: "수집간격(s)",
    width: 120,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      return params.value + " 초";
    },
  },
  {
    field: "edit",
    headerName: "수정",
    width: 70,
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
    field: "run",
    headerName: "수동실행",
    width: 100,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => (
      <CustomIconButton icon="run" onClick={() => handleRunCrawl(params.row)} />
    ),
  },
];
