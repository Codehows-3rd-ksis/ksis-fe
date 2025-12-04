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
// API
import { getSetting, deleteSetting } from "../../API/02_SettingApi"

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
  const [openErrorAlert, setOpenErrorAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState("")

  useEffect(()=> {
    BoardRefresh();
  }, [])

  /**  Table  =========================================== */
  const getTableDatas = async () => {
    try {
        const data = await getSetting()
        
        const result = data.map((row: SettingTableRows, i: number) => ({
            ...row,
            id: row.settingId,
            index: i+1,
        }))
        setBaseRows(result)
        setFilteredRows(result)
    }
    catch(err) {
        console.error(err)
        setAlertMsg("설정데이터 조회 실패")
        setOpenErrorAlert(true)
    }
  }
  const BoardRefresh = () => {
        getTableDatas();
  }
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
  const handleDelete = async () => {
    try {
      if(selectedRow === null) {
        setAlertMsg('잘못된 접근입니다.')
        setOpenErrorAlert(true)
        return;
      }
      await deleteSetting(Number(selectedRow.settingId))

      setOpenDelDoneAlert(true);
    }
    catch(err) {
      console.error(err)
      setAlertMsg('데이터 삭제 실패.')
      setOpenErrorAlert(true)
    }
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
              BoardRefresh()
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
        {/* 에러 */}
        <Alert
            open={openErrorAlert}
            text={alertMsg}
            type='error'
            onConfirm={() => {
              setOpenErrorAlert(false);
            }}
        />
    </Box>
  )
}

export default Setting
