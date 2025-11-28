import { type GridColDef } from '@mui/x-data-grid';
import CustomIconButton from '../../component/CustomIconButton'

export interface SettingTableRows {
    id: number,
    settingId?: number,
    userId?: string,
    // index?: number,
    settingName?: string,
    url?: string,
    type?: string,
    userAgent?: string,
    rate?: number,
    // state?: string,
    listArea?: string,
    pagingArea?: string,
    maxPage?: number,
    linkArea?: string,
    // condition?: JSON,
}

// 외부에서 받을 핸들러들을 타입으로 정의
export interface SettingTableColumnHandlers {
  handleEditOpen: (row: SettingTableRows) => void;
  handleDeleteOpen: (row: SettingTableRows) => void;
  handleRunCrawl: (row: SettingTableRows) => void;
}

// 핸들러를 주입받아 columns를 반환하는 함수
export const getColumns = ({
  handleEditOpen,
  handleDeleteOpen,
  handleRunCrawl,
}: SettingTableColumnHandlers): GridColDef[] => [
  { field: 'settingName',   headerName: '데이터수집명',       flex: 1,    headerAlign: 'center',  align: 'center' },
  { field: 'url',           headerName: 'URL',              flex: 1,    headerAlign: 'center',  align: 'center' },
  { field: 'userAgent',     headerName: 'USER_AGENT',       flex: 1,    headerAlign: 'center',  align: 'center' },
  { field: 'rate',          headerName: '수집간격(s)',       flex: 1,    headerAlign: 'center',  align: 'center' },
  {
    field: 'edit', headerName: '수정', width: 70, headerAlign: 'center', align: 'center',
    renderCell: (params) => ( <CustomIconButton icon="edit" onClick={() => handleEditOpen(params.row)} /> ),
  },
  {
    field: 'del', headerName: '삭제', width: 70, headerAlign: 'center', align: 'center',
    renderCell: (params) => ( <CustomIconButton icon="delete" onClick={() => handleDeleteOpen(params.row)} /> ),
  },
  {
    field: 'run', headerName: '수동실행', width: 100, headerAlign: 'center', align: 'center',
    renderCell: (params) => ( <CustomIconButton icon="run" onClick={() => handleRunCrawl(params.row)} /> ),
  },
];