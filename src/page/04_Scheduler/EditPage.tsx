import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Checkbox,
  FormControlLabel,
  FormGroup,
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

  // 설정 목록 불러오기
  const fetchSettingList = useCallback(async () => {
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
  }, [searchState]);

  useEffect(() => {
    fetchSettingList();
  }, [fetchSettingList]);

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

  // 데이터 설정 테이블 컬럼 정의
  const settingColumns = getSettingSelectColumns();

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
    <Box
      sx={{ height: "97%", display: "flex", flexDirection: "column", gap: 1 }}
    >
      <Box sx={{ padding: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
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

        <Typography
          sx={{
            fontSize: 60,
            fontWeight: "bold",
            color: "black",
          }}
        >
          스케줄 수정
        </Typography>
      </Box>

      {/* 폼 영역 */}
      <Box
        sx={{ padding: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography
          sx={{
            fontSize: 25,
            fontWeight: "bold",
            color: "black",
            mt: 1,
          }}
        >
          스케줄 설정
        </Typography>
        <Box
          sx={{
            width: "100%",
            backgroundColor: "#e8e8e8ff",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            padding: 4,
            boxSizing: "border-box",
            mt: 3,
          }}
        >
          {/* 수집기간 */}
          <Box
            className="수집기간"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "black",
            }}
          >
            <Typography
              sx={{ width: "150px", flexShrink: 0, textAlign: "left", fontSize: 25 }}
            >
              수집 기간 :
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <DatePicker
                  label="시작일자"
                  format="YYYY-MM-DD"
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(v) =>
                    setStartDate(v ? v.format("YYYY-MM-DD") : "")
                  }
                  slotProps={{
                    textField: {
                      sx: {
                        backgroundColor: "#fff",
                        borderRadius: 1,
                        width: "280px",
                        "& .MuiOutlinedInput-root": {
                          height: "50px",
                        },
                      },
                    },
                  }}
                />
                <Typography sx={{ fontSize: 20 }}>~</Typography>
                <DatePicker
                  label="종료일자"
                  format="YYYY-MM-DD"
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(v) => setEndDate(v ? v.format("YYYY-MM-DD") : "")}
                  slotProps={{
                    textField: {
                      sx: {
                        backgroundColor: "#fff",
                        borderRadius: 1,
                        width: "280px",
                        "& .MuiOutlinedInput-root": {
                          height: "50px",
                        },
                      },
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>

          {/* 수집주기 */}
          <Box
            className="수집주기"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "black",
            }}
          >
            <Typography
              sx={{ width: "150px", flexShrink: 0, textAlign: "left", fontSize: 25 }}
            >
              수집 주기 :
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              <CustomSelect
                inputWidth="120px"
                height="50px"
                value={weekOfMonth}
                listItem={[...WEEK_OF_MONTH_OPTIONS]}
                onChange={(e) => {
                  setWeekOfMonth(e.target.value as WeekOfMonth);
                  setSelectedDays([1]);
                }}
              />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <FormGroup row>
                  {DAY_OF_WEEK_KR.map((name, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={selectedDays.includes(
                            index as DayOfWeekIndex
                          )}
                          onChange={() =>
                            handleDayToggle(index as DayOfWeekIndex)
                          }
                          sx={{
                            color: "gray",
                            "&.Mui-checked": {
                              color: "#575757ff",
                            },
                          }}
                        />
                      }
                      label={name}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Box>
          </Box>

          {/* 수집 시간 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 2,
              color: "black",
              width: "100%",
            }}
          >
            <Box
              className="수집시간"
              sx={{ display: "flex", flexDirection: "row", gap: 2 }}
            >
              <Typography
                sx={{ width: "150px", flexShrink: 0, textAlign: "left", fontSize: 25 }}
              >
                수집 시간 :
              </Typography>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <CustomSelect
                  inputWidth="120px"
                  height="50px"
                  value={hour}
                  listItem={HOUR_OPTIONS}
                  onChange={(e) => setHour(e.target.value as number)}
                />
                <CustomSelect
                  inputWidth="120px"
                  height="50px"
                  value={minute}
                  listItem={[...MINUTE_OPTIONS]}
                  onChange={(e) => setMinute(e.target.value as number)}
                />
              </Box>
            </Box>

            {/* 미리보기 */}
            <Box
              className="미리보기"
              sx={{
                paddingTop: 4,
                borderRadius: 1,
                maxWidth: "800px",
              }}
            >
              <Typography sx={{ fontSize: 16, color: "#555" }}>
                <strong>미리보기:</strong> {previewCron()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 데이터 설정 테이블 */}
        <Box
          sx={{
            mt: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 25,
                fontWeight: "bold",
                color: "black",
              }}
            >
              데이터 수집 설정 목록
            </Typography>
            <SearchBarSet
              value={searchState}
              onSearch={handleSearch}
              onReset={handleReset}
              showSearchType={true}
              searchCategories={getSettingSearchCategory()}
              showKeyword={true}
            />
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
      {/* 하단 버튼 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2.5,
        }}
      >
        <CustomButton
          text="닫기"
          radius={2}
          backgroundColor="#BABABA"
          onClick={() => setOpenCloseAlert(true)}
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
