import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/authSlice';
import { constants } from '../../constants';

function NotFound() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const handleBackHome = () => {
        navigate(constants.APP_PREFIX);
    };

    const handleLogoutAndRedirect = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <Result
            status="404"
            title="404"
            subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
            extra={
                [
                    user && (
                        <Button key="home" type="primary" onClick={handleBackHome}>
                            Quay về trang chủ
                        </Button>
                    ),
                    <Button key="logout" onClick={handleLogoutAndRedirect}>
                        Về trang Đăng nhập
                    </Button>
                ]
            }
        />
    );
}

export default NotFound;