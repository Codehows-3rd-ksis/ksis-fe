import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Autocomplete,
  TextField,
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
    const daysOfWeekEN = selectedDays.map((d) => DAY_OF_WEEK_EN[d]); //숫자인덱스 -> 영문
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
    <Box sx={{ height: "97%", display: "flex", flexDirection: "column" }}>
      {/* 상단 헤더 */}
      <Box sx={{ px: 2, py: 2 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            component={RouterLink}
            to="/scheduler"
            underline="hover"
            color="inherit"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            스케줄러 관리
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontWeight: "bold", fontSize: 16 }}
          >
            스케줄 등록
          </Typography>
        </Breadcrumbs>

        <Typography sx={{ fontSize: 60, fontWeight: "bold", color: "black" }}>
          스케줄 등록
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,

          border: "1px solid #abababff",
          marginLeft: "20px",
          marginRight: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 2,
          p: 2,
          overflowY: "auto",
        }}
      >
        {/* 본문 */}
        <Box sx={{ px: 2, flex: 1, overflow: "auto" }}>
          <Typography
            sx={{
              fontSize: 25,
              fontWeight: "bold",
              color: "black",
              mt: 1,
              mb: 2,
            }}
          >
            스케줄 설정
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 3,
            }}
          >
            {/* 설정 카드 */}
            <Box
              sx={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 2,
                p: 4,
                display: "flex",
                flexDirection: "row",
                gap: 5,
                color: "black",
                alignItems: "center",
              }}
            >
              {/* 왼쪽: 입력 폼 */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                {/* 수집 기간 */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{
                      width: "200px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    수집 기간
                  </Typography>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box
                      sx={{
                        display: "flex",

                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        value={startDate ? dayjs(startDate) : null}
                        onChange={(v) =>
                          setStartDate(v ? v.format("YYYY-MM-DD") : "")
                        }
                        slotProps={{
                          textField: {
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                height: "44px",
                                minHeight: "unset",
                              },
                              "& .MuiInputBase-input": {
                                padding: "0 14px",
                                height: "42px",
                                lineHeight: "42px",
                              },
                            },
                          },
                        }}
                      />
                      <Typography>—</Typography>
                      <DatePicker
                        format="YYYY-MM-DD"
                        value={endDate ? dayjs(endDate) : null}
                        onChange={(v) =>
                          setEndDate(v ? v.format("YYYY-MM-DD") : "")
                        }
                        slotProps={{
                          textField: {
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                height: "44px",
                                minHeight: "unset",
                              },
                              "& .MuiInputBase-input": {
                                padding: "0 14px",
                                height: "42px",
                                lineHeight: "42px",
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </LocalizationProvider>
                </Box>

                {/* 수집 주기 */}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Typography
                    sx={{
                      width: "200px",
                      minWidth: "180px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "56px",
                      flexShrink: 0,
                    }}
                  >
                    수집 주기
                  </Typography>

                  <Box
                    sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                  >
                    <CustomSelect
                      inputWidth="120px"
                      height="56px"
                      value={weekOfMonth}
                      listItem={[...WEEK_OF_MONTH_OPTIONS]}
                      onChange={(e) => {
                        setWeekOfMonth(e.target.value as WeekOfMonth);
                        setSelectedDays([1]);
                      }}
                    />

                    {/* 요일 버튼 */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {DAY_OF_WEEK_KR.map((day, index) => {
                        const selected = selectedDays.includes(
                          index as DayOfWeekIndex
                        );

                        return (
                          <Box
                            key={index}
                            onClick={() =>
                              handleDayToggle(index as DayOfWeekIndex)
                            }
                            sx={{
                              px: 2,
                              height: "56px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 1,
                              fontSize: 14,
                              cursor: "pointer",
                              userSelect: "none",
                              border: "1px solid",
                              borderColor: selected ? "#333" : "#ddd",
                              backgroundColor: selected ? "#333" : "#fff",
                              color: selected ? "#fff" : "#333",
                              transition: "all 0.15s",
                            }}
                          >
                            {day}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                {/* 수집 시간  */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{
                      width: "200px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    수집 시간
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <CustomSelect
                      inputWidth="120px"
                      height="56px"
                      value={hour}
                      listItem={HOUR_OPTIONS}
                      onChange={(e) => setHour(e.target.value as number)}
                    />
                    <CustomSelect
                      inputWidth="120px"
                      height="56px"
                      value={minute}
                      listItem={[...MINUTE_OPTIONS]}
                      onChange={(e) => setMinute(e.target.value as number)}
                    />
                  </Box>
                </Box>

                {/* 데이터 수집 설정 */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{
                      width: "200px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    수집 설정
                  </Typography>

                  <Autocomplete
                    value={
                      settingId
                        ? rows.find((row) => row.id === settingId) || null
                        : null
                    }
                    onChange={(event, newValue) => {
                      setSettingId(newValue?.settingId || "");
                    }}
                    options={rows}
                    getOptionLabel={(option) => option.settingName || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.settingId === value.settingId
                    }
                    forcePopupIcon={false}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="데이터 수집명 검색 또는 아래 표에서 선택"
                        sx={{
                          width: "536px",
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            minHeight: "unset",
                          },
                          "& .MuiInputBase-input": {
                            padding: "0 14px",
                            height: "54px",
                            lineHeight: "54px",
                          },
                        }}
                      />
                    )}
                    noOptionsText="일치하는 설정이 없습니다"
                    sx={{ width: "400px" }}
                  />
                </Box>
              </Box>

              {/* 오른쪽: 미리보기 카드 */}
              <Box
                sx={{
                  width: "280px",
                  backgroundColor: "#fafafa",
                  borderRadius: 2,
                  p: 4,
                  border: "1px solid #eee",
                  color: "black",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  미리보기
                </Typography>
                <Box>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>설정</Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      color: "#555",
                      pl: 1,
                      minHeight: "24px",
                    }}
                  >
                    {settingId
                      ? rows.find((row) => row.id === settingId)?.settingName
                      : "\u00A0"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    스케줄
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      color: "#555",
                      pl: 1,
                      minHeight: "24px",
                    }}
                  >
                    {previewCron() || "\u00A0"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>기간</Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      color: "#555",
                      pl: 1,
                      minHeight: "24px",
                    }}
                  >
                    {startDate && endDate
                      ? `${startDate} ~ ${endDate}`
                      : startDate || endDate || "\u00A0"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 데이터 수집 설정 목록 */}
          <Box sx={{ mt: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: 25,
                  fontWeight: "bold",
                  color: "black",
                  mt: 1,
                }}
              >
                데이터 수집 설정 목록
              </Typography>

              <Box sx={{ "& > div": { pl: 0 } }}>
                <SearchBarSet
                  value={searchState}
                  onSearch={handleSearch}
                  onReset={handleReset}
                  showSearchType
                  searchCategories={getSettingSearchCategory()}
                  showKeyword
                />
              </Box>
            </Box>

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
      {/* 하단 버튼 */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <CustomButton
          text="닫기"
          backgroundColor="#BABABA"
          onClick={() => setOpenCloseAlert(true)}
          radius={2}
        />
        <CustomButton
          text="등록"
          onClick={() => setOpenRegAlert(true)}
          radius={2}
          disabled={
            !settingId || !startDate || !endDate || selectedDays.length === 0
          }
        />
      </Box>

      <Alert
        open={openCloseAlert}
        text="현재 입력한 정보가 사라집니다. 정말로 닫으시겠습니까?"
        onConfirm={() => {
          setOpenCloseAlert(false);
          handleClose();
        }}
        onCancel={() => {
          setOpenCloseAlert(false);
        }}
      />
      <Alert
        open={openRegAlert}
        text="등록 하시겠습니까?"
        type="question"
        onConfirm={() => {
          setOpenRegAlert(false);
          handleRegist();
        }}
        onCancel={() => {
          setOpenRegAlert(false);
        }}
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
