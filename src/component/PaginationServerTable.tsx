import { Paper } from "@mui/material";
import {
  DataGrid,
  type GridRowId,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { type CommonTableProps } from "../Types/Table";

export default function PaginationServerTable(props: CommonTableProps) {
  const {
    columns,
    rows,
    selectedRows,
    page = 0,
    pageSize = 5,
    totalCount = 0,
    height,
    width,
    check,
    hideFooter,
    onRowClick,
    onRowSelectionChange,
    onPageChange,
    onPageSizeChange,
  } = props;

  //  v8 기준: rowSelectionModel은 객체 구조 ({ type, ids })
  const rowSelectionModel: GridRowSelectionModel = {
    type: "include",
    ids: new Set(selectedRows?.map((r) => r.id) ?? []),
  };
  return (
    <Paper sx={{ height: height, width: width || "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        {...(!height && { autoHeight: true })} //height 지정 없으면 autoHeight
        hideFooter={hideFooter}
        onRowClick={onRowClick}
        /*  서버 페이지네이션 */
        pagination
        paginationMode="server"
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(model) => {
          onPageChange?.(model.page);

          if (model.pageSize !== pageSize) {
            onPageSizeChange?.(model.pageSize);
          }
        }}
        rowCount={totalCount}
        pageSizeOptions={[pageSize]}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(model: GridRowSelectionModel) => {
          // ✅ model.ids는 Set<GridRowId> 형태
          const selectedIds = Array.from(model.ids) as GridRowId[];
          onRowSelectionChange?.(selectedIds);
        }}
        checkboxSelection={check || false}
        disableColumnMenu
        disableColumnSorting
        getRowClassName={(params) => {
          const classes = [];

          // 1) 짝수 행 스타일 적용 (checkbox 없어도 동작)
          if (params.indexRelativeToCurrentPage % 2 === 0) {
            classes.push("evem-row");
          }
          // 2) 비활성화 row
          if (params.row.state === "승인대기") {
            classes.push("row-inactive");
          }
          // 3) 실패 row
          if (params.row.isFailure) {
            classes.push("row-failure");
          }

          return classes.join(" ");
        }}
        sx={{
          border: "1px solid #CDBAA6",
          // 헤더 배경색
          "&": {
            // '--DataGrid-t-header-background-base': '#FCF7F2 !important'
          },
          // 헤더 스타일
          "& .MuiDataGrid-columnHeaders": {
            color: "white",
            fontSize: 16,
            fontWeight: "bold",
            background: "linear-gradient(90deg, #2a2c32ff 0%, #4F5054 100%)",
          },
          "& .MuiDataGrid-columnHeader": {
            background: "transparent",
          },
          // 셀 폰트
          "& .MuiDataGrid-cell": {
            fontSize: 16,
            fontWeight: "Normal",
          },
          // 비활성화 row
          "& .row-inactive": {
            backgroundColor: "#f5f5f5 !important",
            color: "#999",
            fontStyle: "italic",
          },
          // 실패 row
          "& .row-failure": {
            backgroundColor: "#F1F3F3 !important",
          },
          // 짝수행 색변경
          "& .even-row": {
            backgroundColor: "#FCF7F2",
          },
          // 마우스오버 색변경
          "& .MuiDataGrid-row:hover": {
            // backgroundColor: '#FFEFD6 !important',
            background: "linear-gradient(90deg, #FFEFD6 0%, #FFFFFF 100%)",
            borderLeft: "3px solid #F29A15",
          },
          // 포커스 제거
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none !important",
          },
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
            {
              outline: "none !important",
            },
          // 선택된 행 색 변경
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#FFD699 !important",
            borderLeft: "4px solid #F5A623",
            "&:hover": {
              backgroundColor: "#FFC266 !important",
            },
          },
        }}
      />
    </Paper>
  );
}
