import { FormControl, Select, MenuItem } from "@mui/material";
import { type SearchCategory } from "../../Types/Search";

export type TypeOption = {
  value: string;
  label: string;
};

interface TypeProps {
  selectedType: string;
  onChange: (key: "type", value: string) => void;
  options?: SearchCategory<any>[];
}

const defaultOptions: SearchCategory<string>[] = [
  { id: 0, name: "전체", value: "all" },
];

export default function SearchTypeSection({
  selectedType,
  onChange,
  options = defaultOptions,
}: TypeProps) {
  return (
    <FormControl sx={{ width: 120 }}>
      <Select
        value={selectedType}
        onChange={(e) => onChange("type", e.target.value)}
        sx={{ backgroundColor: "white", height: 40 }}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={String(option.value)}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
