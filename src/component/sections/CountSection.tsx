import { Typography } from "@mui/material";

interface CountProps {
  count?: number;
}

export default function CountSection({ count }: CountProps) {
  if (count === undefined) return null;

  return (
    <Typography sx={{ color: "black", fontWeight: 700 }}>
      검색결과 : {count} 건 입니다.
    </Typography>
  );
}
