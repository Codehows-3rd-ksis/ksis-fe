import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Breadcrumbs, Link, Autocomplete, TextField } from "@mui/material";
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
  parseTimeCron,
  formatScheduleToKorean,
  DAY_OF_WEEK_EN,
  DAY_OF_WEEK_KR,
  WEEK_OF_MONTH_OPTIONS,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  type WeekOfMonth,
  type DayOfWeekIndex,
  type DayOfWeekEN,
} from "../../utils/cronUtils";
import {
  updateSchedule,
  type CreateScheduleRequest,
} from "../../API/04_SchedulerApi";
import { getSetting } from "../../API/02_SettingApi";
import {
  type SettingTableRows,
  getSettingSelectColumns,
} from "../../Types/TableHeaders/SettingHeader";
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
import { getSettingSearchCategory } from "../../Types/Search";
import type { SchedulerTableRows } from "../../Types/TableHeaders/SchedulerHeader";

export default function EditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const row = (location.state as { row: SchedulerTableRows })?.row;

  const [openCloseAlert, setOpenCloseAlert] = useState(false);
  const [openEditAlert, setOpenEditAlert] = useState(false);
  const [openEditDoneAlert, setOpenEditDoneAlert] = useState(false);

  const [settingId, setSettingId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekOfMonth, setWeekOfMonth] = useState<WeekOfMonth>("0");
  const [selectedDays, setSelectedDays] = useState<DayOfWeekIndex[]>([1]);
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

  // 전달받은 데이터로 폼 초기화
  useEffect(() => {
    if (row) {
      setSettingId(row.settingId);
      setStartDate(row.startDate);
      setEndDate(row.endDate);
      setWeekOfMonth(row.weekOfMonth);

      // daysOfWeek 문자열을 배열로 변환 ("MON,WED,FRI" -> [1, 3, 5])
      const daysArray = row.daysOfWeek.split(",") as DayOfWeekEN[];
      setSelectedDays(
        daysArray.map((d) => DAY_OF_WEEK_EN.indexOf(d) as DayOfWeekIndex)
      );

      // 시간 cron 파싱
      const timeConfig = parseTimeCron(row.cronExpression);
      if (timeConfig) {
        setHour(timeConfig.hour);
        setMinute(timeConfig.minute);
      }
    }
  }, [row]);

  // searchState 변경 시 설정 목록 불러오기
  useEffect(() => {
    const fetchSettingList = async () => {
      try {
        const { type, keyword, page, size } = searchState;
        const res = await getSetting(type, keyword, page, size);
        const data = res.content.map((item: SettingTableRows) => ({
          ...item,
          id: item.settingId,
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

    // 이미 선택된 행이면 취소
    if (settingId === clickedId) {
      setSettingId("");
    } else {
      // 새로 선택
      setSettingId(clickedId);
    }
  };

  const handleDayToggle = (day: DayOfWeekIndex) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const previewCron = () => {
    if (selectedDays.length === 0) {
      return "요일을 선택해주세요";
    }
    const daysOfWeekEN = selectedDays.map((d) => DAY_OF_WEEK_EN[d]);
    const scheduleText = formatScheduleToKorean(daysOfWeekEN, weekOfMonth);
    return `${scheduleText} ${hour}시 ${minute}분`;
  };

  const handleEdit = async () => {
    if (!row) return;

    try {
      const requestData: Partial<CreateScheduleRequest> = {
        settingId: settingId as number,
        startDate,
        endDate,
        cronExpression: generateTimeCron(hour, minute),
        daysOfWeek: selectedDays.map((d) => DAY_OF_WEEK_EN[d]),
        weekOfMonth,
      };

      await updateSchedule(row.scheduleId, requestData);
      setOpenEditDoneAlert(true);
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("스케줄 수정에 실패했습니다.");
    }
  };

  const handleClose = () => {
    navigate("/scheduler");
  };

  if (!row) {
    return (
      <Box
        sx={{
          height: "97%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontSize: 24 }}>
          잘못된 접근입니다. 목록에서 수정 버튼을 눌러주세요.
        </Typography>
      </Box>
    );
  }

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
            스케줄 수정
          </Typography>
        </Breadcrumbs>

        <Typography sx={{ fontSize: 60, fontWeight: "bold", color: "black" }}>
          스케줄 수정
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

                {/* 수집 시간 */}
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
                    sx={{ width: "536px" }}
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
                  display: "flex",
                  alignItems: "center",
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
          text="수정"
          onClick={() => setOpenEditAlert(true)}
          radius={2}
          disabled={
            !settingId || !startDate || !endDate || selectedDays.length === 0
          }
        />
      </Box>

      <Alert
        open={openCloseAlert}
        text="현재 수정한 정보가 사라집니다. 정말로 닫으시겠습니까?"
        onConfirm={() => {
          setOpenCloseAlert(false);
          handleClose();
        }}
        onCancel={() => {
          setOpenCloseAlert(false);
        }}
      />
      <Alert
        open={openEditAlert}
        text="수정 하시겠습니까?"
        type="question"
        onConfirm={() => {
          setOpenEditAlert(false);
          handleEdit();
        }}
        onCancel={() => {
          setOpenEditAlert(false);
        }}
      />
      <Alert
        open={openEditDoneAlert}
        text="수정 되었습니다."
        type="success"
        onConfirm={() => {
          setOpenEditDoneAlert(false);
          navigate("/scheduler");
        }}
      />
    </Box>
  );
}
