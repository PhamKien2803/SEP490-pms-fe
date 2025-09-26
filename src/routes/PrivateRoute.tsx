import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/user';

interface PrivateRouteProps {
  allowRoles?: Role[];          // danh sách role được phép
  requireFunction?: string;     // URL function: "/accounts"
  requireAction?: string;       // action: "create" | "view" | "edit" | "delete"
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowRoles,
  requireFunction,
  requireAction,
}) => {
  const { user, canAction } = useAuth();
  const location = useLocation();

  // 1. Chưa login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check role (user.role chỉ là 1 string)
  if (allowRoles && allowRoles.length > 0) {
    if (!user.role || !allowRoles.includes(user.role as Role)) {
      return <Navigate to="/403" replace />;
    }
  }

  // 3. Check permission động
  if (requireFunction && requireAction && !canAction(requireFunction, requireAction)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
