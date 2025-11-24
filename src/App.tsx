import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate   } from "react-router-dom";
import {Box} from '@mui/material'
import Side from "./layout/Side";
import Content from "./layout/Content";
import Menu from "./component/Menu";
import ProtectedRoute from "./component/ProtectedRoute";

import { type User_Type } from "./Types/Components";
import LoginPage from './page/00_Login'
import TestPage from './page/99_Test'
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


function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ 로그인 유저 정보 전역 상태
  const [userInfo, setUserInfo] = useState<User_Type | null>(null);

   // ✅ localStorage에 로그인 정보 유지
  useEffect(() => {
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) setUserInfo(JSON.parse(savedUser));
  }, []);

  // ✅ 로그인 후 상태 업데이트
  const handleLoginSuccess = (user: User_Type | null) => {
    setUserInfo(user);
    localStorage.setItem("userInfo", JSON.stringify(user));
    navigate("/user");
  };

  // ✅ 로그아웃 처리
  const handleLogout = () => {
    console.log("로그아웃 클릭")
    setUserInfo(null);
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  // 사이드바/콘텐츠를 숨길 경로 목록
  const hideLayoutPaths = ["/login", "/test"];
  const shouldHideLayout = hideLayoutPaths.includes(location.pathname);

  return (
    <Box sx={{ width: '100vw', display: 'flex', backgroundColor: '#FEF4EA' }}>
      {shouldHideLayout ? (
        // 로그인, 테스트 페이지는 단독 표시
        <Routes>
          <Route index element={<Navigate to="/login" replace />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/test" element={<TestPage />} />
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
                      ? <Navigate to="/status" replace />
                      : <Navigate to="/login" replace />
                  }
                />
                {/* 유저관리 */}
                <Route path="/user" element={
                  <ProtectedRoute userInfo={userInfo} requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                  } 
                />
                <Route path="/user/log" element={
                  <ProtectedRoute userInfo={userInfo} requiredRole="admin">
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
