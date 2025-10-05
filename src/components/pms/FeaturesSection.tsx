import { Typography, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import {
    RobotOutlined,
    SafetyCertificateOutlined,
    AreaChartOutlined,
    CalendarOutlined,
    MessageOutlined,
    AppleOutlined,
} from '@ant-design/icons';

const features = [
    {
        icon: <RobotOutlined />,
        title: 'Trợ lý AI Dolphin',
        desc: 'Hệ thống tự động phân tích và báo cáo tiến độ học tập, đề xuất hoạt động phù hợp cho từng bé.',
    },
    {
        icon: <MessageOutlined />,
        title: 'Kết nối tức thời 4.0',
        desc: 'Phụ huynh nhận thông báo, hình ảnh hoạt động của con theo thời gian thực, một cách an toàn.',
    },
    {
        icon: <AppleOutlined />,
        title: 'Dinh dưỡng thông minh',
        desc: 'AI đề xuất thực đơn cân bằng, theo dõi chỉ số BMI và cảnh báo dị ứng tự động cho nhà bếp.',
    },
    {
        icon: <CalendarOutlined />,
        title: 'Lịch học linh hoạt',
        desc: 'Tự động sắp xếp thời khóa biểu, tối ưu hóa hoạt động và phân bổ giáo viên hiệu quả.',
    },
    {
        icon: <AreaChartOutlined />,
        title: 'Theo dõi phát triển',
        desc: 'Ghi nhận và trực quan hóa các cột mốc phát triển quan trọng của trẻ qua biểu đồ thông minh.',
    },
    {
        icon: <SafetyCertificateOutlined />,
        title: 'Bảo mật đa tầng',
        desc: 'Dữ liệu của gia đình và nhà trường được mã hóa và bảo vệ theo tiêu chuẩn quốc tế cao nhất.',
    },
];

export const FeaturesSection = () => {
    const COLORS = {
        background: 'linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%)',
        primary: '#0958d9',
        textPrimary: '#1f1f1f',
        textSecondary: '#595959',
    };

    const sectionStyle = {
        padding: '80px 24px',
        background: COLORS.background,
        position: 'relative',
        overflow: 'hidden',
    };

    const backgroundGridStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
            linear-gradient(to right, rgba(9, 88, 217, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(9, 88, 217, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
    };

    const titleStyle = {
        fontWeight: 'bold',
        background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.textPrimary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px',
    };

    // --- Style cho Card đã được làm nhỏ lại ---
    const cardStyle = {
        height: '100%',
        padding: '24px', // Giảm padding
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e5f0',
        boxShadow: '0 8px 24px rgba(9, 88, 217, 0.08)',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
    };

    // --- Style cho Icon đã được làm nhỏ lại ---
    const iconContainerStyle = {
        marginBottom: '16px', // Giảm margin
        height: '48px', // Giảm kích thước
        width: '48px', // Giảm kích thước
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px', // Giảm kích thước icon
        background: `linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)`,
        color: COLORS.primary,
        border: '1px solid #e0e5f0',
    };

    return (
        <div style={sectionStyle as React.CSSProperties}>
            <div style={backgroundGridStyle as React.CSSProperties}></div>
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <Typography.Text style={{ color: COLORS.primary, fontWeight: 'bold', textTransform: 'uppercase' }}>
                        DOLPHINTECH AI PLATFORM
                    </Typography.Text>
                    <Typography.Title level={2} style={titleStyle}>
                        Nền Tảng Thông Minh <br /> Cho Tương Lai Của Trẻ
                    </Typography.Title>
                </div>

                {/* Tăng Gutter để tạo khoảng cách thoáng hơn */}
                <Row gutter={[60, 60]} justify="center">
                    {features.map((item, index) => (
                        <Col key={index} xs={24} sm={12} lg={8}>
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{
                                    scale: 1.03,
                                    borderColor: COLORS.primary,
                                    boxShadow: '0 12px 32px rgba(9, 88, 217, 0.15)',
                                }}
                                style={cardStyle as React.CSSProperties}
                            >
                                <div style={iconContainerStyle}>
                                    {item.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Typography.Title level={5} style={{ color: COLORS.textPrimary, fontWeight: 'bold', marginBottom: '8px' }}>
                                        {item.title}
                                    </Typography.Title>
                                    {/* Xóa bỏ minHeight để card co dãn tự nhiên */}
                                    <Typography.Paragraph style={{ color: COLORS.textSecondary, fontSize: '14px' }}>
                                        {item.desc}
                                    </Typography.Paragraph>
                                </div>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};