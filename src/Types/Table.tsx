import type {
  GridColDef,
  GridRowsProp,
  GridRowId,
  GridRowParams,
} from "@mui/x-data-grid";

export interface CommonTableProps {
  columns: GridColDef[]; // 컬럼 정의 타입
  rows: GridRowsProp; // 행 데이터 타입
  selectedRows?: { id: GridRowId }[]; // 선택된 행 상태를 상위에서 받음

  height?: number | string; // 선택적 높이
  width?: number | string;
  check?: boolean;
  hideFooter?: boolean;
  disableHover?: boolean; // hover 효과 비활성화
  // 행 클릭 시 자동완성 지원 (params.row 등)
  onRowClick?: (params: GridRowParams) => void;

  // 선택 변경 시 선택된 id 배열 전달
  onRowSelectionChange?: (ids: GridRowId[]) => void;

  // 서버 페이지네이션용
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface ScrollTableProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  selectedRows?: { id: GridRowId }[];
  height?: number | string;
  maxHeight?: number | string;
  width?: number | string;
  check?: boolean;
  onRowClick?: (params: GridRowParams) => void;
  onRowSelectionChange?: (ids: GridRowId[]) => void;
  // 무한 스크롤용 콜백
  onLoadMore?: () => void;
}

export interface test {
  a: string;
}
