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

interface SearchBarSetProps {
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
  onSearch: (conditions: SearchConditions) => void;
}

export default function SearchBarSet({
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
}: SearchBarSetProps) {
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
    setConditions((prev) => ({ ...prev, count: count ?? 0 }));
  }, [count]);

  // 내부 세부 컴포넌트들이 값을 변경할 때 호출
  const updateConditions = (key: keyof SearchConditions, value: any) => {
    setConditions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(conditions);
  };

  const handleReset = () => {
    setConditions({
      startDate: null,
      endDate: null,
      keyword: "",
      type: "all",
      count: 0,
    });
    onSearch({
      startDate: null,
      endDate: null,
      keyword: "",
      type: "all",
      count: 0,
    });
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
        {showCount && <CountSection count={conditions.count} />}

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
