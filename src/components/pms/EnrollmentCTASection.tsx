import { Typography, Button, Row, Col } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { FallingPetalsJS } from './FallingPetalsJS';

const { Title, Paragraph } = Typography;

const IMAGE_URL = '/1.jpg';

export const EnrollmentCTASection = () => {


    const sectionStyle = {
        backgroundColor: '#f0f5ff',
        padding: '80px 24px',
        overflow: 'hidden',
    };

    const textContentStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'left',
    };

    const subtitleStyle = {
        color: '#0958d9',
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '8px',
        textTransform: 'uppercase',
    };

    const titleStyle = {
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: '16px',
        lineHeight: '1.2',
    };

    const descriptionStyle = {
        fontSize: '18px',
        color: '#595959',
        marginBottom: '32px',
        maxWidth: '500px',
    };

    const ctaButtonStyle = {
        backgroundColor: '#fa8c16',
        borderColor: '#fa8c16',
        height: '50px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '8px',
    };

    const imageWrapperStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    };

    const imageStyle = {
        width: '100%',
        maxWidth: '450px',
        height: 'auto',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        transform: 'rotate(3deg)',
    };


    return (
        <div style={sectionStyle}>
            <Row gutter={[48, 48]} align="middle" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <FallingPetalsJS />
                <Col xs={24} lg={12} style={textContentStyle as React.CSSProperties}>
                    <Typography.Text style={subtitleStyle as React.CSSProperties}>
                        Chào mừng đến với Dolphin Preschool
                    </Typography.Text>
                    <Title level={1} style={titleStyle}>
                        Nơi Ươm Mầm Tương Lai <br /> Cho Bé Yêu
                    </Title>
                    <Paragraph style={descriptionStyle}>
                        Với môi trường học tập vui vẻ, sáng tạo và an toàn, chúng tôi cam kết mang đến nền tảng vững chắc cho sự phát triển toàn diện của trẻ.
                    </Paragraph>
                    <Button
                        type="primary"
                        size="large"
                        style={ctaButtonStyle}
                        icon={<ArrowRightOutlined />}
                    >
                        Khám Phá Các Lớp Học
                    </Button>
                </Col>

                <Col xs={24} lg={12}>
                    <div style={imageWrapperStyle as React.CSSProperties}>
                        <img
                            src={IMAGE_URL}
                            alt="Em bé vui chơi tại trường mầm non Dolphin Preschool"
                            style={imageStyle}
                        />
                    </div>
                </Col>

            </Row>
        </div>
    );
};