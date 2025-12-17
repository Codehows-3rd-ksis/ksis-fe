import CircularProgress from '@mui/material/CircularProgress';
import {Dialog} from '@mui/material';

interface LoadingProgressProps {
  open: boolean;
}

export default function LoadingProgress({ open }: LoadingProgressProps) {
  
  return (
      <Dialog 
          disableRestoreFocus
          open={open}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw',
              }
            },
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(2px)', 
              }
            }
          }}
      >
          <CircularProgress />
      </Dialog>
  );
}