import { JSX, useState } from 'react';
import { Typography, Button, Modal, Row, Col, Tag } from 'antd';
import {
    GlobalOutlined,
    HighlightOutlined,
    SmileOutlined,
    ExperimentOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const programsData = [
    {
        icon: <GlobalOutlined />,
        title: 'Tiếng Anh Song Ngữ',
        description: 'Bé tiếp xúc với tiếng Anh tự nhiên qua các hoạt động vui chơi, bài hát và giao tiếp hàng ngày cùng giáo viên bản ngữ.',
        featured: true,
    },
    {
        icon: <HighlightOutlined />,
        title: 'Mỹ Thuật Sáng Tạo',
        description: 'Các hoạt động vẽ, nặn đất sét, làm đồ thủ công giúp bé phát triển trí tưởng tượng, sự khéo léo và thể hiện cá tính riêng.',
        featured: false,
    },
    {
        icon: <SmileOutlined />,
        title: 'Phát Triển Kỹ Năng Sống',
        description: 'Bé học cách tự lập, chia sẻ, làm việc nhóm và giải quyết vấn đề thông qua các tình huống thực tế được lồng ghép trong giờ học.',
        featured: false,
    },
    {
        icon: <ExperimentOutlined />,
        title: 'Khám Phá Khoa Học',
        description: 'Các thí nghiệm khoa học vui nhộn, gần gũi giúp khơi dậy trí tò mò, khả năng quan sát và tư duy logic của trẻ từ sớm.',
        featured: false,
    },
];

const ProgramsSection = () => {
    const [modalData, setModalData] = useState<{
        icon: JSX.Element;
        title: string;
        description: string;
        featured: boolean;
    } | null>(null);

    const COLORS = {
        primary: '#0958d9',
        secondary: '#fa8c16',
        text: '#333',
        background: '#fff',
    };

    const sectionStyle = {
        padding: '80px 24px',
        backgroundColor: COLORS.background,
    };

    const baseCardStyle = {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '32px 24px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderTop: '4px solid transparent',
    };

    const featuredCardStyle = {
        borderTop: `4px solid ${COLORS.primary}`,
    };

    const iconWrapperStyle = {
        margin: '0 auto 16px auto',
        height: '80px',
        width: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
    };

    return (
        <div style={sectionStyle}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Tiêu đề Section */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <Title level={2} style={{ fontWeight: 'bold', color: COLORS.text }}>
                        Chương Trình Đào Tạo Đa Dạng
                    </Title>
                    <Paragraph style={{ maxWidth: 600, margin: '12px auto 0', color: '#666', fontSize: '16px' }}>
                        Tại Dolphin Preschool, chúng tôi xây dựng các chương trình học tiên tiến, giúp bé phát triển toàn diện về trí tuệ, thể chất và cảm xúc.
                    </Paragraph>
                </div>

                {/* Các card chương trình */}
                <Row gutter={[32, 32]} justify="center">
                    {programsData.map((program, index) => {
                        const isFeatured = program.featured;
                        const mainColor = isFeatured ? COLORS.primary : COLORS.secondary;

                        return (
                            <Col xs={24} sm={12} lg={6} key={index}>
                                <div
                                    style={{
                                        ...baseCardStyle,
                                        ...(isFeatured ? featuredCardStyle : {}),
                                    } as React.CSSProperties}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-10px)';
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                                    }}
                                >
                                    {isFeatured && (
                                        <Tag color={COLORS.primary} style={{ position: 'absolute', top: 16, right: 16, fontWeight: 'bold' }}>
                                            Nổi bật
                                        </Tag>
                                    )}
                                    <div>
                                        <div style={{ ...iconWrapperStyle, backgroundColor: `${mainColor}20`, color: mainColor }}>
                                            {program.icon}
                                        </div>
                                        <Title level={4} style={{ fontWeight: 'bold', color: COLORS.text, minHeight: '64px' }}>
                                            {program.title}
                                        </Title>
                                        <Paragraph style={{ color: '#666', minHeight: '100px' }}>
                                            {program.description}
                                        </Paragraph>
                                    </div>
                                    <Button
                                        type={isFeatured ? 'primary' : 'default'}
                                        onClick={() => setModalData(program)}
                                        style={{
                                            borderRadius: '50px',
                                            fontWeight: 'bold',
                                            backgroundColor: isFeatured ? mainColor : 'transparent',
                                            borderColor: mainColor,
                                            color: isFeatured ? '#fff' : mainColor,
                                        }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </div>
                            </Col>
                        );
                    })}
                </Row>

                {/* Modal hiển thị chi tiết */}
                <Modal
                    open={!!modalData}
                    onCancel={() => setModalData(null)}
                    footer={null}
                    centered
                    title={<Title level={3} style={{ color: modalData?.featured ? COLORS.primary : COLORS.secondary, margin: 0 }}>{modalData?.title}</Title>}
                >
                    {modalData && (
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                            <div style={{ ...iconWrapperStyle, margin: '16px auto', fontSize: '48px', color: modalData.featured ? COLORS.primary : COLORS.secondary }}>
                                {modalData.icon}
                            </div>
                            <Paragraph style={{ fontSize: '16px' }}>
                                {modalData.description}
                            </Paragraph>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default ProgramsSection;