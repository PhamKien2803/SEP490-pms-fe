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
} from "antd";
import {
    MinusCircleOutlined,
    PlusOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { documentsApis } from "../../../services/apiServices";
import { toast } from "react-toastify";
import { BANK_OPTIONS } from "../../../components/hard-code-action";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useEffect } from "react";
import { noSpecialCharactersRule, requiredTrimRule } from "../../../utils/format";

const { Title } = Typography;
const { Option } = Select;

function DocumentCreate() {
    usePageTitle("Tạo chứng từ - Cá Heo Xanh");
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const method = Form.useWatch("method", form);
    const documentList = Form.useWatch("documentList", form);

    useEffect(() => {
        if (documentList && Array.isArray(documentList)) {
            const total = documentList.reduce((sum, item) => sum + (item?.amount || 0), 0);
            form.setFieldsValue({ amount: total });
        }
    }, [documentList, form]);

    const handleSubmit = async (values: any) => {
        const payload = {
            ...values,
            documentDate: values.documentDate.toISOString(),
            createdBy: currentUser?.email || "admin",
        };
        try {
            await documentsApis.createDocument(payload);
            toast.success("Tạo chứng từ thành công");
            navigate(-1);
        } catch (err) {
            typeof err === "string" ? toast.info(err) : toast.error("Tạo chứng từ thất bại");
        }
    };

    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    };

    return (
        <Card bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space align="center">
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                            />
                            <Title level={3} style={{ margin: 0 }}>
                                Tạo chứng từ mới
                            </Title>
                        </Space>
                    </Col>
                </Row>

                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleSubmit}
                    initialValues={{
                        method: "Chuyển khoản",
                        status: "Chưa thanh toán",
                        documentList: [{ document: "", amount: 0 }],
                        amount: 0,
                    }}
                >
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="documentName"
                                label="Tên chứng từ"
                                rules={[
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
                                ]}
                            >
                                <Input placeholder="Ví dụ: Phiếu chi tiền điện" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="documentDate"
                                label="Ngày lập"
                                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                            >
                                <DatePicker inputReadOnly format="DD/MM/YYYY" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="receiver"
                                label="Người nhận"
                                rules={[
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
                                ]}
                            >
                                <Input placeholder="Ví dụ: Nguyễn Văn A" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="amount"
                                label="Tổng số tiền"
                                rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
                            >
                                <InputNumber<number>
                                    readOnly
                                    min={0}
                                    max={999999999}
                                    style={{
                                        width: "100%",
                                        color: "black",
                                        cursor: "default",
                                    }}
                                    formatter={(value) => (value !== undefined ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "")}
                                    parser={(value) => parseFloat(value?.replace(/,/g, "") || "")}
                                    placeholder="0"
                                    addonAfter="VNĐ"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="method" label="Hình thức thanh toán" rules={[{ required: true }]}>
                                <Select style={{ width: "100%" }}>
                                    <Option value="Chuyển khoản">Chuyển khoản</Option>
                                    <Option value="Tiền mặt">Tiền mặt</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                                <Select style={{ width: "100%" }}>
                                    <Option value="Chưa thanh toán">Chưa thanh toán</Option>
                                    <Option value="Đã thanh toán">Đã thanh toán</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {method === "Chuyển khoản" && (
                            <>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="numberBank"
                                        label="Số tài khoản"
                                        rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
                                    >
                                        <Input onKeyPress={allowOnlyNumbers} placeholder="Số tài khoản ngân hàng" style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="bank"
                                        label="Ngân hàng"
                                        rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
                                    >
                                        <Select placeholder="Chọn ngân hàng" style={{ width: "100%" }}>
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
                            <Form.Item
                                name="reason"
                                label="Lý do"
                                rules={[{ required: true, message: "Vui lòng nhập lý do chi" }]}
                            >
                                <Input.TextArea rows={3} placeholder="Lý do chi" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Danh sách chứng từ đính kèm</Divider>

                    <Form.List name="documentList">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name }) => (
                                    <Row key={key} gutter={[16, 0]} align="top">
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label={`Tài liệu ${name + 1}`}
                                                name={[name, "document"]}
                                                rules={[{ required: true, message: "Tên tài liệu" }]}
                                            >
                                                <Input placeholder="Tên tài liệu (Hóa đơn, ...)" style={{ width: "100%" }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={20} sm={10}>
                                            <Form.Item
                                                label={`Đơn giá ${name + 1}`}
                                                name={[name, "amount"]}
                                                rules={[{ required: true, message: "Số tiền" }]}
                                            >
                                                <InputNumber<number>
                                                    onKeyPress={allowOnlyNumbers}
                                                    min={0}
                                                    placeholder="Số tiền"
                                                    style={{ width: "100%" }}
                                                    formatter={(val) =>
                                                        val !== undefined
                                                            ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                            : ""
                                                    }
                                                    parser={(val) =>
                                                        parseFloat(val?.replace(/,/g, "") || "")
                                                    }
                                                    addonAfter="VNĐ"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={4} sm={2}>
                                            <MinusCircleOutlined
                                                style={{ fontSize: "16px", color: "red" }}
                                                onClick={() => remove(name)}
                                            />
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                                        Thêm dòng
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Divider />

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">Tạo chứng từ</Button>
                            <Button htmlType="button" onClick={() => form.resetFields()}>Đặt lại</Button>
                            <Button htmlType="button" onClick={() => navigate(-1)}>Quay lại</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Space>
        </Card>
    );
}

export default DocumentCreate;
