import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
} from "@mui/material";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";
import CustomButton from "../../component/CustomButton";
import CustomTextField from "../../component/CustomTextField";
import CustomSelect from "../../component/CustomSelect";
import CommonTable from "../../component/CommonTable";
import Alert from "../../component/Alert";
import {
  generateCronExpression,
  formatCronToKorean,
  parseCronExpression,
  type ScheduleType,
  type DayOfWeek,
} from "../../utils/cronUtils";
import {
  updateSchedule,
  type CreateScheduleRequest,
} from "../../API/04_SchedulerApi";
import { getSettings, type Setting } from "./03_SettingApi";
import SearchBarSet from "../../component/SearchBarSet";
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
  const [scheduleType, setScheduleType] = useState<ScheduleType>("weekly");
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1]);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  const [settingList, setSettingList] = useState<Setting[]>([]);
  const [filteredRows, setFilteredRows] = useState<Setting[]>([]);

  useEffect(() => {
    fetchSettingList();

    // 전달받은 데이터로 폼 초기화
    if (row) {
      setSettingId(row.settingId);
      setStartDate(row.startDate);
      setEndDate(row.endDate);

      // Cron 표현식 파싱하여 폼 값 설정
      const cronConfig = parseCronExpression(row.cronExpression);
      if (cronConfig) {
        setScheduleType(cronConfig.type);
        setHour(cronConfig.hour);
        setMinute(cronConfig.minute);
        setSelectedDays(cronConfig.daysOfWeek);
      }
    }
  }, [row]);

  const fetchSettingList = async () => {
    try {
      const data = await getSettings();
      setSettingList(data);
      setFilteredRows(data);
    } catch (error) {
      console.error("Failed to fetch setting list:", error);
    }
  };

  // 데이터 설정 테이블 컬럼 정의
  const settingColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "settingName",
      headerName: "데이터수집명",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "url",
      headerName: "URL",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "userAgent",
      headerName: "USER-AGENT",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
  ];

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

  const scheduleTypeList = [
    { value: "weekly", name: "매주" },
    { value: "1st-week", name: "첫번째 주" },
    { value: "2nd-week", name: "두번째 주" },
    { value: "3rd-week", name: "세번째 주" },
    { value: "4th-week", name: "네번째 주" },
    { value: "last-week", name: "마지막 주" },
  ];

  const dayOfWeekNames = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  const hourList = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    name: `${i}시`,
  }));

  const minuteList = [
    { value: 0, name: "00분" },
    { value: 10, name: "10분" },
    { value: 20, name: "20분" },
    { value: 30, name: "30분" },
    { value: 40, name: "40분" },
    { value: 50, name: "50분" },
  ];

  const handleDayToggle = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const previewCron = () => {
    try {
      const cronExpression = generateCronExpression({
        type: scheduleType,
        hour,
        minute,
        daysOfWeek: selectedDays,
      });
      return `${formatCronToKorean(cronExpression)} ${hour}시 ${minute}분`;
    } catch {
      return "올바른 값을 입력해주세요";
    }
  };

  const handleEdit = async () => {
    if (!row) return;

    try {
      const cronExpression = generateCronExpression({
        type: scheduleType,
        hour,
        minute,
        daysOfWeek: selectedDays,
      });

      const requestData: Partial<CreateScheduleRequest> = {
        settingId: settingId as number,
        startDate,
        endDate,
        cronExpression,
      };

      await updateSchedule(row.id, requestData);
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
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 4,
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
            스케줄 설정
          </Typography>
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#f9f3ecff",
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
                sx={{ width: "150px", textAlign: "left", fontSize: 25 }}
              >
                수집 기간 :
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <CustomTextField
                  height="50px"
                  value={startDate}
                  inputWidth="280px"
                  type="date"
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Typography sx={{ fontSize: 20 }}>~</Typography>
                <CustomTextField
                  height="50px"
                  value={endDate}
                  inputWidth="280px"
                  type="date"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Box>
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
                sx={{ width: "150px", textAlign: "left", fontSize: 25 }}
              >
                수집 주기 :
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <CustomSelect
                  inputWidth="150px"
                  height="50px"
                  value={scheduleType}
                  listItem={scheduleTypeList}
                  onChange={(e) => {
                    setScheduleType(e.target.value as ScheduleType);
                    setSelectedDays([1]);
                  }}
                />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <FormGroup row>
                    {dayOfWeekNames.map((name, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={selectedDays.includes(index as DayOfWeek)}
                            onChange={() => handleDayToggle(index as DayOfWeek)}
                            sx={{
                              color: "gray",
                              "&.Mui-checked": {
                                color: "#F5A623",
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
                  sx={{ width: "150px", textAlign: "left", fontSize: 25 }}
                >
                  수집 시간 :
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <CustomSelect
                    inputWidth="120px"
                    height="50px"
                    value={hour}
                    listItem={hourList}
                    onChange={(e) => setHour(e.target.value as number)}
                  />
                  <CustomSelect
                    inputWidth="120px"
                    height="50px"
                    value={minute}
                    listItem={minuteList}
                    onChange={(e) => setMinute(e.target.value as number)}
                  />
                </Box>
              </Box>

              {/* 미리보기 */}
              <Box
                className="미리보기"
                sx={{
                  padding: 2,
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
                baseRows={settingList}
                setFilteredRows={setFilteredRows}
                showSearchType={true}
                searchCategories={getSettingSearchCategory()}
                showKeyword={true}
              ></SearchBarSet>
            </Box>
            <CommonTable
              columns={settingColumns}
              rows={filteredRows}
              onRowClick={handleSettingRowClick}
              selectedRows={settingId ? [{ id: settingId }] : []}
              height={300}
            />
          </Box>
        </Paper>
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
