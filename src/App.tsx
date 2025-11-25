import { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate   } from "react-router-dom";
import {Box} from '@mui/material'
import Side from "./layout/Side";
import Content from "./layout/Content";
import Menu from "./component/Menu";
import ProtectedRoute from "./component/ProtectedRoute";

import { type User_Type } from "./Types/Components";
import LoginPage from './page/00_Login/Login'
import { jwtDecode } from "jwt-decode";
import { getProfile } from "./API/00_LoginApi"
//** 유저관리 */
import UserManagement from "./page/01_UserManagement/UserManagement";
import UserLog from "./page/01_UserManagement/LogPage"
//** 수집설정 */
import Setting from "./page/02_Setting/Setting"
import SettingReg from "./page/02_Setting/RegPage"
import SettingEdit from "./page/02_Setting/EditPage"
//** 수집현황 */
import Status from "./page/03_Status/Status"
import StatusDetail from "./page/03_Status/StatusDetail"

//** 수집이력 */
import History from "./page/05_History/History"
import HistoryDetail from "./page/05_History/HistoryDetail";


interface JwtPayload {
  sub: string;
  role: "ROLE_ADMIN" | "";
  exp: number;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<User_Type | null>(() => {
      // 새로고침시 로그인정보 유지
      const saved = localStorage.getItem("userInfo");
      return saved ? JSON.parse(saved) : null;
  });


  // ✅ 로그인 후 상태 업데이트
  const handleLoginSuccess = async (accessToken: string) => {
    try {
      localStorage.setItem("accessToken", accessToken);
      const payload = jwtDecode<JwtPayload>(accessToken);
      // payload = { sub, role, exp }
      console.log("payload", payload)
      
      const userData = await getProfile() // return { userId, username, name, role }
      console.log('userData', userData)
      localStorage.setItem("userInfo", JSON.stringify(userData));
      setUserInfo(userData);
      
      // 관리자일 경우 로그인 시 유저관리 페이지로, 외에는 현황페이지로 자동 진입
      if(userData.role === 'ROLE_ADMIN') {
        navigate("/user");
      } else navigate("/status")

    }
    catch(err) {
      console.error(err)
      alert('로그인 유저 정보 조회 실패')
    }

  };

  // ✅ 로그아웃 처리
  const handleLogout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      setUserInfo(null);

      navigate("/login");
  };

  // 사이드바/콘텐츠를 숨길 경로 목록
  const hideLayoutPaths = ["/login"];
  const shouldHideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <Box sx={{ width: '100vw', display: 'flex', backgroundColor: '#FEF4EA' }}>
      {shouldHideLayout ? (
        // 로그인 페이지는 단독 표시
        <Routes>
          <Route index element={<Navigate to="/login" replace />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      ) : (
        // 나머지 페이지는 Side + Content 포함
        <>
          <Box sx={{width: '14.5vw', padding: 1, minWidth: '260px'}}>
            <Side>
              {/* <Menu /> */}
              <ProtectedRoute userInfo={userInfo}>
                <Menu userInfo={userInfo} onLogout={handleLogout} />
              </ProtectedRoute>
            </Side>
          </Box>
          <Box sx={{width: '84.5vw', padding: 1}}>
            <Content>
              <Routes>
                <Route
                  path="/"
                  element={
                    userInfo
                    // isAuthenticated
                      ? <Navigate to="/status" replace />
                      : <Navigate to="/login" replace />
                  }
                />
                {/* 유저관리 */}
                <Route path="/user" element={
                  <ProtectedRoute userInfo={userInfo} requiredRole="ROLE_ADMIN">
                    <UserManagement />
                  </ProtectedRoute>
                  } 
                />
                <Route path="/user/log" element={
                  <ProtectedRoute userInfo={userInfo} requiredRole="ROLE_ADMIN">
                    <UserLog />
                  </ProtectedRoute>
                  } 
                />
                {/* 수집설정 */}
                <Route path="/setting" element={
                  <ProtectedRoute userInfo={userInfo}>
                    <Setting />
                  </ProtectedRoute>
                  } 
                />
                <Route path="/setting/reg" element={
                  <ProtectedRoute userInfo={userInfo}>
                    <SettingReg />
                  </ProtectedRoute>
                  } 
                />
                <Route path="/setting/edit" element={
                  <ProtectedRoute userInfo={userInfo}>
                    <SettingEdit />
                  </ProtectedRoute>
                  } 
                />
                {/* 수집현황 */}
                <Route path="/status" element={
                  <ProtectedRoute userInfo={userInfo}>
                    <Status />
                  </ProtectedRoute>
                  }
                />
                <Route path="/status/detail/:id" element={
                  <ProtectedRoute userInfo={userInfo}>
                    <StatusDetail />
                  </ProtectedRoute>
                  }
                />

                {/* 수집이력 */}
                <Route path="/history" element={
                  <ProtectedRoute userInfo={userInfo}>
                    <History />
                  </ProtectedRoute>
                  }
                />
                <Route path="/history/detail/:id" element={

                  <ProtectedRoute userInfo={userInfo}>
                    <HistoryDetail />
                  </ProtectedRoute>
                  }
                />

              </Routes>
            </Content>
          </Box>
        </>
      )}
    </Box>
  )
}

export default App
