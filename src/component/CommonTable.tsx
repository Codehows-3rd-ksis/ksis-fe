import { Paper } from '@mui/material'
import { DataGrid, type GridRowId, type GridRowSelectionModel} from '@mui/x-data-grid'
import {type CommonTableProps } from '../Types/Table'

function CommonTable(props: CommonTableProps) {
    const {columns, rows, selectedRows, pageSize, height, width, check, hideFooter, onRowClick, onRowSelectionChange} = props

    const paginationModel = { page: 0, pageSize: pageSize || 10 };

     // ✅ v8 기준: rowSelectionModel은 객체 구조 ({ type, ids })
    const rowSelectionModel: GridRowSelectionModel = {
      type: 'include',
      ids: new Set(selectedRows?.map((r) => r.id) ?? []),
  }
    return (

      <Paper sx={{ height: height , width: width || '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          {...(!height && { autoHeight: true })} //height 지정 없으면 autoHeight
          hideFooter={hideFooter}
          onRowClick={onRowClick}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(model: GridRowSelectionModel) => {
            // ✅ model.ids는 Set<GridRowId> 형태
            const selectedIds = Array.from(model.ids) as GridRowId[]
            onRowSelectionChange?.(selectedIds)
          }}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection={check || false}
          getRowClassName={(params) => {
            const classes = [];

            // 1) 짝수 행 스타일 적용 (checkbox 없어도 동작)
            if(params.indexRelativeToCurrentPage % 2 === 0) {
              classes.push("evem-row")
            }
            // 2) 비활성화 row
            if(params.row.state === '승인대기') {
              classes.push('row-inactive')
            }
            // 3) 실패 row
            if(params.row.isFailure) {
              classes.push('row-failure')
            }

            return classes.join(" ");
          }}
          sx={{
              border: '1px solid #CDBAA6',
              // 헤더 배경색
              '&': {
                  '--DataGrid-t-header-background-base': '#FCF7F2 !important'
              },
              // 헤더 스타일
              '& .MuiDataGrid-columnHeaders': { 
                  color: 'black', 
                  fontSize: 20, 
                  fontWeight: 'bold', 
              }, 
              // 셀 폰트
              '& .MuiDataGrid-cell': {
                fontSize: 16,
                fontWeight: 'Normal'
              },
              // 비활성화 row
              '& .row-inactive': {
                backgroundColor: '#f5f5f5 !important',  
                color: '#999',               
                fontStyle: 'italic',
              },
              // 실패 row
              '& .row-failure':{
                backgroundColor:'#F1F3F3 !important'
              },
              // 짝수행 색변경
              '& .even-row': { 
                backgroundColor: '#FCF7F2',
              },
              // 마우스오버 색변경
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#FFEFD6 !important',
              },
              // 포커스 제거
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none !important',
              },
              '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none !important',
              },
          }}
        />
      </Paper>
    );
}

export default CommonTable;

