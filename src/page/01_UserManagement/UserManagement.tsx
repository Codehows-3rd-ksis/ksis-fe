import { useState, useEffect} from "react"
import { useNavigate } from 'react-router-dom';
// Mui
import { Box, Dialog, Typography } from '@mui/material'
// Table
import CommonTable from "../../component/CommonTable"
import { getColumns, type UserTableRows } from '../../Types/TableHeaders/UserManageHeader'
// Search
import SearchHeader from "../../component/SearchHeader"
import { getUserSearchCategory } from "../../Types/Search"
// Pages
import EditPage from "./EditPage"
import RegPage from "./RegPage"
// Comp
import Alert from "../../component/Alert";
// API
import { getUser, deleteUser } from "./Api";

function UserManagement() {
  // Table
  const [baseRows, setBaseRows] = useState<UserTableRows[]>([])
  const [filteredRows, setFilteredRows] = useState<UserTableRows[]>([]);
  const [selectedRow, setSelectedRow] = useState<UserTableRows | null>(null)

  // Dialog
  const [openReg, setOpenReg] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)

  // LogPage
  const navigate = useNavigate();

  // Alert
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [openDelDoneAlert, setOpenDelDoneAlert] = useState(false)
  const [openRegDoneAlert, setOpenRegDoneAlert] = useState(false)
  const [openEditDoneAlert, setOpenEditDoneAlert] = useState(false)

  const getTableDatas = async () => {
      try {
          const data = await getUser();

          const result = data.map((row: UserTableRows, i: number) => ({
              ...row,
              id: row.userId,
              index: i+1,
          }))
        
          setBaseRows(result)
          setFilteredRows(result)
      }
      catch(err) {
          console.error(err)
          alert('getUser 실패')
      }
  }

  useEffect(()=> {
    const data = [
      { userId: 1, id: 1, index: 1, username: 'ksis1', password: 'test1234', name: '김철수', dept: '비즈니스 사업부', ranks: '부장', loginAt: '2025-11-05', state: '승인완료' },
      { userId: 2, id: 2, index: 2, username: 'ksis2', password: 'test5678', name: '김영희', dept: '소프트웨어 사업부', ranks: '대리', loginAt: '2025-11-06', state: '승인완료' },
      { userId: 3, id: 3, index: 3, username: 'ksis3', password: 'test0000', name: '홍길동', dept: '경영지원부', ranks: '과장', loginAt: '2024-04-24', state: '승인대기' },
    ];

    setBaseRows(data)
    setFilteredRows(data)

    // getTableDatas();
  }, [])

  const BoardRefresh = () => {
        // getTableDatas();
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
  /**  수정 페이지  =========================================== */
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
  /**  삭제 팝업  =========================================== */
  const handleDeleteOpen = (row: UserTableRows) => {
    setSelectedRow(row)
    setOpenDeleteAlert(true)
  }
  const handleDelete = async () => {
    // delete api 연결
    try {
      if(!selectedRow) {
        alert('deleteUser 실패 - selectedRow is Null')
        return
      };
      await deleteUser(selectedRow.userId).then(()=>{
        // 삭제완료 팝업
        setOpenDelDoneAlert(true);
      })
    }
    catch(err) {
      console.error(err)
      alert('deleteUser 실패')
    }
  }
  /**  이력조회 페이지  =========================================== */
  const handleShowLogOpen = (row: UserTableRows) => {
    setSelectedRow(row)
    // 로그 페이지로 이동
    navigate('/user/log', {state: {userId: row.userId, username: row.username} })
    
  }

  const columns = getColumns({ handleEditOpen, handleDeleteOpen, handleShowLogOpen });

  return (
    <Box sx={{ height: '97%'}}>
        {/* <Box sx={{ bgcolor: '#FFC98B', height: '120px', borderRadius: '10px 10px 0px 0px', display: 'flex', alignItems: 'center'}}>
        </Box> */}
            <Typography sx={{fontSize: 60, fontWeight: 'bold', color: 'black', paddingLeft: 2, marginTop: 5}}>
              유저관리
            </Typography>
        <SearchHeader
          baseRows={baseRows}                 // 전체 데이터 원본
          setFilteredRows={setFilteredRows}   // 필터링된 데이터 상태 setter
          getSearchCategory={getUserSearchCategory} // 검색 카테고리 목록
          onClick={handleOpenReg}             // 등록 버튼 클릭 시 실행할 함수
          btnName="유저 등록"
        />

        {/* 테이블 영역 */}
        <Box sx={{padding: 2}}>
            <CommonTable columns={columns} rows={filteredRows} /> {/* ✅ 변경 */}
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
        {/* 수정 페이지 */}
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
    </Box>
  )
}

export default UserManagement
