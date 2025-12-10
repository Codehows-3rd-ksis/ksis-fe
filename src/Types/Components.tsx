import type { SelectChangeEvent } from "@mui/material";

export interface TextField_Type {
  // Input
  value?: number | string;
  label?: string;
  variant?: "outlined" | "filled" | "standard" | undefined;
  border?: string;
  radius?: number | string;
  inputWidth?: string;
  height?: string;
  fontSize?: string;
  disabled?: boolean;
  // required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  type?: "text" | "number" | "password" | "date";
  step?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  boxMinWidth?: string;
}

export interface Button_Type {
  width?: string;
  height?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string;
  backgroundColor?: string;
  border?: string;
  radius?: number | string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  text?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
}
export interface IconButton_Type {
  width?: string;
  height?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string;
  backgroundColor?: string;
  border?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?:
    | "search"
    | "reset"
    | "visible"
    | "invisible"
    | "edit"
    | "delete"
    | "log"
    | "run"
    | "stop"
    | "close"
    | "logout"
    | "export";
}

export interface SearchBar_Type {
  //SelectBox
  selectValue?: string;
  onSelectChange?: (event: SelectChangeEvent<string>) => void;
  options: { id: number; name: string; value: string }[];
  //TextField
  label?: string;
  inputValue?: string;
  onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
  //IconButton Click Event
  onSearch?: () => void;
  onReset?: () => void;
  //Search Result
  searchCount?: number;
}

export interface SearchResultBox_Type {
  isSearch?: boolean;
  searchCount?: number;
}

export interface SelectItem {
  id?: number;
  value: string | number;
  name: string;
}

export interface Select_Type {
  value?: number | string;
  listItem: SelectItem[];
  inputWidth?: string;
  height?: string;
  border?: string;
  onChange: (event: SelectChangeEvent<string | number>) => void;
}

export interface User_Type {
  userId?: number;
  username?: string;
  name?: string;
  role?: string;
}

export interface Alert_Type {
  open: boolean;
  text?: string;
  type?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
