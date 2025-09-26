import { Typography, Button } from 'antd';
import { useEffect } from 'react';

const { Title, Paragraph } = Typography;

const FONT_FAMILY = "'Poppins', sans-serif";

const JoinSessionSection = () => {
    // Inject keyframes for pulse animation (since AntD doesn't support @keyframes inline)
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      @keyframes pulseBtn {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.12); box-shadow: 0 4px 16px -4px #F9A84B99; }
        100% { transform: scale(1); }
      }
    `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                minHeight: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                overflow: 'hidden',
            }}
        >
            {/* Background Image */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                }}
            >
                <img
                    src="/mamnon.jpg"
                    alt="Session background"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.7)',
                    }}
                />
                {/* Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(41,194,180,0.7)',
                        zIndex: 2,
                    }}
                />
            </div>

            {/* Content */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 3,
                    width: '100%',
                    maxWidth: 700,
                    margin: '0 auto',
                    textAlign: 'center',
                    color: 'white',
                    paddingTop: 48,
                    paddingBottom: 64,
                    paddingLeft: 16,
                    paddingRight: 16,
                }}
            >
                <Title level={2} style={{ fontFamily: FONT_FAMILY, fontWeight: 900, marginBottom: 16, color: 'white' }}>
                    Đăng ký nhập học tại Sakura
                </Title>
                <Paragraph style={{ fontFamily: FONT_FAMILY, color: 'white', opacity: 0.95, marginBottom: 24 }}>
                    Hãy để bé trải nghiệm môi trường giáo dục hiện đại, sáng tạo và đầy yêu thương tại Sakura.
                    Đăng ký ngay để nhận tư vấn, tham quan trường và nhận ưu đãi nhập học cho năm học mới!
                </Paragraph>

                <Button
                    type="primary"
                    style={{
                        background: '#F9A84B',
                        border: 'none',
                        color: 'white',
                        borderRadius: 50,
                        padding: '8px 32px',
                        fontWeight: 'bold',
                        fontFamily: FONT_FAMILY,
                        fontSize: 16,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px -2px #F9A84B55',
                        transition: 'transform 0.25s, box-shadow 0.25s',
                        animation: 'pulseBtn 1.2s cubic-bezier(0.4,0,0.2,1) 0s 2',
                    }}
                    onMouseOver={(e) => {
                        const target = e.currentTarget;
                        target.style.background = '#f7b85c';
                        target.style.transform = 'scale(1.08)';
                        target.style.boxShadow = '0 4px 16px -4px #F9A84B99';
                    }}
                    onMouseOut={(e) => {
                        const target = e.currentTarget;
                        target.style.background = '#F9A84B';
                        target.style.transform = 'scale(1)';
                        target.style.boxShadow = '0 2px 8px -2px #F9A84B55';
                    }}
                >
                    Xem thêm
                </Button>
            </div>

            {/* Bottom Accent */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: 6,
                    background: 'linear-gradient(90deg,#F9A84B 60%,transparent)',
                    zIndex: 4,
                }}
            />
        </div>
    );
};

export default JoinSessionSection;
