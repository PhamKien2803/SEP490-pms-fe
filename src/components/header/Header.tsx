import React from 'react';
import { Layout, Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const Header: React.FC = () => {
    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            // TODO: Add logout logic
        }
    };

    const menu = (
        <Menu
            onClick={handleMenuClick}
            items={[
                {
                    key: 'profile',
                    label: 'Profile',
                },
                {
                    key: 'logout',
                    label: 'Logout',
                },
            ]}
        />
    );

    return (
        <Layout.Header
            style={{
                backgroundColor: '#fff',
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                height: 64,
                boxShadow: '0 2px 8px #f0f1f2',
                zIndex: 1,
            }}
        >
            <Dropdown overlay={menu}>
                <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
            </Dropdown>
        </Layout.Header>
    );
};

export default Header;
