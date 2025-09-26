import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Button, Space, Statistic } from 'antd';
import {
    PlayCircleOutlined,
    TrophyOutlined,
    TeamOutlined,
    ReadOutlined,
} from '@ant-design/icons';
import { useMotionValue, animate } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;
const FONT_FAMILY = 'Poppins, sans-serif';

const stats = [
    { value: '14+', label: 'Năm kinh nghiệm', icon: <ReadOutlined /> },
    { value: '500+', label: 'Học sinh mỗi năm', icon: <TeamOutlined /> },
    { value: '10+', label: 'Giải thưởng đạt được', icon: <TrophyOutlined /> },
];

function useCountUp(target: string, duration = 1) {
    const match = target.match(/(\d+)(\D*)/);
    const number = match ? parseInt(match[1], 10) : 0;
    const suffix = match ? match[2] : '';
    const motionValue = useMotionValue(0);
    const [display, setDisplay] = useState('0' + suffix);

    useEffect(() => {
        const controls = animate(motionValue, number, {
            duration,
            onUpdate: (latest) => {
                setDisplay(Math.floor(latest).toLocaleString('vi-VN') + suffix);
            },
        });
        return controls.stop;
    }, [number, suffix, duration, motionValue]);
    return display;
}

const bullets = [
    'Chúng tôi tin rằng mỗi trẻ đều thông minh và xứng đáng được quan tâm.',
    'Giáo viên tạo nên sự khác biệt cho con bạn.',
];

const ProgramIntroSection = () => {
    return (
        <div style={{ background: '#FEFDFC', padding: '64px 0' }}>
            <Row justify="center" align="middle" gutter={[64, 32]} style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Left image */}
                <Col xs={24} md={10}>
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 420,
                            height: 320,
                            margin: '0 auto',
                            borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%',
                            overflow: 'hidden',
                            boxShadow: '0 12px 40px -8px #F9A84B77',
                            background: '#fff',
                            position: 'relative',
                        }}
                    >
                        <img
                            src="/chương trình.png"
                            alt="Program"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '80%',
                                height: 22,
                                background: 'linear-gradient(90deg, #F9A84B 60%, transparent)',
                                borderBottomLeftRadius: 48,
                                borderBottomRightRadius: 48,
                            }}
                        />
                    </div>
                </Col>

                {/* Right content */}
                <Col xs={24} md={14}>
                    <Typography style={{ fontFamily: FONT_FAMILY }}>
                        <Title level={2} style={{ fontWeight: 900 }}>Chương trình của chúng tôi</Title>
                        <Paragraph style={{ fontSize: 16, color: '#595959' }}>
                            Sự dũng cảm không phải lúc nào cũng là những hành động lớn lao, đôi khi chỉ đơn giản là thử sức với một câu hỏi khó, mạnh dạn phát biểu trong lớp hoặc trải nghiệm điều mới mẻ. Sakura luôn khuyến khích trẻ phát triển toàn diện qua các chương trình học hiện đại và môi trường thân thiện.
                        </Paragraph>
                    </Typography>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        {stats.map((stat, idx) => {
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const count = useCountUp(stat.value, 1.2 + idx * 0.2);
                            return (
                                <Col key={idx} xs={8}>
                                    <Card
                                        bordered
                                        style={{
                                            textAlign: 'center',
                                            background: '#ffffff',
                                            borderRadius: 24,
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        <div style={{ fontSize: 32, color: '#29C2B4', marginBottom: 8 }}>{stat.icon}</div>
                                        <Statistic
                                            title={<Text style={{ fontWeight: 500 }}>{stat.label}</Text>}
                                            value={count}
                                            valueStyle={{ fontWeight: 900, fontSize: 24, fontFamily: FONT_FAMILY }}
                                        />
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>

                    <Space direction="vertical" size="small" style={{ marginBottom: 24 }}>
                        {bullets.map((b, idx) => (
                            <Text key={idx} style={{ fontSize: 14 }}>
                                • {b}
                            </Text>
                        ))}
                    </Space>

                    <Space>
                        <Button
                            type="primary"
                            style={{
                                background: '#F9A84B',
                                borderRadius: 50,
                                padding: '8px 24px',
                                fontWeight: 'bold',
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            Xem thêm
                        </Button>
                        <Button
                            icon={<PlayCircleOutlined />}
                            style={{
                                borderColor: '#F9A84B',
                                color: '#F9A84B',
                                borderRadius: 50,
                                padding: '8px 24px',
                                fontWeight: 'bold',
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            Video giới thiệu
                        </Button>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

export default ProgramIntroSection;
