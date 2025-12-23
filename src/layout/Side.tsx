import {Box} from '@mui/material'
import  {type LayoutProps } from '../Types/Layout';

function Side({children}:LayoutProps) {
  
  return (
    <Box
        sx={{
            backgroundColor: '#fff',
            flex: 1,            
            minHeight: 0,       
            border: '3px solid #CDBAA6',
            borderRadius: 3,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
        }}
    >
            {children}
    </Box>
  )
}

export default Side
