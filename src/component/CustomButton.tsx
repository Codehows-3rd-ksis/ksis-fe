import {Button} from '@mui/material'

import {type Button_Type} from '../Types/Components'

export default function CustomButton(props: Button_Type) {
    const {width, height, fontSize, color, fontWeight, backgroundColor, border, radius, onClick, text, startIcon, endIcon, disabled, hoverStyle} = props
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
                // 비활성화 상태일 때의 스타일을 명시적으로 지정
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                },
                // 🔽 hover 스타일을 조건부로 추가
                ...(hoverStyle && {
                  '&:hover': hoverStyle,
                }),
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