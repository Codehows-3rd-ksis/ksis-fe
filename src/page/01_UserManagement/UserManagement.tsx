import { useState, useEffect} from "react"
import { useNavigate } from 'react-router-dom';
// Mui
import { Box, Dialog, Typography } from '@mui/material'
// Table
import CommonTable from "../../component/CommonTable"
import { getColumns, type UserTableRows } from '../../Types/TableHeaders/UserManageHeader'
// Search
import { getUserSearchCategory } from "../../Types/Search"
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
// Pages
import EditPage from "./EditPage"
import EditAccountPage from "./EditAccountPage"
import RegPage from "./RegPage"
// Comp
import Alert from "../../component/Alert";
import LoadingProgress from "../../component/LoadingProgress";
// API
import { getUser, deleteUser } from "../../API/01_UsermanagementApi";

function UserManagement() {
  const [loading, setLoading] = useState(false)
  const [isSearched, setIsSearched] = useState(false);
  // Table
  const [totalCount, setTotalCount] = useState(0)
  const [searchState, setSearchState] = useState({
    type: 'all',
    keyword: '',
    page: 0,
    size: 5,
  });
  const [baseRows, setBaseRows] = useState<UserTableRows[]>([])
  const [selectedRow, setSelectedRow] = useState<UserTableRows | null>(null)

  // Dialog
  const [openReg, setOpenReg] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openEditAccount, setOpenEditAccount] = useState(false)

  // LogPage
  const navigate = useNavigate();

  // Alert
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [openDelDoneAlert, setOpenDelDoneAlert] = useState(false)
  const [openRegDoneAlert, setOpenRegDoneAlert] = useState(false)
  const [openEditDoneAlert, setOpenEditDoneAlert] = useState(false)
  const [openEditAccountDoneAlert, setOpenEditAccountDoneAlert] = useState(false)
  const [openErrorAlert, setOpenErrorAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const getTableDatas = async () => {
    try {
          setLoading(true)
          const { type, keyword, page, size } = searchState

          const res = await getUser(
            type ?? 'all',
            keyword ?? '',
            page, 
            size
          )
          
          const result = res.content.map((row: UserTableRows, i: number) => ({
            ...row,
            id: row.userId,
            index: page * size + i + 1, // 🔥 전체 기준 index
          }))

          setBaseRows(result)
          setTotalCount(res.totalElements)
          setLoading(false)
      }
      catch(err) {
          console.error(err)
          setErrorMsg('get User 실패');
          setOpenErrorAlert(true)
          setLoading(false)
      }
  }

  useEffect(()=> {
    getTableDatas();
  }, [searchState])

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
    setOpenReg(true)
  }
  const handleCloseReg = () => {
    setOpenReg(false)
  }
  const handleReg = () => {
    handleCloseReg() // 등록 다이얼로그 닫기
    setOpenRegDoneAlert(true) // 등록 완료 팝업 띄우기
  }
  /**  정보수정 페이지  =========================================== */
  const handleEditOpen = (row: UserTableRows) => {
    setSelectedRow(row)
    setOpenEdit(true)
  }
  const handleCloseEdit = () => {
    setSelectedRow(null)
    setOpenEdit(false)
  }
  const handleEdit = () => {
    handleCloseEdit() // 수정 다이얼로그 닫기
    setOpenEditDoneAlert(true) // 수정완료팝업
  }
  /**  계정수정 페이지  =========================================== */
  const handleEditAccountOpen = (row: UserTableRows) => {
    setSelectedRow(row)
    setOpenEditAccount(true)
  }
  const handleCloseEditAccount = () => {
    setSelectedRow(null)
    setOpenEditAccount(false)
  }
  const handleEditAccount = () => {
    handleCloseEditAccount()
    setOpenEditAccountDoneAlert(true) // 수정완료팝업
  }
  /**  삭제 팝업  =========================================== */
  const handleDeleteOpen = (row: UserTableRows) => {
    setSelectedRow(row)
    setOpenDeleteAlert(true)
  }
  const handleDelete = async () => {
    try {
      if(!selectedRow) {
        setErrorMsg('User 삭제 실패');
        setOpenErrorAlert(true)
        return
      };
      await deleteUser(selectedRow.userId).then(()=>{
        // 삭제완료 팝업
        setSelectedRow(null)
        setOpenDelDoneAlert(true);
      })
    }
    catch(err) {
      console.error(err)
      setErrorMsg('User 삭제 실패');
      setOpenErrorAlert(true)
    }
  }
  /**  이력조회 페이지  =========================================== */
  const handleShowLogOpen = (row: UserTableRows) => {
    setSelectedRow(row)
    // 로그 페이지로 이동
    navigate('/user/log', {state: {userId: row.userId, username: row.username} })
    
  }

  const columns = getColumns({ 
    handleEditOpen, 
    handleEditAccountOpen, 
    handleDeleteOpen, 
    handleShowLogOpen 
  });

  return (
    <Box sx={{ height: '97%'}}>
        <Typography sx={{fontSize: 60, fontWeight: 'bold', color: 'black', paddingLeft: 2, marginTop: 5}}>
          유저관리
        </Typography>
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
            searchCategories={getUserSearchCategory()}
            onSearch={handleSearch}
            onReset={handleReset}
            showButton={true}
            buttonLabel="유저 등록"
            onButtonClick={handleOpenReg}
          />
        </Box>

        {/* 테이블 영역 */}
        <Box sx={{padding: 2}}>
            <CommonTable 
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

        {/* 등록 페이지 */}
        <Dialog open={openReg} onClose={handleCloseReg} maxWidth={false} disableEnforceFocus disableRestoreFocus>
            <RegPage handleDone={handleReg} handleCancel={handleCloseReg} />
        </Dialog>
        <Alert
            open={openRegDoneAlert}
            text="등록 되었습니다."
            type='success'
            onConfirm={() => {
              setOpenRegDoneAlert(false);
              BoardRefresh()
            }}
        />
        {/* 정보수정 페이지 */}
        <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth={false} disableEnforceFocus disableRestoreFocus>
            <EditPage row={selectedRow} handleDone={handleEdit} handleCancel={handleCloseEdit} />
        </Dialog>
        <Alert
            open={openEditDoneAlert}
            text="수정 되었습니다."
            type='success'
            onConfirm={() => {
              setOpenEditDoneAlert(false);
              BoardRefresh()
            }}
        />
        {/* 계정수정 페이지 */}
        <Dialog open={openEditAccount} onClose={handleCloseEditAccount} maxWidth={false} disableEnforceFocus disableRestoreFocus>
            <EditAccountPage row={selectedRow} handleDone={handleEditAccount} handleCancel={handleCloseEditAccount} />
        </Dialog>
        <Alert
            open={openEditAccountDoneAlert}
            text="수정 되었습니다."
            type='success'
            onConfirm={() => {
              setOpenEditAccountDoneAlert(false);
              BoardRefresh()
            }}
        />
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
        {/* Error Alert */}
        <Alert
          open={openErrorAlert}
          text={errorMsg}
          type="error"
          onConfirm={() => {
            setOpenErrorAlert(false);
          }}
        />
        <LoadingProgress open={loading} />
    </Box>
  )
}

export default UserManagement
