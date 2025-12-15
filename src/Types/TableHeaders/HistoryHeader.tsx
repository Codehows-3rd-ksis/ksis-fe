import { Box, Typography } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import CustomIconButton from '../../component/CustomIconButton';
import dayjs from 'dayjs'

export interface HistoryTableRows {
    workId: number,
    id?: number,
    index?: number,
    settingId?: number,
    settingName?: string,
    userId?: number,
    username?: string,
    type?: string,
    state?: string,
    startAt: string,
    endAt?: string,
    scheduleId?: number,
    startDate?: string,
    endDate?: string,
    cronExpression?: string,
}

// 외부에서 받을 핸들러들을 타입으로 정의
export interface HistoryTableColumnHandlers {
  handleDetailView: (row: HistoryTableRows) => void;
  handleExport: (row: HistoryTableRows, event: React.MouseEvent<HTMLButtonElement>) => void;
}


// 핸들러를 주입받아 columns를 반환하는 함수
export const getColumns = ({
  handleDetailView,
  handleExport,
}: HistoryTableColumnHandlers): GridColDef[] => [
  { field: 'index',   headerName: '번호',       flex: 0.5,  headerAlign: 'center',  align: 'center' },
  { field: 'settingName', headerName: '데이터 수집명',     flex: 1.5,    headerAlign: 'center',  align: 'center',
    renderCell: (params) => (
                <Typography
                    variant="body2"
                    sx={{ 
                        cursor: 'pointer', color: 'black', textDecoration: 'underline', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: '100%', width: '100%', fontWeight: 'bold', fontSize: 16
                    }}
                    onClick={() => handleDetailView(params.row)}
                >
                  {params.value}
                </Typography>
  )},
  { field: 'state',    headerName: '진행상태',       flex: 1,    headerAlign: 'center',  align: 'center',
    renderCell: (params) => {
      if (params.value === "SUCCESS") {
        if(params.row.failCount === 0) return '수집완료';
        else return (
          <Box sx={{display: 'flex'}}>
            <Typography>수집완료(수집실패:</Typography>
            <Typography sx={{ color: 'red'}}>{params.row.failCount}</Typography>
            <Typography>건)</Typography>
          </Box>
        )
      } 
      else if(params.value === "FAILED") return '수집실패'
      else return '진행중'
    }
  },
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
  { field: 'period',   headerName: '수집기간',       flex: 1,    headerAlign: 'center',  align: 'center',
    renderCell: (params) => {
      if (!params.row.scheduleId) return '-';
      else return params.value
    }
  },
  { field: 'cycle',   headerName: '수집주기',       flex: 1,    headerAlign: 'center',  align: 'center',
    renderCell: (params) => {
      if (!params.row.scheduleId) return '-';
      else return params.value
    }
  },
  { field: 'username',   headerName: '유저ID',       flex: 1,    headerAlign: 'center',  align: 'center',
    renderCell: (params) => {
      if (params.row.scheduleId) return '-';
      else return params.value
    }
  },
  {
    field: 'export', headerName: '내보내기', width: 100, headerAlign: 'center', align: 'center',
    renderCell: (params) => ( <CustomIconButton icon="export" onClick={(e: any) => handleExport(params.row, e)} /> ),
  },
];