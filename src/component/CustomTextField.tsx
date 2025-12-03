// import React from 'react'
import {Box, TextField} from '@mui/material'

import {type TextField_Type} from '../Types/Components'

export default function CustomTextField(props: TextField_Type) {
    const {value, label, variant, border, radius, inputWidth, height, fontSize,
        disabled, placeholder, readOnly, type, step, 
        onChange, startAdornment, endAdornment, boxMinWidth} = props
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: boxMinWidth || '320px'}}>
            <TextField 
                sx={{
                    backgroundColor: 'white', 
                    border: border || '', 
                    width: inputWidth || '246px', 
                    minWidth: '246px'
                }}
                size= "small"
                value={value || ''}
                label={label || ''}
                variant={variant || undefined}
                onChange={onChange}
                disabled={disabled || false}
                placeholder={placeholder || ''}
                // inputProps={{ autoFocus: true, }}
                slotProps={{
                    input: {
                        readOnly: readOnly || false,
                        startAdornment: startAdornment,
                        endAdornment: endAdornment,
                        inputProps: {
                            step: step || 1,
                        },
                        sx: {
                            borderRadius: radius || 1, 
                            height: height || '40px',
                            fontSize: fontSize || '16px'
                        }, 
                    },
                }}
                type={type || 'text'}
            />
        </Box>
    )
}