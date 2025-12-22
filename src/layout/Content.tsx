import {Box} from '@mui/material'
import  {type LayoutProps } from '../Types/Layout';

function Content({children}:LayoutProps) {
  
  return (
    <Box
        sx={{
            // backgroundColor: '#fff',
            // height: '100%',
            // border: '3px solid #CDBAA6', 
            // borderRadius: 3

            backgroundColor: '#fff',
            // flex: 1,          
            height: '100%',
            minHeight: 0,     
            border: '3px solid #CDBAA6',
            borderRadius: 3,
            boxSizing: 'border-box',
            // overflow: 'hidden', 
        }}
    >
            {children}
    </Box>
  )
}

export default Content
