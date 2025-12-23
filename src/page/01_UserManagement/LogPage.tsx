import { useState, useEffect, useCallback } from "react";
import {
  useNavigate,
  useLocation,
  Link as RouterLink,
  useParams,
} from "react-router-dom";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
// Table
import PaginationServerTable from "../../component/PaginationServerTable";
import {
  getColumns,
  type UserLogTableRows,
} from "../../Types/TableHeaders/UserManageLogHeader";
// Comp
import Alert from "../../component/Alert";
// Search
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
// API
import { getUserLog } from "../../API/01_UsermanagementApi";
import LoadingProgress from "../../component/LoadingProgress";
import CustomButton from "../../component/CustomButton";

type SearchState = {
  startDate: string | null;
  endDate: string | null;
  type: string;
  keyword: string;
  page: number;
  size: number;
};

export default function LogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { username } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  // Table
  const [totalCount, setTotalCount] = useState(0);
  const [searchState, setSearchState] = useState<SearchState>({
    startDate: "",
    endDate: "",
    type: "all",
    keyword: "",
    page: 0,
    size: 10,
  });
  const [baseRows, setBaseRows] = useState<UserLogTableRows[]>([]);
  // Alert
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getTableDatas = useCallback(async () => {
    try {
      setLoading(true);
      const { startDate, endDate, type, keyword, page, size } = searchState;
      const res = await getUserLog(
        startDate ?? "",
        endDate ?? "",
        type,
        keyword,
        page,
        size,
        Number(userId)
      );

      const result = res.content.map((row: UserLogTableRows, i: number) => ({
        ...row,
        id: row.workId,
        index: page * size + i + 1, // 🔥 전체 기준 index
      }));

      setBaseRows(result);
      setTotalCount(res.totalElements);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("getUserLog 실패");
      setOpenErrorAlert(true);
      setLoading(false);
    }
  }, [searchState, userId]);

  useEffect(() => {
    getTableDatas();
  }, [getTableDatas]);

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
      startDate: "",
      endDate: "",
      type: "all",
      keyword: "",
      page: 0,
      size: 10,
    });
  };

  // 라디오 선택 변경시 호출될 함수
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setIsSearched(true);
    setSearchState((prev) => ({
      ...prev,
      type: value,
      page: 0,
    }));
  };

  const handleDetailView = (row: UserLogTableRows) => {
    navigate(`/user/${userId}/history/${row.workId}`, {
      state: { username },
    });
  };

  const columns = getColumns({ handleDetailView });

  const handleClose = () => {
    navigate("/user");
  };

  return (
    <Box sx={{ height: "97%" }}>
      {/* BreadCrumbs */}
      <Box sx={{ paddingLeft: 2, marginTop: 1 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/user"
            underline="hover"
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            유저관리
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            {username} 의 데이터 수집 이력
          </Typography>
        </Breadcrumbs>
      </Box>
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: -1,
        }}
      >
        데이터 수집 이력
      </Typography>
      <Box sx={{ padding: 2 }}>
        <SearchBarSet
          value={{
            type: searchState.type,
            keyword: searchState.keyword,
            startDate: searchState.startDate,
            endDate: searchState.endDate,
          }}
          totalCount={totalCount}
          showDateRange={true}
          showKeyword={true}
          showSearchType={false}
          showCount={isSearched}
          onSearch={handleSearch}
          onReset={handleReset}
          showButton={false}
          placeholder="수집명 입력"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ paddingLeft: 2 }}>
          <Typography sx={{ color: "black", fontWeight: "bold", fontSize: 20 }}>
            User ID : {username}
          </Typography>
        </Box>
        {/* RadioBtn */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", paddingRight: 1 }}
        >
          <FormControl>
            <RadioGroup
              row
              value={searchState.type}
              onChange={handleFilterChange}
              sx={{ color: "black" }}
            >
              <FormControlLabel
                value="all"
                control={
                  <Radio
                    sx={{
                      color: "gray",
                      "&.Mui-checked": {
                        color: "#BB510C",
                      },
                    }}
                  />
                }
                label="전체"
              />
              <FormControlLabel
                value="스케줄링"
                control={
                  <Radio
                    sx={{
                      color: "gray",
                      "&.Mui-checked": {
                        color: "#BB510C",
                      },
                    }}
                  />
                }
                label="스케줄링"
              />
              <FormControlLabel
                value="수동실행"
                control={
                  <Radio
                    sx={{
                      color: "gray",
                      "&.Mui-checked": {
                        color: "#BB510C",
                      },
                    }}
                  />
                }
                label="수동실행"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </Box>
      {/* 테이블 영역 */}
      <Box sx={{ padding: 2 }}>
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", padding: 2 }}>
        <CustomButton
          text="◀ 이전"
          backgroundColor="#9E9E9E"
          // color="#fff"
          onClick={handleClose}
          radius={2}
          width="80px"
        />
      </Box>
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
