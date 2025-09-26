import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../../components/error-boundary/Error';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LocalStorageKey } from '../../types/local-storage';
import { Header } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { SIDER_COLLAPSED_WIDTH } from '../../components/sider/Sider';


const { Content } = Layout;

const AdminDashboard: React.FC = () => {
    const [fixedCollapsed, setFixedCollapsed] = useLocalStorage(
        LocalStorageKey.IS_SIDE_BAR_COLLAPSED,
        false
    );

    return (
        <Layout>
            <Sider collapsible collapsed={fixedCollapsed} onCollapse={setFixedCollapsed} />
            <Layout style={{ marginLeft: fixedCollapsed ? SIDER_COLLAPSED_WIDTH : 0 }}>
                <Header />
                <Content
                    style={{
                        minHeight: 280,
                        width: '100%',
                        backgroundColor: '#fafbfe',
                        position: 'relative',
                        overflowY: 'auto', // Scrollable content
                        height: 'calc(100vh - 82px)', // Subtract header height
                    }}
                >
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;
