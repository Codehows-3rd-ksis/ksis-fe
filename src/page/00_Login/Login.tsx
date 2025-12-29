import { useState } from "react"
import { Box, Typography, InputAdornment } from '@mui/material'
import logo from '../../assets/logo.png'
import CustomButton from "../../component/CustomButton"
import CustomIconButton from '../../component/CustomIconButton'
import CustomTextField from "../../component/CustomTextField"
import { loginUser } from "../../API/00_LoginApi"
import Alert from "../../component/Alert";

interface LoginProps {
  onLoginSuccess: (accessToken: string) => void;
}

function Login({onLoginSuccess}: LoginProps) {
  const [loginInfo, setLoginInfo] = useState<{username: string, password: string}>({username: "", password: ""})
  const [isVisible, setIsVisible] = useState(false)
  const [openErrorAlert, setOpenErrorAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleInputChange = (key: keyof typeof loginInfo, value: string) => {
        setLoginInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    try {
      const data = await loginUser(loginInfo);
      
      // server response: { accessToken }
      onLoginSuccess(data.accessToken);
    } 
    catch(err:any) {
      console.error(err);

      // axios 에러일 때
      if (err.response && err.response.data) {
        const serverMsg = err.response.data.message;  // 백엔드 메시지
        setErrorMsg(serverMsg);
      } else {
        // 네트워크 에러 등
        setErrorMsg("로그인 중 오류가 발생했습니다.");
      }
      
      setOpenErrorAlert(true)
    }
  };


  const handleShowPassword = () => {
    setIsVisible(!isVisible);
  }

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center'}}>
      <Box>
        <Box sx={{alignItems: 'center'}}>
          <Box sx={{ maxWidth: 400, maxHeight: 400}}>
            {<img src={logo} alt="company logo" style={{ height: '100%', width: '100%' }} />}
          </Box>
          <Box>
            <Typography sx={{ fontSize: 54, fontWeight: 'bold', color: 'white'}}>데이터 수집 시스템</Typography>
          </Box>
        </Box>
        <Box sx={{ marginTop: 3, padding: 2, borderRadius: 3}}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3}}>
            <Box>
              <CustomTextField 
                inputWidth="330px"
                radius={20}
                fontSize="24px"
                height="50px"
                value={loginInfo?.username}
                disabled={false}
                readOnly={false}
                placeholder="ID"
                type="text"
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </Box>
            <Box>
              <CustomTextField 
                inputWidth="330px"
                radius={20}
                fontSize="24px"
                height="50px"
                value={loginInfo?.password}
                disabled={false}
                readOnly={false}
                placeholder="비밀번호"
                type={isVisible? 'text' : "password"}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onEnter={handleLogin}
                endAdornment={
                  <InputAdornment position="end">
                    { isVisible?
                        (<CustomIconButton icon="invisible" width='20px' height='20px' color="gray" onClick={handleShowPassword} />) :
                        (<CustomIconButton icon="visible"   width='20px' height='20px' color="gray" onClick={handleShowPassword} />) 
                    }
                  </InputAdornment>
                }
              />
            </Box>
            <CustomButton 
              text="로그인" width="330px" radius={20} height="50px" 
              backgroundColor="#F5A623" color='black' fontSize="24px"
              onClick={handleLogin} 
              hoverStyle={{
                backgroundColor: "#ba7d1bff",
                border: "2px solid #373737ff",
              }}
            />
          </Box>
        </Box>
      </Box>
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

export default Login
