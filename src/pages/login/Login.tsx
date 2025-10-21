import { Form, Input, Button, Typography, Checkbox, Row, Col, Tooltip } from 'antd';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getCurrentUser, login } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LocalStorageKey } from '../../types/local-storage';
import { constants } from '../../constants';
import { LockOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { toast } from 'react-toastify';

const { Title, Link } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoginPending } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useLocalStorage<string>(LocalStorageKey.EMAIL, '');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);

    const handleLogin = async (values: { email: string; password: string }) => {
        const result = await dispatch(login(values));

        if (login.fulfilled.match(result)) {
            if (remember) {
                setEmail(values.email);
            } else {
                setEmail('');
            }
            const getUserResult = await dispatch(getCurrentUser());
            if (getCurrentUser.fulfilled.match(getUserResult)) {
                toast.success("Đăng nhập thành công");
                navigate(constants.APP_PREFIX, { replace: true });
            } else {
                toast.error("Không lấy được thông tin người dùng");
            }
        } else if (login.rejected.match(result)) {
            const error = result.payload;
            if (typeof error === "string") {
                toast.error(error);
            } else if (error?.errorField) {
                form.setFields([{ name: error.errorField, errors: [error.message] }]);
            } else {
                toast.error(error?.message || "Đăng nhập thất bại");
            }
        }
    };

    const animationsCSS = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-25px) rotate(15deg); }
            100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        .login-form-container {
            animation: fadeInUp 0.8s ease-out forwards;
        }
        .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(9, 88, 217, 0.2);
        }
    `;

    const styles = {
        loginPage: { minHeight: '100vh', backgroundColor: '#f0f5ff', overflow: 'hidden' },
        formColumn: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
        formContainer: {
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '24px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
        },
        illustrationColumn: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #e6f7ff 0%, #d6e4ff 100%)',
        },
        mainIllustration: {
            maxWidth: '85%',
            maxHeight: '85%',
            position: 'relative',
            zIndex: 2,
            animation: 'float 6s ease-in-out infinite',
        },
        blob: {
            position: 'absolute',
            animation: 'morph 15s ease-in-out infinite',
            zIndex: 1,
        }
    };
    return (
        <>
            <style>{animationsCSS}</style>
            <Row style={styles.loginPage}>
                <Col xs={24} lg={10} style={styles.formColumn}>
                    <div style={styles.formContainer} className="login-form-container">
                        <Tooltip title="Quay lại trang chủ">
                            <Button
                                type="text"
                                shape="circle"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/')}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '20px',
                                    fontSize: '16px'
                                }}
                            />
                        </Tooltip>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'inline-block' }}>
                                <Title level={3} style={{ color: '#0958d9', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '28px' }}>🐬</span> Dolphin Preschool
                                </Title>
                            </div>
                            <Paragraph style={{ marginTop: '8px', color: '#595959' }}>
                                Chào mừng quý phụ huynh trở lại!
                            </Paragraph>
                        </div>

                        <Form form={form} layout="vertical" onFinish={handleLogin} initialValues={{ email, remember }}>
                            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không đúng định dạng!' }]}>
                                <Input prefix={<UserOutlined />} placeholder="Nhập email của bạn" size="large" />
                            </Form.Item>

                            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" onChange={(e) => setPassword(e.target.value)} />
                            </Form.Item>

                            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>Ghi nhớ đăng nhập</Checkbox>
                                </Form.Item>
                                <Link href="#">Quên mật khẩu?</Link>
                            </Row>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large" loading={isLoginPending} block className="login-button" style={{ transition: 'all 0.3s ease' }} disabled={password.length < 8}>
                                    Đăng Nhập
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>

                <Col xs={0} lg={14} style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #e6f7ff 0%, #d6e4ff 100%)' }}>
                    <style>
                        {`
            @keyframes rotate {
                from { transform: rotate(0deg) scale(1); }
                to { transform: rotate(360deg) scale(1.05); }
            }
            .shape {
                position: absolute;
                animation: rotate 40s linear infinite alternate;
            }
        `}
                    </style>
                    <div className="shape" style={{ width: '200px', height: '200px', background: 'rgba(9, 88, 217, 0.15)', borderRadius: '50%', top: '15%', left: '20%' }}></div>
                    <div className="shape" style={{ width: '150px', height: '150px', background: 'rgba(250, 140, 22, 0.25)', borderRadius: '15%', bottom: '20%', right: '25%', animationDuration: '30s', animationDirection: 'reverse' }}></div>
                    <div className="shape" style={{ width: '80px', height: '80px', border: '10px solid rgba(9, 88, 217, 0.2)', top: '25%', right: '15%', animationDuration: '50s' }}></div>
                    <div className="shape" style={{ width: '100px', height: '100px', background: 'rgba(250, 140, 22, 0.1)', borderRadius: '50%', bottom: '15%', left: '10%', animationDuration: '35s' }}></div>

                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="./Dolphin.svg" alt="Dolphin Preschool Illustration" style={{ ...styles.mainIllustration, animation: 'none' } as React.CSSProperties} />
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Login;
