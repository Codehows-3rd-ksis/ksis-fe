import { type GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Link, Typography, Box } from "@mui/material";
import { PlayCircleOutline, HighlightOff, ErrorOutline, CheckCircleOutline  } from "@mui/icons-material";

// --- 기본 정보 컬럼 ---
export const DETAIL_SETTING_COLUMNS: GridColDef[] = [
  {
    field: "settingName",
    headerName: "데이터수집명",
    flex: 1.5,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "state",
    headerName: "진행상태",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (params.value === "RUNNING") {
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
                bgcolor: '#90CAF9',
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
      }
      else if (params.value === "SUCCESS") {
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
              bgcolor: '#A5D6A7',
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
              bgcolor: '#EF9A9A',
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
      else if (params.value === "STOPPED") {
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
              bgcolor: '#E0E0E0',
              pl: 1,
              pr: 2,
              pt: 0.5,
              pb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}> 
            <HighlightOff sx={{fontSize:15}}/>
             수집중지
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
                bgcolor: '#FFCC80',
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
               <Typography component="span" sx={{color: 'red'}}>{failCount}</Typography>
               {'건)'}
              </Typography>
          </Box>
        );
      }
      else return params.value; // 알 수 없는 값은 그대로 표시
    },
  },
  {
    field: "startAt",
    headerName: "수집시작",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (!params.value) return "-"; // 값 없으면 빈 문자열
      return dayjs(params.value).format("YY-MM-DD HH:mm");
    },
  },
  {
    field: "endAt",
    headerName: "수집완료",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (!params.value) return "-"; // 값 없으면 빈 문자열
      return dayjs(params.value).format("YY-MM-DD HH:mm");
    },
  },
  {
    field: "type",
    headerName: "실행타입",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "userId",
    headerName: "유저ID",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
];

// --- 수집 데이터 컬럼 생성을 위한 팩토리 함수 ---
export const createHistoryColumnsFromParsedRow = (
  row: Record<string, any>
): GridColDef[] => {
  const baseColumns: GridColDef[] = [
    {
      field: "seq",
      headerName: "진행번호",
      width: 120,
      headerAlign: "center",
      align: "center",
    },
  ];

  // 불필요한 키를 필터링하고 동적 컬럼 생성
  const dynamicColumns: GridColDef[] = Object.keys(row)
    .filter((key) => !["id", "itemId", "seq", "state"].includes(key)) // 필터링 조건 수정
    .map((key) => ({
      field: key,
      headerName: key,
      flex: 1,
      headerAlign: "center",
      align: key === "context" ? "left" : "center",
      minWidth: 150, // 최소 너비 설정
    }));

  return [...baseColumns, ...dynamicColumns];
};

// --- 수집 실패 테이블 컬럼 ---
export const FAILURE_COLUMNS: GridColDef[] = [
  {
    field: "seq",
    headerName: "진행번호",
    width: 120,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "url",
    headerName: "URL",
    flex: 4,
    headerAlign: "center",
    align: "left",
    renderCell: (params) => {
      if (!params.value) return "";
      return (
        <Link
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {params.value}
        </Link>
      );
    },
  },
];
