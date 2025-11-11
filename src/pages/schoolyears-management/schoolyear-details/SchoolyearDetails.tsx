import { useState, useEffect, useCallback } from "react";
import {
    Button,
    Space,
    Typography,
    Card,
    Row,
    Col,
    Spin,
    Flex,
    Tooltip,
    Tag,
    Descriptions,
    Divider,
} from "antd";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined,
    NumberOutlined,
    FlagOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { schoolYearApis } from "../../../services/apiServices";
import { SchoolYearListItem } from "../../../types/schoolYear";
import dayjs from "dayjs";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text } = Typography;

const THEME_COLOR = "#08979c";
const BACKGROUND_GREY = "#f0f2f5";

const STATUS_CONFIG = {
    "Chưa hoạt động": { text: "CHƯA HOẠT ĐỘNG", color: "processing" },
    "Đang hoạt động": { text: "ĐANG HOẠT ĐỘNG", color: "success" },
    "Hết thời hạn": { text: "HẾT THỜI HẠN", color: "error" },
};

function SchoolyearDetails() {
    usePageTitle("Chi tiết năm học - Cá Heo Xanh");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [schoolYearData, setSchoolYearData] =
        useState<SchoolYearListItem | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) {
            toast.error("URL không hợp lệ, thiếu ID năm học.");
            navigate(-1);
            return;
        }
        setLoading(true);
        try {
            const data = await schoolYearApis.getSchoolYearById(id);
            setSchoolYearData(data);
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Không thể tải dữ liệu năm học.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
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

    if (!schoolYearData) {
        return null;
    }

    const statusInfo = STATUS_CONFIG[
        schoolYearData.state as keyof typeof STATUS_CONFIG
    ] || { text: schoolYearData.state.toUpperCase(), color: "default" };

    return (
        <div style={{ padding: "24px", background: BACKGROUND_GREY }}>
            <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 24 }}
            >
                <Col>
                    <Space align="center">
                        <Tooltip title="Quay lại">
                            <Button
                                shape="circle"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                            />
                        </Tooltip>
                        <Title level={3} style={{ margin: 0, color: THEME_COLOR }}>
                            Chi tiết năm học
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
                            <Space>
                                <CalendarOutlined style={{ color: THEME_COLOR, fontSize: 22 }} />
                                <Title level={4} style={{ margin: 0 }}>
                                    {schoolYearData.schoolYear}
                                </Title>
                            </Space>
                        }
                        extra={
                            <Tag
                                color={statusInfo.color}
                                style={{
                                    fontSize: 14,
                                    padding: "5px 10px",
                                    fontWeight: "bold",
                                }}
                            >
                                {statusInfo.text}
                            </Tag>
                        }
                    >
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Mã năm học: {schoolYearData.schoolyearCode}
                        </Text>
                        <Divider />
                        <Descriptions
                            title="Các Mốc Thời Gian Chính"
                            bordered
                            column={{ xs: 1, sm: 2 }}
                        >
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <CalendarOutlined style={{ color: THEME_COLOR }} /> Ngày bắt
                                        đầu
                                    </Text>
                                }
                            >
                                {dayjs(schoolYearData.startDate).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <CalendarOutlined style={{ color: THEME_COLOR }} /> Ngày kết
                                        thúc
                                    </Text>
                                }
                            >
                                {dayjs(schoolYearData.endDate).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions
                            title="Tuyển Sinh & Dịch Vụ"
                            bordered
                            column={{ xs: 1, sm: 2 }}
                            style={{ marginTop: 24 }}
                        >
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <NumberOutlined style={{ color: THEME_COLOR }} /> Chỉ tiêu
                                    </Text>
                                }
                            >
                                {schoolYearData.numberTarget}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <FlagOutlined style={{ color: THEME_COLOR }} /> Bắt đầu tuyển
                                        sinh
                                    </Text>
                                }
                            >
                                {dayjs(schoolYearData.enrollmentStartDate).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <FlagOutlined style={{ color: THEME_COLOR }} /> Kết thúc
                                        tuyển sinh
                                    </Text>
                                }
                            >
                                {dayjs(schoolYearData.enrollmentEndDate).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <WalletOutlined style={{ color: THEME_COLOR }} /> Bắt đầu
                                        dịch vụ
                                    </Text>
                                }
                            >
                                {dayjs(schoolYearData.serviceStartTime).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <WalletOutlined style={{ color: THEME_COLOR }} /> Kết thúc
                                        dịch vụ
                                    </Text>
                                }
                                span={2}
                            >
                                {dayjs(schoolYearData.serviceEndTime).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title="Thông tin hệ thống"
                        bordered={false}
                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                    >
                        <Descriptions
                            column={1}
                            size="small"
                            layout="horizontal"
                            labelStyle={{ width: 90 }}
                        >
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <UserOutlined /> Người tạo
                                    </Text>
                                }
                            >
                                {schoolYearData.createdBy}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <ClockCircleOutlined /> Ngày tạo
                                    </Text>
                                }
                            >
                                {dayjs(schoolYearData.createdAt).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Text strong>
                                        <ClockCircleOutlined /> Cập nhật
                                    </Text>
                                }
                            >
                                {dayjs(schoolYearData.updatedAt).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default SchoolyearDetails;