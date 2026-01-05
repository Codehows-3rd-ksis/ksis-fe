/**
 * @file StatusDetailHeader.tsx
 * @description StatusDetail 페이지 전용 타입 및 컬럼 정의
 */

import { type GridColDef } from "@mui/x-data-grid";
import { parseResultValue } from "../../utils/resultValueParser";
import dayjs from "dayjs";
import { Box, LinearProgress, Typography } from "@mui/material";
import CustomIconButton from "../../component/CustomIconButton";
import { PlayCircleOutline, HighlightOff, ErrorOutline, CheckCircleOutline  } from "@mui/icons-material";
import { type StatusTableRows } from "../../API/03_StatusApi";

//** 데이터 **/
// 크롤링 결과 항목 (백엔드 CrawlResultItem 엔티티)
export interface CrawlResultItem {
  id: number;
  itemId: number;
  seq: number;
  resultValue: any;
  state: "SUCCESS" | "FAILED";
  url?: string;
  [key: string]: any;
}

// 수집 실패 행 타입 (failureRows state용)
export interface FailureRow {
  id: number; // MUI DataGrid용 고유 ID (백엔드 itemId와 동일)
  seq: number; // 진행번호
  url: string; // 실패한 URL
}

//** 컬럼정의 **/
// 기본 정보 테이블 컬럼

export interface StatusDetailTableColumnHandlers {
  handleStopClick: (row: StatusTableRows) => void;
}
export const DETAIL_SETTING_COLUMNS = ({
  handleStopClick,
}: StatusDetailTableColumnHandlers): GridColDef[] => [
  {
    field: "settingName",
    headerName: "데이터수집명",
    flex: 1,
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
    field: "period",
    headerName: "수집기간",
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "cycle",
    headerName: "수집주기",
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
  {
    field: "progressRate",
    headerName: "진행도",
    flex: 1,
    minWidth: 250,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      let progressValue: number;
      let progressLabel: string;

      if (typeof params.value === "number") {
        progressValue = params.value;
        progressLabel = `${Math.floor(progressValue)}%`;
      } else if (typeof params.value === "string") {
        progressLabel = params.value;
        progressValue = parseFloat(params.value.replace(/[^0-9.]/g, "")) || 0;
      } else {
        progressValue = 0;
        progressLabel = "-";
      }

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            width: "100%", // Box가 셀 너비를 모두 차지하도록 설정
          }}
        >
          <Box sx={{ minWidth: "50px", textAlign: "right" }}>
            <span>{progressLabel}</span>
          </Box>
          <Box
            sx={{
              display: "inline-flex",
              height: "6px",
              paddingRight: "21.186px",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: "100px",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                background: '#E0E0E0', // 트랙 배경을 연한 회색으로 변경
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#F5A623' // 채워진 바의 색상을 팀 색상으로 지정
                }
              }}
            />
          </Box>
          <Box
            sx={{ minWidth: "40px", display: "flex", justifyContent: "center" }}
          >
            <CustomIconButton
              icon="stop"
              onClick={() => handleStopClick(params.row)}
            />
          </Box>
        </Box>
      );
    },
  },
];

// 수집 실패 테이블 컬럼
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
    flex: 9,
    headerAlign: "center",
    align: "left",
    renderCell: (params) => {
      if (!params.value) return "";
      return (
        <a
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#1976d2",
            textDecoration: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          {params.value}
        </a>
      );
    },
  },
];

// 수집 데이터 컬럼 생성 함수 (동적 컬럼)
// rows의 첫 번째 resultValue에서 컬럼을 추출하고 GridColDef 형식으로 변환
export const createCollectionColumns = (
  rows: Array<{ resultValue: string }>
): GridColDef[] => {
  if (rows.length === 0) return [];

  const firstRow = rows[0];
  if (!firstRow.resultValue) return [];

  // 첫 행의 resultValue 파싱하여 필드 추출
  const firstRowData = parseResultValue(firstRow.resultValue);
  const dynamicFields = Object.keys(firstRowData).map((key) => ({
    field: key,
    headerName: key,
  }));

  // GridColDef 형식으로 변환
  return [
    {
      field: "seq",
      headerName: "진행번호",
      width: 120,
      headerAlign: "center",
      align: "center",
    },
    ...dynamicFields.map(
      ({ field, headerName }): GridColDef => ({
        field,
        headerName,
        minWidth: field === "context" ? 300 : 150,
        flex: 1,
        headerAlign: "center",
        align: field === "context" ? "left" : "center",
      })
    ),
  ];
};

// 이미 파싱된 row 객체에서 컬럼 생성 (파싱 재사용, 성능 최적화)
export const createColumnsFromParsedRow = (
  parsedRow: Record<string, any>
): GridColDef[] => {
  if (!parsedRow) return [];

  // id, itemId, seq, state, isFailure 같은 메타 필드 제외하고 동적 필드만 추출
  const dynamicFields = Object.keys(parsedRow).filter(
    (key) => !["id", "itemId", "seq", "state", "isFailure"].includes(key)
  );

  if (dynamicFields.length === 0) return [];

  return [
    {
      field: "seq",
      headerName: "진행번호",
      width: 120,
      headerAlign: "center",
      align: "center",
    },
    ...dynamicFields.map(
      (field): GridColDef => ({
        field,
        headerName: field,
        minWidth: field === "context" ? 300 : 150,
        flex: 1,
        headerAlign: "center",
        align: field === "context" ? "left" : "center",
      })
    ),
  ];
};
