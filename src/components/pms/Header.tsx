import { useState, useEffect } from 'react';
import { Layout, Button, Drawer, Space, Typography, Row, Col } from 'antd';
import {
    MenuOutlined,
    MailOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const mainColor = '#5eb3e8ff';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleDrawer = (open: boolean) => () => setMobileOpen(open);

    const menuItems = [
        { label: 'Trang chủ', onClick: () => navigate('/') },
        { label: 'Đăng ký nhập học', onClick: () => navigate('/registration') },
        { label: 'Chủ đề', onClick: () => { } },
        { label: 'Liên hệ', onClick: () => navigate('/sign-in') },
    ];

    return (
        <>
            <AntHeader
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    width: '100%',
                    backgroundColor: scrolled ? `${mainColor}E6` : mainColor,
                    transition: 'all 0.3s ease',
                    paddingInline: 24,
                    paddingBlock: 0,
                    height: '72px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Row style={{ width: '100%' }} align="middle" justify="space-between">
                    <Col>
                        <Text
                            strong
                            style={{
                                fontSize: '1.5rem',
                                fontFamily: "'Poppins', sans-serif",
                                color: 'white',
                                cursor: 'pointer',
                            }}
                            onClick={() => navigate('/')}
                        >
                             Blue Dolphin Preschool
                        </Text>
                    </Col>

                    <Col xs={0} md="auto">
                        <Space size="middle">
                            <Button type="link" style={{ color: 'white' }} onClick={menuItems[1].onClick}>
                                Đăng ký nhập học
                            </Button>
                            <Button type="link" style={{ color: 'white' }} onClick={menuItems[0].onClick}>
                                Trang chủ
                            </Button>
                            <Button
                                type="primary"
                                icon={<MailOutlined />}
                                style={{
                                    borderRadius: '20px',
                                    backgroundColor: 'white',
                                    color: mainColor,
                                    fontWeight: 'bold',
                                }}
                                onClick={menuItems[3].onClick}
                            >
                                Đăng nhập
                            </Button>
                        </Space>
                    </Col>

                    <Col xs="auto" md={0}>
                        <Button
                            icon={<MenuOutlined />}
                            type="text"
                            style={{ color: 'white' }}
                            onClick={toggleDrawer(true)}
                        />
                    </Col>
                </Row>
            </AntHeader>

            <Drawer
                title="Menu"
                placement="right"
                onClose={toggleDrawer(false)}
                open={mobileOpen}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    {menuItems.map(({ label, onClick }, idx) => (
                        <Button
                            key={idx}
                            type="text"
                            block
                            style={{ textAlign: 'left' }}
                            onClick={onClick}
                        >
                            {label}
                        </Button>
                    ))}
                </Space>
            </Drawer>
        </>
    );
};
