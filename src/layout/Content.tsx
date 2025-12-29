import {Box} from '@mui/material'
import  {type LayoutProps } from '../Types/Layout';

function Content({children}:LayoutProps) {
  
  return (
    <Box
        sx={{
            backgroundColor: '#fff',
            height: '100%',
            minHeight: 0,     
            borderRadius: 3,
            boxSizing: 'border-box',
            border: '3px solid rgba(86, 86, 86, 1)',
            background: 'linear-gradient(180deg, #EDECEC 0%, #DBD9DB 100%)',
            
        }}
    >
            {children}
    </Box>
  )
}

export default Content
