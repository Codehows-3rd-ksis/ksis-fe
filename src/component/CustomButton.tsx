import React from 'react'
import {Button} from '@mui/material'

import {type Button_Type} from '../Types/Components'

export default function CustomButton(props: Button_Type) {
    const {width, height, fontSize, color, fontWeight, backgroundColor, border, radius, onClick, text, startIcon, endIcon, disabled} = props
    return (
        <Button 
            sx={{
                width: width || '90px',
                height: height || '35px',
                color: color || 'black',
                fontWeight: fontWeight || 'bold',
                fontSize: fontSize || '16px',
                backgroundColor: backgroundColor || '#F5A623',
                border: border || '',
                borderRadius: radius || 0,
                // boxShadow: '0px 3px 0px black'
            }}
            disabled={disabled || false}
            onClick={onClick? onClick : ()=>{}}
            startIcon={startIcon}
            endIcon={endIcon}
        >
            {text || '버튼'}
        </Button>
    )
}