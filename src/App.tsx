import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate  } from "react-router-dom";
import {Box, Typography} from '@mui/material'
import { useAuthStore } from "./Store/authStore";
import Side from "./layout/Side";
import Content from "./layout/Content";
import Menu from "./component/Menu";
import ProtectedRoute from "./component/ProtectedRoute";

import LoginPage from './page/00_Login/Login'

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
  const { user, isLoading, setToken, fetchUserProfile, loadFromStorage } = useAuthStore();

  // 새로고침 시 저장된 값 로드
  useEffect(() => {
    (async () => {
      await loadFromStorage();
    })();
  }, []);

  // 사이드바/콘텐츠를 숨길 경로 목록
  const hideLayoutPaths = ["/login"];
  const shouldHideLayout = hideLayoutPaths.includes(location.pathname);

  // zustand store 이용하여 유저 프로필과 토큰을 전역 저장
  const handleLoginSuccess = async (accessToken: string) => {
    setToken(accessToken);
    await fetchUserProfile();

    // 로그인 성공 후 권한에 따라 이동
    const currentUser = useAuthStore.getState().user; 
    if (currentUser?.role === "ROLE_ADMIN") {
      navigate("/user");
    } else {
      navigate("/status");
    }
  };

  if (isLoading) {
    // 프로필 로딩 중엔 로딩 UI 또는 빈 화면 표시
    return <Box sx={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Typography>Loading...</Typography>
    </Box>;
  }


  return (
    <Box sx={{ width: '100vw', display: 'flex', backgroundColor: '#FEF4EA' }}>
      {shouldHideLayout ? (
        // 로그인 페이지는 단독 표시
        <Routes>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      ) : (
        // 나머지 페이지는 Side + Content 포함
        <>
          <Box sx={{width: '14.5vw', padding: 1, minWidth: '260px'}}>
            <Side>
              {/* <Menu /> */}
              <ProtectedRoute userInfo={user}>
                <Menu />
              </ProtectedRoute>
            </Side>
          </Box>
          <Box sx={{width: '84.5vw', padding: 1}}>
            <Content>
              <Routes>
                <Route
                  path="/"
                  element={
                    user
                      ? <Navigate to="/status" replace />
                      : <Navigate to="/login" replace />
                  }
                />
                {/* 유저관리 */}
                <Route path="/user" element={
                  <ProtectedRoute userInfo={user} requiredRole="ROLE_ADMIN">
                    <UserManagement />
                  </ProtectedRoute>
                  } 
                />
                <Route path="/user/log" element={
                  <ProtectedRoute userInfo={user} requiredRole="ROLE_ADMIN">
                    <UserLog />
                  </ProtectedRoute>
                  } 
                />
                {/* 수집설정 */}
                <Route path="/setting" element={
                  <ProtectedRoute userInfo={user}>
                    <Setting />
                  </ProtectedRoute>
                  } 
                />
                <Route path="/setting/reg" element={
                  <ProtectedRoute userInfo={user}>
                    <SettingReg />
                  </ProtectedRoute>
                  } 
                />
                <Route path="/setting/edit" element={
                  <ProtectedRoute userInfo={user}>
                    <SettingEdit />
                  </ProtectedRoute>
                  } 
                />
                {/* 수집현황 */}
                <Route path="/status" element={
                  <ProtectedRoute userInfo={user}>
                    <Status />
                  </ProtectedRoute>
                  }
                />
                <Route path="/status/detail/:workId" element={
                  <ProtectedRoute userInfo={user}>
                    <StatusDetail />
                  </ProtectedRoute>
                  }
                />

                {/* 수집이력 */}
                <Route path="/history" element={
                  <ProtectedRoute userInfo={user}>
                    <History />
                  </ProtectedRoute>
                  }
                />
                <Route path="/history/detail/:id" element={

                  <ProtectedRoute userInfo={user}>
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
