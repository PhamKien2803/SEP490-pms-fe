import { Card, Typography, Button, Space } from "antd";
import {
    ArrowRightOutlined,
    SolutionOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { constants } from "../../../constants";

const { Title, Text, Paragraph } = Typography;

function ParentPreviewLanding() {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: "80vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)",
            padding: 24
        }}>
            <Card
                bordered={false}
                style={{
                    maxWidth: 500,
                    width: "100%",
                    textAlign: "center",
                    borderRadius: 20,
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                    overflow: "hidden"
                }}
                bodyStyle={{ padding: "40px 32px" }}
            >
                <div style={{ marginBottom: 24 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: "#e6f7ff",
                        borderRadius: "50%",
                        display: "inline-flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 16
                    }}>
                        <SolutionOutlined style={{ fontSize: 36, color: "#1890ff" }} />
                    </div>
                </div>

                <Title level={2} style={{ marginBottom: 16, color: "#1f1f1f" }}>
                    Chào mừng Quý phụ huynh
                </Title>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 8 }}>
                            Cổng thông tin tuyển sinh và nhập học trực tuyến.
                        </Paragraph>
                        <Text style={{ fontSize: 15, color: "#595959" }}>
                            Để hoàn tất hồ sơ, vui lòng truy cập mục <Text strong color="#1890ff">Học phí</Text> để thực hiện thanh toán các khoản thu đầu năm.
                        </Text>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <Button
                            type="primary"
                            size="large"
                            shape="round"
                            icon={<ArrowRightOutlined />}
                            style={{
                                height: 48,
                                paddingLeft: 32,
                                paddingRight: 32,
                                fontSize: 16,
                                boxShadow: "0 4px 14px rgba(24, 144, 255, 0.3)"
                            }}
                            onClick={() => {
                                navigate(`${constants.APP_PREFIX}/tuitions`)
                            }}
                        >
                            Đến trang Học phí
                        </Button>
                    </div>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Nếu cần hỗ trợ, vui lòng liên hệ văn phòng nhà trường.
                    </Text>
                </Space>
            </Card>
        </div>
    );
}

export default ParentPreviewLanding;