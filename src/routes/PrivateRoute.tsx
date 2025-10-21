import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { usePermission } from '../hooks/usePermission';
import { PagePermissionProvider } from '../context/PermissionContext';

interface PrivateRouteProps {
  requireFunction?: string;
  requireAction?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  requireFunction,
  requireAction,
}) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { canAction } = usePermission();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireFunction && requireAction && !canAction(requireFunction, requireAction)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <PagePermissionProvider value={requireFunction || null}>
      <Outlet />
    </PagePermissionProvider>
  );
};

export default PrivateRoute;