import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

const PublicRoute = () => {
    const { user } = useAppSelector((state) => state.auth);
    // Nếu đã login thì redirect về HOME
    if (user) {
        return <Navigate to="/" replace />;
    }
    // Nếu chưa login thì cho phép truy cập các route công khai như /login, /forgot-password
    return <Outlet />;
};

export default PublicRoute;
