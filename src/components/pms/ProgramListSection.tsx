import { Row, Col, Typography, Card } from 'antd';

const FONT_FAMILY = 'Poppins, sans-serif';

const programs = [
    {
        image: '/Nhà trẻ Sakura.png',
        title: 'Nhà trẻ Dolphin ',
        desc: 'Chương trình dành cho trẻ nhỏ, chú trọng phát triển vận động, cảm xúc và kỹ năng tự lập trong môi trường an toàn, thân thiện.',
        info: [
            { value: '4-5', label: 'Tuổi', color: '#F9A84B' },
            { value: '3', label: 'Ngày/tuần', color: '#29C2B4' },
            { value: '3.5', label: 'Giờ/buổi', color: '#F9A84B' },
        ],
    },
    {
        image: '/Mẫu giáo Bé Sakura.png',
        title: 'Mẫu giáo Bé Dolphin',
        desc: 'Tập trung phát triển ngôn ngữ, tư duy logic, kỹ năng giao tiếp và sáng tạo qua các hoạt động trải nghiệm.',
        info: [
            { value: '3-4', label: 'Tuổi', color: '#F9A84B' },
            { value: '5', label: 'Ngày/tuần', color: '#29C2B4' },
            { value: '2', label: 'Giờ/buổi', color: '#F9A84B' },
        ],
    },
    {
        image: '/Mẫu giáo Nhỡ & Lớn.png',
        title: 'Mẫu giáo Nhỡ & Lớn Dolphin',
        desc: 'Phát triển toàn diện về thể chất, trí tuệ, cảm xúc, chuẩn bị sẵn sàng cho lớp 1 với các hoạt động STEAM, tiếng Anh, kỹ năng sống.',
        info: [
            { value: '1-2', label: 'Tuổi', color: '#F9A84B' },
            { value: '3', label: 'Ngày/tuần', color: '#29C2B4' },
            { value: '3', label: 'Giờ/buổi', color: '#F9A84B' },
        ],
    },
];

const ProgramListSection = () => {
    return (
        <div style={{ padding: '64px 0', background: 'linear-gradient(90deg,#fff7f5 60%,#eafafc 100%)' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Typography.Title level={2} style={{ fontFamily: FONT_FAMILY, fontWeight: 900 }}>
                    Các chương trình nổi bật
                </Typography.Title>
                <Typography.Paragraph style={{ fontFamily: FONT_FAMILY, color: 'rgba(0,0,0,0.65)', maxWidth: 500, margin: 'auto' }}>
                    Dolphin Preschool mang đến môi trường học tập hiện đại, sáng tạo và thân thiện, giúp trẻ phát triển toàn diện từ thể chất đến trí tuệ.
                </Typography.Paragraph>
            </div>

            <Row gutter={[32, 32]} justify="center">
                {programs.map((program, idx) => (
                    <Col key={idx} xs={24} sm={12} md={8} lg={7}>
                        <Card
                            bordered={false}
                            bodyStyle={{ padding: 24, textAlign: 'center', fontFamily: FONT_FAMILY }}
                            style={{ borderRadius: 16, boxShadow: '0 8px 32px -8px #29C2B455' }}
                            cover={
                                <img
                                    alt={program.title}
                                    src={program.image}
                                    style={{ height: 160, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                                />
                            }
                        >
                            <Typography.Title level={4} style={{ fontFamily: FONT_FAMILY, fontWeight: 700 }}>
                                {program.title}
                            </Typography.Title>
                            <Typography.Paragraph style={{ fontFamily: FONT_FAMILY, color: 'rgba(0,0,0,0.65)' }}>
                                {program.desc}
                            </Typography.Paragraph>
                            <Row gutter={[8, 8]} justify="center" style={{ marginTop: 16 }}>
                                {program.info.map((info, i) => (
                                    <Col key={i}>
                                        <div
                                            style={{
                                                background: info.color,
                                                borderRadius: 8,
                                                padding: '8px 16px',
                                                minWidth: 80,
                                                color: '#fff',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography.Title level={5} style={{ margin: 0, color: '#fff', fontWeight: 900 }}>
                                                {info.value}
                                            </Typography.Title>
                                            <Typography.Text style={{ fontSize: 12 }}>{info.label}</Typography.Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ProgramListSection;