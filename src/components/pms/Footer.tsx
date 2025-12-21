import { Layout, Row, Col, Typography, Space, Input, Button } from 'antd';
import {
    FacebookFilled,
    YoutubeFilled,
    InstagramFilled, // Thêm icon Instagram
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

export default function Footer() {
    // --- Bảng màu và styles object ---
    const COLORS = {
        background: '#f0f5ff',
        primary: '#29c2b4',
        secondary: '#fa8c16',
        textPrimary: '#1f1f1f',
        textSecondary: '#595959',
    };

    const styles = {
        footer: {
            backgroundColor: COLORS.background,
            color: COLORS.textPrimary,
            padding: '60px 0 0 0', // Bỏ padding bottom để sub-footer chiếm trọn
            borderTop: `4px solid ${COLORS.primary}`,
        },
        content: {
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px 60px 24px',
        },
        title: {
            color: COLORS.textPrimary,
            marginBottom: '16px',
            fontWeight: 'bold',
        },
        link: {
            color: COLORS.textSecondary,
            display: 'block',
            marginBottom: '8px',
            transition: 'color 0.3s ease',
        },
        text: {
            color: COLORS.textSecondary,
        },
        subFooter: {
            backgroundColor: COLORS.primary,
            color: '#fff',
            padding: '24px',
        },
        socialIcon: {
            fontSize: '24px',
            color: '#fff',
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
        },
    };

    return (
        <AntFooter style={styles.footer}>
            <div style={styles.content}>
                <Row gutter={[40, 40]} justify="space-between">
                    {/* --- Cột 1: Giới thiệu & Logo --- */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={4} style={{ ...styles.title, display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '28px', marginRight: '8px' }}>🐬</span> Dolphin Preschool
                        </Title>
                        <Text style={styles.text}>
                            Nơi ươm mầm những ước mơ trẻ thơ trong môi trường giáo dục an toàn, sáng tạo và đầy yêu thương.
                        </Text>
                    </Col>

                    {/* --- Cột 2: Về chúng tôi --- */}
                    <Col xs={24} sm={12} lg={5}>
                        <Title level={5} style={styles.title}>Về chúng tôi</Title>
                        <Link href="#" style={styles.link} className="footer-link">Giới thiệu</Link>
                        <Link href="#" style={styles.link} className="footer-link">Đội ngũ giáo viên</Link>
                        <Link href="#" style={styles.link} className="footer-link">Cơ sở vật chất</Link>
                        <Link href="#" style={styles.link} className="footer-link">Tuyển dụng</Link>
                    </Col>

                    {/* --- Cột 3: Thông tin liên hệ --- */}
                    <Col xs={24} sm={12} lg={6}>
                        <Title level={5} style={styles.title}>Liên hệ</Title>
                        <Text style={{ ...styles.text, display: 'block', marginBottom: '8px' }}><b>Địa chỉ:</b> Số 34A TT5 Khu Đô Thị Văn Quán, Hà Đông, Hà Nội</Text>
                        <Text style={{ ...styles.text, display: 'block', marginBottom: '8px' }}><b>Hotline:</b> 0987 654 321</Text>
                        <Text style={{ ...styles.text, display: 'block', marginBottom: '8px' }}><b>Email:</b> info.littledolphins.preschool@gmail.com</Text>
                    </Col>

                    {/* --- Cột 4: Đăng ký nhận tin --- */}
                    <Col xs={24} sm={12} lg={7}>
                        <Title level={5} style={styles.title}>Nhận bản tin từ Dolphin</Title>
                        <Text style={{ ...styles.text, display: 'block', marginBottom: '16px' }}>
                            Đăng ký để nhận thông tin mới nhất về các hoạt động và ưu đãi tuyển sinh.
                        </Text>
                        <Input.Search
                            placeholder="Nhập email của bạn"
                            enterButton={<Button type="primary" style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.secondary, height: '40px' }}>Đăng ký</Button>}
                            size="large"
                            style={{ height: '40px' }}
                        />
                    </Col>
                </Row>
            </div>

            {/* --- Sub-Footer: Copyright & Mạng xã hội --- */}
            <div style={styles.subFooter}>
                <Row justify="space-between" align="middle" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Col>
                        <Text style={{ color: '#fff' }}>
                            © {new Date().getFullYear()} Dolphin Preschool. All Rights Reserved.
                        </Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                                <FacebookFilled style={styles.socialIcon} className="social-icon-hover" />
                            </a>
                            <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                                <YoutubeFilled style={styles.socialIcon} className="social-icon-hover" />
                            </a>
                            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                                <InstagramFilled style={styles.socialIcon} className="social-icon-hover" />
                            </a>
                        </Space>
                    </Col>
                </Row>
            </div>
            {/* Thêm CSS cho hiệu ứng hover của link và icon */}
            <style>
                {`
                    .footer-link:hover {
                        color: ${COLORS.primary} !important;
                    }
                    .social-icon-hover:hover {
                        transform: scale(1.2);
                    }
                `}
            </style>
        </AntFooter>
    );
}