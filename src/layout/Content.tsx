import React from 'react'
import {Box} from '@mui/material'
import  {type LayoutProps } from '../Types/Layout';

function Content({children}:LayoutProps) {
  
  return (
    <Box
        sx={{
            backgroundColor: '#fff',
            height: '98vh',
            border: '3px solid #CDBAA6', 
            borderRadius: 3
        }}
    >
            {children}
    </Box>
  )
}

export default Content
