import React, { useState, useEffect } from "react";
import {
    Card,
    Spin,
    Flex,
    Typography,
    Button,
    Tooltip,
    Descriptions,
    Tag,
    Space,
    Row,
    Col,
    Tabs,
} from "antd";
import {
    ArrowLeftOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    StopOutlined,
    CloseCircleOutlined,
    QuestionCircleOutlined,
    FileTextOutlined,
    TeamOutlined,
    ManOutlined,
    WomanOutlined,
    SolutionOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { enrollmentApis } from "../../../services/apiServices";
import { EnrollmentListItem } from "../../../types/enrollment";
import dayjs from "dayjs";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const THEME_COLOR = "black";
const BACKGROUND_GREY = "#f0f2f5";

const EnrollmentDetail: React.FC = () => {
    usePageTitle("Thông tin chi tiết - Cá Heo Xanh");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<EnrollmentListItem | null>(null);

    useEffect(() => {
        if (!id) {
            toast.error("Không tìm thấy ID của đơn tuyển sinh.");
            navigate(-1);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await enrollmentApis.getEnrollmentById(id);
                setData(response);
            } catch (error) {
                typeof error === "string"
                    ? toast.info(error)
                    : toast.error("Không thể tải chi tiết đơn tuyển sinh.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const getTagProps = (state?: string): { color: string; icon: React.ReactNode; text: string } => {
        const s = state || "";
        switch (s) {
            case "Chờ xử lý":
                return { color: "default", icon: <ClockCircleOutlined />, text: "Chờ xử lý" };
            case "Chờ thanh toán":
                return { color: "gold", icon: <DollarOutlined />, text: "Chờ thanh toán" };
            case "Chờ BGH phê duyệt":
                return { color: "blue", icon: <ClockCircleOutlined />, text: "Chờ BGH phê duyệt" };
            case "Chưa đủ điều kiện nhập học":
                return { color: "red", icon: <StopOutlined />, text: "Chưa đủ điều kiện" };
            case "Từ chối":
                return { color: "volcano", icon: <CloseCircleOutlined />, text: "Từ chối" };
            case "Hoàn thành":
                return { color: "green", icon: <CheckCircleOutlined />, text: "Hoàn thành" };
            default:
                return { color: "default", icon: <QuestionCircleOutlined />, text: s };
        }
    };

    if (loading || !data) {
        return (
            <Flex
                align="center"
                justify="center"
                style={{ minHeight: "calc(100vh - 150px)" }}
            >
                <Spin size="large" />
            </Flex>
        );
    }

    const statusInfo = getTagProps(data.state);

    return (
        <div style={{ padding: "24px", background: BACKGROUND_GREY }}>
            <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: "24px" }}
            >
                <Col>
                    <Space align="center">
                        <Tooltip title="Quay lại danh sách">
                            <Button
                                shape="circle"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                            />
                        </Tooltip>
                        <Title level={3} style={{ margin: 0, color: THEME_COLOR }}>
                            Chi tiết đơn tuyển sinh
                        </Title>
                        <Title level={4} style={{ margin: 0, color: "#595959" }}>
                            ({data.enrollmentCode})
                        </Title>
                    </Space>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card
                        bordered={false}
                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                        title={
                            <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                <SolutionOutlined style={{ marginRight: 8 }} />
                                Thông Tin Học Sinh
                            </Title>
                        }
                    >
                        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
                            <Descriptions.Item label="Họ và tên">
                                <Text strong>{data.studentName}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {dayjs(data.studentDob).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                <Tag color={data.studentGender === "Nam" ? "blue" : "pink"}>
                                    {data.studentGender}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã định danh">
                                {data.studentIdCard}
                            </Descriptions.Item>
                            <Descriptions.Item label="Dân tộc">
                                {data.studentNation}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tôn giáo">
                                {data.studentReligion}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={3}>
                                {data.address}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card
                        bordered={false}
                        style={{
                            marginTop: 24,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        }}
                        title={
                            <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                <TeamOutlined style={{ marginRight: 8 }} />
                                Thông Tin Phụ Huynh
                            </Title>
                        }
                    >
                        <Tabs defaultActiveKey="father" type="card">
                            <TabPane
                                tab={
                                    <span>
                                        <ManOutlined /> Thông tin Cha
                                    </span>
                                }
                                key="father"
                            >
                                <Descriptions column={1} bordered size="middle">
                                    <Descriptions.Item label="Họ và tên">
                                        {data.fatherName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Nghề nghiệp">
                                        {data.fatherJob}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        {data.fatherPhoneNumber}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {data.fatherEmail}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="CCCD">
                                        {data.fatherIdCard}
                                    </Descriptions.Item>
                                </Descriptions>
                            </TabPane>
                            <TabPane
                                tab={
                                    <span>
                                        <WomanOutlined /> Thông tin Mẹ
                                    </span>
                                }
                                key="mother"
                            >
                                <Descriptions column={1} bordered size="middle">
                                    <Descriptions.Item label="Họ và tên">
                                        {data.motherName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Nghề nghiệp">
                                        {data.motherJob}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        {data.motherPhoneNumber}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {data.motherEmail}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="CCCD">
                                        {data.motherIdCard}
                                    </Descriptions.Item>
                                </Descriptions>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        bordered={false}
                        style={{
                            marginBottom: 24,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        }}
                        title={
                            <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                <FileTextOutlined style={{ marginRight: 8 }} />
                                Thông Tin Đơn
                            </Title>
                        }
                    >
                        <Descriptions column={1} layout="vertical">
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    icon={statusInfo.icon}
                                    color={statusInfo.color}
                                    style={{
                                        fontSize: "1.1em",
                                        padding: "6px 12px",
                                        borderRadius: "12px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {statusInfo.text}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày nộp đơn">
                                <Text strong>
                                    {dayjs(data.createdAt).format("DD/MM/YYYY HH:mm")}
                                </Text>
                                <br />
                                <Text type="secondary">
                                    ({dayjs(data.createdAt).fromNow()})
                                </Text>
                            </Descriptions.Item>
                            {data.state === "Từ chối" && (
                                <Descriptions.Item label="Lý do từ chối">
                                    <Text type="danger" italic>
                                        {data.reason || "Không có lý do."}
                                    </Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default EnrollmentDetail;