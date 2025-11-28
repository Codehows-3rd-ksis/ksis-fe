import { useState, useEffect } from "react"
import { Box, FormControl, Select, MenuItem, TextField, InputAdornment } from "@mui/material"
import CustomIconButton from "./CustomIconButton"
import CustomButton from "./CustomButton"
import { type SearchCategory } from "../Types/Search"

interface SearchBarProps<K extends string | number | symbol> {
  options: SearchCategory<K>[]
  onSearch?: (searchInfo: { category: K; keyword: string }) => void
  onClick?: () => void
  btnName?: string;
}

export default function SearchBar<K extends string | number | symbol>({
  options,
  onSearch,
  onClick,
  btnName
}: SearchBarProps<K>) {
  const [searchInfo, setSearchInfo] = useState<{ category: K; keyword: string }>({
    category: (options[0]?.value ?? ("" as K)),
    keyword: "",
  })

  // ✅ 옵션이 바뀌면 첫 번째 카테고리(예: "전체") 자동 선택
  useEffect(() => {
    if (options.length > 0) {
      setSearchInfo({
        category: options[0].value,
        keyword: "",
      })
    }
  }, [options])

  const handleChange = (key: keyof typeof searchInfo, value: string) => {
    setSearchInfo((prev) => ({ ...prev, [key]: value as K }))
  }

  const handleSearch = () => {
    onSearch?.(searchInfo)
  }

  const handleReset = () => {
    const defaultCategory = options[0]?.value ?? ("" as K)
    setSearchInfo({ category: defaultCategory, keyword: "" })
    onSearch?.({ category: defaultCategory, keyword: "" })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        backgroundColor: "lightgray",
        p: 2,
        height: "50px",
        borderRadius: 2,
      }}
    >
      <FormControl sx={{ width: 120 }}>
        <Select
          value={String(searchInfo.category)}
          onChange={(e) => handleChange("category", e.target.value)}
          sx={{ backgroundColor: "white", height: "40px" }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.id} value={String(opt.value)}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        value={searchInfo.keyword}
        onChange={(e) => handleChange("keyword", e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="검색어 입력"
        size="small"
        sx={{ backgroundColor: "white", flex: 1, borderRadius: 1 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <CustomIconButton icon="search" color="black" onClick={handleSearch} />
              <CustomIconButton icon="reset" color="black" onClick={handleReset} />
            </InputAdornment>
            
          ),
        }}
      />

      <CustomButton text={btnName} height="40px" radius={2} onClick={onClick} />
    </Box>
  )
}
