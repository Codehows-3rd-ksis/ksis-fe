import {Box} from '@mui/material'
import  {type LayoutProps } from '../Types/Layout';

function Side({children}:LayoutProps) {
  
  return (
    <Box
        sx={{
            // backgroundColor: '#fff',
            // height: '100%',
            // border: '3px solid #CDBAA6', 
            // borderRadius: 3,

            backgroundColor: '#fff',
            // flex: 1,          
            height: '100%',
            minHeight: 0,         // 🔥 필수 (스크롤 방지)
            border: '3px solid #CDBAA6',
            borderRadius: 3,
            boxSizing: 'border-box',
            overflow: 'hidden',  // 내부에서만 스크롤
        }}
    >
            {children}
    </Box>
  )
}

export default Side
