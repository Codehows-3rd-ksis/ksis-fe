
import { Navigate } from 'react-router-dom';
import { type User_Type } from '../Types/Components';

interface ProtectedRouteProps {
  userInfo?: User_Type | null;
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ userInfo, children, requiredRole }: ProtectedRouteProps) {
  if (!userInfo) return <Navigate to="/login" replace />;

  // 1️⃣ 토큰이 없으면 로그인 페이지로
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return <Navigate to="/login" replace />;

  // 2️⃣ 토큰은 있지만 userInfo가 null이면? (이슈 방지)
  //    → localStorage에서 userInfo 복구가 안 된 잠깐의 상태 등
  if (!userInfo) return <Navigate to="/login" replace />;

  // 3️⃣ role 체크 (관리자만 접근 같은 경우)
  if (requiredRole && userInfo.role !== requiredRole) {
    alert('접근 권한이 없습니다.');
    return <Navigate to="/status" replace />;
  }

  return <>{children}</>;
}