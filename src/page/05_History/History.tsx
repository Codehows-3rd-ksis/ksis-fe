import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemText,
} from "@mui/material";
import CommonTable from "../../component/CommonTable";
import {
  getColumns,
  type HistoryTableRows,
} from "../../Types/TableHeaders/HistoryHeader";
import SearchBarSet, {
  type SearchConditions,
} from "../../component/SearchBarSet";

export default function History() {
  const navigate = useNavigate();
  const [baseRows, setBaseRows] = useState<HistoryTableRows[]>([]);
  const [filteredRows, setFilteredRows] = useState<HistoryTableRows[]>([]);

  const [filterType, setFilterType] = useState("all"); // 라디오 선택값 상태
  const [searchConditions, setSearchConditions] = useState<SearchConditions>({
    startDate: null,
    endDate: null,
    keyword: "",
  });

  // 메뉴 anchor
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  // 내보내기 대상 row
  const [exportRow, setExportRow] = useState<HistoryTableRows | null>(null);

  useEffect(() => {
    getTableDatas();
  }, []);

  const DAY_MAP: any = {
    MON: "월요일",
    TUE: "화요일",
    WED: "수요일",
    THU: "목요일",
    FRI: "금요일",
    SAT: "토요일",
    SUN: "일요일",
  };

  const WEEK_INDEX_MAP: any = {
    1: "첫번째",
    2: "두번째",
    3: "세번째",
    4: "네번째",
  };

  function parseCronWeekDay(cron: string) {
    if (!cron) return { week: "", day: "" };

    const f = cron.split(" ");
    const dayOfWeekField = f[5]; // 예: MON, MON,TUE,WED, 1#MON, LFRI

    // 1) "마지막주" 또는 "1#MON" 등 개별 표현 판별
    const isLastWeek = dayOfWeekField.includes("L");
    const isNthWeek = dayOfWeekField.includes("#");

    if (isLastWeek || isNthWeek) {
      // 단일 요일 기준으로 처리 (콤마 있는 경우 예외처리 필요하면 별도)
      // 콤마가 있을 경우는 복수 요일 표현 불가하므로 간단 처리
      if (dayOfWeekField.includes(",")) {
        // 여러개가 섞인 경우가 드물지만 있다면 첫번째만 처리
        const parts = dayOfWeekField.split(",");
        const part = parts[0];

        if (part.startsWith("L")) {
          const dow = part.substring(1);
          return { week: "마지막", day: DAY_MAP[dow] || "" };
        }
        if (part.includes("#")) {
          const [weekIdx, dow] = part.split("#");
          return {
            week: WEEK_INDEX_MAP[Number(weekIdx)] || "",
            day: DAY_MAP[dow] || "",
          };
        }
      } else {
        // 단일 표현 처리
        if (dayOfWeekField.startsWith("L")) {
          const dow = dayOfWeekField.substring(1);
          return { week: "마지막", day: DAY_MAP[dow] || "" };
        }
        if (dayOfWeekField.includes("#")) {
          const [weekIdx, dow] = dayOfWeekField.split("#");
          return {
            week: WEEK_INDEX_MAP[Number(weekIdx)] || "",
            day: DAY_MAP[dow] || "",
          };
        }
      }
    } else {
      // 매주인 경우, 요일 복수 가능, 콤마로 분리해서 배열로 만들기
      const dayParts = dayOfWeekField.split(",");
      const days = dayParts
        .map((d) => DAY_MAP[d] || "")
        .filter((d) => d !== "");
      return {
        week: "매주",
        day: days.join(", "),
      };
    }

    // 기본 반환
    return { week: "", day: "" };
  }

  const getTableDatas = () => {
    const data = [
      {
        id: 1,
        index: 1,
        settingId: 1,
        settingName: "창원시청 공지사항 수집",
        state: "진행중",
        startAt: "2025-10-24 09:00",
        startDate: "2025-10-23",
        endDate: "2025-11-23",
        cronExpression: "0 0 9 ? * MON,TUE,WED",
        type: "스케줄링",
      },
      {
        id: 2,
        index: 2,
        settingId: 1,
        settingName: "창원시청 공지사항 수집",
        state: "수집완료(수집실패: 5건)",
        startAt: "2025-10-24 09:00",
        endAt: "2025-10-24 09:43",
        startDate: "2025-10-23",
        endDate: "2025-11-23",
        cronExpression: "0 0 9 ? * LTHU",
        type: "스케줄링",
      },
      {
        id: 3,
        index: 3,
        settingId: 3,
        settingName: "경상남도 보도자료 수집",
        userId: 1,
        loginId: "ksis1",
        state: "수집완료",
        startAt: "2025-10-22 15:23",
        endAt: "2025-10-22 16:00",
        type: "수동실행",
      },
    ];

    const res = data.map((item) => {
      let cycle = "";
      if (item.cronExpression) {
        const { week, day } = parseCronWeekDay(item.cronExpression);
        cycle = `${week} ${day}`.trim();
      }

      const period =
        item.startDate && item.endDate
          ? `${item.startDate} ~ ${item.endDate}`
          : "";

      return {
        ...item,
        cycle,
        period,
      };
    });

    setBaseRows(res);
    setFilteredRows(res);
  };

  //  /**  Table Handlers */

  //     const handleDetailOpen = (row: StatusTableRows) => {
  //         navigate(`/status/detail/${row.id}`, { state: { rowData: row } })
  //     }

  //   const handleStopCrawl = (row: StatusTableRows) => {
  //     console.log('수집 중지:', row.settingName)
  //     // TODO: 실제 수집 중지 API 호출
  //     alert(`${row.settingName} 수집을 중지합니다.`)
  //   }

  //   const columns = getColumns({ handleDetailOpen, handleStopCrawl });

  //   return (
  //     <Box sx={{ height: '97%'}}>
  //         <Typography sx={{fontSize: 60, fontWeight: 'bold', color: 'black', paddingLeft: 2, marginTop: 5}}>
  //           수집 현황
  //         </Typography>

  //         {/* 테이블 영역 */}
  //         <Box sx={{padding: 2}}>
  //             <CommonTable columns={columns} rows={filteredRows} />
  //         </Box>

  //     </Box>
  //   )
  // }

  const handleDetailView = (row: HistoryTableRows) => {
    console.log("row", row);
    navigate(`/history/detail/${row.id}`, { state: { rowData: row } });
    // 현재 행의 상세조회
  };
  const handleExport = (row: HistoryTableRows, event?: any) => {
    setExportRow(row);
    setExportAnchor(event.currentTarget); // 클릭한 아이콘 위치에 메뉴 뜨게
  };

  const columns = getColumns({ handleDetailView, handleExport });

  // 공통 필터링 함수
  const applyFilters = (
    conditions: SearchConditions,
    typeFilter: string = filterType
  ) => {
    let filtered = [...baseRows];

    // 날짜 범위 필터링 (startAt 기준)
    if (conditions.startDate && !conditions.endDate) {
      filtered = filtered.filter((row) => {
        const rowStartDate = row.startAt.slice(0, 10);
        return rowStartDate >= conditions.startDate!;
      });
    } else if (!conditions.startDate && conditions.endDate) {
      filtered = filtered.filter((row) => {
        const rowStartDate = row.startAt.slice(0, 10);
        return rowStartDate <= conditions.endDate!;
      });
    } else if (conditions.startDate && conditions.endDate) {
      filtered = filtered.filter((row) => {
        const rowStartDate = row.startAt.slice(0, 10);
        return (
          rowStartDate >= conditions.startDate! &&
          rowStartDate <= conditions.endDate!
        );
      });
    }

    // 키워드 필터링 (settingName으로 검색)
    if (conditions.keyword && conditions.keyword.trim() !== "") {
      filtered = filtered.filter((row) =>
        row.settingName?.toLowerCase().includes(conditions.keyword!.toLowerCase())
      );
    }

    // 라디오 타입 필터링
    if (typeFilter !== "all") {
      filtered = filtered.filter((row) => row.type === typeFilter);
    }

    setFilteredRows(filtered);
  };

  const handleSearch = (conditions: SearchConditions) => {
    setSearchConditions(conditions); // 검색 조건 저장
    applyFilters(conditions);
  };

  // 라디오 선택 변경시 호출될 함수
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterType(value);

    // 현재 검색 조건을 유지하면서 타입만 변경하여 재검색
    applyFilters(searchConditions, value);
  };

  const handleExport_Excel = () => {
    console.log("엑셀로 내보내기", exportRow);
  };
  const handleExport_CSV = () => {
    console.log("CSV로 내보내기");
  };
  const handleExport_Json = () => {
    console.log("Json로 내보내기");
  };

  return (
    <Box sx={{ height: "97%" }}>
      {/* <Box sx={{ bgcolor: '#FFC98B', height: '120px', borderRadius: '10px 10px 0px 0px', display: 'flex', alignItems: 'center'}}>
            </Box> */}
      <Typography
        sx={{
          fontSize: 60,
          fontWeight: "bold",
          color: "black",
          paddingLeft: 2,
          marginTop: 5,
        }}
      >
        데이터 수집이력
      </Typography>

      {/* SearchBarSet */}
      <SearchBarSet
        showDateRange={true}
        showKeyword={true}
        showCount={true}
        count={filteredRows.length}
        onSearch={handleSearch}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {/* RadioBtn */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", paddingRight: 1 }}
        >
          <FormControl>
            <RadioGroup
              row
              value={filterType}
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
        <CommonTable columns={columns} rows={filteredRows} />
      </Box>

      {/* 내보내기 */}
      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setExportAnchor(null);
            handleExport_Excel();
          }}
        >
          <ListItemText>엑셀(xlsx)</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setExportAnchor(null);
            handleExport_CSV();
          }}
        >
          <ListItemText>CSV</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setExportAnchor(null);
            handleExport_Json();
          }}
        >
          <ListItemText>JSON</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
