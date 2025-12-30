import { Box, Typography, InputAdornment } from "@mui/material";
import { useState, useEffect } from "react";
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

interface SearchBarSetProps {
  value: SearchConditions;
  onSearch: (conditions: SearchConditions) => void;
  onReset?: () => void;

  showDateRange?: boolean;
  showKeyword?: boolean;
  showSearchType?: boolean;
  showCount?: boolean;

  totalCount?: number;
  searchCategories?: SearchCategory[];
  placeholder?: string;

  showButton?: boolean;
  buttonLabel?: string;
  buttonWidth?: string;
  onButtonClick?: () => void;
}

export default function SearchBarSet({
  value,
  onSearch,
  onReset,
  showDateRange,
  showKeyword,
  showSearchType,
  showCount,
  totalCount,
  searchCategories = [],
  placeholder = "검색어 입력",
  showButton,
  buttonLabel = "등록",
  buttonWidth,
  onButtonClick,
}: SearchBarSetProps) {
  const [localValue, setLocalValue] = useState<SearchConditions>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const updateLocal = (key: keyof SearchConditions, val: any) => {
    setLocalValue((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderRadius: 2,
        gap: 2,
      }}
    >
      <Box>
        {showCount && (
          <Typography sx={{ color: "black", fontWeight: 700 }}>
            검색결과 : {totalCount} 건 입니다.
          </Typography>
        )}
      </Box>

      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
      >
        {showDateRange && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <DatePicker
                label="시작일자"
                format="YYYY-MM-DD"
                value={
                  localValue.startDate ? dayjs(localValue.startDate) : null
                }
                onChange={(v) =>
                  updateLocal("startDate", v ? v.format("YYYY-MM-DD") : null)
                }
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      backgroundColor: "#fff",
                      borderRadius: 1,
                      width: "220px",
                    },
                  },
                }}
              />
              <DatePicker
                label="종료일자"
                format="YYYY-MM-DD"
                value={localValue.endDate ? dayjs(localValue.endDate) : null}
                onChange={(v) =>
                  updateLocal("endDate", v ? v.format("YYYY-MM-DD") : null)
                }
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      backgroundColor: "#fff",
                      borderRadius: 1,
                      width: "220px",
                    },
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
              value={localValue.type}
              onChange={(e) => updateLocal("type", e.target.value)}
              listItem={searchCategories}
              inputWidth="140px"
              height="40px"
            />
          )}

          {/* 키워드 검색 */}
          {showKeyword && (
            <CustomTextField
              value={localValue.keyword}
              onChange={(e) => updateLocal("keyword", e.target.value)}
              placeholder={placeholder}
              inputWidth="250px"
              height="40px"
              boxMinWidth="250px"
              endAdornment={
                <InputAdornment position="end">
                  <CustomIconButton
                    icon="search"
                    onClick={() => onSearch(localValue)}
                  />
                  <CustomIconButton icon="reset" onClick={onReset} />
                </InputAdornment>
              }
              onEnter={() => onSearch(localValue)}
            />
          )}
        </Box>

        {showButton && (
          <CustomButton
            text={buttonLabel}
            width={buttonWidth}
            onClick={onButtonClick}
            radius={2}
            height="40px"
            hoverStyle={{
              backgroundColor: "#ba7d1bff",
              border: "2px solid #373737ff",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
