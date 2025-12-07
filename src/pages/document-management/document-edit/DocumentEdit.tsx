import {
    Form,
    Input,
    Button,
    DatePicker,
    InputNumber,
    Space,
    Typography,
    Select,
    Divider,
    Card,
    Row,
    Col,
    Spin,
} from "antd";
import {
    MinusCircleOutlined,
    PlusOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { documentsApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { IDocumentDetailResponse } from "../../../types/documents";
import { toast } from "react-toastify";
import { BANK_OPTIONS } from "../../../components/hard-code-action";
import { noSpecialCharactersRule, requiredTrimRule } from "../../../utils/format";

const { Title } = Typography;
const { Option } = Select;

function DocumentEdit() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const currentUser = useCurrentUser();
    const [loading, setLoading] = useState(true);
    const [documentData, setDocumentData] = useState<IDocumentDetailResponse | null>(null);

    const method = Form.useWatch("method", form);
    const documentList = Form.useWatch("documentList", form);

    useEffect(() => {
        if (documentList && Array.isArray(documentList)) {
            const total = documentList.reduce((sum, item) => sum + (item?.amount || 0), 0);
            form.setFieldsValue({ amount: total });
        }
    }, [documentList, form]);

    const fetchDocument = async () => {
        try {
            const res = await documentsApis.getDocumentById(id as string);
            setDocumentData(res);
            form.setFieldsValue({
                ...res,
                documentDate: dayjs(res.documentDate),
            });
        } catch {
            toast.error("Không thể tải dữ liệu chứng từ");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        const payload = {
            ...values,
            documentDate: values.documentDate.toISOString(),
            createdBy: currentUser?.email || "admin",
        };
        setLoading(true);
        try {
            await documentsApis.updateDocument(id as string, payload);
            toast.success("Cập nhật thành công");
        } catch {
            toast.error("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };


    const handleConfirm = async () => {
        try {
            await documentsApis.confirmDocument(id as string);
            toast.success("Đã xác nhận thanh toán");
            fetchDocument();
        } catch {
            toast.error("Xác nhận thất bại");
        }
    };

    useEffect(() => {
        fetchDocument();
    }, [id]);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    };

    const isPaid = documentData?.status === "Đã thanh toán";

    return (
        <Card bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space align="center">
                            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                            <Title level={3} style={{ margin: 0 }}>Chỉnh sửa chứng từ</Title>
                        </Space>
                    </Col>
                    {!isPaid && (
                        <Col>
                            <Button type="primary" onClick={handleConfirm}>Xác nhận thanh toán</Button>
                        </Col>
                    )}
                </Row>

                <Form layout="vertical" form={form} onFinish={handleSubmit} disabled={isPaid}>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item name="documentName" label="Tên chứng từ" rules={[
                                requiredTrimRule("tên chứng từ"),
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (/^\s|\s$/.test(value)) {
                                            return Promise.reject(new Error("Không được để khoảng trắng ở đầu hoặc cuối!"));
                                        }
                                        if (/\s{2,}/.test(value)) {
                                            return Promise.reject(new Error("Không được có nhiều khoảng trắng liên tiếp!"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="documentDate" label="Ngày lập" rules={[{ required: true }]}>
                                <DatePicker inputReadOnly style={{ width: "100%" }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="receiver" label="Người nhận" rules={[
                                requiredTrimRule("tên người nhận"),
                                noSpecialCharactersRule,
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (/^\s|\s$/.test(value)) {
                                            return Promise.reject(new Error("Không được để khoảng trắng ở đầu hoặc cuối!"));
                                        }
                                        if (/\s{2,}/.test(value)) {
                                            return Promise.reject(new Error("Không được có nhiều khoảng trắng liên tiếp!"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="amount" label="Tổng số tiền" rules={[{ required: true }]}>
                                <InputNumber<number>
                                    readOnly
                                    style={{
                                        width: "100%",
                                        color: "black",
                                        backgroundColor: "#f5f5f5",
                                        cursor: "default",
                                        fontWeight: 600
                                    }}
                                    formatter={(value) =>
                                        value !== undefined
                                            ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                            : ""
                                    }
                                    parser={(value) => parseFloat(value?.replace(/,/g, "") || "")}
                                    addonAfter="VNĐ"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="method" label="Hình thức thanh toán" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="Chuyển khoản">Chuyển khoản</Option>
                                    <Option value="Tiền mặt">Tiền mặt</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="Chưa thanh toán">Chưa thanh toán</Option>
                                    <Option value="Đã thanh toán">Đã thanh toán</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {method === "Chuyển khoản" && (
                            <>
                                <Col xs={24} md={12}>
                                    <Form.Item name="numberBank" label="Số tài khoản" rules={[{ required: true }]}>
                                        <Input onKeyPress={allowOnlyNumbers} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item name="bank" label="Ngân hàng" rules={[{ required: true }]}>
                                        <Select placeholder="Chọn ngân hàng">
                                            {BANK_OPTIONS.map((bank) => (
                                                <Option key={bank.value} value={bank.value}>
                                                    {bank.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </>
                        )}

                        <Col span={24}>
                            <Form.Item name="reason" label="Lý do" rules={[{ required: true }]}>
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Danh sách chứng từ đính kèm</Divider>

                    <Form.List name="documentList">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name }) => (
                                    <Row key={key} gutter={[16, 8]}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item label={`Tài liệu ${name + 1}`} name={[name, "document"]} rules={[{ required: true }]}>
                                                <Input placeholder="Tên tài liệu" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={20} sm={10}>
                                            <Form.Item label={`Đơn giá ${name + 1}`} name={[name, "amount"]} rules={[{ required: true }]}>
                                                <InputNumber<number>
                                                    onKeyPress={allowOnlyNumbers}
                                                    min={0}
                                                    style={{ width: "100%" }}
                                                    formatter={(val) =>
                                                        val !== undefined
                                                            ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                            : ""
                                                    }
                                                    parser={(val) => parseFloat(val?.replace(/[^0-9]/g, "") || "")}
                                                    placeholder="Số tiền"
                                                    addonAfter="VNĐ"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={4} sm={2}>
                                            {!isPaid && (
                                                <MinusCircleOutlined
                                                    style={{ fontSize: 16, color: "red" }}
                                                    onClick={() => remove(name)}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                ))}

                                {!isPaid && (
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                                            Thêm dòng
                                        </Button>
                                    </Form.Item>
                                )}
                            </>
                        )}
                    </Form.List>

                    <Divider />

                    <Form.Item>
                        <Space>
                            {!isPaid && (
                                <>
                                    <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
                                    <Button onClick={() => form.resetFields()}>Đặt lại</Button>
                                </>
                            )}
                            <Button onClick={() => navigate(-1)}>Quay lại</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Space>
        </Card>
    );
}

export default DocumentEdit;
