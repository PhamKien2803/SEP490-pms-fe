import { useState } from 'react';
import { Typography, Button, Modal, Row, Col } from 'antd';
import {
    AudioOutlined,
    HighlightOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const FONT_FAMILY = "'Poppins', sans-serif";

const programsData = [
    {
        icon: <AudioOutlined />,
        title: 'Âm nhạc & Nhịp điệu',
        description:
            'Trẻ được làm quen với âm nhạc, nhịp điệu, phát triển cảm xúc, khả năng cảm thụ nghệ thuật và sự tự tin thể hiện bản thân qua các tiết học hát, múa, chơi nhạc cụ.',
        featured: true,
    },
    {
        icon: <HighlightOutlined />,
        title: 'Mỹ thuật & Sáng tạo',
        description:
            'Các hoạt động vẽ, tô màu, làm thủ công giúp trẻ phát triển tư duy sáng tạo, khả năng quan sát và sự khéo léo của đôi tay.',
        featured: false,
    },
];

const ProgramsSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const featuredColor = '#29C2B4';
    const standardColor = '#F9A84B';

    return (
        <div style={{ padding: '64px 0', backgroundColor: '#FEFDFC' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
                {/* Section Title */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <Title level={2} style={{ fontFamily: FONT_FAMILY, fontWeight: 900 }}>
                        Chương trình nổi bật
                    </Title>
                    <Paragraph
                        style={{
                            fontFamily: FONT_FAMILY,
                            maxWidth: 500,
                            margin: '12px auto 0',
                            color: '#666',
                        }}
                    >
                        Trường mầm non Sakura dành cho trẻ từ 1-5 tuổi với chương trình học tập hiện đại, phát triển toàn diện.
                    </Paragraph>
                </div>

                {/* Program Cards */}
                <Row gutter={[24, 24]} justify="center">
                    {programsData.map((program, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <Col xs={24} md={8} key={index}>
                                <div
                                    style={{
                                        minHeight: 370,
                                        height: '100%',
                                        borderRadius: 24,
                                        textAlign: 'center',
                                        backgroundColor: program.featured ? featuredColor : 'white',
                                        color: program.featured ? 'white' : 'inherit',
                                        border: program.featured ? 'none' : `2px dotted ${standardColor}`,
                                        boxShadow: program.featured
                                            ? `0 10px 30px -5px ${featuredColor}77`
                                            : 'none',
                                        padding: 32,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.transform = 'none';
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                padding: 12,
                                                marginBottom: 16,
                                                borderRadius: '50%',
                                                backgroundColor: program.featured ? 'white' : 'transparent',
                                                color: program.featured ? featuredColor : standardColor,
                                                fontSize: 48,
                                            }}
                                        >
                                            {program.icon}
                                        </div>
                                        <Title level={4} style={{ fontFamily: FONT_FAMILY, fontWeight: 'bold' }}>
                                            {program.title}
                                        </Title>
                                        <Paragraph
                                            style={{
                                                fontFamily: FONT_FAMILY,
                                                opacity: program.featured ? 0.9 : 1,
                                                minHeight: 60,
                                            }}
                                        >
                                            {program.description}
                                        </Paragraph>
                                    </div>

                                    <Button
                                        type="default"
                                        onClick={() => setOpenIndex(index)}
                                        style={{
                                            borderRadius: 50,
                                            padding: '6px 24px',
                                            fontWeight: 'bold',
                                            fontFamily: FONT_FAMILY,
                                            color: program.featured ? 'white' : standardColor,
                                            borderColor: program.featured ? 'white' : standardColor,
                                            backgroundColor: 'transparent',
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = program.featured
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(249, 168, 75, 0.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        Xem chi tiết
                                    </Button>

                                    <Modal
                                        open={isOpen}
                                        onCancel={() => setOpenIndex(null)}
                                        footer={null}
                                        centered
                                        title={program.title}
                                        style={{ fontFamily: FONT_FAMILY }}
                                        bodyStyle={{
                                            backgroundColor: program.featured ? featuredColor : 'white',
                                            color: program.featured ? 'white' : 'inherit',
                                            textAlign: 'center',
                                            borderRadius: 12,
                                        }}
                                    >
                                        <div style={{ marginBottom: 16, fontSize: 48 }}>
                                            {program.icon}
                                        </div>
                                        <Paragraph
                                            style={{
                                                fontFamily: FONT_FAMILY,
                                                opacity: program.featured ? 0.9 : 1,
                                            }}
                                        >
                                            {program.description}
                                        </Paragraph>
                                    </Modal>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </div>
    );
};

export default ProgramsSection;
