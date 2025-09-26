import { useState } from 'react';
import { Typography, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const FONT_FAMILY = "'Poppins', sans-serif";

const cards = [
    {
        title: 'Giá trị Sakura - Yêu thương & Tôn trọng',
        desc: 'Sakura xây dựng môi trường giáo dục dựa trên sự yêu thương, tôn trọng cá nhân, giúp trẻ phát triển nhân cách và tự tin thể hiện bản thân.',
        color: '#F9A84B',
        textColor: 'white',
        highlight: true,
    },
    {
        title: 'Chương trình học hiện đại, sáng tạo',
        desc: 'Chương trình tại Sakura kết hợp giữa kiến thức, kỹ năng sống, STEAM, tiếng Anh và các hoạt động trải nghiệm, giúp trẻ phát triển toàn diện.',
        color: '#fff',
        textColor: '#222',
        highlight: false,
    },
    {
        title: 'Đội ngũ giáo viên tận tâm, chuyên nghiệp',
        desc: 'Giáo viên Sakura giàu kinh nghiệm, tận tâm, luôn đồng hành, truyền cảm hứng và khơi dậy tiềm năng của từng học sinh.',
        color: '#fff',
        textColor: '#222',
        highlight: false,
    },
];

const KnowMoreSection = () => {
    const [openCardIndex, setOpenCardIndex] = useState<number | null>(null);

    return (
        <div style={{ padding: '64px 0', backgroundColor: '#FEFDFC' }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 48,
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 16px',
            }}>
                {/* Left Side – Cards */}
                <div style={{ flex: 1, minWidth: 320 }}>
                    <Title level={3} style={{ fontFamily: FONT_FAMILY, fontWeight: 900, marginBottom: 24 }}>
                        Tìm hiểu thêm về Sakura
                    </Title>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {cards.map((card, idx) => {
                            const isDropdown = idx === 1 || idx === 2;
                            const isOpen = openCardIndex === idx;

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        padding: 20,
                                        borderRadius: 16,
                                        background: card.color,
                                        color: card.textColor,
                                        boxShadow: card.highlight ? '0 4px 16px -4px #F9A84B55' : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 12,
                                        cursor: isDropdown ? 'pointer' : 'default',
                                        transition: 'all 0.4s ease',
                                        minHeight: isDropdown ? 80 : undefined,
                                    }}
                                    onClick={() => isDropdown && setOpenCardIndex(isOpen ? null : idx)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Title level={5} style={{ margin: 0, fontFamily: FONT_FAMILY }}>
                                            {card.title}
                                        </Title>
                                        {isDropdown && (
                                            <Button
                                                shape="circle"
                                                size="small"
                                                icon={isOpen ? <UpOutlined /> : <DownOutlined />}
                                                style={{
                                                    backgroundColor: isOpen ? '#f9a84b22' : 'transparent',
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Show always if highlight */}
                                    {card.highlight && (
                                        <Paragraph style={{
                                            fontFamily: FONT_FAMILY,
                                            margin: 0,
                                            color: card.textColor,
                                        }}>
                                            {card.desc}
                                        </Paragraph>
                                    )}

                                    {/* Collapsible content */}
                                    {isDropdown && isOpen && (
                                        <div
                                            style={{
                                                animation: 'fadeIn 0.4s ease',
                                            }}
                                        >
                                            <Paragraph style={{
                                                fontFamily: FONT_FAMILY,
                                                margin: 0,
                                                color: card.textColor,
                                            }}>
                                                {card.desc}
                                            </Paragraph>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side – Image */}
                <div style={{
                    flex: 1,
                    minWidth: 360,
                    maxWidth: 540,
                    marginTop: 16,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 540,
                        height: 320,
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 10px 36px -8px #F9A84B55',
                        position: 'relative',
                        background: '#fff',
                    }}>
                        <img
                            src="/Đội ngũ.jpg"
                            alt="Know more"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: 22,
                                background: 'linear-gradient(90deg, #F9A84B 60%, transparent)',
                                borderRadius: '0 0 24px 24px',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowMoreSection;
