import { type GridColDef } from '@mui/x-data-grid';

export interface RobotsTableRows {
    id: number,
    userAgent: string,
    disallow: string[],
    allow: string[]
}

// 핸들러를 주입받아 columns를 반환하는 함수
export const getColumns = (): GridColDef[] => [
  { field: 'userAgent', headerName: 'USER_AGENT', flex: 0.5, headerAlign: 'center', align: 'center' },
  { field: 'disallow', headerName: 'Disallow', flex: 1, headerAlign: 'center', align: 'left',
    renderCell: (params) => (params.value ?? []).join(', '),
   },
  { field: 'allow', headerName: 'Allow', flex: 1, headerAlign: 'center', align: 'left',
    renderCell: (params) => (params.value ?? []).join(', '),
   },
];