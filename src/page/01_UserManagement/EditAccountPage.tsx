import { useState, useEffect } from 'react'
import { Box, Typography, InputAdornment } from '@mui/material'
import CustomButton from '../../component/CustomButton';
import CustomTextField from '../../component/CustomTextField';
import CustomIconButton from '../../component/CustomIconButton';
import Alert from '../../component/Alert';
import { updateUserAccount, checkUsernameEdit } from '../../API/01_UsermanagementApi';

import { type UserTableRows } from '../../Types/TableHeaders/UserManageHeader'

interface EditPageProps {
    row: UserTableRows | null;
    handleDone: () => void;
    handleCancel: () => void;
}

interface UserForm {
  username: string;
  password: string;
  passwordConfirm: string;
}

export default function EditPage(props: EditPageProps) {
    const {row, handleDone, handleCancel} = props
    const [isValid_id, setIsValid_id] = useState<boolean | null>(null);
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [isVisible, setIsVisible] = useState(false)
    const [isPasswordMismatch, setIsPasswordMismatch] = useState(false);
    const [newData, setNewData] = useState<UserForm>({
        username: row?.username || '',
        password: row?.password || '',
        passwordConfirm: '',
    })
    const [openCancelAlert, setOpenCancelAlert] = useState(false)
    const [openEditAlert, setOpenEditAlert] = useState(false)

    const [openValidAlert, setOpenValidAlert] = useState(false)
    const [validateMsg, setValidateMsg] = useState('')
    const [openErrorAlert, setOpenErrorAlert] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (!row) return;

        const valid = validateLoginId(row.username ?? "");
        setIsValid_id(valid);
    }, [row]);

    const handleShowPassword = () => {
        setIsVisible(!isVisible);
    }

    const handleInputChange = (key: keyof typeof newData, value: string) => {
        setNewData((prev) => {
            const updated = { ...prev, [key]: value };

            if (key === 'username') {
                if (value === '') {
                    setIsValid_id(null); // 입력이 없으면 검사 안함
                } else {
                    setIsValid_id(validateLoginId(value));
                }
            }

            if (key === 'password') {
              if (value === '') {
                setIsValidPassword(null);
              } else {
                    if(value.length < 8) setIsValidPassword(false);
                    else setIsValidPassword(true);
              }
            }
            
            if (key === 'passwordConfirm' || key === 'password') {
                const mismatch = updated.password !== updated.passwordConfirm;
                setIsPasswordMismatch(mismatch);
            }

            return updated;
        });
    }

    const validateLoginId = (id: string): boolean => {
      if( id.length < 8 || id.length > 20) return false;

      let count = 0;
      if (/[a-z]/.test(id)) count++;    // 영소문자
      if (/[0-9]/.test(id)) count++;    // 숫자

      return count >= 2;
    };

    const handleValidate = async () => {
        try {
            if(row === null) return;
            
            const isDuplicate = await checkUsernameEdit(newData.username, row.userId);
            // console.log('isDuplicate', isDuplicate)            

            const password = newData.password;
            const passwordConfirm = newData.passwordConfirm;

            // 한글 포함 여부 검사
            const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(password);
            const hasKoreanC = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(passwordConfirm);

            if (hasKorean || hasKoreanC) {
                setValidateMsg('비밀번호에 한글은 포함될 수 없습니다.');
                setOpenValidAlert(true)
                return;
            }

            const errMsg = []
            if (!isValid_id || isValid_id === null) errMsg.push('아이디 양식') 
            if (isDuplicate.duplicate) errMsg.push(isDuplicate.message) 
            if (!isValidPassword || isValidPassword === null) errMsg.push('비밀번호 양식')
            if (isPasswordMismatch) errMsg.push('비밀번호 불일치')

            if(errMsg.length !== 0) {
                setValidateMsg(errMsg.join('\n'));
                setOpenValidAlert(true)
            } else {
                handleEdit()
            }
        }
        catch(err) {
            console.error(err)
            setOpenEditAlert(false);
            setErrorMsg('get User 실패');
            setOpenErrorAlert(true)
        }
        
    }
    const handleEdit = async () => {
        try {
            if(row === null) {
                setOpenEditAlert(false);
                setErrorMsg('row is null // User 수정 실패');
                setOpenErrorAlert(true)
                return;
            }
            await updateUserAccount(row.userId,{
                username: newData.username,
                password: newData.password,
            })
            handleDone()
        }
        catch(err) {
            console.error(err)
            setOpenEditAlert(false);
            setErrorMsg('User 수정 실패');
            setOpenErrorAlert(true)
            
        }
    }


    return (
        <Box sx={{
            width: '600px',
            height: '500px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <Box sx={{background: "linear-gradient(90deg, #202021ff 0%, #4B4B4F 100%)", display: 'flex', justifyContent: 'space-between'}}>
                <Typography sx={{fontSize: 48, fontWeight: 'bold', marginLeft: '20px', color: "white"}}>유저 계정 수정</Typography>
                <CustomIconButton icon="close" backgroundColor='transparent' color="white" onClick={()=>setOpenCancelAlert(true)}/>
            </Box>
            <Box sx={{
                border: '2px solid #abababff',
                marginLeft: '20px',
                marginRight: '20px',
                borderRadius: 1,
                paddingTop: 1,
                paddingBottom: 1,
                overflowY: 'auto'
            }}>
                {/* ID */}
                <Box sx={{display: 'flex', justifyContent: 'space-around', gap: 2, padding: 1}}>
                    <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', borderRight: '1px solid', width: '200px'}}>
                        <Typography>아이디</Typography>
                        <Typography sx={{color: 'red'}}>*</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <CustomTextField 
                          variant="outlined"
                          value={newData.username}
                          inputWidth="300px"
                          disabled={false}
                          readOnly={false}
                          placeholder="아이디"
                          type="text"
                          onChange={(e) => handleInputChange('username', e.target.value)}
                        />
                        <Box sx={{ backgroundColor: '#c5c4c7', borderRadius:1, width: '300px'}}>
                            <Typography sx={{fontSize: 14}}>∴ 영문 소문자(a-z), 숫자(0~9) 조합으로 8자 이상 20자 이하 이어야 합니다.</Typography>
                            {isValid_id === null ? null : (
                              isValid_id ? (
                                <Typography sx={{ color: 'green' }}>사용 가능한 아이디 형식입니다.</Typography>
                              ) : (
                                <Typography sx={{ color: 'red' }}>사용 불가능한 아이디 형식입니다.</Typography>
                              )
                            )}
                        </Box>
                    </Box>
                </Box>
                {/* 비밀번호 */}
                <Box sx={{display: 'flex', justifyContent: 'space-around', gap: 2, padding: 1}}>
                    <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', borderRight: '1px solid', width: '200px'}}>
                        <Typography>비밀번호</Typography>
                        <Typography sx={{color: 'red'}}>*</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <CustomTextField 
                            variant="outlined"
                            value={newData.password}
                            inputWidth="300px"
                            disabled={false}
                            readOnly={false}
                            placeholder="비밀번호"
                            type={isVisible? 'text' : "password"}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            endAdornment={
                              <InputAdornment position="end">
                                { isVisible?
                                    (<CustomIconButton icon="invisible" width='20px' height='20px' color="gray" onClick={handleShowPassword} />) :
                                    (<CustomIconButton icon="visible"   width='20px' height='20px' color="gray" onClick={handleShowPassword} />) 
                                }
                              </InputAdornment>
                            }
                        />
                        <Box sx={{ backgroundColor: '#c5c4c7', borderRadius:1, width: '300px'}}>
                            <Typography sx={{fontSize:14}}>∴ 8자 이상 입력해주세요.</Typography>
                            {isValidPassword === null ? null : (
                                isValidPassword ? (
                                    <Typography sx={{ color: 'green' }}>사용 가능한 비밀번호 형식입니다.</Typography>
                                ) : (
                                    <Typography sx={{ color: 'red' }}>사용 불가능한 비밀번호 형식입니다.</Typography>
                                )
                            )}
                        </Box>
                    </Box>
                </Box>
                {/* 비밀번호 확인 */}
                <Box sx={{display: 'flex', justifyContent: 'space-around', gap: 2, padding: 1}}>
                    <Box sx={{display: 'flex', justifyContent:'center', alignItems: 'center', borderRight: '1px solid', width: '200px'}}>
                        <Typography>비밀번호 확인</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <CustomTextField 
                            variant="outlined"
                            value={newData.passwordConfirm}
                            inputWidth="300px"
                            disabled={false}
                            readOnly={false}
                            placeholder="비밀번호 확인"
                            type={isVisible? 'text' : "password"}
                            onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                            endAdornment={
                              <InputAdornment position="end">
                                { isVisible?
                                    (<CustomIconButton icon="invisible" width='20px' height='20px' color="gray" onClick={handleShowPassword} />) :
                                    (<CustomIconButton icon="visible"   width='20px' height='20px' color="gray" onClick={handleShowPassword} />) 
                                }
                              </InputAdornment>
                            }
                        />
                        <Box sx={{ backgroundColor: '#c5c4c7', borderRadius:1, width: '300px', 
                            overflow: 'hidden', // 높이 줄이기 위해 꼭 필요
                            height: isPasswordMismatch  ? 'auto' : 0,
                            opacity: isPasswordMismatch  ? 1 : 0,
                            transition: 'all 0.3s ease', // 부드럽게 등장/사라짐
                        }}>
                            <Typography sx={{color: 'red', fontSize: 14}}>∴ 입력한 비밀번호가 다릅니다.</Typography>
                            <Typography sx={{color: 'red', fontSize: 14, whiteSpace: 'pre'}}>{'     '}비밀번호를 확인해주세요.</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center', gap:2, marginBottom: 2}}>
                <CustomButton 
                    text="수정" 
                    onClick={()=>setOpenEditAlert(true)} 
                    radius={2}
                    border="1px solid #757575"
                    hoverStyle={{
                      backgroundColor: "#ba7d1bff",
                      border: "2px solid #373737ff",
                    }}
                />
                <CustomButton 
                    text="닫기" 
                    onClick={()=>setOpenCancelAlert(true)} 
                    radius={2}
                    backgroundColor="#F2F2F2"
                    border="1px solid #757575"
                    hoverStyle={{
                      backgroundColor: "transparent",
                      border: "2px solid #373737ff",
                    }}
                />
            </Box>

            {/* Cancel Alert */}
            <Alert
              open={openCancelAlert}
              text="정말로 닫으시겠습니까?"
              onConfirm={() => {
                setOpenCancelAlert(false);
                handleCancel()
              }}
              onCancel={() => {
                setOpenCancelAlert(false);
              }}
            />
            {/* Edit Alert */}
            <Alert
              open={openEditAlert}
              text="수정 하시겠습니까?"
              type="question"
              onConfirm={() => {
                setOpenEditAlert(false);
                handleValidate()
              }}
              onCancel={() => {
                setOpenEditAlert(false);
              }}
            />
            {/* Validation Alert */}
            <Alert
              open={openValidAlert}
              text={validateMsg}
              type="validate"
              onConfirm={() => {
                setOpenValidAlert(false);
              }}
            />
            {/* Error Alert */}
            <Alert
              open={openErrorAlert}
              text={errorMsg}
              type="error"
              onConfirm={() => {
                setOpenErrorAlert(false);
              }}
            />
        </Box>
    )
}