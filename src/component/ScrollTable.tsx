import { Paper } from '@mui/material'
import { DataGrid, type GridRowId, type GridRowSelectionModel} from '@mui/x-data-grid'
import {type ScrollTableProps } from '../Types/Table'
import { useRef, useEffect } from 'react'


/** 중요! */
// MUI 기본 테이블은 최대 페이지 크기가 100 제한

function ScrollTable(props: ScrollTableProps) {
    const {
      columns, rows, selectedRows, check, 
      height,
      width,
      onRowClick, onRowSelectionChange, onLoadMore,
    } = props

    // DataGrid를 감싸는 div ref
    const dataGridWrapperRef = useRef<HTMLDivElement>(null)

    // rowSelectionModel: v8 기준
    const rowSelectionModel: GridRowSelectionModel = {
      type: 'include',
      ids: new Set(selectedRows?.map((r) => r.id) ?? []),
    }

    useEffect(() => {
      if (!dataGridWrapperRef.current) return

      // 내부 스크롤 컨테이너 div 찾기 (MUI 클래스명 기준)
      const scrollContainer = dataGridWrapperRef.current.querySelector('.MuiDataGrid-virtualScroller')

      if (!scrollContainer) return

      const onScroll = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
          onLoadMore?.()
        }
      }

      scrollContainer.addEventListener('scroll', onScroll)

      return () => {
        scrollContainer.removeEventListener('scroll', onScroll)
      }
    }, [onLoadMore])

    return (
      <Paper  sx={{ height: height, width: width }}>
        <div
          // style={{ height: 630, overflow: 'auto' }}
          style={{ height: height, width: '100%', overflow: 'auto' }}
          ref={dataGridWrapperRef}
        >

          <DataGrid
            rows={rows}
            columns={columns}
            
            hideFooter

            onRowClick={onRowClick}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(model: GridRowSelectionModel) => {
              const selectedIds = Array.from(model.ids) as GridRowId[]
              onRowSelectionChange?.(selectedIds)
            }}

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
              
              return classes.join(" ");
            }}
            sx={{
                // width: '100%',
                // minHeight: height,
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
                    position: 'sticky', // 헤더 고정
                    top: 0,
                    // backgroundColor: '#FCF7F2',
                    zIndex: 1,
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
        </div>
      </Paper>
    );
}

export default ScrollTable;

