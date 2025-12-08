import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemText,
} from "@mui/material";
import CommonTable from "../../component/CommonTable";
import {
  getColumns,
  type HistoryTableRows,
} from "../../Types/TableHeaders/HistoryHeader";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import CustomTextField from "../../component/CustomTextField";
import CustomIconButton from "../../component/CustomIconButton";
import { getHistoryAll, getHistoryResult } from "../../API/05_HistoryApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function History() {
  const navigate = useNavigate();
  const [baseRows, setBaseRows] = useState<HistoryTableRows[]>([]);
  const [filteredRows, setFilteredRows] = useState<HistoryTableRows[]>([]);

  const [filterType, setFilterType] = useState("all"); // 라디오 선택값 상태
  const [searchStartAt, setSearchStartAt] = useState<Dayjs | null>(null);
  const [searchEndAt, setSearchEndAt] = useState<Dayjs | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchCount, setSearchCount] = useState(0);

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

  const getTableDatas = async () => {
    // const data = [
    //   {
    //     id: 1,
    //     index: 1,
    //     settingId: 1,
    //     settingName: "창원시청 공지사항 수집",
    //     state: "진행중",
    //     startAt: "2025-10-24 09:00",
    //     startDate: "2025-10-23",
    //     endDate: "2025-11-23",
    //     cronExpression: "0 0 9 ? * MON,TUE,WED",
    //     type: "스케줄링",
    //   },
    //   {
    //     id: 2,
    //     index: 2,
    //     settingId: 1,
    //     settingName: "창원시청 공지사항 수집",
    //     state: "수집완료(수집실패: 5건)",
    //     startAt: "2025-10-24 09:00",
    //     endAt: "2025-10-24 09:43",
    //     startDate: "2025-10-23",
    //     endDate: "2025-11-23",
    //     cronExpression: "0 0 9 ? * LTHU",
    //     type: "스케줄링",
    //   },
    //   {
    //     id: 3,
    //     index: 3,
    //     settingId: 3,
    //     settingName: "경상남도 보도자료 수집",
    //     userId: 1,
    //     loginId: "ksis1",
    //     state: "수집완료",
    //     startAt: "2025-10-22 15:23",
    //     endAt: "2025-10-22 16:00",
    //     type: "수동실행",
    //   },
    // ];

    const data = await getHistoryAll()

    const res = data.map((row: HistoryTableRows, i: number) => {
      let cycle = "";
      if (row.cronExpression) {
        const { week, day } = parseCronWeekDay(row.cronExpression);
        cycle = `${week} ${day}`.trim();
      }

      const period =
        row.startDate && row.endDate
          ? `${row.startDate} ~ ${row.endDate}`
          : "";

      return {
        ...row,
        cycle,
        period,
        index: i+1,
        id: row.workId,
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
    navigate(`/history/detail/${row.id}`, { state: { rowData: row } });
    // 현재 행의 상세조회
  };

  // =========================
  // 공통 다운로드 함수
  // =========================
  const downloadFile = (data: BlobPart, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  // =========================
  // JSON 내보내기
  // =========================
  const exportJSON = (jsonData: any, filename: string) => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonString, filename + ".json", "application/json");
  };

  // =========================
  // CSV 내보내기
  // =========================
  const exportCSV = (jsonData: any, filename: string) => {
    const arr = Array.isArray(jsonData) ? jsonData : [jsonData];
    const headers = Object.keys(arr[0]).join(",");

    const rows = arr
      .map((row) => Object.values(row).join(","))
      .join("\n");

    const csv = headers + "\n" + rows;
    downloadFile(csv, filename + ".csv", "text/csv;charset=utf-8;");
  };

  // =========================
  // Excel(xlsx) 내보내기
  // =========================

  const exportExcel = (jsonData: any, filename: string) => {
    const arr = Array.isArray(jsonData) ? jsonData : [jsonData];
    const worksheet = XLSX.utils.json_to_sheet(arr);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, filename + ".xlsx");
  };

  // =========================
  // value 배열을 단일 객체로 평탄화
  // =========================
  const flattenResult = (rows: any[]) => {
  return rows.map(item => {
    // JSON 문자열인 resultValue를 파싱
    let parsedValue;
    try {
      parsedValue = JSON.parse(item.resultValue);
    } catch (e) {
      parsedValue = [];
      console.error("result_value JSON parse error", e);
    }

    // parsedValue가 배열이 아닐 수도 있으니 배열인지 체크
    const valueArray = Array.isArray(parsedValue) ? parsedValue : [parsedValue];

    const flat = valueArray.reduce((acc: any, obj: any) => {
      // obj가 객체인지 확인
      if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, val]) => {
          acc[key] = val;
        });
      }
      return acc;
    }, {});

    return {
      seq: item.seq,
      page_url: item.pageUrl,
      ...flat
    };
  });
};
  

  

  const handleInputChange = (value: string) => {
    setSearchName(value);
  };

  const handleSearch = (forceType?: string) => {
    let filtered = [...baseRows];

    const typeToUse = forceType ?? filterType;

    if (searchStartAt && searchEndAt === null) {
      filtered = filtered.filter((row) => {
        const startDate = searchStartAt?.format("YYYY-MM-DD");
        const rowStartDate = row.startAt.slice(0, 10);
        return rowStartDate >= startDate;
      });
    } else if (searchEndAt && searchStartAt === null) {
      filtered = filtered.filter((row) => {
        const endDate = searchEndAt?.format("YYYY-MM-DD");
        const rowEndDate = row.endAt ? row.endAt.slice(0, 10) : null;
        if (rowEndDate) return rowEndDate <= endDate;
      });
    } else if (searchStartAt && searchEndAt) {
      filtered = filtered.filter((row) => {
        const startDate = searchStartAt?.format("YYYY-MM-DD");
        const rowStartDate = row.startAt.slice(0, 10);
        const endDate = searchEndAt?.format("YYYY-MM-DD");
        const rowEndDate = row.endAt ? row.endAt.slice(0, 10) : null;

        if (rowEndDate) {
          return rowStartDate >= startDate && rowEndDate <= endDate;
        }
      });
    }

    if (searchName.trim() !== "") {
      filtered = filtered.filter((row) =>
        row.settingName?.includes(searchName.trimEnd())
      );
    }

    if (typeToUse !== "all") {
      filtered = filtered.filter((row) => row.type === typeToUse);
    }

    setFilteredRows(filtered);
    setSearchCount(filtered.length);
  };
  const handleReset = () => {
    setSearchStartAt(null);
    setSearchEndAt(null);
    setSearchName("");
    setFilteredRows(baseRows);
    setFilterType("all");
    setSearchCount(0);
  };

  // 라디오 선택 변경시 호출될 함수
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterType(value);

    handleSearch(value);
  };

  const handleExport = (row: HistoryTableRows, event?: any) => {
    setExportRow(row);
    setExportAnchor(event.currentTarget); // 클릭한 아이콘 위치에 메뉴 뜨게
  };

  const getExportData = async () => {
      if (!exportRow) return [];
      const result = await getHistoryResult(Number(exportRow.id))

      const targets = result.filter((r:any) => r.workId === exportRow.id);
      return flattenResult(targets); // 평탄화된 형태로 반환
    };

  const handleExport_Excel = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportExcel(exportData, `${exportRow.settingName}(${new Date().toLocaleString().slice(0,12)})_수집이력`);
  };
  const handleExport_CSV = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportCSV(exportData, `${exportRow.settingName}(${new Date().toLocaleString().slice(0,12)})_수집이력`);
  };
  const handleExport_Json = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportJSON(exportData, `${exportRow.settingName}(${new Date().toLocaleString().slice(0,12)})_수집이력`);
  };

  const columns = getColumns({ handleDetailView, handleExport });

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

      <Box
        sx={{
          bgcolor: "#f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          height: 80,
        }}
      >
        {/* Search Count */}
        <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
          {searchCount > 0 ? (
            <Typography sx={{ color: "black", fontWeight: 700 }}>
              검색결과 : {searchCount} 건 입니다.
            </Typography>
          ) : (
            <></>
          )}
        </Box>
        {/* Search */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="시작일자"
              format="YYYY-MM-DD"
              value={searchStartAt}
              onChange={(newValue) => setSearchStartAt(newValue)}
            />
            <DatePicker
              label="종료일자"
              format="YYYY-MM-DD"
              value={searchEndAt}
              onChange={(newValue) => setSearchEndAt(newValue)}
            />
          </LocalizationProvider>
          <CustomTextField
            value={searchName}
            height="56px"
            inputWidth="300px"
            placeholder="수집명"
            type="text"
            onChange={(e) => handleInputChange(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <CustomIconButton
                  icon="search"
                  width="20px"
                  height="20px"
                  color="gray"
                  onClick={() => handleSearch()}
                />
                <CustomIconButton
                  icon="reset"
                  width="20px"
                  height="20px"
                  color="gray"
                  onClick={handleReset}
                />
              </InputAdornment>
            }
          />
        </Box>
      </Box>
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
