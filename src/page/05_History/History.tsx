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
import SearchBarSet from "../../component/SearchBarSet";
import { getHistory, getHistoryResult } from "../../API/05_HistoryApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Alert from '../../component/Alert';

export default function History() {
  const navigate = useNavigate();
  const [baseRows, setBaseRows] = useState<HistoryTableRows[]>([]);
  const [filteredRows, setFilteredRows] = useState<HistoryTableRows[]>([]);
  const [radioFilteredRows, setRadioFilteredRows] = useState<HistoryTableRows[]>([]);
  const [filterType, setFilterType] = useState("all");

  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [exportRow, setExportRow] = useState<HistoryTableRows | null>(null);
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getTableDatas();
  }, []);

  useEffect(() => {
    let currentRows = [...baseRows];
    if (filterType !== "all") {
      currentRows = currentRows.filter((row) => row.type === filterType);
    }
    setRadioFilteredRows(currentRows);
  }, [baseRows, filterType]);

  const DAY_MAP: any = {
    MON: "월요일", TUE: "화요일", WED: "수요일", THU: "목요일", FRI: "금요일", SAT: "토요일", SUN: "일요일",
  };
  const WEEK_INDEX_MAP: any = { 1: "첫번째", 2: "두번째", 3: "세번째", 4: "네번째" };

  function parseCronWeekDay(cron: string) {
    if (!cron) return { week: "", day: "" };
    const f = cron.split(" ");
    const dayOfWeekField = f[5];
    const isLastWeek = dayOfWeekField.includes("L");
    const isNthWeek = dayOfWeekField.includes("#");
    if (isLastWeek || isNthWeek) {
      if (dayOfWeekField.includes(",")) {
        const parts = dayOfWeekField.split(",");
        const part = parts[0];
        if (part.startsWith("L")) {
          const dow = part.substring(1);
          return { week: "마지막", day: DAY_MAP[dow] || "" };
        }
        if (part.includes("#")) {
          const [weekIdx, dow] = part.split("#");
          return { week: WEEK_INDEX_MAP[Number(weekIdx)] || "", day: DAY_MAP[dow] || "" };
        }
      } else {
        if (dayOfWeekField.startsWith("L")) {
          const dow = dayOfWeekField.substring(1);
          return { week: "마지막", day: DAY_MAP[dow] || "" };
        }
        if (dayOfWeekField.includes("#")) {
          const [weekIdx, dow] = dayOfWeekField.split("#");
          return { week: WEEK_INDEX_MAP[Number(weekIdx)] || "", day: DAY_MAP[dow] || "" };
        }
      }
    } else {
      const dayParts = dayOfWeekField.split(",");
      const days = dayParts.map((d) => DAY_MAP[d] || "").filter((d) => d !== "");
      return { week: "매주", day: days.join(", ") };
    }
    return { week: "", day: "" };
  }

  const getTableDatas = async () => {
    try {
      const data = await getHistory();
      const res = data.map((row: HistoryTableRows, i: number) => {
        let cycle = "";
        if (row.cronExpression) {
          const { week, day } = parseCronWeekDay(row.cronExpression);
          cycle = `${week} ${day}`.trim();
        }
        const period = row.startDate && row.endDate ? `${row.startDate} ~ ${row.endDate}` : "";
        return { ...row, cycle, period, index: i + 1, id: row.workId };
      });
      setBaseRows(res);
      setFilteredRows(res); // Initialize filteredRows as well
    } catch (err) {
      console.error(err);
      setErrorMsg("유저이력 조회 실패");
      setOpenErrorAlert(true);
    }
  };

  const handleDetailView = (row: HistoryTableRows) => {
    navigate(`/history/detail/${row.id}`, { state: { rowData: row } });
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
    const rows = arr.map((row) => Object.values(row).join(",")).join("\n");
    const csv = headers + "\n" + rows;
    downloadFile(csv, filename + ".csv", "text/csv;charset=utf-8;");
  };

  const exportExcel = (jsonData: any, filename: string) => {
    const arr = Array.isArray(jsonData) ? jsonData : [jsonData];
    const worksheet = XLSX.utils.json_to_sheet(arr);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, filename + ".xlsx");
  };

  const flattenResult = (rows: any[]) => {
    return rows.map(item => {
      let parsedValue;
      try {
        parsedValue = JSON.parse(item.resultValue);
      } catch (e) {
        parsedValue = [];
        console.error("result_value JSON parse error", e);
      }
      const valueArray = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
      const flat = valueArray.reduce((acc: any, obj: any) => {
        if (typeof obj === 'object' && obj !== null) {
          Object.entries(obj).forEach(([key, val]) => {
            acc[key] = val;
          });
        }
        return acc;
      }, {});
      return { seq: item.seq, page_url: item.pageUrl, ...flat };
    });
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterType(value);
  };

  const handleExport = (row: HistoryTableRows, event?: any) => {
    setExportRow(row);
    setExportAnchor(event.currentTarget);
  };

  const getExportData = async () => {
    if (!exportRow) return [];
    const result = await getHistoryResult(Number(exportRow.id));
    const targets = result.filter((r: any) => r.workId === exportRow.id);
    return flattenResult(targets);
  };

  const handleExport_Excel = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportExcel(exportData, `${exportRow.settingName}(${new Date().toLocaleString().slice(0, 12)})_수집이력`);
  };

  const handleExport_CSV = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportCSV(exportData, `${exportRow.settingName}(${new Date().toLocaleString().slice(0, 12)})_수집이력`);
  };

  const handleExport_Json = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportJSON(exportData, `${exportRow.settingName}(${new Date().toLocaleString().slice(0, 12)})_수집이력`);
  };

  const columns = getColumns({ handleDetailView, handleExport });

  return (
    <Box sx={{ height: "97%" }}>
      <Typography sx={{ fontSize: 60, fontWeight: "bold", color: "black", paddingLeft: 2, marginTop: 5 }}>
        데이터 수집이력
      </Typography>

      <SearchBarSet
        baseRows={radioFilteredRows}
        setFilteredRows={setFilteredRows}
        dateField="startAt"
        showDateRange={true}
        showKeyword={true}
        showCount={true}
      />
      
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", paddingRight: 1 }}>
          <FormControl>
            <RadioGroup row value={filterType} onChange={handleFilterChange} sx={{ color: "black" }}>
              <FormControlLabel value="all" control={<Radio sx={{ color: "gray", "&.Mui-checked": { color: "#BB510C" } }} />} label="전체" />
              <FormControlLabel value="스케줄링" control={<Radio sx={{ color: "gray", "&.Mui-checked": { color: "#BB510C" } }} />} label="스케줄링" />
              <FormControlLabel value="수동실행" control={<Radio sx={{ color: "gray", "&.Mui-checked": { color: "#BB510C" } }} />} label="수동실행" />
            </RadioGroup>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ padding: 2 }}>
        <CommonTable columns={columns} rows={filteredRows} />
      </Box>

      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
        <MenuItem onClick={() => { setExportAnchor(null); handleExport_Excel(); }}>
          <ListItemText>엑셀(xlsx)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setExportAnchor(null); handleExport_CSV(); }}>
          <ListItemText>CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setExportAnchor(null); handleExport_Json(); }}>
          <ListItemText>JSON</ListItemText>
        </MenuItem>
      </Menu>

      <Alert open={openErrorAlert} text={errorMsg} type="error" onConfirm={() => setOpenErrorAlert(false)} />
    </Box>
  );
}
