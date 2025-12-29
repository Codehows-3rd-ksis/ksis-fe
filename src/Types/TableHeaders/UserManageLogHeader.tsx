import { type GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs'
import { Box, Typography } from '@mui/material'
import { PlayCircleOutline, HighlightOff, ErrorOutline, CheckCircleOutline  } from "@mui/icons-material";

export interface UserLogTableRows {
    workId: number,
    id?: number,
    index?: number,
    settingId?: number,
    settingName?: string,
    userId?: number,
    type?: string,
    state?: string,
    startAt: string,
    endAt?: string,
}

// 외부에서 받을 핸들러들을 타입으로 정의
export interface UserLogColumnHandlers {
  handleDetailView: (row: UserLogTableRows) => void;
}

// 핸들러를 주입받아 columns를 반환하는 함수
export const getColumns = ({
  handleDetailView,
}: UserLogColumnHandlers): GridColDef[] => [
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
    )
  },
  {
    field: "state",
    headerName: "진행상태",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (params.value === "SUCCESS") {
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <Typography sx={{ 
                color: 'black',
                borderRadius: 2,
                bgcolor: 'rgba(46,125,50,0.15)',
                pl: 1,
                pr: 2,
                pt: 0.5,
                pb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}> 
                <CheckCircleOutline sx={{fontSize:15}}/>
                수집완료
              </Typography>
            </Box>
          )
      }
      else if (params.value === "FAILED") {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <Typography sx={{ 
              color: 'black',
              borderRadius: 3,
              bgcolor: 'rgba(211,47,47,0.15)',
              pl: 1,
              pr: 2,
              pt: 0.5,
              pb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}> 
            <HighlightOff sx={{fontSize:15}}/>
             수집실패
            </Typography>
          </Box>
        )
      }
      else if (params.value === "PARTIAL") {
        const failCount = params.row.failCount || 0;
        return (
          <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
          >
              <Typography sx={{ 
                color: 'black',
                borderRadius: 3,
                bgcolor: 'rgba(237,108,2,0.3)',
                pl: 1,
                pr: 2,
                pt: 0.5,
                pb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}> 
              <ErrorOutline sx={{fontSize:15}}/>
               {'부분완료 (실패:'}
               <Typography sx={{color: 'red'}}>{failCount}</Typography>
               {'건)'}
              </Typography>
          </Box>
        );
      }
      else return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography sx={{ 
              color: 'black',
              borderRadius: 3,
              bgcolor: 'rgba(247,148,29,0.15)',
              pl: 1,
              pr: 2,
              pt: 0.5,
              pb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1
          }}> 
            <PlayCircleOutline sx={{fontSize:15}}/>
             진행중
            </Typography>
        </Box>
      )
    },
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
];