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
// Table
import CommonTable from "../../component/CommonTable";
import {
  getColumns,
  type HistoryTableRows,
} from "../../Types/TableHeaders/HistoryHeader";
// Comp
import Alert from '../../component/Alert';
import LoadingProgress from "../../component/LoadingProgress";
// Search
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
// Api
import { getHistory, getHistoryResult } from "../../API/05_HistoryApi";
// Export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type HistorySearchState = {
  startDate: string | null;
  endDate: string | null;
  type: string;
  keyword: string;
  page: number;
  size: number;
};

export default function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [isSearched, setIsSearched] = useState(false);
  // Table
  const [totalCount, setTotalCount] = useState(0)
  const [searchState, setSearchState] = useState<HistorySearchState>({
    startDate: '',
    endDate: '',
    type: 'all',
    keyword: '',
    page: 0,
    size: 10,
  });
  const [baseRows, setBaseRows] = useState<HistoryTableRows[]>([]);

  // 메뉴 anchor
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  // 내보내기 대상 row
  const [exportRow, setExportRow] = useState<HistoryTableRows | null>(null);
  // Alert
  const [openErrorAlert, setOpenErrorAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // const DAY_MAP: any = {
  //   MON: "월요일",
  //   TUE: "화요일",
  //   WED: "수요일",
  //   THU: "목요일",
  //   FRI: "금요일",
  //   SAT: "토요일",
  //   SUN: "일요일",
  // };

  // const WEEK_INDEX_MAP: any = {
  //   1: "첫번째",
  //   2: "두번째",
  //   3: "세번째",
  //   4: "네번째",
  // };

  // function parseCronWeekDay(cron: string) {
  //   if (!cron) return { week: "", day: "" };

  //   const f = cron.split(" ");
  //   const dayOfWeekField = f[5]; // 예: MON, MON,TUE,WED, 1#MON, LFRI

  //   // 1) "마지막주" 또는 "1#MON" 등 개별 표현 판별
  //   const isLastWeek = dayOfWeekField.includes("L");
  //   const isNthWeek = dayOfWeekField.includes("#");

  //   if (isLastWeek || isNthWeek) {
  //     // 단일 요일 기준으로 처리 (콤마 있는 경우 예외처리 필요하면 별도)
  //     // 콤마가 있을 경우는 복수 요일 표현 불가하므로 간단 처리
  //     if (dayOfWeekField.includes(",")) {
  //       // 여러개가 섞인 경우가 드물지만 있다면 첫번째만 처리
  //       const parts = dayOfWeekField.split(",");
  //       const part = parts[0];

  //       if (part.startsWith("L")) {
  //         const dow = part.substring(1);
  //         return { week: "마지막", day: DAY_MAP[dow] || "" };
  //       }
  //       if (part.includes("#")) {
  //         const [weekIdx, dow] = part.split("#");
  //         return {
  //           week: WEEK_INDEX_MAP[Number(weekIdx)] || "",
  //           day: DAY_MAP[dow] || "",
  //         };
  //       }
  //     } else {
  //       // 단일 표현 처리
  //       if (dayOfWeekField.startsWith("L")) {
  //         const dow = dayOfWeekField.substring(1);
  //         return { week: "마지막", day: DAY_MAP[dow] || "" };
  //       }
  //       if (dayOfWeekField.includes("#")) {
  //         const [weekIdx, dow] = dayOfWeekField.split("#");
  //         return {
  //           week: WEEK_INDEX_MAP[Number(weekIdx)] || "",
  //           day: DAY_MAP[dow] || "",
  //         };
  //       }
  //     }
  //   } else {
  //     // 매주인 경우, 요일 복수 가능, 콤마로 분리해서 배열로 만들기
  //     const dayParts = dayOfWeekField.split(",");
  //     const days = dayParts
  //       .map((d) => DAY_MAP[d] || "")
  //       .filter((d) => d !== "");
  //     return {
  //       week: "매주",
  //       day: days.join(", "),
  //     };
  //   }

  //   // 기본 반환
  //   return { week: "", day: "" };
  // }

  const getTableDatas = async () => {
    try {
      setLoading(true)
      const { startDate, endDate, type, keyword, page, size } = searchState
      
      const res = await getHistory(
        startDate ?? '',
        endDate ?? '',
        type,
        keyword,
        page, 
        size
      )
      
      const result = res.content.map((row: HistoryTableRows, i: number) => ({
        ...row,
        id: row.workId,
        index: page * size + i + 1, // 🔥 전체 기준 index
      }))

      setBaseRows(result);
      setTotalCount(res.totalElements)
      setLoading(false)
    }
    catch(err) {
      console.error(err)
      setErrorMsg("유저이력 조회 실패")
      setOpenErrorAlert(true)
      setLoading(false)
    }
    
  };

  useEffect(()=> {
    getTableDatas();
  }, [searchState])

  const handleSearch = (conditions: SearchConditions) => {
    setIsSearched(true)
    setSearchState(prev => ({
      ...prev,
      ...conditions,
      page: 0,
    }));
  };
  const handleReset = () => {
    setIsSearched(false)
    setSearchState({
      startDate: '',
      endDate: '',
      type: 'all',
      keyword: '',
      page: 0,
      size: 10,
    })
  }
  // 라디오 선택 변경시 호출될 함수
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setIsSearched(true);
    setSearchState(prev => ({
      ...prev,
      type: value,
      page: 0,
    }));
  };

  const handleDetailView = (row: HistoryTableRows) => {
    navigate(`/history/detail/${row.id}`, { state: { rowData: row } });
    // 현재 행의 상세조회
  };

  const downloadFile = (data: BlobPart, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };
  const exportJSON = (jsonData: any, filename: string) => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonString, filename + ".json", "application/json");
  };
  const exportCSV = (jsonData: any, filename: string) => {
    const arr = Array.isArray(jsonData) ? jsonData : [jsonData];
    const headers = Object.keys(arr[0]).join(",");

    const rows = arr
      .map((row) => Object.values(row).join(","))
      .join("\n");

    const csv = headers + "\n" + rows;
    downloadFile(csv, filename + ".csv", "text/csv;charset=utf-8;");
  };
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

      <Box sx={{padding: 2}}>
        <SearchBarSet
          value={{
            type: searchState.type,
            keyword: searchState.keyword,
            startDate: searchState.startDate,
            endDate: searchState.endDate
          }}
          totalCount={totalCount}
          showDateRange={true}
          showKeyword={true}
          showSearchType={false}
          showCount={isSearched}
          onSearch={handleSearch}
          onReset={handleReset}
          showButton={false}
        />
      </Box>
      
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {/* RadioBtn */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", paddingRight: 1 }}
        >
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
        <CommonTable 
            columns={columns} 
            rows={baseRows} 
            page={searchState.page}
            pageSize={searchState.size}
            totalCount={totalCount}

            onPageChange={(newPage: number) => {
              setSearchState(prev => ({
                ...prev,
                page: newPage,
              }))
            }}
        />
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


// const data = await getHistory()

//       const res = data.map((row: HistoryTableRows, i: number) => {
//         let cycle = "";
//         if (row.cronExpression) {
//           const { week, day } = parseCronWeekDay(row.cronExpression);
//           cycle = `${week} ${day}`.trim();
//         }

//         const period =
//           row.startDate && row.endDate
//             ? `${row.startDate} ~ ${row.endDate}`
//             : "";

//         return {
//           ...row,
//           cycle,
//           period,
//           index: i+1,
//           id: row.workId,
//         };
//       });