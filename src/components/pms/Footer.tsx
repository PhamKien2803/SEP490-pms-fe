import { Layout, Row, Col, Typography, Space } from 'antd';
import {
    FacebookFilled,
    YoutubeFilled,
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

export default function Footer() {
    const styles = {
        wrapper: {
            backgroundColor: '#29C2B4',
            color: 'white',
            paddingTop: 0,
            paddingBottom: 48,
            marginTop: 64,
            fontFamily: "'Poppins', sans-serif",
        },
        topBar: {
            height: 6,
            background: 'linear-gradient(to right, #46a2da, #4194cb, #3982b8)',
        },
        content: {
            maxWidth: 1200,
            margin: '0 auto',
            paddingTop: 48,
            paddingLeft: 24,
            paddingRight: 24,
        },
        title: {
            color: 'white',
            marginBottom: 16,
        },
        text: {
            display: 'block',
            color: 'white',
            fontSize: 14,
        },
        icon: {
            fontSize: 20,
            color: 'white',
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
        },
    };

    return (
        <AntFooter style={styles.wrapper}>
            <div style={styles.topBar} />

            <div style={styles.content}>
                <Row gutter={[32, 32]} justify="space-between" align="top">
                    <Col xs={24} sm={12} md={8}>
                        <Title level={5} style={styles.title}>Sakura School</Title>
                        <Text style={styles.text}>Địa chỉ: Khu Công Nghệ Cao Hòa Lạc, km 29</Text>
                        <Text style={styles.text}>Hotline: 0913339709</Text>
                        <Text style={styles.text}>
                            Website:{' '}
                            <Link href="https://sakura.edu.vn" target="_blank" style={styles.text}>
                                sakura.edu.vn
                            </Link>
                        </Text>
                        <Text style={styles.text}>
                            Email:{' '}
                            <Link href="mailto:sakura.edu@gmail.com" target="_blank" style={styles.text}>
                                sakura.edu@gmail.com
                            </Link>
                        </Text>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Title level={5} style={styles.title}>Chính sách</Title>
                        <Space direction="vertical" size={8}>
                            <Link href="#" style={styles.text}>Giới thiệu nhà trường</Link>
                            <Link href="#" style={styles.text}>Câu hỏi thường gặp</Link>
                            <Link href="#" style={styles.text}>Chính sách bảo mật</Link>
                            <Link href="#" style={styles.text}>Học phí & ưu đãi</Link>
                        </Space>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Title level={5} style={styles.title}>Kết nối với chúng tôi</Title>
                        <Space size="middle" style={{ marginBottom: 12 }}>
                            <a href="https://facebook.com" aria-label="Facebook">
                                <FacebookFilled
                                    style={{ ...styles.icon }}
                                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                />
                            </a>
                            <a href="https://youtube.com" aria-label="YouTube">
                                <YoutubeFilled
                                    style={{ ...styles.icon }}
                                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                />
                            </a>
                        </Space>
                        <Text style={styles.text}>
                            © 2025 Sakura School. Thiết kế bởi{' '}
                            <Link href="https://nina.vn" target="_blank" style={styles.text}>
                                Sakura team
                            </Link>
                        </Text>
                    </Col>
                </Row>
            </div>
        </AntFooter>
    );
}
