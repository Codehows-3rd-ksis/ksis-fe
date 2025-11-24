// import React from 'react'
import {IconButton} from '@mui/material'

import {type IconButton_Type} from '../Types/Components'

import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';

export default function CustomIconButton(props: IconButton_Type) {
    const {width, height, fontSize, color, fontWeight, backgroundColor, border, onClick, icon} = props

    switch (icon) {
        case 'search':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <SearchIcon />
                </IconButton>
            )
        case 'reset':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <RestartAltIcon />
                </IconButton>
            )
        case 'visible':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <Visibility />
                </IconButton>
            )
        case 'invisible':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <VisibilityOff />
                </IconButton>
            )
        case 'edit':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <EditSquareIcon />
                </IconButton>
            )
        case 'delete':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <DeleteIcon />
                </IconButton>
            )
        case 'log':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <ListAltIcon />
                </IconButton>
            )
        case 'run':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <PlayArrowIcon />
                </IconButton>
            )
        case 'stop':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <StopIcon />
                </IconButton>
            )
        case 'close':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <CloseIcon />
                </IconButton>
            )
        case 'logout':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <LogoutIcon />
                </IconButton>
            )
        case 'export':
            return (
                <IconButton 
                    sx={{
                        width: width || '30px',
                        height: height || '30px',
                        color: color || 'black',
                        fontWeight: fontWeight || 'bold',
                        fontSize: fontSize || '16px',
                        backgroundColor: backgroundColor || '#fff',
                        border: border || '',
                        // borderRadius: 3,
                        // boxShadow: '0px 3px 0px black'
                    }}
                    onClick={onClick? onClick : ()=>{}}
                >
                    <DownloadIcon />
                </IconButton>
            )
    }
}