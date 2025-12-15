import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function LoadingProgress() {
  return (
    <Box sx={{ display: 'flex'}}>
      <CircularProgress />
    </Box>
  );
}