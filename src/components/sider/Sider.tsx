import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// export const SIDER_COLLAPSED_WIDTH = 80;

// interface SiderProps {
//     fixedCollapsed: boolean;
//     setFixedCollapsed: (val: boolean) => void;
// }


export const SIDER_COLLAPSED_WIDTH = 85;
export const SIDER_WIDTH = 256;

interface SiderProps {
    fixedCollapsed: boolean;
    setFixedCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sider: React.FC<SiderProps> = ({ fixedCollapsed, setFixedCollapsed }) => {
    const navigate = useNavigate();

    const toggleCollapse = () => setFixedCollapsed(!fixedCollapsed);

    return (
        <Layout.Sider
            collapsible
            collapsed={fixedCollapsed}
            onCollapse={toggleCollapse}
            width={220}
            collapsedWidth={SIDER_COLLAPSED_WIDTH}
            style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
        >
            <div
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#fff',
                }}
            >
                {fixedCollapsed ? '📊' : 'Dashboard'}
            </div>
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['dashboard']}
                onClick={({ key }) => navigate(key)}
                items={[
                    {
                        key: '/dashboard',
                        icon: <DashboardOutlined />,
                        label: 'Dashboard',
                    },
                    {
                        key: '/users',
                        icon: <UserOutlined />,
                        label: 'Users',
                    },
                ]}
            />
        </Layout.Sider>
    );
};

export default Sider;
