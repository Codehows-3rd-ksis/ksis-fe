import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import CommonTable from "../../component/CommonTable";
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
import {
  getColumns,
  type SchedulerTableRows,
} from "../../Types/TableHeaders/SchedulerHeader";
import { useNavigate } from "react-router-dom";
import { getSchedulerSearchCategory } from "../../Types/Search";
import Alert from "../../component/Alert";

export default function Scheduler() {
  const navigate = useNavigate();
  const [baseRows, setBaseRows] = useState<SchedulerTableRows[]>([]);
  const [filteredRows, setFilteredRows] = useState<SchedulerTableRows[]>([]);
  const [selectedRow, setSelectedRow] = useState<SchedulerTableRows | null>(
    null
  );

  // Alert
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [openDelDoneAlert, setOpenDelDoneAlert] = useState(false);

  useEffect(() => {
    // Mock data for the scheduler
    const data: SchedulerTableRows[] = [
      {
        id: 1,
        settingName: "창원시청 공지사항 수집",
        startAt: "2025-10-24 09:00",
        period: "2025-10-23 ~ 2025-11-23",
        cycle: "매주 월,수,금",
      },
      {
        id: 2,
        settingName: "정기 뉴스레터 발송",
        startAt: "2025-11-01 10:00",
        period: "2025-11-01 ~ 2025-12-31",
        cycle: "매월 1일",
      },
      {
        id: 3,
        settingName: "데이터베이스 백업",
        startAt: "2025-09-01 02:00",
        period: "2025-09-01 ~ 2025-12-01",
        cycle: "매일 02시",
      },
    ];
    setBaseRows(data);
    setFilteredRows(data);
  }, []);

  // const BoardRefresh = async () => {
  //   const data = await getSchedulers();  // API 호출
  //   setBaseRows(data);
  //   setFilteredRows(data);
  // };

  /**  수정 페이지  =========================================== */
  const handleEditOpen = (row: SchedulerTableRows) => {
    console.log("Edit scheduler with ID:", row.id);
    navigate(`/scheduler/edit/${row.id}`);
  };

  /**  삭제 팝업  =========================================== */
  const handleDeleteOpen = (row: SchedulerTableRows) => {
    setSelectedRow(row);
    setOpenDeleteAlert(true);
  };

  const handleDelete = () => {
    if (!selectedRow) return;

    console.log("Delete scheduler with ID:", selectedRow.id);
    // API 연결 시 deleteScheduler(selectedRow.id) 호출

    setFilteredRows((prevRows) =>
      prevRows.filter((row) => row.id !== selectedRow.id)
    );
    setBaseRows((prevRows) =>
      prevRows.filter((row) => row.id !== selectedRow.id)
    );

    // 삭제완료 팝업
    setOpenDelDoneAlert(true);
  };

  //** 검색 ================================================== */
  const handleSearch = (conditions: SearchConditions) => {
    // 모든 조건이 비어있으면 빈 배열
    if (!conditions.startDate && !conditions.endDate && !conditions.keyword) {
      setFilteredRows([]);
      return;
    }

    //   // 조건 없으면 검색 막기
    //   if (!conditions.startDate &&
    // !conditions.endDate &&
    // !conditions.keyword?.trim()) {
    //     alert("검색 조건을 입력해주세요.");
    //     return;
    //   }

    let filtered = [...baseRows];

    // 날짜 범위 필터링
    if (conditions.startDate) {
      filtered = filtered.filter((row) => {
        const rowDate = row.startAt.split(" ")[0];
        return rowDate >= conditions.startDate!;
      });
    }
    if (conditions.endDate) {
      filtered = filtered.filter((row) => {
        const rowDate = row.startAt.split(" ")[0];
        return rowDate <= conditions.endDate!;
      });
    }

    // 키워드 필터링 (type에 따라 검색 필드 결정)
    if (conditions.keyword) {
      filtered = filtered.filter((row) => {
        const searchType = conditions.type || "all";
        const keyword = conditions.keyword!.toLowerCase();

        if (searchType === "all") {
          // 전체: 모든 필드에서 검색
          return (
            row.settingName.toLowerCase().includes(keyword) ||
            row.cycle.toLowerCase().includes(keyword) ||
            row.startAt.toLowerCase().includes(keyword)
          );
        } else {
          // 특정 필드만 검색
          const fieldValue = row[searchType as keyof SchedulerTableRows];
          return (
            fieldValue?.toString().toLowerCase().includes(keyword) || false
          );
        }
      });
    }

    setFilteredRows(filtered);
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
          // justifyContent: "center",
        }}
      >
        <SearchBarSet
          showDateRange={true}
          showKeyword={true}
          showSearchType={true}
          showCount={true}
          count={filteredRows.length}
          getSearchCategory={getSchedulerSearchCategory}
          showButton={true}
          buttonLabel="스케줄 등록"
          buttonWidth="100px"
          onButtonClick={() => navigate("/scheduler/reg")}
          onSearch={handleSearch}
        />

        <Box sx={{ mt: 2 }}>
          <CommonTable columns={columns} rows={filteredRows}/>
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
          // BoardRefresh();
        }}
      />
    </Box>
  );
}
