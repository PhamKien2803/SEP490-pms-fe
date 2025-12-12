import { Card, Col, Row, Typography, List, Avatar, Divider, Tag } from "antd";
import {
    UserOutlined,
    MailOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

const { Title, Text } = Typography;

const StaffNews = () => {
    const user = useCurrentUser();

    const userInfo = [
        {
            title: "Email",
            description: user?.email,
            icon: <MailOutlined />,
        },
        {
            title: "Trạng thái",
            description: user?.active ? (
                <Tag color="success" style={{ margin: 0 }}>
                    Đang hoạt động
                </Tag>
            ) : (
                <Tag color="error" style={{ margin: 0 }}>
                    Vô hiệu hóa
                </Tag>
            ),
            icon: <CheckCircleOutlined />,
        },
        {
            title: "Vai trò",
            description: "Nhân viên",
            icon: <SafetyCertificateOutlined />,
        },
    ];

    return (
        <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
            <Card
                style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                bordered={false}
            >
                <Row align="middle" gutter={[16, 16]}>
                    <Col flex="auto">
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Xin chào, {user?.email?.split('@')[0] || "Nhân viên"}!
                        </Title>
                        <Text type="secondary">Chúc bạn một ngày làm việc hiệu quả.</Text>
                    </Col>
                    <Col>
                        <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    </Col>
                </Row>
            </Card>

            <Card
                title="Thông tin tài khoản"
                bordered={false}
                style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={userInfo}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar style={{ backgroundColor: '#f0f2f5', color: '#1890ff' }} icon={item.icon} />}
                                title={item.title}
                                description={
                                    typeof item.description === 'string'
                                        ? <Text strong>{item.description}</Text>
                                        : item.description
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>

            <Divider style={{ marginTop: 32 }} />

            <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    Phiên bản giao diện dành cho nhân viên nội bộ
                </Text>
            </div>
        </div>
    );
};

export default StaffNews;