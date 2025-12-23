import type { SelectChangeEvent } from "@mui/material";

export interface TextField_Type {
  // Box sx
  boxMinWidth?: string;
  // TextField attr
  value?: number | string;
  label?: string;
  variant?: "outlined" | "filled" | "standard" | undefined;
  type?: "text" | "number" | "password";
  disabled?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  // TextField sx
  border?: string;
  inputWidth?: string;
  // input attr
  readOnly?: boolean;
  step?: number;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  // input sx
  radius?: number | string;
  height?: string;
  fontSize?: string;
  // func
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onEnter?: () => void;
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
    | "add"
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
    | "export"
    | "account";
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
