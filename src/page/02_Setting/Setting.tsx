import { useState, useEffect, useCallback } from "react"
import { useNavigate } from 'react-router-dom';
// Mui
import { Box, Typography } from '@mui/material'
// Table
import PaginationServerTable from "../../component/PaginationServerTable"
import { getColumns, type SettingTableRows } from '../../Types/TableHeaders/SettingHeader'
// Search
import { getSettingSearchCategory } from "../../Types/Search"
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
// Comp
import Alert from "../../component/Alert"
import LoadingProgress from "../../component/LoadingProgress";
// API
import { getSetting, deleteSetting, runCrawl } from "../../API/02_SettingApi"

function Setting() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [isSearched, setIsSearched] = useState(false);
  // Table
  const [searchState, setSearchState] = useState({
    type: 'all',
    keyword: '',
    page: 0,
    size: 5,
  });
  const [totalCount, setTotalCount] = useState(0)
  const [baseRows, setBaseRows] = useState<SettingTableRows[]>([])
  const [selectedRow, setSelectedRow] = useState<SettingTableRows | null>(null)
  
  // Alert
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [openDelDoneAlert, setOpenDelDoneAlert] = useState(false)
  const [openRunAlert, setOpenRunAlert] = useState(false)
  const [openRunDoneAlert, setOpenRunDoneAlert] = useState(false)
  const [openErrorAlert, setOpenErrorAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState("")

  /**  Table  =========================================== */
  const getTableDatas = useCallback(async () => {
    try {
        const { type, keyword, page, size } = searchState
        setLoading(true)
        const res = await getSetting(
          type ?? 'all',
          keyword ?? '',
          page, 
          size
        )
        
        const result = res.content.map((row: SettingTableRows, i: number) => ({
          ...row,
          id: row.settingId,
          index: page * size + i + 1, // 🔥 전체 기준 index
        }))

        setBaseRows(result)
        setTotalCount(res.totalElements)
        setLoading(false)
    }
    catch(err) {
        console.error(err)
        setAlertMsg("설정데이터 조회 실패")
        setOpenErrorAlert(true)
        setLoading(false)
    }
  }, [searchState] )

  useEffect(()=> {
    getTableDatas();
  }, [getTableDatas])

  const BoardRefresh = () => {
        getTableDatas();
  }

  const handleSearch = (conditions: SearchConditions) => {
    setIsSearched(true)
    setSearchState(prev => ({
      ...prev,
      ...conditions,
      page: 0,
    }));
  };
  const handleReset = () => {
    setIsSearched(false)
    setSearchState({
      type: 'all',
      keyword: '',
      page: 0,
      size: 5,
    })
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
      await deleteSetting(Number(selectedRow?.settingId))
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
  const handleCrawl = async () => {
    try {
      await runCrawl(Number(selectedRow?.settingId))
      setOpenRunDoneAlert(true);
    }
    catch(err) {
      console.error(err)
      setAlertMsg("수동 실행 실패")
      setOpenErrorAlert(true)
    }
  }
  const columns = getColumns({ handleEditOpen, handleDeleteOpen, handleRunCrawl });

  return (
    <Box sx={{ height: '97%'}}>
        <Typography sx={{fontSize: 60, fontWeight: 'bold', color: 'black', paddingLeft: 2, marginTop: 5}}>
          데이터 수집 설정
        </Typography>
        {/* Search */}
        <Box sx={{padding: 2}}>
          <SearchBarSet
            value={{
              type: searchState.type,
              keyword: searchState.keyword,
            }}
            totalCount={totalCount}
            showDateRange={false}
            showKeyword={true}
            showSearchType={true}
            showCount={isSearched}
            searchCategories={getSettingSearchCategory()}
            onSearch={handleSearch}
            onReset={handleReset}
            showButton={true}
            buttonLabel="설정 등록"
            onButtonClick={handleOpenReg}
          />
        </Box>
        {/* 테이블 영역 */}
        <Box sx={{padding: 2}}>
            <PaginationServerTable 
                columns={columns} 
                rows={baseRows} 
                page={searchState.page}
                pageSize={searchState.size}
                totalCount={totalCount}

                onPageChange={(newPage: number) => {
                  setSearchState(prev => ({
                    ...prev,
                    page: newPage,
                  }))
                }}
            />
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
        <LoadingProgress open={loading} />
    </Box>
  )
}

export default Setting
