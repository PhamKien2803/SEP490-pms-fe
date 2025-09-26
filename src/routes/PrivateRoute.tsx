import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { Role } from '../types/user';

interface PrivateRouteProps {
  allowRoles?: Role[];
  requireFunction?: string;
  requireAction?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowRoles,
  requireFunction,
  requireAction,
}) => {
  const location = useLocation();
  const { user, permissionMap } = useAppSelector((state) => state.auth);

  // 1. Chưa login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check role
  if (allowRoles?.length && !allowRoles.includes(user.role as Role)) {
    return <Navigate to="/403" replace />;
  }

  // 3. Check permission
  if (requireFunction && requireAction) {
    const actions = permissionMap.get(requireFunction);
    if (!actions || !actions[requireAction]) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
