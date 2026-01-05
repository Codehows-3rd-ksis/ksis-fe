import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Mui
import {
  Box,
  Dialog,
  Typography,
  Button,
  Container,
  Paper,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
// Table
import PaginationServerTable from "../../component/PaginationServerTable";
import {
  getColumns,
  type UserTableRows,
} from "../../Types/TableHeaders/UserManageHeader";
// Search
import { getUserSearchCategory } from "../../Types/Search";
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
// Pages
import EditPage from "./EditPage";
import EditAccountPage from "./EditAccountPage";
import RegPage from "./RegPage";
// Comp
import Alert from "../../component/Alert";
import LoadingProgress from "../../component/LoadingProgress";
// API
import { getUser, deleteUser } from "../../API/01_UsermanagementApi";

function UserManagement() {
  const [loading, setLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  // Table
  const [totalCount, setTotalCount] = useState(0);
  const [searchState, setSearchState] = useState({
    type: "all",
    keyword: "",
    page: 0,
    size: 10,
  });
  const [baseRows, setBaseRows] = useState<UserTableRows[]>([]);
  const [selectedRow, setSelectedRow] = useState<UserTableRows | null>(null);

  // Dialog
  const [openReg, setOpenReg] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditAccount, setOpenEditAccount] = useState(false);

  // LogPage
  const navigate = useNavigate();

  // Alert
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [openDelDoneAlert, setOpenDelDoneAlert] = useState(false);
  const [openRegDoneAlert, setOpenRegDoneAlert] = useState(false);
  const [openEditDoneAlert, setOpenEditDoneAlert] = useState(false);
  const [openEditAccountDoneAlert, setOpenEditAccountDoneAlert] =
    useState(false);
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getTableDatas = useCallback(async () => {
    try {
      setLoading(true);
      const { type, keyword, page, size } = searchState;

      const res = await getUser(type ?? "all", keyword ?? "", page, size);

      const result = res.content.map((row: UserTableRows, i: number) => ({
        ...row,
        id: row.userId,
        index: page * size + i + 1, // 🔥 전체 기준 index
      }));

      setBaseRows(result);
      setTotalCount(res.totalElements);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("get User 실패");
      setOpenErrorAlert(true);
      setLoading(false);
    }
  }, [searchState]);

  useEffect(() => {
    getTableDatas();
  }, [getTableDatas]);

  const BoardRefresh = () => {
    getTableDatas();
  };

  const handleSearch = (conditions: SearchConditions) => {
    setIsSearched(true);
    setSearchState((prev) => ({
      ...prev,
      ...conditions,
      page: 0,
    }));
  };
  const handleReset = () => {
    setIsSearched(false);
    setSearchState({
      type: "all",
      keyword: "",
      page: 0,
      size: 10,
    });
  };

  /**  등록 페이지  =========================================== */
  const handleOpenReg = () => {
    setOpenReg(true);
  };
  const handleCloseReg = () => {
    setOpenReg(false);
  };
  const handleReg = () => {
    handleCloseReg(); // 등록 다이얼로그 닫기
    setOpenRegDoneAlert(true); // 등록 완료 팝업 띄우기
  };
  /**  정보수정 페이지  =========================================== */
  const handleEditOpen = (row: UserTableRows) => {
    setSelectedRow(row);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setSelectedRow(null);
    setOpenEdit(false);
  };
  const handleEdit = () => {
    handleCloseEdit(); // 수정 다이얼로그 닫기
    setOpenEditDoneAlert(true); // 수정완료팝업
  };
  /**  계정수정 페이지  =========================================== */
  const handleEditAccountOpen = (row: UserTableRows) => {
    setSelectedRow(row);
    setOpenEditAccount(true);
  };
  const handleCloseEditAccount = () => {
    setSelectedRow(null);
    setOpenEditAccount(false);
  };
  const handleEditAccount = () => {
    handleCloseEditAccount();
    setOpenEditAccountDoneAlert(true); // 수정완료팝업
  };
  /**  삭제 팝업  =========================================== */
  const handleDeleteOpen = (row: UserTableRows) => {
    setSelectedRow(row);
    setOpenDeleteAlert(true);
  };
  const handleDelete = async () => {
    try {
      if (!selectedRow) {
        setErrorMsg("User 삭제 실패");
        setOpenErrorAlert(true);
        return;
      }
      await deleteUser(selectedRow.userId).then(() => {
        // 삭제완료 팝업
        setSelectedRow(null);
        setOpenDelDoneAlert(true);
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("User 삭제 실패");
      setOpenErrorAlert(true);
    }
  };
  /**  이력조회 페이지  =========================================== */
  const handleShowLogOpen = (row: UserTableRows) => {
    setSelectedRow(row);
    // 로그 페이지로 이동
    navigate(`/user/${row.userId}/history`, {
      state: { username: row.username },
    });
  };

  const columns = getColumns({
    handleEditOpen,
    handleEditAccountOpen,
    handleDeleteOpen,
    handleShowLogOpen,
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        pb: 4,
      }}
    >
      {/* 1. 헤더 섹션: 타이틀과 버튼을 한 행(Row)에 배치 */}
      <Box
        sx={{
          px: 4,
          pt: 6,
          pb: 3,
          display: "flex",
          justifyContent: "space-between", // 양 끝으로 배치
          alignItems: "flex-end", // 텍스트 하단 라인에 버튼을 맞춤
        }}
      >
        {/* 텍스트 영역 */}
        <Box>
          <Typography
            sx={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "#1E293B",
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            유저관리
          </Typography>
          <Typography
            sx={{ color: "#64748B", fontSize: "0.95rem", fontWeight: 500 }}
          >
            시스템 사용자의 계정과 활동 이력을 관리합니다.
          </Typography>
        </Box>

        {/* 버튼 영역: 헤더 안으로 이동 */}
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenReg}
          sx={{
            bgcolor: "#F5A623",
            color: "black",
            px: 3, // 가로 여백 살짝 증가
            py: 1.2,
            borderRadius: "10px", // 좀 더 둥글게 조정
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "none",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            "&:hover": {
              bgcolor: "#E59512",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          유저 등록
        </Button>
      </Box>

      <Container maxWidth={false} sx={{ px: 4 }}>
        {/* 2. 검색 바 영역 */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#fff",
          }}
        >
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
            showButton={false}
          />
        </Paper>
        {/* 3. 테이블 영역: 카드 스타일 및 내부 패딩 조정 */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#fff",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ p: 1 }}>
            <PaginationServerTable
              columns={columns}
              rows={baseRows}
              page={searchState.page}
              pageSize={searchState.size}
              totalCount={totalCount}
              onPageChange={(newPage: number) => {
                setSearchState((prev) => ({
                  ...prev,
                  page: newPage,
                }));
              }}
            />
          </Box>
        </Paper>
      </Container>

      {/* 등록 페이지 */}
      <Dialog
        open={openReg}
        onClose={handleCloseReg}
        maxWidth={false}
        disableEnforceFocus
        disableRestoreFocus
      >
        <RegPage handleDone={handleReg} handleCancel={handleCloseReg} />
      </Dialog>
      <Alert
        open={openRegDoneAlert}
        text="등록 되었습니다."
        type="success"
        onConfirm={() => {
          setOpenRegDoneAlert(false);
          BoardRefresh();
        }}
      />
      {/* 정보수정 페이지 */}
      <Dialog
        open={openEdit}
        onClose={handleCloseEdit}
        maxWidth={false}
        disableEnforceFocus
        disableRestoreFocus
      >
        <EditPage
          row={selectedRow}
          handleDone={handleEdit}
          handleCancel={handleCloseEdit}
        />
      </Dialog>
      <Alert
        open={openEditDoneAlert}
        text="수정 되었습니다."
        type="success"
        onConfirm={() => {
          setOpenEditDoneAlert(false);
          BoardRefresh();
        }}
      />
      {/* 계정수정 페이지 */}
      <Dialog
        open={openEditAccount}
        onClose={handleCloseEditAccount}
        maxWidth={false}
        disableEnforceFocus
        disableRestoreFocus
      >
        <EditAccountPage
          row={selectedRow}
          handleDone={handleEditAccount}
          handleCancel={handleCloseEditAccount}
        />
      </Dialog>
      <Alert
        open={openEditAccountDoneAlert}
        text="수정 되었습니다."
        type="success"
        onConfirm={() => {
          setOpenEditAccountDoneAlert(false);
          BoardRefresh();
        }}
      />
      {/* 삭제 팝업 */}
      <Alert
        open={openDeleteAlert}
        text="정말로 삭제하시겠습니까?"
        type="delete"
        onConfirm={() => {
          setOpenDeleteAlert(false);
          handleDelete();
        }}
        onCancel={() => {
          setOpenDeleteAlert(false);
        }}
      />
      <Alert
        open={openDelDoneAlert}
        text="삭제 완료되었습니다."
        type="success"
        onConfirm={() => {
          setOpenDelDoneAlert(false);
          BoardRefresh();
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
  );
}

export default UserManagement;
