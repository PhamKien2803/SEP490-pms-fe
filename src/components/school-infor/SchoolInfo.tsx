import React from 'react';
import {
    Card,
    Space,
    Typography,
    Divider,
    Avatar,
    List,
} from 'antd';
import {
    HomeOutlined,
    GlobalOutlined,
    PhoneOutlined,
    MailOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const SchoolInfo: React.FC = () => {
    const infoData = [
        {
            icon: <PhoneOutlined style={{ color: '#1890ff' }} />,
            title: 'Hotline tuyển sinh',
            content: '0987 654 321',
        },
        {
            icon: <MailOutlined style={{ color: '#1890ff' }} />,
            title: 'Email hỗ trợ',
            content: 'info.littledolphins.preschool@gmail.com',
        },
        {
            icon: <GlobalOutlined style={{ color: '#1890ff' }} />,
            title: 'Website chính thức',
            content: 'https://www.dolphin-pms.id.vn/',
        },
        {
            icon: <HomeOutlined style={{ color: '#1890ff' }} />,
            title: 'Địa chỉ',
            content: 'Số 34A TT5 Khu Đô Thị Văn Quán, Hà Đông, Hà Nội',
        },
    ];

    return (
        <Card>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Avatar size={80} style={{ backgroundColor: '#e6f7ff', color: '#1890ff', fontSize: '40px' }}>
                    🐬
                </Avatar>
                <Title level={4} style={{ marginTop: 16 }}>Dolphin Preschool</Title>
                <Text type="secondary">Năm học 2025 - 2026</Text>
            </Space>

            <Divider>Thông tin liên hệ</Divider>

            <List
                itemLayout="horizontal"
                dataSource={infoData}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={item.icon}
                            title={<Text strong>{item.title}</Text>}
                            description={item.content}
                        />
                    </List.Item>
                )}
            />

            <Divider>Nơi Ươm Mầm Tương Lai</Divider>
            <Paragraph>
                <ul style={{ paddingLeft: '20px' }}>
                    <li>Phương pháp giáo dục sớm, tôn trọng sự khác biệt của trẻ.</li>
                    <li>Chương trình học tập đa dạng, kết hợp vui chơi và khám phá.</li>
                    <li>Cơ sở vật chất hiện đại, không gian xanh an toàn cho bé.</li>
                    <li>Đội ngũ giáo viên tận tâm, yêu trẻ và có chuyên môn cao.</li>
                </ul>
            </Paragraph>
        </Card>
    );
};

export default SchoolInfo;
