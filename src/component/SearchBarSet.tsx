import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import DateRangeSection from "./sections/DateRangeSection";
import KeywordSection from "./sections/KeywordSection";
import SearchTypeSection, {
  type TypeOption,
} from "./sections/SearchTypeSection";
import CountSection from "./sections/CountSection";
import CustomButton from "./CustomButton";
import { type SearchCategory } from "../Types/Search";
import { AlignHorizontalCenter } from "@mui/icons-material";

export type { TypeOption };

export type SearchConditions = {
  startDate?: string | null;
  endDate?: string | null;
  keyword?: string;
  type?: string;
  count?: number;
};

interface SearchBarSetProps<T = any> {
  // 검색 데이터
  baseRows?: T[];
  setFilteredRows?: React.Dispatch<React.SetStateAction<T[]>>;
  dateField?: keyof T; // 날짜 필터링할 필드명 (예: "startAt")

  // UI 표시 옵션
  showDateRange?: boolean;
  showKeyword?: boolean;
  showSearchType?: boolean;
  showCount?: boolean;
  count?: number;
  typeOptions?: TypeOption[];
  getSearchCategory?: () => SearchCategory<any>[];
  showButton?: boolean;
  buttonLabel?: string;
  buttonWidth?: string;
  onButtonClick?: () => void;

  // 커스텀 검색 (선택사항)
  onSearch?: (conditions: SearchConditions) => void;
}

export default function SearchBarSet<T = any>({
  baseRows,
  setFilteredRows,
  dateField,
  showDateRange,
  showKeyword,
  showSearchType,
  showCount,
  count,
  typeOptions,
  getSearchCategory,
  showButton,
  buttonLabel,
  buttonWidth,
  onButtonClick,
  onSearch,
}: SearchBarSetProps<T>) {
  const [conditions, setConditions] = useState<SearchConditions>({
    startDate: null,
    endDate: null,
    keyword: "",
    type: "all",
    count: count ?? 0,
  });

  const [categoryOptions, setCategoryOptions] = useState<SearchCategory<any>[]>(
    []
  );
  const [internalCount, setInternalCount] = useState(0);

  // getSearchCategory가 있으면 "전체" 옵션 추가
  useEffect(() => {
    if (getSearchCategory) {
      const categories = getSearchCategory();
      setCategoryOptions([
        { id: 0, name: "전체", value: "all" },
        ...categories,
      ]);
    }
  }, [getSearchCategory]); //바뀌지 않지만, ESLint 경고 만족

  // count prop이 변경되면 conditions에도 반영
  useEffect(() => {
    setConditions((prev) => ({ ...prev, count: count ?? internalCount }));
  }, [count, internalCount]);

  // 내부 세부 컴포넌트들이 값을 변경할 때 호출
  const updateConditions = (key: keyof SearchConditions, value: any) => {
    setConditions((prev) => ({ ...prev, [key]: value }));
  };

  // 내부 검색 로직
  const performInternalSearch = (searchConditions: SearchConditions) => {
    if (!baseRows || !setFilteredRows) return;

    let filtered = [...baseRows];

    // 날짜 범위 필터링
    if (dateField && (searchConditions.startDate || searchConditions.endDate)) {
      if (searchConditions.startDate && !searchConditions.endDate) {
        filtered = filtered.filter((row) => {
          const rowDate = String(row[dateField]).split(" ")[0];
          return rowDate >= searchConditions.startDate!;
        });
      } else if (!searchConditions.startDate && searchConditions.endDate) {
        filtered = filtered.filter((row) => {
          const rowDate = String(row[dateField]).split(" ")[0];
          return rowDate <= searchConditions.endDate!;
        });
      } else if (searchConditions.startDate && searchConditions.endDate) {
        filtered = filtered.filter((row) => {
          const rowDate = String(row[dateField]).split(" ")[0];
          return (
            rowDate >= searchConditions.startDate! &&
            rowDate <= searchConditions.endDate!
          );
        });
      }
    }

    // 키워드 필터링
    if (searchConditions.keyword && searchConditions.keyword.trim() !== "") {
      const keyword = searchConditions.keyword.toLowerCase();
      const searchType = searchConditions.type || "all";

      if (searchType === "all") {
        // 전체 검색: 모든 필드에서 검색
        filtered = filtered.filter((row) =>
          Object.values(row as Record<string, unknown>).some(
            (value) =>
              typeof value === "string" && value.toLowerCase().includes(keyword)
          )
        );
      } else {
        // 특정 필드만 검색
        filtered = filtered.filter((row) => {
          const value = (row as Record<string, unknown>)[searchType];
          return (
            typeof value === "string" && value.toLowerCase().includes(keyword)
          );
        });
      }
    }

    setFilteredRows(filtered);
    setInternalCount(filtered.length);
  };

  const handleSearch = () => {
    if (onSearch) {
      // 커스텀 검색 함수가 있으면 사용
      onSearch(conditions);
    } else {
      // 없으면 내부 검색 로직 사용
      performInternalSearch(conditions);
    }
  };

  const handleReset = () => {
    const resetConditions = {
      startDate: null,
      endDate: null,
      keyword: "",
      type: "all",
      count: 0,
    };
    setConditions(resetConditions);

    if (onSearch) {
      onSearch(resetConditions);
    } else {
      performInternalSearch(resetConditions);
    }
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "#f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderRadius: 2,
          gap: 2,
        }}
      >
        {showCount && <CountSection count={count ?? internalCount} />}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {showDateRange && (
            <DateRangeSection
              startDate={conditions.startDate}
              endDate={conditions.endDate}
              onChange={updateConditions}
            />
          )}

          <Box sx={{ display: "flex", gap: 0.5 }}>
            {showSearchType && (
              <SearchTypeSection
                selectedType={conditions.type ?? "all"}
                onChange={updateConditions}
                options={categoryOptions}
              />
            )}

            {showKeyword && (
              <KeywordSection
                keyword={conditions.keyword ?? ""}
                onChange={updateConditions}
                onSearch={handleSearch}
                onReset={handleReset}
              />
            )}
          </Box>

          {showButton && (
            <CustomButton
              text={buttonLabel || "등록"}
              width={buttonWidth}
              onClick={onButtonClick}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
