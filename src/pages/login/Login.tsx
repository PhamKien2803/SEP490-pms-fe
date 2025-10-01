import { Form, Input, Button, Typography, Checkbox } from 'antd';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getCurrentUser, login } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LocalStorageKey } from '../../types/local-storage';
import { constants } from '../../constants';

const { Title, Text, Link } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoginPending } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useLocalStorage<string>(LocalStorageKey.EMAIL, '');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [fieldError, setFieldError] = useState<string | null>(null);

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
                navigate(constants.APP_PREFIX, { replace: true });
            } else {
                setFieldError("Không lấy được thông tin người dùng");
            }
        } else if (login.rejected.match(result)) {
            const error = result.payload;
            if (typeof error === "string") {
                setFieldError(error);
            } else if (error?.errorField) {
                form.setFields([{ name: error.errorField, errors: [error.message] }]);
            } else {
                setFieldError(error?.message || "Login failed");
            }
        }
    };
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <div
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 64px',
                    maxWidth: 480,
                    margin: '0 auto',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <img src="/logo.jpg" alt="logo" width={48} height={48} />
                    <Title level={2} style={{ margin: '16px 0 8px' }}>Sign in</Title>
                    <Text>
                        Welcome back to Dophin Preschool! Please enter your details below to sign in.
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
                    initialValues={{ email, password, remember }}
                >
                    <Form.Item
                        label="Username"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Invalid email format' },
                        ]}
                    >
                        <Input
                            placeholder="Username"
                            size="large"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password
                            placeholder="Password"
                            size="large"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Item>

                    {fieldError && (
                        <div style={{ color: 'red', marginBottom: 16 }}>{fieldError}</div>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 24,
                        }}
                    >
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            >
                                Remember me
                            </Checkbox>
                        </Form.Item>
                        <Link href="#">Forgot password?</Link>
                    </div>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={isLoginPending}
                            disabled={password.length < 8}
                            style={{ width: '100%' }}
                        >
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            {/* Right - Image */}
            <div
                style={{
                    flex: 1,
                    backgroundImage: 'url("/1.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
        </div>
    );
};

export default Login;
