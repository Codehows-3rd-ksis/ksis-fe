import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
// Mui
import { Box, Typography } from '@mui/material'
// Table
import CommonTable from "../../component/CommonTable"
import { getColumns, type SettingTableRows } from '../../Types/TableHeaders/SettingHeader'
// Search
import SearchHeader from "../../component/SearchHeader"
import { getSettingSearchCategory } from "../../Types/Search"
// Comp
import Alert from "../../component/Alert"

function Setting() {
  const navigate = useNavigate();
  // Table
  const [baseRows, setBaseRows] = useState<SettingTableRows[]>([])
  const [filteredRows, setFilteredRows] = useState<SettingTableRows[]>([]);
  const [selectedRow, setSelectedRow] = useState<SettingTableRows | null>(null)
  
  // Alert
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [openDelDoneAlert, setOpenDelDoneAlert] = useState(false)
  const [openRunAlert, setOpenRunAlert] = useState(false)
  const [openRunDoneAlert, setOpenRunDoneAlert] = useState(false)

  useEffect(()=> {
    const data = [
      { id: 1, settingName: '창원시청 공지사항 수집', url: 'https://...', userAgent: 'Windows / Edge', rate: 10  },
      { id: 2, settingName: '경상남도 보도자료 수집', url: 'https://...', userAgent: 'Windows / Chrome', rate: 10 },
      { id: 3, settingName: '창원관광 관광지자료 수집', url: 'https://...', userAgent: 'Windows / Chrome', rate: 10 },
    ];

    setBaseRows(data)
    setFilteredRows(data)
  }, [])

  /**  Table  =========================================== */
  /**  등록 페이지  =========================================== */
  const handleOpenReg = () => {
      navigate('/setting/reg')
  }
  /**  수정 페이지  =========================================== */
  const handleEditOpen = (row: SettingTableRows) => {
    navigate('/setting/edit', {state: {row} })
  }
  /**  삭제 팝업  =========================================== */
  const handleDeleteOpen = (row: SettingTableRows) => {
    setSelectedRow(row)
    setOpenDeleteAlert(true)
  }
  const handleDelete = () => {
    console.log('Row', selectedRow)
    // delete api 연결

    // 삭제완료 팝업
    setOpenDelDoneAlert(true);
  }
  /**  수동실행  =========================================== */
  const handleRunCrawl = (row: SettingTableRows) => { // 수동실행 버튼 클릭시 팝업
    setSelectedRow(row)
    setOpenRunAlert(true)
  }
  const handleCrawl = () => {
    console.log('Row', selectedRow)
    // 수동실행 크롤링 API 호출

    // 실행완료 팝업
    setOpenRunDoneAlert(true);
    
  }
  const columns = getColumns({ handleEditOpen, handleDeleteOpen, handleRunCrawl });

  return (
    <Box sx={{ height: '97%'}}>
        <Typography sx={{fontSize: 60, fontWeight: 'bold', color: 'black', paddingLeft: 2, marginTop: 5}}>
          데이터 수집 설정
        </Typography>
        <SearchHeader
          baseRows={baseRows}                 // 전체 데이터 원본
          setFilteredRows={setFilteredRows}   // 필터링된 데이터 상태 setter
          getSearchCategory={getSettingSearchCategory} // 검색 카테고리 목록
          onClick={handleOpenReg}             // 등록 버튼 클릭 시 실행할 함수
          btnName="설정 등록"
        />

        {/* 테이블 영역 */}
        <Box sx={{padding: 2}}>
            <CommonTable columns={columns} rows={filteredRows} /> {/* ✅ 변경 */}
        </Box>

        {/* 삭제 팝업 */}
        <Alert
            open={openDeleteAlert}
            text="정말로 삭제하시겠습니까?"
            type='delete'
            onConfirm={() => {
              setOpenDeleteAlert(false);
              handleDelete()
            }}
            onCancel={() => {
              setOpenDeleteAlert(false);
            }}
        />
        <Alert
            open={openDelDoneAlert}
            text="삭제 완료되었습니다."
            type='success'
            onConfirm={() => {
              setOpenDelDoneAlert(false);
              // 테이블 Refresh 함수 추가해야함
            }}
        />
        {/* 수동 실행 */}
        <Alert
            open={openRunAlert}
            text="선택하신 설정을 수동실행 하시겠습니까?"
            type='question'
            onConfirm={() => {
              setOpenRunAlert(false);
              handleCrawl()
            }}
            onCancel={() => {
              setOpenRunAlert(false);
            }}
        />
        <Alert
            open={openRunDoneAlert}
            text="선택하신 설정으로 수동실행 되었습니다."
            type='success'
            onConfirm={() => {
              setOpenRunDoneAlert(false);
            }}
        />
    </Box>
  )
}

export default Setting
