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
  Paper,
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
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafaf9",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* 상단 헤더 */}
      <Box sx={{ px: 4, pt: 3, pb: 2, flexShrink: 0 }}>
        <Breadcrumbs
          sx={{ mb: 0.5, "& .MuiTypography-root": { fontSize: 14 } }}
        >
          <Link
            component={RouterLink}
            to="/user"
            underline="hover"
            color="inherit"
          >
            유저관리
          </Link>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            {username} 의 데이터 수집 이력
          </Typography>
        </Breadcrumbs>
        <Typography
          sx={{
            fontSize: 32,
            fontWeight: 800,
            color: "#292524",
            letterSpacing: "-0.03em",
          }}
        >
          데이터 수집 이력
        </Typography>
      </Box>

      {/* 본문 영역: 스크롤 구역 */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 4, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* 검색 영역 */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px solid #e7e5e4",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.04)",
              backgroundColor: "#fff",
            }}
          >
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

            {/* 수집 타입 필터 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
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
                            color: "#F7941D",
                          },
                        }}
                      />
                    }
                    label="전체"
                  />
                  <FormControlLabel
                    value="스케줄러"
                    control={
                      <Radio
                        sx={{
                          color: "gray",
                          "&.Mui-checked": {
                            color: "#F7941D",
                          },
                        }}
                      />
                    }
                    label="스케줄러"
                  />
                  <FormControlLabel
                    value="수동실행"
                    control={
                      <Radio
                        sx={{
                          color: "gray",
                          "&.Mui-checked": {
                            color: "#F7941D",
                          },
                        }}
                      />
                    }
                    label="수동실행"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Paper>

          {/* 테이블 영역 */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px solid #e7e5e4",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.04)",
              backgroundColor: "#fff",
            }}
          >
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
          </Paper>
        </Box>
      </Box>

      {/* 하단 푸터 */}
      <Box
        sx={{
          px: 4,
          py: 2,
          display: "flex",
          justifyContent: "flex-start",
          flexShrink: 0,
        }}
      >
        <CustomButton
          text="이전"
          onClick={handleClose}
          radius={2}
          width="100px"
          backgroundColor="#F2F2F2"
          border="1px solid #757575"
          hoverStyle={{
            backgroundColor: "transparent",
            border: "2px solid #373737ff",
          }}
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
