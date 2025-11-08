import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Table,
    Typography,
    Tag,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { receiptsApis, revenuesApis } from "../../../services/apiServices";
import {
    CreateOrUpdateReceiptPayload,
    ReceiptDetailResponse,
} from "../../../types/receipts";
import { toast } from "react-toastify";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

const { Title } = Typography;

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
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editableRevenueList, setEditableRevenueList] = useState<any[]>([]);
    const [revenueMap, setRevenueMap] = useState<Record<string, string>>({});

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
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error("Không thể tải danh sách khoản thu");
        }
    };

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await receiptsApis.getReceiptById(id!);

            setData(res);
            const formattedList = res.revenueList.map((r) => ({
                ...r,
                revenueName: revenueMap[r.revenue] || r.revenueName || "Không rõ",
            }));
            setEditableRevenueList(formattedList);

            form.setFieldsValue({
                receiptName: res.receiptName,
                schoolYear: res.schoolYearId,
                month: res.month,
                revenueList: formattedList,
                totalAmount: res.totalAmount,
            });
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueList().then(() => fetchDetail());
    }, [id]);

    const onFinish = async (values: CreateOrUpdateReceiptPayload) => {
        try {
            setSubmitting(true);
            await receiptsApis.updateReceipt(id!, {
                ...values,
                revenueList: editableRevenueList.map((item) => ({
                    revenue: typeof item.revenue === "string" ? item.revenue : item.revenue._id,
                    amount: item.amount,
                })),
                totalAmount: calculateTotal(editableRevenueList),
                updatedBy: user.email
            });

            toast.success("Cập nhật thành công!");
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error("Lỗi khi cập nhật");
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
            typeof error === "string" ? toast.warn(error) : toast.error("Lỗi xác nhận");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAmountChange = (value: number, index: number) => {
        const updatedList = [...editableRevenueList];
        updatedList[index].amount = value;
        setEditableRevenueList(updatedList);
        form.setFieldValue("totalAmount", calculateTotal(updatedList));
    };

    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    };

    const isConfirmed = data?.state === "Đã xác nhận";

    const columns = [
        {
            title: "Khoản thu",
            dataIndex: "revenue",
            key: "revenue",
            render: (rev: any, record: any) => {
                const id = typeof rev === "string" ? rev : rev?._id;
                return revenueMap[id] || record.revenueName || "Không rõ";
            },
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            render: (_: any, __: any, index: number) =>
                isConfirmed ? (
                    <span>{editableRevenueList[index]?.amount.toLocaleString()} VNĐ</span>
                ) : (
                    <InputNumber
                        onKeyPress={allowOnlyNumbers}
                        style={{ width: "100%" }}
                        value={editableRevenueList[index]?.amount}
                        onChange={(val) => handleAmountChange(val || 0, index)}
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
    ];

    return (
        <Card loading={loading}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={4}>Cập nhật phiếu thu</Title>
                    <Tag color={isConfirmed ? "green" : "orange"}>
                        {data?.state}
                    </Tag>
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
                                >
                                    Lưu
                                </Button>
                                <Button
                                    type="primary"
                                    danger
                                    onClick={onConfirm}
                                    loading={submitting}
                                >
                                    Xác nhận
                                </Button>
                            </>
                        )}
                    </Space>
                </Col>
            </Row>

            {data && (
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    id="receiptForm"
                    disabled={isConfirmed}
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
                                rules={[{ required: true, message: "Chọn tháng" }]}
                            >
                                <Select options={monthOptions} placeholder="Chọn tháng" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Chi tiết khoản thu">
                        <Table
                            dataSource={editableRevenueList}
                            columns={columns}
                            rowKey={(record: any) =>
                                typeof record.revenue === "string"
                                    ? record.revenue
                                    : record.revenue._id
                            }
                            pagination={false}
                        />
                    </Form.Item>

                    <Form.Item label="Tổng số tiền" name="totalAmount">
                        <InputNumber
                            style={{
                                width: "100%",
                                backgroundColor: "#EEF6FF",
                                color: "#000",
                                fontWeight: 600,
                            }}
                            disabled
                            value={calculateTotal(editableRevenueList)}
                            formatter={(val) =>
                                `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VNĐ"
                            }
                        />
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
}

export default ReceiptsEdit;
