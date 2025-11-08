import { useLocation, useNavigate } from "react-router-dom";
import {
    Card,
    Button,
    Typography,
    Space,
    Result,
    Row,
    Col,
    Alert,
    Steps,
    Tooltip,
    QRCode,
} from "antd";
import {
    ArrowLeftOutlined,
    CopyOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { tuitionApis } from "../../../../services/apiServices";
import { constants } from "../../../../constants";

const { Title, Text } = Typography;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount || 0);
};

const InfoRow = ({
    label,
    value,
    valueColor,
    canCopy = false,
    transaction = false,
}: {
    label: string;
    value: string;
    valueColor?: string;
    canCopy?: boolean;
    transaction?: boolean;
}) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        toast.success(`Đã sao chép ${label.toLowerCase()}`);
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "8px 0",
            }}
        >
            <Text type="secondary" style={{ fontSize: "14px" }}>
                {label}
            </Text>
            <Space>
                <Text
                    strong
                    style={{
                        fontSize: "16px",
                        color: valueColor,
                        maxWidth: transaction ? "200px" : "unset",
                    }}
                    ellipsis={transaction ? { tooltip: value } : false}
                >
                    {value}
                </Text>
                {canCopy && (
                    <Tooltip title={`Sao chép ${label.toLowerCase()}`}>
                        <Button
                            type="text"
                            shape="circle"
                            icon={<CopyOutlined />}
                            onClick={handleCopy}
                        />
                    </Tooltip>
                )}
            </Space>
        </div>
    );
};

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();

    const paymentData = location.state?.paymentData;
    const totalAmount = location.state?.totalAmount;

    const [paymentStatus, setPaymentStatus] = useState<"pending" | "success">("pending");
    const [isFetching, setIsFetching] = useState(false);

    const paymentContent = `HOCPHIPA${paymentData?.transactionCode}`;

    useEffect(() => {
        if (!paymentData?.transactionCode || isFetching || paymentStatus === "success") return;

        const checkPayment = async () => {
            try {
                setIsFetching(true);
                const res = await tuitionApis.checkTuitionStatus(paymentData.transactionCode.toString());

                if (res.status === "PAID") {
                    setPaymentStatus("success");
                    Swal.fire({
                        icon: "success",
                        title: "Thanh toán thành công!",
                        text: "Cảm ơn bạn đã hoàn tất thanh toán học phí.",
                        confirmButtonText: "Quay về",
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });

                    setTimeout(() => navigate(-1), 4000);
                }
            } catch (error) {
                typeof error === "string" ? toast.warn(error) : toast.error("Lỗi kiểm tra trạng thái");
            } finally {
                setIsFetching(false);
            }
        };

        const interval = setInterval(checkPayment, 5000);
        return () => clearInterval(interval);
    }, [paymentData, isFetching, paymentStatus, navigate]);

    if (!paymentData || !totalAmount) {
        return (
            <Result
                status="error"
                title="Lỗi"
                subTitle="Không tìm thấy thông tin thanh toán."
                extra={
                    <Button type="primary" onClick={() => navigate("/")}>
                        Về trang chủ
                    </Button>
                }
            />
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#eef2f6",
                padding: "40px 24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
            }}
        >
            <Card
                style={{
                    width: "100%",
                    maxWidth: 1200,
                    borderRadius: 16,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
                bodyStyle={{ padding: 40 }}
            >
                <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
                    Thanh toán học phí
                </Title>

                <Steps
                    current={paymentStatus === "success" ? 2 : 1}
                    labelPlacement="vertical"
                    responsive
                    style={{ marginBottom: 48 }}
                    status={paymentStatus === "success" ? "finish" : "process"}
                >
                    <Steps.Step
                        title="Tạo QR"
                        status="finish"
                        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                    />
                    <Steps.Step
                        title="Chờ thanh toán"
                        status={paymentStatus === "success" ? "finish" : "process"}
                        icon={
                            paymentStatus === "success" ? (
                                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                            ) : (
                                <LoadingOutlined spin style={{ color: "#1890ff" }} />
                            )
                        }
                    />
                    <Steps.Step
                        title="Hoàn thành"
                        status={paymentStatus === "success" ? "finish" : "wait"}
                        icon={
                            paymentStatus === "success" ? (
                                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                            ) : undefined
                        }
                    />
                </Steps>


                <Row gutter={[32, 32]}>
                    <Col xs={24} md={10}>
                        <Card bordered style={{ textAlign: "center", borderRadius: 12 }}>
                            <Space direction="vertical" align="center" size="large" style={{ width: "100%" }}>
                                <Title level={4}>Quét mã để thanh toán</Title>
                                <QRCode value={paymentData.qrCode} size={260} />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    napas 247 | BIDV
                                </Text>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    // onClick={() => navigate(-1)}
                                    onClick={() =>
                                        navigate(`${constants.APP_PREFIX}/tuitions`, { state: { refetch: true }, replace: true, })
                                    }
                                    size="middle"
                                >
                                    Hủy giao dịch
                                </Button>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={14}>
                        <Card bordered style={{ borderRadius: 12 }}>
                            <Alert
                                message="Mở App Ngân hàng bất kỳ để quét mã VietQR."
                                type="info"
                                showIcon
                                icon={<InfoCircleOutlined />}
                                style={{ marginBottom: 24 }}
                            />
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <InfoRow label="Ngân hàng" value="Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" />
                                <InfoRow label="Chủ tài khoản" value="BUI TRUNG HIEU" />
                                <InfoRow label="Số tài khoản" value="V3CAS3711098367" canCopy />
                                <InfoRow
                                    label="Số tiền"
                                    value={formatCurrency(totalAmount)}
                                    valueColor="#E53935"
                                    canCopy
                                />
                                <InfoRow label="Nội dung" value={paymentContent} transaction canCopy />
                            </Space>
                            <Alert
                                message="Lưu ý: Nhập chính xác Số tiền và Nội dung khi chuyển khoản."
                                type="warning"
                                showIcon
                                style={{ marginTop: 24 }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Button
                    type="primary"
                    size="large"
                    href={paymentData.paymentUrl}
                    target="_blank"
                    block
                    style={{ marginTop: 40 }}
                >
                    Chuyển đến trang thanh toán PayOS (Nếu không thể quét QR)
                </Button>

            </Card>
        </div>
    );
}

export default Payment;
