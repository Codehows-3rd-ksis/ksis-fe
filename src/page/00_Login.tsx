import {useState} from "react"
import { Box, Typography, InputAdornment } from '@mui/material'
import logo from '../assets/ksisLogo.png'
import CustomButton from "../component/CustomButton"
import CustomIconButton from '../component/CustomIconButton'
import CustomTextField from "../component/CustomTextField"

import { type User_Type } from "../Types/Components"
interface LoginProps {
  onLoginSuccess: (user: User_Type) => void;
}

function Login({onLoginSuccess}: LoginProps) {
  const [loginInfo, setLoginInfo] = useState<{loginId: string, password: string}>({loginId: "", password: ""})
  const [isVisible, setIsVisible] = useState(false)

  const handleInputChange = (key: keyof typeof loginInfo, value: string) => {
        setLoginInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = () => {
    console.log('loginInfo', loginInfo)

    const user = { name: "홍길동", loginId: loginInfo.loginId, id:0, role:'admin' };
    onLoginSuccess(user);
  }

  const handleShowPassword = () => {
    setIsVisible(!isVisible);
  }

  return (
    <Box sx={{ width: '100vw', height: '100vh', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center'}}>
      <Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap:1}}>
          <Box>
            {<img src={logo} alt="company logo" style={{ height: '100%', width: '100%' }} />}
          </Box>
          <Box sx={{width: '75%'}}>
            <Typography sx={{ fontSize: 40, fontWeight: 'bold', color: 'black'}}>데이터 수집 시스템</Typography>
          </Box>
        </Box>
        <Box sx={{border: '5px solid black', marginTop: 3, padding: 2, borderRadius: 3}}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3}}>
            <Box>
              {/* <Typography sx={{ fontSize: 20, fontWeight: 'bold', color: 'black'}}>아이디</Typography> */}
              <CustomTextField 
                inputWidth="330px"
                radius={20}
                value={loginInfo?.loginId}
                disabled={false}
                readOnly={false}
                placeholder="ID"
                type="text"
                onChange={(e) => handleInputChange('loginId', e.target.value)}
              />
            </Box>
            <Box>
              {/* <Typography sx={{ fontSize: 20, fontWeight: 'bold', color: 'black'}}>비밀번호</Typography> */}
              <CustomTextField 
                inputWidth="330px"
                radius={20}
                value={loginInfo?.password}
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
            </Box>
            <CustomButton 
              text="로그인" width="330px" radius={20} 
              backgroundColor="#F5A623" color='black'
              onClick={handleLogin} 
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Login
