import { useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import PaginationServerTable from "../../component/PaginationServerTable";
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
import {
  getColumns,
  type SchedulerTableRows,
} from "../../Types/TableHeaders/SchedulerHeader";
import { useNavigate } from "react-router-dom";
import { getSchedulerSearchCategory } from "../../Types/Search";
import Alert from "../../component/Alert";
import {
  parseTimeCron,
  formatScheduleToKorean,
  type DayOfWeekEN,
} from "../../utils/cronUtils";
import { getSchedules, deleteSchedule, type Schedule } from "../../API/04_SchedulerApi";

export default function Scheduler() {
  const navigate = useNavigate();
  const [isSearched, setIsSearched] = useState(false);

  // Table
  const [rows, setRows] = useState<SchedulerTableRows[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchState, setSearchState] = useState({
    startDate: "",
    endDate: "",
    type: "all",
    keyword: "",
    page: 0,
    size: 10,
  });
  const [selectedRow, setSelectedRow] = useState<SchedulerTableRows | null>(null);

  // Alert
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [openDelDoneAlert, setOpenDelDoneAlert] = useState(false);

  // 데이터 조회
  const fetchSchedulerList = useCallback(async () => {
    try {
      const { startDate, endDate, type, keyword, page, size } = searchState;
      const response = await getSchedules(startDate, endDate, type, keyword, page, size);

      const data: SchedulerTableRows[] = response.content.map((item: Schedule) => {
        const time = parseTimeCron(item.cronExpression);
        const daysArray = item.daysOfWeek.split(",") as DayOfWeekEN[];
        return {
          id: item.scheduleId,
          scheduleId: item.scheduleId,
          settingName: item.settingName,
          settingId: item.settingId,
          userId: item.userId,
          startDate: item.startDate,
          endDate: item.endDate,
          cronExpression: item.cronExpression,
          daysOfWeek: item.daysOfWeek,
          weekOfMonth: item.weekOfMonth,
          createAt: item.createAt,
          updateAt: item.updateAt,
          startAt: time
            ? `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`
            : "",
          period: `${item.startDate} ~ ${item.endDate}`,
          cycle: formatScheduleToKorean(daysArray, item.weekOfMonth),
        };
      });

      setRows(data);
      setTotalCount(response.totalElements);
    } catch (error) {
      console.error("Failed to fetch scheduler list:", error);
    }
  }, [searchState]);

  useEffect(() => {
    fetchSchedulerList();
  }, [fetchSchedulerList]);

  // 검색
  const handleSearch = (conditions: SearchConditions) => {
    setIsSearched(true);
    setSearchState((prev) => ({
      ...prev,
      startDate: conditions.startDate ?? "",
      endDate: conditions.endDate ?? "",
      type: conditions.type ?? "all",
      keyword: conditions.keyword ?? "",
      page: 0, // 검색 시 첫 페이지로
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

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    setSearchState((prev) => ({ ...prev, page: newPage }));
  };

  /**  수정 페이지  =========================================== */
  const handleEditOpen = (row: SchedulerTableRows) => {
    console.log("Edit scheduler with ID:", row.id);
    navigate("/scheduler/edit", { state: { row } });
  };

  /**  삭제 팝업  =========================================== */
  const handleDeleteOpen = (row: SchedulerTableRows) => {
    setSelectedRow(row);
    setOpenDeleteAlert(true);
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    try {
      await deleteSchedule(selectedRow.scheduleId);
      setOpenDelDoneAlert(true);
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("스케줄 삭제에 실패했습니다.");
    }
  };

  const columns = getColumns({ handleEditOpen, handleDeleteOpen });

  return (
    <Box sx={{ height: "97%" }}>
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: 20,
          marginBottom: 5,
        }}
      >
        스케줄러 관리
      </Typography>

      <Box
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <SearchBarSet
          value={searchState}
          onSearch={handleSearch}
          onReset={handleReset}
          totalCount={totalCount}
          showDateRange={true}
          showKeyword={true}
          showSearchType={true}
          showCount={isSearched}
          searchCategories={getSchedulerSearchCategory()}
          showButton={true}
          buttonLabel="스케줄 등록"
          buttonWidth="100px"
          onButtonClick={() => navigate("/scheduler/reg")}
        />

        <Box sx={{ mt: 10 }}>
          <PaginationServerTable
            columns={columns}
            rows={rows}
            page={searchState.page}
            pageSize={searchState.size}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </Box>
      </Box>

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
          fetchSchedulerList();
        }}
      />
    </Box>
  );
}
