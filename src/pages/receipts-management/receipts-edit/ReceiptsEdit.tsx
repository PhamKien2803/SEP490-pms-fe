import React, { useEffect, useState } from "react";
import {
    Card,
    Spin,
    Row,
    Col,
    Typography,
    Button,
    Select,
    Table,
    Form,
    Input,
    InputNumber,
    Space,
    Tag,
    Checkbox,
    Flex,
    Popconfirm,
    Tooltip,
} from "antd";
import {
    CheckCircleOutlined,
    FileTextOutlined,
    ArrowLeftOutlined,
    StopOutlined,
    DeleteOutlined,
    WalletOutlined,
    DollarCircleOutlined,
    ExceptionOutlined,
    LoadingOutlined,
    SaveOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useNavigate, useParams } from "react-router-dom";
import { receiptsApis, revenuesApis } from "../../../services/apiServices";
import {
    CreateOrUpdateReceiptPayload,
    ReceiptDetailResponse,
} from "../../../types/receipts";
import { toast } from "react-toastify";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;
const { Option } = Select;

const THEME_COLOR = "black";
const BACKGROUND_GREY = "#f0f2f5";

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: i + 1,
}));

function ReceiptsEdit() {
    const user = useCurrentUser();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    usePageTitle("Chỉnh sửa biên lai - Cá Heo Xanh");
    const [data, setData] = useState<ReceiptDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editableRevenueList, setEditableRevenueList] = useState<any[]>([]);
    const [revenueMap, setRevenueMap] = useState<Record<string, string>>({});
    const [revenues, setRevenues] = useState<any[]>([]);
    const [disabledMonth, setDisabledMonth] = useState(false);
    const [isAdmissionFee, setIsAdmissionFee] = useState(false);

    const calculateTotal = (list: any[]) =>
        list.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const fetchRevenueList = async () => {
        try {
            const res = await revenuesApis.getListRevenues({ page: 1, limit: 100 });
            const map: Record<string, string> = {};
            res.data.forEach((item: any) => {
                map[item._id] = item.revenueName;
            });
            setRevenueMap(map);
            setRevenues(res.data);
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Không thể tải danh sách khoản thu");
        }
    };

    const fetchDetail = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await receiptsApis.getReceiptById(id!);
            setDisabledMonth(res.disabledMonth || res.isEnroll || false);
            setData(res);
            const formattedList = res.revenueList.map((r) => ({
                ...r,
                key: r.revenue,
                revenueName: revenueMap[r.revenue] || r.revenueName || "Không rõ",
            }));
            setEditableRevenueList(formattedList);
            setIsAdmissionFee(res.isAdmissionFee || false);
            form.setFieldsValue({
                receiptName: res.receiptName,
                schoolYear: res.schoolYearId,
                month: res.month,
                isEnroll: res.isEnroll,
                totalAmount: res.totalAmount,
            });
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const removeRevenueItem = (key: string) => {
        const updatedList = editableRevenueList.filter((item) => item.key !== key);
        setEditableRevenueList(updatedList);
        form.setFieldValue("totalAmount", calculateTotal(updatedList));
    };

    const addRevenueItem = () => {
        const newKey = `new_${Date.now()}`;
        setEditableRevenueList([
            ...editableRevenueList,
            {
                revenue: null,
                amount: 0,
                key: newKey,
            },
        ]);
    };

    useEffect(() => {
        fetchRevenueList().then(() => fetchDetail());
    }, [id]);

    const onFinish = async (values: CreateOrUpdateReceiptPayload) => {
        try {
            setSubmitting(true);
            await receiptsApis.updateReceipt(id!, {
                ...values,
                isAdmissionFee: isAdmissionFee,
                isEnroll: values.isEnroll,
                revenueList: editableRevenueList.map((item) => ({
                    revenue: typeof item.revenue === "string" ? item.revenue : item.revenue._id,
                    amount: item.amount,
                })),
                totalAmount: calculateTotal(editableRevenueList),
                updatedBy: user.email,
            });

            toast.success("Cập nhật thành công!");
            navigate(-1);
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Lỗi khi cập nhật");
        } finally {
            setSubmitting(false);
        }
    };

    const onConfirm = async () => {
        try {
            setSubmitting(true);
            await receiptsApis.confirmReceipt(id!);
            toast.success("Đã xác nhận phiếu thu!");
            fetchDetail();
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Lỗi xác nhận");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevenueChange = (value: string, key: string) => {
        const updatedList = [...editableRevenueList];
        const itemIndex = updatedList.findIndex(item => item.key === key);
        if (itemIndex > -1) {
            const selectedRevenue = revenues.find(r => r._id === value);
            updatedList[itemIndex] = {
                ...updatedList[itemIndex],
                revenue: value,
                amount: selectedRevenue ? selectedRevenue.amount : 0,
                revenueName: selectedRevenue ? selectedRevenue.revenueName : "Không rõ"
            };
            setEditableRevenueList(updatedList);
            form.setFieldValue("totalAmount", calculateTotal(updatedList));
        }
    };

    const handleAmountChange = (value: number, key: string) => {
        const updatedList = [...editableRevenueList];
        const itemIndex = updatedList.findIndex(item => item.key === key);
        if (itemIndex > -1) {
            updatedList[itemIndex].amount = value;
            setEditableRevenueList(updatedList);
            form.setFieldValue("totalAmount", calculateTotal(updatedList));
        }
    };

    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            !/[0-9]/.test(event.key) &&
            !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(
                event.key
            ) &&
            !event.ctrlKey
        ) {
            event.preventDefault();
        }
    };

    const isConfirmed = data?.state === "Đã xác nhận";

    const columns = [
        {
            title: "Khoản thu",
            dataIndex: "revenue",
            key: "revenue",
            render: (revenue: any, record: any) =>
                isConfirmed ? (
                    <Text>{record.revenueName}</Text>
                ) : (
                    <Select
                        placeholder="Chọn khoản thu"
                        style={{ width: "100%" }}
                        value={revenue}
                        onChange={(value) => handleRevenueChange(value, record.key)}
                    >
                        {revenues.map((r) => (
                            <Option key={r._id} value={r._id}>
                                {r.revenueName}
                            </Option>
                        ))}
                    </Select>
                ),
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number, record: any) =>
                isConfirmed ? (
                    <span>{amount.toLocaleString()} VNĐ</span>
                ) : (
                    <InputNumber
                        onKeyPress={allowOnlyNumbers}
                        style={{ width: "100%" }}
                        value={amount}
                        onChange={(val) => handleAmountChange(val || 0, record.key)}
                        min={0}
                        max={1_000_000_000}
                        formatter={(val) =>
                            `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VNĐ"
                        }
                        parser={(value?: string) =>
                            Number(value?.replace(/[^0-9]/g, "") || 0)
                        }
                    />
                ),
        },
        {
            title: "Xóa",
            key: "action",
            width: 50,
            align: "center" as "center",
            render: (_: any, record: any) =>
                !isConfirmed && (
                    <Tooltip title="Xóa khoản thu">
                        <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => removeRevenueItem(record.key)}
                        />
                    </Tooltip>
                ),
        },
    ];

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

    if (loading || !data) {
        return (
            <Flex
                align="center"
                justify="center"
                style={{ minHeight: "calc(100vh - 150px)" }}
            >
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </Flex>
        );
    }

    return (
        <div style={{ padding: "24px", background: BACKGROUND_GREY }}>
            <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: '24px' }}
            >
                <Col>
                    <Space align="center">
                        <Tooltip title="Quay lại">
                            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                        </Tooltip>
                        <Title level={3} style={{ margin: 0, color: THEME_COLOR }}>
                            Cập nhật phiếu thu
                        </Title>
                    </Space>
                </Col>
                <Col>
                    <Space>
                        <Button onClick={() => navigate(-1)}>Quay lại</Button>
                        {!isConfirmed && (
                            <>
                                <Button
                                    type="primary"
                                    form="receiptForm"
                                    htmlType="submit"
                                    loading={submitting}
                                    icon={<SaveOutlined />}
                                >
                                    Lưu
                                </Button>
                                <Popconfirm
                                    title="Xác nhận phiếu thu?"
                                    description="Hành động này sẽ khóa phiếu thu và không thể chỉnh sửa."
                                    onConfirm={onConfirm}
                                    okText="Xác nhận"
                                    cancelText="Hủy"
                                >
                                    <Button
                                        type="primary"
                                        danger
                                        loading={submitting}
                                        icon={<CheckCircleOutlined />}
                                    >
                                        Xác nhận
                                    </Button>
                                </Popconfirm>
                            </>
                        )}
                    </Space>
                </Col>
            </Row>

            <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    id="receiptForm"
                    disabled={isConfirmed}
                    onValuesChange={(changed, _) => {
                        if ("isEnroll" in changed) {
                            setDisabledMonth(changed.isEnroll === true);
                        }
                    }}
                >
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <Card
                                type="inner"
                                title={
                                    <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                        <FileTextOutlined style={{ marginRight: 8 }} />
                                        Thông tin chung
                                    </Title>
                                }
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Tên phiếu thu"
                                            name="receiptName"
                                            rules={[{ required: true, message: "Không được để trống" }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item label="Năm học" name="schoolYear">
                                            <Select disabled>
                                                <Select.Option value={data.schoolYearId}>
                                                    {data.schoolYear}
                                                </Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label="Tháng"
                                            name="month"
                                            rules={[{ required: !disabledMonth, message: "Chọn tháng" }]}
                                        >
                                            <Select
                                                options={monthOptions}
                                                placeholder="Chọn tháng"
                                                disabled={disabledMonth}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="isEnroll" valuePropName="checked">
                                            <Checkbox>Đây là phí nhập học (Tự động áp dụng cho học sinh mới)</Checkbox>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            <Card
                                type="inner"
                                title={
                                    <Title level={4} style={{ margin: 0, color: THEME_COLOR, marginTop: 24 }}>
                                        <WalletOutlined style={{ marginRight: 8 }} />
                                        Chi tiết khoản thu
                                    </Title>
                                }
                                style={{ marginTop: 24 }}
                            >
                                <Table
                                    dataSource={editableRevenueList}
                                    columns={columns}
                                    rowKey="key"
                                    pagination={false}
                                    locale={{ emptyText: "Chưa có khoản thu nào." }}
                                />
                                {!isConfirmed && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={addRevenueItem}
                                        block
                                        style={{ marginTop: 16 }}
                                    >
                                        Thêm khoản thu
                                    </Button>
                                )}
                            </Card>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Card
                                type="inner"
                                title={
                                    <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                        <CheckCircleOutlined style={{ marginRight: 8 }} />
                                        Trạng thái
                                    </Title>
                                }
                                style={{ marginBottom: 24 }}
                            >
                                <Flex justify="center" align="center">
                                    {renderStateTag(data.state)}
                                </Flex>
                            </Card>

                            <Card
                                type="inner"
                                title={
                                    <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                        <DollarCircleOutlined style={{ marginRight: 8 }} />
                                        Tổng số tiền
                                    </Title>
                                }
                            >
                                <Form.Item name="totalAmount">
                                    <InputNumber
                                        style={{
                                            width: "100%",
                                            backgroundColor: "#f6ffed",
                                            color: "#52c41a",
                                            fontWeight: 700,
                                            fontSize: "1.5em",
                                        }}
                                        readOnly
                                        value={calculateTotal(editableRevenueList)}
                                        formatter={(val) =>
                                            `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VNĐ"
                                        }
                                    />
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}

export default ReceiptsEdit;