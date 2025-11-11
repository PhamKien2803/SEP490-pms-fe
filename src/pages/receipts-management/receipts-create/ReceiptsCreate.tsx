import {
    Form,
    Input,
    InputNumber,
    Button,
    Select,
    Typography,
    Space,
    Popconfirm,
    Row,
    Col,
    Table,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import {
    receiptsApis,
    schoolYearApis,
} from "../../../services/apiServices";
import type { CreateOrUpdateReceiptPayload } from "../../../types/receipts";
import type { SchoolYearListItem } from "../../../types/schoolYear";
import type { RevenueForReceiptItem } from "../../../types/receipts";
import { toast } from "react-toastify";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

const { Title } = Typography;
const { Option } = Select;

function ReceiptsCreate() {
    const user = useCurrentUser();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    usePageTitle("Tạo mới biên lai - Cá Heo Xanh");
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [revenues, setRevenues] = useState<RevenueForReceiptItem[]>([]);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    const fetchInitialData = async () => {
        try {
            const [resSchoolYears, resRevenues] = await Promise.all([
                schoolYearApis.getSchoolYearList({ page: 1, limit: 100 }),
                receiptsApis.getRevenuesForReceipt(),
            ]);

            setSchoolYears(resSchoolYears.data);
            setRevenues(resRevenues);

            if (resSchoolYears.data.length > 0) {
                form.setFieldsValue({ schoolYear: resSchoolYears.data[0]._id });
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải dữ liệu khởi tạo");
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const onFinish = async (values: any) => {
        const payload: CreateOrUpdateReceiptPayload = {
            receiptName: values.receiptName,
            schoolYear: values.schoolYear,
            month: values.month,
            revenueList: values.revenueList,
            totalAmount: values.revenueList.reduce(
                (sum: number, item: any) => sum + item.amount,
                0
            ),
            createdBy: user.email
        };

        try {
            await receiptsApis.createReceipt(payload);
            toast.success("Tạo biên lai thành công");
            setUnsavedChanges(false);
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Tạo biên lai thất bại");
        }
    };

    const handleChange = () => setUnsavedChanges(true);
    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    };

    return (
        <div>
            <Space align="center" style={{ marginBottom: 16 }}>
                <Popconfirm
                    title="Bạn có chắc muốn quay lại? Dữ liệu chưa lưu sẽ bị mất."
                    onConfirm={() => navigate(-1)}
                    okText="Rời đi"
                    cancelText="Ở lại"
                    disabled={!unsavedChanges}
                >
                    <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Quay lại</Button>
                </Popconfirm>
                <Title level={3} style={{ margin: 0 }}>
                    Tạo biên lai mới
                </Title>
            </Space>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleChange}
                initialValues={{ revenueList: [] }}
            >

                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            label="Tháng"
                            name="month"
                            rules={[{ required: true, message: "Vui lòng chọn tháng" }]}
                        >
                            <Select placeholder="Chọn tháng" onChange={(value) => {
                                const currentName = form.getFieldValue("receiptName");
                                if (!currentName || currentName.startsWith("Học phí tháng")) {
                                    form.setFieldsValue({ receiptName: `Học phí tháng ${value}` });
                                }
                            }}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <Option key={i + 1} value={i + 1}>
                                        Tháng {i + 1}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Tên biên lai"
                            name="receiptName"
                            rules={[{ required: true, message: "Vui lòng nhập tên biên lai" }]}
                        >
                            <Input placeholder="Nhập tên biên lai" />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Năm học"
                            name="schoolYear"
                            rules={[{ required: true, message: "Vui lòng chọn năm học" }]}
                        >
                            <Select placeholder="Chọn năm học" allowClear>
                                {schoolYears.map((item) => (
                                    <Option key={item._id} value={item._id}>
                                        {item.schoolYear}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.List name="revenueList">
                    {(fields, { add, remove }) => (
                        <>
                            <Title level={5}>Danh sách khoản thu</Title>

                            <Table
                                dataSource={fields}
                                rowKey="key"
                                bordered
                                pagination={false}
                                scroll={{ x: "max-content" }}
                                style={{ marginBottom: 16 }}
                                columns={[
                                    {
                                        title: "STT",
                                        width: 50,
                                        render: (_, __, i) => i + 1,
                                    },
                                    {
                                        title: "Khoản thu",
                                        width: 300,
                                        render: (_, field) => (
                                            <Form.Item
                                                name={[field.name, "revenue"]}
                                                rules={[{ required: true, message: "Chọn khoản thu" }]}
                                                style={{ margin: 0 }}
                                            >
                                                <Select
                                                    placeholder="Chọn khoản thu"
                                                    style={{ width: "100%" }}
                                                    onChange={(value) => {
                                                        const selected = revenues.find((r) => r._id === value);
                                                        if (selected) {
                                                            const currentList = form.getFieldValue("revenueList");
                                                            const newList = [...currentList];
                                                            newList[field.name] = {
                                                                ...newList[field.name],
                                                                amount: selected.amount,
                                                            };
                                                            form.setFieldsValue({ revenueList: newList });
                                                        }
                                                    }}
                                                >
                                                    {revenues.map((r) => (
                                                        <Option key={r._id} value={r._id}>
                                                            {r.revenueName}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        ),
                                    },
                                    {
                                        title: "Số tiền",
                                        width: 160,
                                        render: (_, field) => (
                                            <Form.Item
                                                name={[field.name, "amount"]}
                                                rules={[{ required: true, message: "Nhập số tiền" }]}
                                                style={{ margin: 0 }}
                                            >
                                                <InputNumber
                                                    onKeyPress={allowOnlyNumbers}
                                                    min={0}
                                                    max={1_000_000_000}
                                                    placeholder="Số tiền"
                                                    style={{ width: "100%" }}
                                                    controls={false}
                                                    formatter={(value) =>
                                                        value
                                                            ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                            : ""
                                                    }
                                                    parser={(value?: string) => {
                                                        if (!value) return 0;
                                                        const cleaned = value.replace(/[^0-9]/g, "");
                                                        return Math.min(Number(cleaned), 1_000_000_000);
                                                    }}
                                                />
                                            </Form.Item>
                                        ),
                                    },
                                    {
                                        title: "Xoá",
                                        width: 80,
                                        render: (_, field) => (
                                            <Button danger onClick={() => remove(field.name)}>
                                                Xoá
                                            </Button>
                                        ),
                                    },
                                ]}

                            />

                            <Form.Item>
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        add();
                                        setUnsavedChanges(true);
                                    }}
                                >
                                    Thêm khoản thu
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item>
                    <Popconfirm
                        title="Xác nhận tạo biên lai?"
                        onConfirm={() => form.submit()}
                        okText="Tạo"
                        cancelText="Huỷ"
                    >
                        <Button type="primary">Tạo biên lai</Button>
                    </Popconfirm>
                </Form.Item>
            </Form>
        </div>
    );
}

export default ReceiptsCreate;
