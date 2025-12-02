import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface DateRangeProps {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  onChange: (key: "startDate" | "endDate", value: string | null) => void;
}

export default function DateRangeSection({
  startDate,
  endDate,
  onChange,
}: DateRangeProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", gap: 1 }}>
        <DatePicker
          label="시작일자"
          format="YYYY-MM-DD"
          value={startDate ? dayjs(startDate) : null}
          onChange={(v) =>
            onChange("startDate", v ? v.format("YYYY-MM-DD") : null)
          }
          slotProps={{
            textField: {
              size: "small",
            },
          }}
        />
        <DatePicker
          label="종료일자"
          format="YYYY-MM-DD"
          value={endDate ? dayjs(endDate) : null}
          onChange={(v) =>
            onChange("endDate", v ? v.format("YYYY-MM-DD") : null)
          }
          slotProps={{
            textField: {
              size: "small",
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
