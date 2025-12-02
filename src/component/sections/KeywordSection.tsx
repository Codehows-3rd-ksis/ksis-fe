import { TextField, InputAdornment } from "@mui/material";
import CustomIconButton from "../CustomIconButton";

interface KeywordProps {
  keyword: string;
  onChange: (key: "keyword", value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function KeywordSection({
  keyword,
  onChange,
  onSearch,
  onReset,
}: KeywordProps) {
  return (
    <TextField
      value={keyword}
      onChange={(e) => onChange("keyword", e.target.value)}
      placeholder="검색어 입력"
      sx={{ backgroundColor: "white", borderRadius: 1, width: 250 }}
      InputProps={{
        sx: { height: 40 },
        endAdornment: (
          <InputAdornment position="end">
            <CustomIconButton icon="search" onClick={onSearch} />
            <CustomIconButton icon="reset" onClick={onReset} />
          </InputAdornment>
        ),
      }}
    />
  );
}
