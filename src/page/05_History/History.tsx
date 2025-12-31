import { useState, useEffect, useCallback } from "react";
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
  Container,
  Paper,
} from "@mui/material";
// Table
import PaginationServerTable from "../../component/PaginationServerTable";
import {
  getColumns,
  type HistoryTableRows,
} from "../../Types/TableHeaders/HistoryHeader";
// Comp
import Alert from "../../component/Alert";
import LoadingProgress from "../../component/LoadingProgress";
// Search
import SearchBarSet from "../../component/SearchBarSet";
import type { SearchConditions } from "../../component/SearchBarSet";
// Api
import { getHistory, getHistoryExport } from "../../API/05_HistoryApi";
// Export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// Parse
import { parseResultValueRows } from "../../utils/resultValueParser";

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
  const [loading, setLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  // Table
  const [totalCount, setTotalCount] = useState(0);
  const [searchState, setSearchState] = useState<HistorySearchState>({
    startDate: "",
    endDate: "",
    type: "all",
    keyword: "",
    page: 0,
    size: 10,
  });
  const [baseRows, setBaseRows] = useState<HistoryTableRows[]>([]);

  // 메뉴 anchor
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [exportRow, setExportRow] = useState<HistoryTableRows | null>(null);
  // Alert
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getTableDatas = useCallback(async () => {
    try {
      setLoading(true);
      const { startDate, endDate, type, keyword, page, size } = searchState;

      const res = await getHistory(
        startDate ?? "",
        endDate ?? "",
        type,
        keyword,
        page,
        size
      );

      const result = res.content.map((row: HistoryTableRows, i: number) => ({
        ...row,
        id: row.workId,
        index: page * size + i + 1, // 🔥 전체 기준 index
      }));

      setBaseRows(result);
      setTotalCount(res.totalElements);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("유저이력 조회 실패");
      setOpenErrorAlert(true);
      setLoading(false);
    }
  }, [searchState]);

  useEffect(() => {
    getTableDatas();
  }, [getTableDatas]);

  const handleSearch = (conditions: SearchConditions) => {
    setIsSearched(true);
    setSearchState((prev) => ({
      ...prev,
      ...conditions,
      page: 0,
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
  // 라디오 선택 변경시 호출될 함수
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setIsSearched(true);
    setSearchState((prev) => ({
      ...prev,
      type: value,
      page: 0,
    }));
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
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename + ".xlsx");
  };

  const handleExport = (row: HistoryTableRows, event?: any) => {
    setExportRow(row);
    setExportAnchor(event.currentTarget);
  };

  const getExportData = async () => {
    if (!exportRow) return [];
    const result = await getHistoryExport(Number(exportRow.id));

    const targets = result.filter((r: any) => r.workId === exportRow.id);

    //  공통 유틸 함수 사용
    return parseResultValueRows(targets, (row: any) => ({
      seq: row.seq,
      page_url: row.pageUrl,
    }));
  };

  const handleExport_Excel = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportExcel(
      exportData,
      `${exportRow.settingName}(${new Date()
        .toLocaleString()
        .slice(0, 12)})_수집이력`
    );
  };

  const handleExport_CSV = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportCSV(
      exportData,
      `${exportRow.settingName}(${new Date()
        .toLocaleString()
        .slice(0, 12)})_수집이력`
    );
  };

  const handleExport_Json = async () => {
    if (!exportRow) return;
    const exportData = await getExportData();
    exportJSON(
      exportData,
      `${exportRow.settingName}(${new Date()
        .toLocaleString()
        .slice(0, 12)})_수집이력`
    );
  };

  const columns = getColumns({ handleDetailView, handleExport });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        pb: 4,
      }}
    >
      {/* 1. 헤더 섹션: 타이틀 폰트 조정 및 설명 추가 */}
      <Box sx={{ px: 4, pt: 6, pb: 2 }}>
        <Typography
          sx={{
            fontSize: "1.85rem", // 60px에서 세련된 크기로 하향 조정
            fontWeight: 800,
            color: "#1E293B",
            letterSpacing: "-0.02em",
            mb: 0.5,
          }}
        >
          데이터 수집이력
        </Typography>
        <Typography
          sx={{ color: "#64748B", fontSize: "0.95rem", fontWeight: 500 }}
        >
          수집된 데이터의 이력을 조회하고 내보낼 수 있습니다.
        </Typography>
      </Box>

      <Container maxWidth={false} sx={{ px: 4 }}>
        {/* 2. 검색 바 영역: 흰색 카드 스타일 및 여백 조정 */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#fff",
          }}
        >
          <SearchBarSet
            value={{
              type: searchState.type,
              keyword: searchState.keyword,
              startDate: searchState.startDate,
              endDate: searchState.endDate,
            }}
            totalCount={totalCount}
            showDateRange={true}
            showKeyword={true}
            showSearchType={false}
            showCount={isSearched}
            onSearch={handleSearch}
            onReset={handleReset}
            showButton={false}
            placeholder="수집명 입력"
          />

          {/* 수집 타입 필터 */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
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
                          color: "#F7941D",
                        },
                      }}
                    />
                  }
                  label="전체"
                />
                <FormControlLabel
                  value="스케줄러"
                  control={
                    <Radio
                      sx={{
                        color: "gray",
                        "&.Mui-checked": {
                          color: "#F7941D",
                        },
                      }}
                    />
                  }
                  label="스케줄러"
                />
                <FormControlLabel
                  value="수동실행"
                  control={
                    <Radio
                      sx={{
                        color: "gray",
                        "&.Mui-checked": {
                          color: "#F7941D",
                        },
                      }}
                    />
                  }
                  label="수동실행"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Paper>

        {/* 3. 테이블 영역: 카드 스타일 및 내부 패딩 조정 */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#fff",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ p: 1 }}>
            <PaginationServerTable
              columns={columns}
              rows={baseRows}
              page={searchState.page}
              pageSize={searchState.size}
              totalCount={totalCount}
              onPageChange={(newPage: number) => {
                setSearchState((prev) => ({
                  ...prev,
                  page: newPage,
                }));
              }}
            />
          </Box>
        </Paper>
      </Container>

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
