import { Layout, Menu, Avatar, Typography } from 'antd';
import {
    DashboardOutlined,
    TeamOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const NAVIGATION = [
    {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
    },
    {
        key: '/customers',
        icon: <TeamOutlined />,
        label: 'Customers',
    },
];

const DashboardLayoutAntd = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
                }}
            >
                <div
                    style={{
                        padding: 16,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottom: '1px solid #f0f0f0',
                    }}
                >
                    <Avatar src="https://avatars.githubusercontent.com/u/19550456" size="large" />
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={handleMenuClick}
                    items={NAVIGATION}
                    style={{ fontWeight: 500 }}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: '#fff',
                        padding: '0 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Typography.Title level={5} style={{ margin: 0 }}>
                        {NAVIGATION.find((nav) => nav.key === location.pathname)?.label || 'Trang'}
                    </Typography.Title>
                    <LogoutOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
                </Header>
                <Content style={{ margin: '24px', background: '#fff', borderRadius: 8, padding: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayoutAntd;
