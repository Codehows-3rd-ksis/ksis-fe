import React, { useState } from 'react'
import { Box } from '@mui/material'
import CustomTextField from '../../component/CustomTextField';
import CustomButton from '../../component/CustomButton';

type SearchBarProps = {
  placeholder?: string;
  onSearch: (keyword: string) => void;
};

export const SearchBar = React.memo(
  ({ placeholder = "검색", onSearch }: SearchBarProps) => {
    const [value, setValue] = useState("");

    const handleSearch = () => {
      onSearch(value);
    };

    return (
      <Box display="flex" gap={1} alignItems="center">
        <CustomTextField
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onEnter={handleSearch}
        />
        <CustomButton 
          radius={1} 
          text="검색" 
          onClick={handleSearch} 
          border="1px solid #757575"
          hoverStyle={{
            backgroundColor: "#ba7d1bff",
            border: "2px solid #373737ff",
          }}
        />
      </Box>
    );
  }
);