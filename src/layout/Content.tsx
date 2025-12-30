import { Box } from "@mui/material";
import { type LayoutProps } from "../Types/Layout";

function Content({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        backgroundColor: "#fafaf9",
        height: "100%",
        minHeight: 0,
        borderRadius: 3,
        boxSizing: "border-box",
        border: "3px solid rgba(86, 86, 86, 1)",
      }}
    >
      {children}
    </Box>
  );
}

export default Content;
