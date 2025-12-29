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
                    <DialogTitle sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        background: 'linear-gradient(90deg, #202021ff 0%, #4B4B4F 100%)', 
                        color: 'white' 
                    }}>
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
                        <CustomButton 
                            text="닫기" 
                            onClick={onConfirm} 
                            radius={2}
                            backgroundColor="#f0f0f0" 
                            border="1px solid #757575"
                            hoverStyle={{
                                backgroundColor:"#b9b8b8ff",
                                border: "2px solid #373737ff"
                            }}
                        />
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
                    <DialogTitle sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        background: 'linear-gradient(90deg, #202021ff 0%, #4B4B4F 100%)', 
                        color: 'white' 
                    }}>
                        <HelpOutlineIcon sx={{color: 'white'}} fontSize="large" />
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
                        <CustomButton 
                            text="확인" 
                            onClick={onConfirm} 
                            radius={2}
                            border="1px solid #757575"
                            hoverStyle={{
                              backgroundColor: "#ba7d1bff",
                              border: "2px solid #373737ff",
                            }}
                        />
                        <CustomButton 
                            text="취소" 
                            onClick={onCancel} 
                            radius={2}
                            backgroundColor="#f0f0f0" 
                            border="1px solid #757575"
                            hoverStyle={{
                                backgroundColor:"#b9b8b8ff",
                                border: "2px solid #373737ff"
                            }}
                        />
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
                    <DialogTitle sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        background: 'linear-gradient(90deg, #202021ff 0%, #4B4B4F 100%)', 
                        color: 'white' 
                    }}>
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
                        <CustomButton 
                            text="확인" 
                            onClick={onConfirm} 
                            radius={2}
                            border="1px solid #757575"
                            hoverStyle={{
                                backgroundColor: "#ba7d1bff",
                                border: "2px solid #373737ff",
                            }}
                        />
                        <CustomButton 
                        text="취소" 
                        onClick={onCancel} 
                        radius={2}
                        backgroundColor="#f0f0f0" 
                        border="1px solid #757575"
                            hoverStyle={{
                                backgroundColor:"#b9b8b8ff",
                                border: "2px solid #373737ff"
                            }}
                        />
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
                    <DialogTitle sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        background: 'linear-gradient(90deg, #202021ff 0%, #4B4B4F 100%)', 
                        color: 'white' 
                    }}>
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
                        <CustomButton 
                            text="닫기" 
                            onClick={onConfirm} 
                            radius={2}
                            backgroundColor="#f0f0f0" 
                            border="1px solid #757575"
                            hoverStyle={{
                                backgroundColor:"#b9b8b8ff",
                                border: "2px solid #373737ff"
                            }}
                        />
                    </DialogActions>
                </Dialog>
            )
        case 'error':
            return (
                <Dialog 
                    open={open} 
                    onClose={onCancel} 
                    disableAutoFocus
                    disableRestoreFocus
                >
                    <DialogTitle sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        background: 'linear-gradient(90deg, #202021ff 0%, #4B4B4F 100%)', 
                        color: 'white' 
                    }}>
                        <WarningAmberIcon color="error" fontSize="large" />
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
                        <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-line', color: 'red' }}>
                            {text}
                        </Typography>
                    </DialogContent>
                    
                    <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
                        <CustomButton 
                            text="닫기" 
                            onClick={onConfirm} 
                            radius={2}
                            backgroundColor="#f0f0f0" 
                            border="1px solid #757575"
                            hoverStyle={{
                                backgroundColor:"#b9b8b8ff",
                                border: "2px solid #373737ff"
                            }}
                        />
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
                    <DialogTitle sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        background: 'linear-gradient(90deg, #202021ff 0%, #4B4B4F 100%)', 
                        color: 'white' 
                    }}>
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
                        <CustomButton 
                            text="확인" 
                            onClick={onConfirm} 
                            radius={2}
                            border="1px solid #757575"
                            hoverStyle={{
                              backgroundColor: "#ba7d1bff",
                              border: "2px solid #373737ff",
                            }}
                        />
                        <CustomButton 
                            text="취소" 
                            onClick={onCancel} 
                            backgroundColor="#f0f0f0" 
                            radius={2}
                            border="1px solid #757575"
                            hoverStyle={{
                                backgroundColor:"#b9b8b8ff",
                                border: "2px solid #373737ff"
                            }}
                        />
                    </DialogActions>
                </Dialog>
            )
    }

    
}