import { useState, useEffect } from 'react';
import { Layout, Button, Drawer, Space, Typography, Row, Col, Menu } from 'antd';
import {
    MenuOutlined,
    LoginOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const COLORS = {
    primary: '#0958d9',
    secondary: '#fa8c16',
    white: '#ffffff',
    text: '#333333'
};

export const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const showDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);

    const menuItems = [
        { key: 'home', label: 'Trang chủ', onClick: () => navigate('/') },
        { key: 'enrollment', label: 'Nhập học', onClick: () => navigate('/enrollment') },
        { key: 'news', label: 'Tin tức', onClick: () => navigate('/news') },
    ];

    return (
        <>
            <AntHeader
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    width: '100%',
                    backgroundColor: COLORS.white,
                    transition: 'box-shadow 0.3s ease-in-out',
                    boxShadow: scrolled ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                    padding: '0 24px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Title
                                level={3}
                                style={{
                                    color: COLORS.primary,
                                    margin: 0,
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                                onClick={() => navigate('/')}
                            >
                                🐬 Dolphin Preschool
                            </Title>
                        </Col>

                        <Col xs={0} md={18} lg={16} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Menu
                                mode="horizontal"
                                items={menuItems}
                                style={{
                                    borderBottom: 'none',
                                    backgroundColor: 'transparent',
                                }}
                                onClick={({ key }) => {
                                    const item = menuItems.find(i => i.key === key);
                                    if (item && item.onClick) item.onClick();
                                }}
                            />
                            <Space size="middle" style={{ marginLeft: '24px' }}>
                                <Button
                                    icon={<LoginOutlined />}
                                    onClick={() => navigate('/login')}
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<RocketOutlined />}
                                    style={{
                                        backgroundColor: COLORS.secondary,
                                        borderColor: COLORS.secondary,
                                        fontWeight: 'bold',
                                    }}
                                    onClick={() => navigate('/admissions')}
                                >
                                    Tuyển sinh
                                </Button>
                            </Space>
                        </Col>

                        <Col xs={2} md={0}>
                            <Button
                                type="text"
                                icon={<MenuOutlined style={{ fontSize: '20px', color: COLORS.primary }} />}
                                onClick={showDrawer}
                            />
                        </Col>
                    </Row>
                </div>
            </AntHeader>

            <Drawer
                title="Menu"
                placement="right"
                onClose={closeDrawer}
                open={drawerOpen}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    {menuItems.map(item => (
                        <Button
                            key={item.key}
                            type="text"
                            block
                            style={{ textAlign: 'left', fontSize: '16px' }}
                            onClick={() => {
                                item.onClick();
                                closeDrawer();
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                    <Button
                        type="default"
                        block
                        icon={<LoginOutlined />}
                        style={{ marginTop: '16px' }}
                        onClick={() => {
                            navigate('/login');
                            closeDrawer();
                        }}
                    >
                        Đăng nhập
                    </Button>
                    <Button
                        type="primary"
                        block
                        icon={<RocketOutlined />}
                        style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }}
                        onClick={() => {
                            navigate('/admissions');
                            closeDrawer();
                        }}
                    >
                        Tuyển sinh
                    </Button>
                </Space>
            </Drawer>
        </>
    );
};