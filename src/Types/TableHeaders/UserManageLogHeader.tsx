import { type GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs'

export interface UserLogTableRows {
    workId: number,
    index?: number,
    settingId?: number,
    settingName?: string,
    userId?: number,
    loginId?: string,
    type?: string,
    state?: string,
    startAt: string,
    endAt?: string,
}

// 핸들러를 주입받아 columns를 반환하는 함수
export const getColumns = (): GridColDef[] => [
  { field: 'index',   headerName: '번호',       flex: 0.5,  headerAlign: 'center',  align: 'center' },
  { field: 'settingName', headerName: '데이터 수집명',     flex: 1.5,    headerAlign: 'center',  align: 'center' },
  { field: 'state',    headerName: '진행상태',       flex: 1,    headerAlign: 'center',  align: 'center' },
  { field: 'startAt',    headerName: '수집시작',       flex: 1,  headerAlign: 'center',  align: 'center',
    renderCell: (params) => {
      if (!params.value) return ''; // 값 없으면 빈 문자열
      return dayjs(params.value).format('YY-MM-DD HH:mm');           
    }
  },
  { field: 'endAt',    headerName: '수집완료',       flex: 1,    headerAlign: 'center',  align: 'center',
    renderCell: (params) => {
      if (!params.value) return ''; // 값 없으면 빈 문자열
      return dayjs(params.value).format('YY-MM-DD HH:mm');           
    }
  },
  { field: 'type',   headerName: '수집타입',       flex: 1,    headerAlign: 'center',  align: 'center' },
];