import { Box, Typography, InputAdornment } from "@mui/material";
import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import CustomButton from "./CustomButton";
import CustomIconButton from "./CustomIconButton";
import CustomSelect from "./CustomSelect";
import CustomTextField from "./CustomTextField";
import { type SearchCategory } from "../Types/Search";

export type SearchConditions = {
  startDate?: string | null;
  endDate?: string | null;
  keyword: string;
  type: string;
};

const INITIAL_CONDITIONS: SearchConditions = {
  startDate: null,
  endDate: null,
  keyword: "",
  type: "all",
};

interface SearchBarSetProps<T extends object = object> {
  baseRows?: T[];
  filteredRows?: T[];
  setFilteredRows?: React.Dispatch<React.SetStateAction<T[]>>;
  dateField?: keyof T;

  showDateRange?: boolean;
  showKeyword?: boolean;
  showSearchType?: boolean;
  showCount?: boolean;

  searchCategories?: SearchCategory[];

  showButton?: boolean;
  buttonLabel?: string;
  buttonWidth?: string;
  onButtonClick?: () => void;
}

export default function SearchBarSet<T extends object = object>({
  baseRows,
  filteredRows,
  setFilteredRows,
  dateField,
  showDateRange,
  showKeyword,
  showSearchType,
  showCount,
  searchCategories = [],
  showButton,
  buttonLabel = "등록",
  buttonWidth,
  onButtonClick,
}: SearchBarSetProps<T>) {
  const [conditions, setConditions] =
    useState<SearchConditions>(INITIAL_CONDITIONS);

  const updateConditions = (key: string, value: any) => {
    setConditions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (searchConditions = conditions) => {
    if (!baseRows || !setFilteredRows) {
      return;
    }

    const filtered = baseRows.filter((row) => {
      // 날짜 범위 필터링
      if (
        dateField &&
        (searchConditions.startDate || searchConditions.endDate)
      ) {
        const rowDate = dayjs(String(row[dateField])).format("YYYY-MM-DD");

        if (
          searchConditions.startDate &&
          rowDate < searchConditions.startDate
        ) {
          return false; //시작일 이전은 제외
        }
        if (searchConditions.endDate && rowDate > searchConditions.endDate) {
          return false; // 종료일 이후는 제외
        }
      }

      // 키워드 필터링
      if (searchConditions.keyword.trim() !== "") {
        const keyword = searchConditions.keyword.toLowerCase();
        const searchType = searchConditions.type;

        const hasKeyword =
          searchType === "all"
            ? Object.values(row).some(
                (value) =>
                  typeof value === "string" &&
                  value.toLowerCase().includes(keyword)
              )
            : typeof row[searchType as keyof T] === "string" &&
              (row[searchType as keyof T] as string)
                .toLowerCase()
                .includes(keyword);

        if (!hasKeyword) return false;
      }

      return true;
    });

    setFilteredRows(filtered);
  };

  const handleReset = () => {
    setConditions(INITIAL_CONDITIONS);
    handleSearch(INITIAL_CONDITIONS);
  };

  return (
    <Box
      sx={{
        bgcolor: "#dbdbdbff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderRadius: 2,
        gap: 2,
      }}
    >
      <Box>
        {showCount && filteredRows && (
          <Typography sx={{ color: "black", fontWeight: 700 }}>
            검색결과 : {filteredRows.length} 건 입니다.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {showDateRange && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <DatePicker
                label="시작일자"
                format="YYYY-MM-DD"
                value={
                  conditions.startDate ? dayjs(conditions.startDate) : null
                }
                onChange={(v) =>
                  updateConditions(
                    "startDate",
                    v ? v.format("YYYY-MM-DD") : null
                  )
                }
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
              />
              <DatePicker
                label="종료일자"
                format="YYYY-MM-DD"
                value={conditions.endDate ? dayjs(conditions.endDate) : null}
                onChange={(v) =>
                  updateConditions("endDate", v ? v.format("YYYY-MM-DD") : null)
                }
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
        )}

        {/* 타입검색 */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {showSearchType && (
            <CustomSelect
              value={conditions.type}
              onChange={(e) => updateConditions("type", e.target.value)}
              listItem={searchCategories}
              inputWidth="120px"
              height="40px"
            />
          )}

          {/* 키워드 검색 */}
          {showKeyword && (
            <CustomTextField
              value={conditions.keyword}
              onChange={(e) => updateConditions("keyword", e.target.value)}
              placeholder="검색어 입력"
              inputWidth="250px"
              height="40px"
              boxMinWidth="250px"
              endAdornment={
                <InputAdornment position="end">
                  <CustomIconButton
                    icon="search"
                    onClick={() => handleSearch()}
                  />
                  <CustomIconButton
                    icon="reset"
                    onClick={() => handleReset()}
                  />
                </InputAdornment>
              }
            />
          )}
        </Box>

        {showButton && (
          <CustomButton
            text={buttonLabel}
            width={buttonWidth}
            onClick={onButtonClick}
          />
        )}
      </Box>
    </Box>
  );
}
