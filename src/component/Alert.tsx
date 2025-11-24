import { type Alert_Type } from "../Types/Components"
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'
import CustomButton from "./CustomButton"
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function Alert (props: Alert_Type) {
    const {open, text, type, onConfirm, onCancel} = props

    switch (type) {
        case 'success':
            return (
                <Dialog 
                    open={open} 
                    onClose={onCancel} 
                    disableAutoFocus
                    disableRestoreFocus
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#FFF4E5' }}>
                        <CheckCircleOutlineIcon color="success" fontSize="large" />
                        <Typography variant="h6" component="div">
                            알림
                        </Typography>
                    </DialogTitle>
                    <DialogContent
                        sx={{ 
                            marginTop: 2,
                            minWidth: 300,
                        }}
                    >
                        <Typography variant="body1" color="text.primary">
                            {text}
                        </Typography>
                    </DialogContent>
                    
                    <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
                        <CustomButton text="닫기" onClick={onConfirm} radius={2}/>
                    </DialogActions>
                </Dialog>
            )
        case 'question' :
            return (
                <Dialog 
                    open={open} 
                    onClose={onCancel} 
                    disableAutoFocus
                    disableRestoreFocus
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#FFF4E5' }}>
                        <HelpOutlineIcon color="action" fontSize="large" />
                        <Typography variant="h6" component="div">
                            알림
                        </Typography>
                    </DialogTitle>
                    <DialogContent
                        sx={{ 
                            marginTop: 2,
                            minWidth: 300,
                        }}
                    >
                        <Typography variant="body1" color="text.primary">
                            {text}
                        </Typography>
                    </DialogContent>
                    
                    <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
                        <CustomButton text="확인" onClick={onConfirm} radius={2}/>
                        <CustomButton text="취소" onClick={onCancel} backgroundColor="#f0f0f0" radius={2}/>
                    </DialogActions>
                </Dialog>
            )
        case 'delete' :
            return (
                <Dialog 
                    open={open} 
                    onClose={onCancel} 
                    disableAutoFocus
                    disableRestoreFocus
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#FFF4E5' }}>
                        <HighlightOffIcon color="error" fontSize="large" />
                        <Typography variant="h6" component="div">
                            알림
                        </Typography>
                    </DialogTitle>
                    <DialogContent
                        sx={{ 
                            marginTop: 2,
                            minWidth: 300,
                        }}
                    >
                        <Typography variant="body1" color="text.primary">
                            {text}
                        </Typography>
                    </DialogContent>
                    
                    <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
                        <CustomButton text="확인" onClick={onConfirm} radius={2}/>
                        <CustomButton text="취소" onClick={onCancel} backgroundColor="#f0f0f0" radius={2}/>
                    </DialogActions>
                </Dialog>
            )
        case 'validate':
            return (
                <Dialog 
                    open={open} 
                    onClose={onCancel} 
                    disableAutoFocus
                    disableRestoreFocus
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#FFF4E5' }}>
                        <WarningAmberIcon color="warning" fontSize="large" />
                        <Typography variant="h6" component="div">
                            알림
                        </Typography>
                    </DialogTitle>
                    <DialogContent
                        sx={{ 
                            marginTop: 2,
                            minWidth: 300,
                        }}
                    >
                        <Typography variant="body1" color="text.primary">
                            다음과 같은 사유로 등록이 실패하였습니다.
                        </Typography>
                        <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-line', color: 'red' }}>
                            {text}
                        </Typography>
                    </DialogContent>
                    
                    <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
                        <CustomButton text="닫기" onClick={onConfirm} radius={2}/>
                    </DialogActions>
                </Dialog>
            )
        case 'warning':
        default:
            return (
                <Dialog 
                    open={open} 
                    onClose={onCancel} 
                    disableAutoFocus
                    disableRestoreFocus
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#FFF4E5' }}>
                        <WarningAmberIcon color="warning" fontSize="large" />
                        <Typography variant="h6" component="div">
                            알림
                        </Typography>
                    </DialogTitle>
                    <DialogContent
                        sx={{ 
                            marginTop: 2,
                            minWidth: 300,
                        }}
                    >
                        <Typography variant="body1" color="text.primary">
                            {text}
                        </Typography>
                    </DialogContent>
                    
                    <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
                        <CustomButton text="확인" onClick={onConfirm} radius={2}/>
                        <CustomButton text="취소" onClick={onCancel} backgroundColor="#f0f0f0" radius={2}/>
                    </DialogActions>
                </Dialog>
            )
    }

    
}