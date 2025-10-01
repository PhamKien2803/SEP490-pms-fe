import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Spin } from 'antd';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/authSlice';

const UnauthorizedPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(logout());
            navigate('/login', { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
    }, [dispatch, navigate]);

    return (
        <Result
            status="403"
            title="403 - Không có quyền truy cập"
            subTitle="Xin lỗi, bạn không có quyền để xem trang này. Hệ thống sẽ tự động đăng xuất..."
            extra={
                <Spin size="large" />
            }
        />
    );
};

export default UnauthorizedPage;