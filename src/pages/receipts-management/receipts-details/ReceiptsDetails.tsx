import { useEffect, useState } from "react";
import {
    Descriptions,
    Spin,
    Tag,
    Typography,
    Table,
    Button,
    Space,
    Card,
    Row,
    Col,
    Flex,
    Alert,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    DollarCircleOutlined,
    CheckCircleOutlined,
    ExceptionOutlined,
    StopOutlined,
    LoadingOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { receiptsApis } from "../../../services/apiServices";
import {
    ReceiptDetailResponse,
    RevenueInReceipt,
} from "../../../types/receipts";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text } = Typography;

const THEME_COLOR = "#08979c";
const BACKGROUND_GREY = "#f0f2f5";

function ReceiptsDetails() {
    usePageTitle("Chi tiết biên lai - Cá Heo Xanh");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<ReceiptDetailResponse | null>(null);

    const fetchReceiptDetail = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await receiptsApis.getReceiptById(id);
            setReceipt(res);
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Không thể tải chi tiết biên lai");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceiptDetail();
    }, [id]);

    const renderStateTag = (state: string) => {
        const stateMap: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
            "Đã xác nhận": {
                color: "success",
                label: "Đã xác nhận",
                icon: <CheckCircleOutlined />,
            },
            "Bản nháp": {
                color: "warning",
                label: "Bản nháp",
                icon: <ExceptionOutlined />,
            },
            "Đã hủy": { color: "error", label: "Đã hủy", icon: <StopOutlined /> },
            "Chờ thanh toán": {
                color: "processing",
                label: "Chờ thanh toán",
                icon: <LoadingOutlined />,
            },
            "Đã thanh toán": {
                color: "purple",
                label: "Đã thanh toán",
                icon: <WalletOutlined />,
            },
        };

        const display = stateMap[state] || {
            color: "default",
            label: state,
            icon: <FileTextOutlined />,
        };

        return (
            <Tag
                color={display.color}
                icon={display.icon}
                style={{
                    fontSize: "1.1em",
                    padding: "8px 14px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                }}
            >
                {display.label}
            </Tag>
        );
    };

    const revenueColumns: ColumnsType<RevenueInReceipt> = [
        {
            title: "Tên khoản thu",
            dataIndex: "revenueName",
            key: "revenueName",
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            align: "right",
            render: (amount: number) => `${amount.toLocaleString()} VNĐ`,
        },
    ];

    if (loading) {
        return (
            <Flex
                align="center"
                justify="center"
                style={{ minHeight: "calc(100vh - 150px)" }}
            >
                <Spin size="large" tip="Đang tải chi tiết biên lai..." />
            </Flex>
        );
    }

    return (
        <div style={{ padding: "24px", background: BACKGROUND_GREY }}>
            <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 24 }}
            >
                <Col>
                    <Space align="center">
                        <Button
                            shape="circle"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(-1)}
                        />
                    </Space>
                </Col>
            </Row>

            {!receipt ? (
                <Card>
                    <Alert
                        message={<Title level={4} style={{ margin: 0 }}>Không tìm thấy dữ liệu</Title>}
                        description="Không thể tìm thấy chi tiết biên lai này. Có thể nó đã bị xóa hoặc có lỗi xảy ra."
                        type="error"
                        showIcon
                        style={{ padding: "24px" }}
                    />
                </Card>
            ) : (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <Space>
                                    <FileTextOutlined style={{ color: THEME_COLOR, fontSize: 22 }} />
                                    <Title level={4} style={{ margin: 0 }}>
                                        Thông tin chung
                                    </Title>
                                </Space>
                            }
                            bordered={false}
                            style={{
                                marginBottom: 24,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                            }}
                        >
                            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
                                <Descriptions.Item label="Mã biên lai">
                                    <Text strong>{receipt.receiptCode}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Năm học">
                                    {receipt.schoolYear}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên biên lai" span={2}>
                                    {receipt.receiptName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tháng">
                                    <Tag color="blue">{receipt.month}</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <WalletOutlined style={{ color: THEME_COLOR, fontSize: 22 }} />
                                    <Title level={4} style={{ margin: 0 }}>
                                        Chi tiết khoản thu
                                    </Title>
                                </Space>
                            }
                            bordered={false}
                            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                        >
                            <Table
                                columns={revenueColumns}
                                dataSource={receipt.revenueList}
                                rowKey="revenue"
                                pagination={false}
                                footer={() => (
                                    <Row justify="end">
                                        <Col>
                                            <Text strong style={{ fontSize: "1.2em" }}>
                                                Tổng cộng:{" "}
                                            </Text>
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: "1.3em",
                                                    color: THEME_COLOR,
                                                    marginLeft: 16,
                                                }}
                                            >
                                                {receipt.totalAmount.toLocaleString()} VNĐ
                                            </Text>
                                        </Col>
                                    </Row>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            title={
                                <Space>
                                    <CheckCircleOutlined style={{ color: THEME_COLOR, fontSize: 22 }} />
                                    <Title level={4} style={{ margin: 0, marginRight: 4 }}>
                                        Trạng thái
                                    </Title>
                                </Space>
                            }
                            bordered={false}
                            style={{
                                marginBottom: 30,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                                textAlign: "center",

                            }}
                        >
                            <Flex justify="center" align="center">
                                {renderStateTag(receipt.state)}
                            </Flex>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <DollarCircleOutlined style={{ color: THEME_COLOR, fontSize: 22 }} />
                                    <Title level={4} style={{ margin: 0 }}>
                                        Tổng thanh toán
                                    </Title>
                                </Space>
                            }
                            bordered={false}
                            style={{
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                                textAlign: "center",
                            }}
                        >
                            <Title
                                level={2}
                                style={{
                                    margin: 0,
                                    color: THEME_COLOR,
                                    fontWeight: 700,
                                }}
                            >
                                {receipt.totalAmount.toLocaleString()} VNĐ
                            </Title>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
}

export default ReceiptsDetails;