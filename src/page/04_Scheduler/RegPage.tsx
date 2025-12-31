import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Autocomplete,
  TextField,
  Paper,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type { GridRowParams } from "@mui/x-data-grid";
import CustomButton from "../../component/CustomButton";
import CustomSelect from "../../component/CustomSelect";

import PaginationServerTable from "../../component/PaginationServerTable";
import Alert from "../../component/Alert";
import {
  generateTimeCron,
  formatScheduleToKorean,
  DAY_OF_WEEK_EN,
  DAY_OF_WEEK_KR,
  WEEK_OF_MONTH_OPTIONS,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  type WeekOfMonth,
  type DayOfWeekIndex,
} from "../../utils/cronUtils";
import { createSchedule } from "../../API/04_SchedulerApi";
import type { CreateScheduleRequest } from "../../API/04_SchedulerApi";
import { getSetting } from "../../API/02_SettingApi";
import {
  type SettingTableRows,
  getSettingSelectColumns,
} from "../../Types/TableHeaders/SettingHeader";
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
import { getSettingSearchCategory } from "../../Types/Search";

export default function RegPage() {
  const navigate = useNavigate();

  const [openCloseAlert, setOpenCloseAlert] = useState(false);
  const [openRegAlert, setOpenRegAlert] = useState(false);
  const [openRegDoneAlert, setOpenRegDoneAlert] = useState(false);

  const [settingId, setSettingId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekOfMonth, setWeekOfMonth] = useState<WeekOfMonth>("0");
  const [selectedDays, setSelectedDays] = useState<DayOfWeekIndex[]>([]);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  // 설정 목록 테이블
  const [rows, setRows] = useState<SettingTableRows[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchState, setSearchState] = useState({
    type: "all",
    keyword: "",
    page: 0,
    size: 5,
  });

  // searchState 변경 시 설정 목록 불러오기
  useEffect(() => {
    const fetchSettingList = async () => {
      try {
        const { type, keyword, page, size } = searchState;
        const res = await getSetting(type, keyword, page, size);
        const data = res.content.map((row: SettingTableRows) => ({
          ...row,
          id: row.settingId,
        }));
        setRows(data);
        setTotalCount(res.totalElements);
      } catch (error) {
        console.error("Failed to fetch setting list:", error);
      }
    };
    fetchSettingList();
  }, [searchState]);

  // 검색
  const handleSearch = (conditions: SearchConditions) => {
    setSearchState((prev) => ({
      ...prev,
      type: conditions.type ?? "all",
      keyword: conditions.keyword ?? "",
      page: 0,
    }));
  };

  //검색초기화
  const handleReset = () => {
    setSearchState({
      type: "all",
      keyword: "",
      page: 0,
      size: 5,
    });
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    setSearchState((prev) => ({ ...prev, page: newPage }));
  };

  // 데이터 설정 테이블 컬럼 정의 (ID 컬럼 제외)
  const settingColumns = getSettingSelectColumns().filter(
    (col) => col.field !== "id"
  );

  // 행 클릭 시 해당 설정 선택/취소
  const handleSettingRowClick = (params: GridRowParams) => {
    const clickedId = params.row.id;

    if (settingId === clickedId) {
      setSettingId(""); //선택해제
    } else {
      setSettingId(clickedId); // 새로 선택
    }
  };
  //요일토글
  const handleDayToggle = (day: DayOfWeekIndex) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // 미리보기
  const previewCron = () => {
    if (selectedDays.length === 0) {
      return "";
    }
    const sortedDays = [...selectedDays].sort((a, b) => a - b); // 일요일부터 차례대로 정렬
    const daysOfWeekEN = sortedDays.map((d) => DAY_OF_WEEK_EN[d]); //숫자인덱스 -> 영문
    const scheduleText = formatScheduleToKorean(daysOfWeekEN, weekOfMonth); // 영문 -> 한글
    return `${scheduleText} ${hour}시 ${minute}분`;
  };

  //등록
  const handleRegist = async () => {
    try {
      //서버 전송 데이터 구성
      const requestData: CreateScheduleRequest = {
        settingId: settingId as number,
        startDate,
        endDate,
        cronExpression: generateTimeCron(hour, minute),
        daysOfWeek: selectedDays.map((d) => DAY_OF_WEEK_EN[d]),
        weekOfMonth,
      };

      await createSchedule(requestData);
      setOpenRegDoneAlert(true); //완료팝업
    } catch (error) {
      console.error("Failed to create schedule:", error);
      alert("스케줄 등록에 실패했습니다.");
    }
  };

  const handleClose = () => {
    navigate("/scheduler");
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
      {/* 상단 헤더: 최적화된 타이틀 */}
      <Box sx={{ px: 4, pt: 3, pb: 2, flexShrink: 0 }}>
        <Breadcrumbs
          sx={{ mb: 0.5, "& .MuiTypography-root": { fontSize: 14 } }}
        >
          <Link
            component={RouterLink}
            to="/scheduler"
            underline="hover"
            color="inherit"
          >
            스케줄러 관리
          </Link>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            스케줄 등록
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
          스케줄 등록
        </Typography>
      </Box>

      {/* 본문 영역: 카드와 테이블이 들어가는 스크롤 구역 */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 4, pb: 2 }}>
        {/* 섹션 1: 스케줄 설정 카드 */}
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
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, mb: 5, color: "#44403c" }}
          >
            스케줄 설정
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Row: 수집 기간 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                py: 2.5,
                borderBottom: "1px solid #f5f5f4",
              }}
            >
              <Typography
                sx={{
                  width: 160,
                  fontWeight: 600,
                  color: "#78716c",
                  fontSize: 15,
                }}
              >
                수집 기간
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <DatePicker
                    format="YYYY-MM-DD"
                    value={startDate ? dayjs(startDate) : null}
                    onChange={(v) =>
                      setStartDate(v ? v.format("YYYY-MM-DD") : "")
                    }
                    slotProps={{
                      textField: { size: "small", sx: { width: 200 } },
                    }}
                  />
                  <Typography color="#cbd5e1">—</Typography>
                  <DatePicker
                    format="YYYY-MM-DD"
                    value={endDate ? dayjs(endDate) : null}
                    onChange={(v) =>
                      setEndDate(v ? v.format("YYYY-MM-DD") : "")
                    }
                    slotProps={{
                      textField: { size: "small", sx: { width: 200 } },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>

            {/* Row: 수집 주기 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                py: 2.5,
                borderBottom: "1px solid #f5f5f4",
              }}
            >
              <Typography
                sx={{
                  width: 160,
                  fontWeight: 600,
                  color: "#78716c",
                  fontSize: 15,
                }}
              >
                수집 주기
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <CustomSelect
                  inputWidth="120px"
                  height="40px"
                  value={weekOfMonth}
                  listItem={[...WEEK_OF_MONTH_OPTIONS]}
                  onChange={(e) => {
                    setWeekOfMonth(e.target.value as WeekOfMonth);
                    setSelectedDays([1]);
                  }}
                />
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  {DAY_OF_WEEK_KR.map((day, index) => {
                    const selected = selectedDays.includes(
                      index as DayOfWeekIndex
                    );
                    return (
                      <Box
                        key={index}
                        onClick={() => handleDayToggle(index as DayOfWeekIndex)}
                        sx={{
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "1px solid",
                          borderColor: selected ? "#ba7d1bff" : "#e7e5e4",
                          backgroundColor: selected ? "#ba7d1bff" : "#fff",
                          color: selected ? "#fff" : "#78716c",
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: selected ? "#9a6515" : "#f5f5f4",
                          },
                        }}
                      >
                        {day}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* Row: 수집 시간 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                py: 2.5,
                borderBottom: "1px solid #f5f5f4",
              }}
            >
              <Typography
                sx={{
                  width: 160,
                  fontWeight: 600,
                  color: "#78716c",
                  fontSize: 15,
                }}
              >
                수집 시간
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <CustomSelect
                  inputWidth="100px"
                  height="40px"
                  value={hour}
                  listItem={HOUR_OPTIONS}
                  onChange={(e) => setHour(e.target.value as number)}
                />
                <CustomSelect
                  inputWidth="100px"
                  height="40px"
                  value={minute}
                  listItem={[...MINUTE_OPTIONS]}
                  onChange={(e) => setMinute(e.target.value as number)}
                />
              </Box>
            </Box>

            {/* Row: 수집 설정 (검색) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                py: 2.5,
                borderBottom: "1px solid #f5f5f4",
              }}
            >
              <Typography
                sx={{
                  width: 160,
                  fontWeight: 600,
                  color: "#78716c",
                  fontSize: 15,
                }}
              >
                데이터 수집명
              </Typography>
              <Autocomplete
                value={
                  settingId
                    ? rows.find((row) => row.id === settingId) || null
                    : null
                }
                onChange={(_, newValue) => setSettingId(newValue?.id || "")}
                options={rows}
                getOptionLabel={(option) => option.settingName || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="수집 설정명 검색 및 표에서 선택"
                    size="small"
                    sx={{ width: 430 }}
                  />
                )}
              />
            </Box>

            {/* 미리보기 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                pt: 2.5,
                visibility:
                  settingId && startDate && endDate && previewCron()
                    ? "visible"
                    : "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2.5,
                  py: 1.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 1.5,
                  border: "1px solid #dee2e6",
                  width: "fit-content",
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#ba7d1bff",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{ fontSize: 13, color: "#495057", fontWeight: 500 }}
                >
                  {rows.find((r) => r.id === settingId)?.settingName}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#adb5bd" }}>
                  •
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#495057" }}>
                  {startDate} ~ {endDate}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#adb5bd" }}>
                  •
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#495057" }}>
                  {previewCron()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 섹션 2: 테이블 영역 */}
        <Box sx={{ mt: 8 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              sx={{ fontSize: 18, fontWeight: 700, color: "#44403c" }}
            >
              연결할 설정 목록
            </Typography>
            <SearchBarSet
              value={searchState}
              onSearch={handleSearch}
              onReset={handleReset}
              showSearchType
              searchCategories={getSettingSearchCategory()}
              showKeyword
            />
          </Box>
          <Box
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid #e7e5e4",
              boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
              backgroundColor: "#fff",
            }}
          >
            <PaginationServerTable
              columns={settingColumns}
              rows={rows}
              page={searchState.page}
              pageSize={searchState.size}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onRowClick={handleSettingRowClick}
              selectedRows={settingId ? [{ id: settingId }] : []}
            />
          </Box>
        </Box>
      </Box>

      {/* 하단 푸터 액션바 */}
      <Box
        sx={{
          px: 4,
          py: 2,
          backgroundColor: "#fff",
          borderTop: "1px solid #e7e5e4",
          display: "flex",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <CustomButton
          text="취소"
          backgroundColor="#f5f5f4"
          color="#78716c"
          onClick={() => setOpenCloseAlert(true)}
          radius={1}
        />
        <CustomButton
          text="등록"
          backgroundColor="#ba7d1bff"
          onClick={() => setOpenRegAlert(true)}
          radius={1}
          disabled={
            !settingId || !startDate || !endDate || selectedDays.length === 0
          }
        />
      </Box>

      {/* ================= Alert ================= */}
      <Alert
        open={openCloseAlert}
        text="현재 입력한 정보가 사라집니다. 정말로 닫으시겠습니까?"
        onConfirm={() => {
          setOpenCloseAlert(false);
          handleClose();
        }}
        onCancel={() => setOpenCloseAlert(false)}
      />

      <Alert
        open={openRegAlert}
        text="등록 하시겠습니까?"
        type="question"
        onConfirm={() => {
          setOpenRegAlert(false);
          handleRegist();
        }}
        onCancel={() => setOpenRegAlert(false)}
      />

      <Alert
        open={openRegDoneAlert}
        text="등록 되었습니다."
        type="success"
        onConfirm={() => {
          setOpenRegDoneAlert(false);
          navigate("/scheduler");
        }}
      />
    </Box>
  );
}
