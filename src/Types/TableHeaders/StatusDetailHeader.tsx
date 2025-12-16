/**
 * @file StatusDetailHeader.tsx
 * @description StatusDetail 페이지 전용 타입 및 컬럼 정의
 */

import { type GridColDef } from "@mui/x-data-grid";
import { parseResultValue } from "../../utils/resultValueParser";
import dayjs from "dayjs";
import { Box, LinearProgress } from "@mui/material";

//** 데이터 **/
// 크롤링 결과 항목 (백엔드 CrawlResultItem 엔티티)
export interface CrawlResultItem {
  id: number;
  itemId: number;
  seq: number;
  resultValue: any;
  state: "SUCCESS" | "FAILURE";
  url?: string;
  [key: string]: any;
}

// 수집 실패 행 타입 (failureRows state용)
export interface FailureRow {
  id: number;
  itemId: number;
  seq: number;
  state: "FAILURE";
  url: string;
}

//** 컬럼정의 **/
// 기본 정보 테이블 컬럼
export const DETAIL_SETTING_COLUMNS: GridColDef[] = [
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
  },
  {
    field: "startAt",
    headerName: "수집시작",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: (params) => {
      if (!params.value) return ""; // 값 없으면 빈 문자열
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
      if (!params.value) return ""; // 값 없으면 빈 문자열
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
    field: "progress",
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
        if (progressValue === 100) {
          progressLabel = "완료";
        } else {
          progressLabel = `${Math.floor(progressValue)}%`;
        }
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
            width: "100%",
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
                background: "var(--Fills-Primary, rgba(120, 120, 120, 0.20))",
              }}
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
    flex: 1,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "url",
    headerName: "URL",
    flex: 7,
    headerAlign: "center",
    align: "left",
  },
  // {
  //   field: "recollect",
  //   headerName: "재수집",
  //   flex: 1,
  //   headerAlign: "center",
  //   align: "center",
  //   renderCell: (params) => (
  //     <CustomIconButton
  //       icon="refresh"
  //       onClick={() => params.row.onRecollect?.(params.row.itemId)}
  //     />
  //   ),
  // },
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
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    ...dynamicFields.map(
      ({ field, headerName }): GridColDef => ({
        field,
        headerName,
        flex: field === "context" ? 4 : 1,
        headerAlign: "center",
        align: field === "context" ? "left" : "center",
      })
    ),
  ];
};
