// import React from 'react'
import { Box, TextField } from "@mui/material";

import { type TextField_Type } from "../Types/Components";

export default function CustomTextField(props: TextField_Type) {
  const {
    boxMinWidth, // Box sx
    value,
    label,
    variant,
    type,
    disabled,
    placeholder,
    fullWidth, // TextField attr
    border,
    inputWidth, // TextField sx
    radius,
    height,
    fontSize, // input sx
    readOnly,
    step,
    startAdornment,
    endAdornment, // input attr
    onChange,
    onEnter,
  } = props;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: fullWidth ? undefined : boxMinWidth || "320px",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      <TextField
        fullWidth={fullWidth}
        sx={{
          backgroundColor: "white",
          border: border || "",
          width: fullWidth ? "100%" : inputWidth || "246px",
          minWidth: "246px",
          borderRadius: radius || 1,
        }}
        size="small"
        value={value ?? ""}
        label={label || ""}
        variant={variant || undefined}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnter?.(); // ✅ 여기
          }
        }}
        disabled={disabled || false}
        placeholder={placeholder || ""}
        // inputProps={{ autoFocus: true, }}
        slotProps={{
          input: {
            readOnly: readOnly || false,
            startAdornment: startAdornment,
            endAdornment: endAdornment,
            inputProps: {
              step: step || 1,
            },
            sx: {
              borderRadius: radius || 1,
              height: height || "40px",
              fontSize: fontSize || "16px",
            },
          },
        }}
        type={type || "text"}
      />
    </Box>
  );
}
