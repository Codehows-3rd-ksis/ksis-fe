import { Box } from "@mui/material"
import SearchBar from "../component/SearchBar"
import SearchResultBox from "../component/SearchResultBox"
import { type SearchCategory } from "../Types/Search"
import { useEffect, useState } from "react"

interface SearchHeaderProps<T> {
  baseRows: T[]
  setFilteredRows: React.Dispatch<React.SetStateAction<T[]>>
  getSearchCategory: () => SearchCategory<keyof T>[]
  onClick: () => void
  btnName: string;
}

export default function SearchHeader<T>({
  baseRows,
  setFilteredRows,
  getSearchCategory,
  onClick,
  btnName,
}: SearchHeaderProps<T>) {
  const [searchList, setSearchList] = useState<SearchCategory<keyof T | "all">[]>([])
  const [searchCount, setSearchCount] = useState<number | undefined>()
  const [isSearch, setIsSearch] = useState<boolean>(false)

  useEffect(() => {
    const categories = getSearchCategory()
    // ✅ "전체" 카테고리를 자동으로 추가
    setSearchList([{ id: 0, name: "전체", value: "all" as keyof T }, ...categories])
  }, [getSearchCategory])

  const handleSearch = (searchInfo: { category: keyof T | "all"; keyword: string }) => {
    const { category, keyword } = searchInfo
    if (!keyword.trim()) {
      // 🔸 초기화: 전체 표시
      setFilteredRows(baseRows)
      setSearchCount(0)
      setIsSearch(false)
      return
    }

    let filtered: T[] = []

    if (category === "all") {
      filtered = baseRows.filter((row) =>
        Object.values(row as Record<string, unknown>).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    } else {
      filtered = baseRows.filter((row) => {
        const value = (row as Record<string, unknown>)[category as string]
        return (
          typeof value === "string" &&
          value.toLowerCase().includes(keyword.toLowerCase())
        )
      })
    }

    setFilteredRows(filtered)
    setSearchCount(filtered.length)
    setIsSearch(true)
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        // backgroundColor: "white",
        p: 2,
        borderRadius: 2,
      }}
    >
      <SearchResultBox isSearch={isSearch} searchCount={searchCount} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <SearchBar<keyof T | "all">
          options={searchList}
          onSearch={handleSearch}
          onClick={onClick}
          btnName={btnName}
        />
      </Box>
    </Box>
  )
}
