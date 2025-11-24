import {useEffect} from 'react'
import { Box, MenuItem, FormControl, Select } from '@mui/material'
import { type Select_Type } from '../Types/Components';

export default function CustomSelect(props: Select_Type) {
    const { value, listItem, onChange, inputWidth, height, border } = props;

    useEffect(() => {
      if (!value && listItem.length > 0) {
        // Select 내부 onChange 트리거 (부모로 전달)
        const firstValue = listItem[0].value;
        onChange?.({ target: { value: firstValue } } as any);
      }
    }, [listItem]);

  return (
    <Box>
      <FormControl sx={{ width: inputWidth || '300px', border: border || '', borderRadius: 1 }}>
        <Select
          value={value}
          onChange={onChange}
          sx={{height: height || '40px'}}
        >
            {listItem.map((item, index) => (
                <MenuItem 
                  key={index}
                  value={item.value}
                >
                    {item.name}
                </MenuItem>

            ))}
        </Select>
      </FormControl>
    </Box>
  );
}