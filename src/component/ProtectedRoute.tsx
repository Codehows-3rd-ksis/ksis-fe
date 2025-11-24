
import { Navigate } from 'react-router-dom';
import { type User_Type } from '../Types/Components';

interface ProtectedRouteProps {
  userInfo?: User_Type | null;
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ userInfo, children, requiredRole }: ProtectedRouteProps) {
  if (!userInfo) return <Navigate to="/login" replace />;

  if (requiredRole && userInfo.role !== requiredRole) {
    alert('접근 권한이 없습니다.');
    return <Navigate to="/setting" replace />;
  }

  return <>{children}</>;
}