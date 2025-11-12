import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Button,
    Space,
    Typography,
    Descriptions,
    Tag,
    Spin,
    Empty,
    Row,
    Col,
    Alert,
    Collapse,
    List,
    Divider,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { TuitionDetailItem } from "../../../types/tuition";
import { tuitionApis } from "../../../services/apiServices";
import { constants } from "../../../constants";
import { usePagePermission } from "../../../hooks/usePagePermission";
import { usePageTitle } from "../../../hooks/usePageTitle";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const getStateTag = (state: string) => {
    const normalized = state?.trim().toLowerCase();
    switch (normalized) {
        case "đã thanh toán":
            return <Tag color="green">Đã thanh toán</Tag>;
        case "chưa thanh toán":
            return <Tag color="red">Chưa thanh toán</Tag>;
        default:
            return <Tag>{state}</Tag>;
    }
};

const { Title, Text } = Typography;

function TuitionDetails() {
    usePageTitle("Chi tiết học phí - Cá Heo Xanh");
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const parentId = currentUser?.parent;
    const { canApprove } = usePagePermission();
    const [details, setDetails] = useState<TuitionDetailItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [enrollmentId, setEnrollmentId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        if (!parentId) {
            toast.error("Không tìm thấy thông tin phụ huynh.");
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await tuitionApis.getTuitionDetail(parentId);
                setDetails(response.data);
                setTotalAmount(response.totalAmount);
                setEnrollmentId(response.data[0]?.enrollementId || "");
            } catch (error) {
                typeof error === "string" ? toast.info(error) : toast.error("Không thể tải chi tiết học phí");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [parentId]);

    const handleConfirmPayment = async () => {
        if (!parentId || totalAmount === 0) return;

        setConfirmLoading(true);
        try {
            const payload = {
                enrollementId: enrollmentId,
                parentId: parentId,
                totalAmount: totalAmount,
            };
            const response = await tuitionApis.confirmTuition(payload);

            if (response.success && response.data) {
                navigate(`${constants.APP_PREFIX}/tuitions/payment`, {
                    state: {
                        paymentData: response.data,
                        totalAmount: totalAmount,
                    },
                });
            } else {
                toast.error(response.message || "Xác nhận thất bại");
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Có lỗi xảy ra khi xác nhận thanh toán");
        } finally {
            setConfirmLoading(false);
        }
    };

    if (loading) {
        return <Spin tip="Đang tải dữ liệu..." />;
    }

    if (details.length === 0) {
        return <Empty description="Hiện chưa có thông tin học phí của con." />;
    }

    const commonInfo = details[0];
    const allPaid = details.every(
        (d) => d.state?.toLowerCase() === "đã thanh toán"
    );

    const renderPaymentSummary = () => (
        <Card style={{ position: "sticky", top: 24 }}>
            <Title level={4}>Tóm tắt thanh toán</Title>
            <Descriptions column={1}>
                <Descriptions.Item label="Tổng cộng">
                    <Title level={2} style={{ color: "#1677ff", margin: 0 }}>
                        {formatCurrency(totalAmount)}
                    </Title>
                </Descriptions.Item>
            </Descriptions>
            {canApprove && (<Space direction="vertical" style={{ width: "100%", margin: "16px 0" }}>

                {allPaid ? (
                    <Alert
                        message="Đã hoàn tất thanh toán"
                        type="success"
                        showIcon
                    />
                ) : (

                    <Button
                        type="primary"
                        style={{ backgroundColor: "#08979c" }}
                        size="large"
                        block
                        loading={confirmLoading}
                        onClick={handleConfirmPayment}
                    >
                        Tiến hành thanh toán
                    </Button>
                )}
            </Space>)}

            <Divider style={{ margin: "12px 0" }} />

            <Descriptions
                title="Thông tin biên lai"
                bordered
                column={1}
                size="small"
            >
                <Descriptions.Item label="Biên lai">
                    {commonInfo.receiptName}
                </Descriptions.Item>
                <Descriptions.Item label="Mã biên lai">
                    {commonInfo.receiptCode}
                </Descriptions.Item>
                <Descriptions.Item label="Năm học">
                    {commonInfo.schoolYear}
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                    {commonInfo.createdBy}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );

    const renderTuitionDetails = () => (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {details.map((item) => {
                const isExpandable = item.revenueList && item.revenueList.length > 0;

                if (isExpandable) {
                    return (
                        <Card key={item.tuitionId} bodyStyle={{ padding: 0 }}>
                            <Collapse ghost>
                                <Collapse.Panel
                                    key={item.tuitionId}
                                    header={
                                        <Row justify="space-between" style={{ width: "100%" }}>
                                            <Col>
                                                <Space direction="vertical" size={2}>
                                                    <Text strong style={{ fontSize: "1.1em" }}>
                                                        {item.tuitionName}
                                                    </Text>
                                                    <Text>
                                                        Học sinh: {item.studentName} - Tháng: {item.month}
                                                    </Text>
                                                </Space>
                                            </Col>
                                            <Col>
                                                <Space direction="vertical" align="end" size={4}>
                                                    <Text
                                                        strong
                                                        style={{ fontSize: "1.2em", color: "#1677ff" }}
                                                    >
                                                        {formatCurrency(item.totalAmount)}
                                                    </Text>
                                                    {getStateTag(item.state)}
                                                </Space>
                                            </Col>
                                        </Row>
                                    }
                                >
                                    <div style={{ padding: "0 16px 16px 16px" }}>
                                        <List
                                            dataSource={item.revenueList}
                                            renderItem={(revenue) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        title={revenue.revenueName}
                                                        description={`Mã: ${revenue.revenueCode || "N/A"}`}
                                                    />
                                                    <Text strong>{formatCurrency(revenue.amount)}</Text>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                </Collapse.Panel>
                            </Collapse>
                        </Card>
                    );
                }

                return (
                    <Card key={item.tuitionId}>
                        <Row
                            justify="space-between"
                            align="middle"
                            style={{ width: "100%" }}
                        >
                            <Col>
                                <Space direction="vertical" size={2}>
                                    <Text strong style={{ fontSize: "1.1em" }}>
                                        {item.tuitionName}
                                    </Text>
                                    <Text>Mã: {item.receiptCode || item.tuitionId}</Text>
                                </Space>
                            </Col>
                            <Col>
                                <Space direction="vertical" align="end" size={4}>
                                    <Text
                                        strong
                                        style={{ fontSize: "1.2em", color: "#1677ff" }}
                                    >
                                        {formatCurrency(item.totalAmount)}
                                    </Text>
                                    {getStateTag(item.state)}
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                );
            })}
        </Space>
    );

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                Quay lại
            </Button>

            <Title level={3}>Chi tiết học phí</Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={15}>
                    <Space direction="vertical" style={{ width: "100%" }} size="middle">
                        <Title level={4}>Các khoản cần thanh toán</Title>
                        {renderTuitionDetails()}
                    </Space>
                </Col>

                <Col xs={24} md={9}>
                    {renderPaymentSummary()}
                </Col>
            </Row>
        </Space>
    );
}

export default TuitionDetails;