import { Box } from "@mui/material";
import { type LayoutProps } from "../Types/Layout";

function Side({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        borderRadius: 3,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        // backgroundColor: '#fff',
        border: "1px solid rgba(86, 86, 86, 1)",
        background: "linear-gradient(90deg, #202021ff 0%, #4B4B4F 100%)", //1d1d1fff
        // boxShadow: '0 0 0 2px rgba(253, 140, 2, 0.5)',
      }}
    >
      {children}
    </Box>
  );
}

export default Side;
