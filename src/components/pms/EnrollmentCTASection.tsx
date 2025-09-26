import { Typography, Button, Row, Col } from 'antd';
import { useMemo } from 'react';
import { FallingPetalsJS } from './FallingPetalsJS';
import './EnrollmentCTASection.css';

const { Title, Text } = Typography;

const IMAGE_URL = '/1.jpg';

export const EnrollmentCTASection = () => {
    const doodles = useMemo(() => [
        { style: { top: '-15px', left: '150px', animationDelay: '0s' }, svg: 'wave' },
        { style: { top: '30px', right: '30px', animationDelay: '0.5s' }, svg: 'circle' },
        {
            style: {
                top: '50%',
                left: '-15px',
                transform: 'translateY(-50%) rotate(-15deg)',
                animationDelay: '1s',
                animationDirection: 'alternate-reverse',
            },
            svg: 'triangle',
        },
        {
            style: { bottom: '20px', left: '50px', animationDelay: '1.5s' },
            custom: <div className="doodle-blobby" />,
        },
        {
            style: { bottom: '10px', right: '50px', animationDelay: '0.2s' },
            custom: <div className="doodle-outline" />,
        },
    ], []);

    return (
        <div className="hero-wrapper">
            <FallingPetalsJS />
            <div className="wavy-border-top" />

            <div className="container">
                <Row gutter={[32, 32]} align="middle">
                    <Col xs={24} md={12}>
                        <div>
                            <Text className="section-subtitle">Chương trình Sakura</Text>
                            <Title level={1} className="hero-title">
                                Giáo trình giáo dục<br />tốt nhất cho trẻ em
                            </Title>
                            <Text className="hero-description">Nhận đăng ký từ 20-24 tháng 4</Text>
                            <br />
                            <Button
                                type="primary"
                                size="large"
                                className="hero-button"
                            >
                                Đăng ký ngay
                            </Button>
                        </div>
                    </Col>

                    <Col xs={24} md={12}>
                        <div className="hero-image-wrapper">
                            {doodles.map((d, i) => (
                                <div key={i} className="doodle" style={d.style}>
                                    {d.custom || renderSVG(d.svg)}
                                </div>
                            ))}

                            <img
                                src={IMAGE_URL}
                                alt="Child in kindergarten program"
                                className="hero-image"
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

function renderSVG(type: string) {
    switch (type) {
        case 'wave':
            return (
                <svg width="67" height="15"><path d="M2.58 11.23C12.16 1.7 41.84 -2.1 58.42 6.55" stroke="#FDB556" strokeWidth="4" strokeLinecap="round" /><path d="M8.58 12.23C18.16 2.7 47.84 -1.1 64.42 7.55" stroke="#F9A84B" strokeWidth="4" strokeLinecap="round" /></svg>
            );
        case 'circle':
            return (
                <svg width="48" height="48"><circle cx="24" cy="24" r="22" stroke="#FDB556" strokeWidth="3" /><circle cx="17.5" cy="19" r="1.5" fill="#FDB556" /><circle cx="30.5" cy="19" r="1.5" fill="#FDB556" /><path d="M16 31C16 31 19 35 24 35C29 35 32 31 32 31" stroke="#FDB556" strokeWidth="3" strokeLinecap="round" /></svg>
            );
        case 'triangle':
            return (
                <svg width="30" height="30"><path d="M32.5 19.5L2.5 37.54L2.5 1.46L32.5 19.5Z" fill="#29C2B4" stroke="#29C2B4" strokeOpacity="0.5" strokeWidth="2" /></svg>
            );
        default:
            return null;
    }
}
