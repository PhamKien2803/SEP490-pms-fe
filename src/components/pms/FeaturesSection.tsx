import { Typography, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import {
    ShopOutlined,
    MessageOutlined,
    CalendarOutlined,
    StarOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';
import './FeaturesSection.css';

const MotionCard = motion.div;

const primaryColor = '#29C2B4';
const secondaryColor = '#F9A84B';
const accentColor = '#F96D6D';

const features = [
    {
        icon: <ShopOutlined />,
        title: 'Quản lý tập trung',
        desc: 'Dữ liệu học sinh, lớp học, hồ sơ giáo viên được quản lý đồng bộ.',
    },
    {
        icon: <MessageOutlined />,
        title: 'Tương tác đa chiều',
        desc: 'Phụ huynh – giáo viên – nhà trường trao đổi trực tiếp, cập nhật thông tin mỗi ngày.',
    },
    {
        icon: <ShopOutlined />,
        title: 'Theo dõi dinh dưỡng',
        desc: 'Cập nhật thực đơn, kiểm soát khẩu phần ăn và cảnh báo dị ứng cho từng bé.',
    },
    {
        icon: <CalendarOutlined />,
        title: 'Điểm danh & lịch học',
        desc: 'Tự động điểm danh, báo nghỉ, phân phối thời khóa biểu thông minh.',
    },
    {
        icon: <ScheduleOutlined />,
        title: 'Tạo lịch học tự động',
        desc: 'Hệ thống tự động sắp xếp lịch học, tối ưu thời gian và phù hợp từng lớp.',
    },
    {
        icon: <StarOutlined />,
        title: 'Khung chương trình mới mẻ',
        desc: 'Chương trình học sáng tạo, tích hợp STEAM, tiếng Anh, kỹ năng sống và trải nghiệm thực tế.',
    },
];

export const FeaturesSection = () => {
    const borderColors = [primaryColor, secondaryColor, accentColor];
    const iconBgColors = ['#eafafc', '#fff7e6', '#fff0ee'];
    const iconColors = [primaryColor, secondaryColor, accentColor];

    return (
        <div className="features-section">
            <div className="features-container">
                <Typography.Text className="features-subtitle">SakuraTech Platform</Typography.Text>
                <Typography.Title level={2} className="features-title">
                    Một nền tảng, vạn tiện ích cho trường mầm non Sakura
                </Typography.Title>

                <Row gutter={[24, 24]} justify="center">
                    {features.map((item, index) => (
                        <Col key={index} xs={24} sm={12} md={12} lg={8}>
                            <MotionCard
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="feature-card"
                                style={{
                                    borderLeft: `4px solid ${borderColors[index % 3]}`,
                                }}
                            >
                                <div
                                    className="feature-icon"
                                    style={{
                                        backgroundColor: iconBgColors[index % 3],
                                        color: iconColors[index % 3],
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <div>
                                    <Typography.Text className="feature-title">{item.title}</Typography.Text>
                                    <Typography.Paragraph className="feature-desc">{item.desc}</Typography.Paragraph>
                                </div>
                            </MotionCard>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};
