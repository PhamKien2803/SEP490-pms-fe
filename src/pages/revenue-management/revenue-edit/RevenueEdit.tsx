import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Space,
    Spin,
    Tooltip,
    Typography,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { CreateRevenuePayload } from "../../../types/revenues";
import { revenuesApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title } = Typography;

const RevenueEdit = () => {
    usePageTitle("Cập nhật khoản thu - Cá Heo Xanh");
    const { id } = useParams();
    const [form] = Form.useForm();
    const user = useCurrentUser();
    const navigate = useNavigate();
    const [modalApi, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await revenuesApis.getRevenueById(id!);
            form.setFieldsValue(data);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải dữ liệu khoản thu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleCancel = () => {
        if (isFormDirty) {
            modalApi.confirm({
                title: "Bạn có chắc muốn hủy?",
                content: "Các thay đổi sẽ không được lưu lại.",
                okText: "Đồng ý",
                cancelText: "Ở lại",
                onOk: () => navigate(-1),
            });
        } else {
            navigate(-1);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload: CreateRevenuePayload = {
                ...values,
                amount: Number(values.amount),
                updatedBy: user.email,
            };

            setIsSubmitting(true);
            await revenuesApis.updateRevenue(id!, payload);
            toast.success("Cập nhật khoản thu thành công!");
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Cập nhật khoản thu thất bại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const allowOnlyNumbers = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (
                !/[0-9]/.test(event.key) &&
                !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(
                    event.key
                )
            ) {
                event.preventDefault();
            }
        },
        []
    );

    const validateOnlyLetters = (_: any, value: string) => {
        const regex = /^[\p{L}\s]+$/u;
        if (!value || regex.test(value)) {
            return Promise.resolve();
        }
        return Promise.reject("Chỉ được nhập chữ cái, không chứa số hoặc ký tự đặc biệt");
    };

    return (
        <div style={{ padding: 24, background: "#f0f2f5" }}>
            {contextHolder}
            <Spin spinning={loading}>
                <Card
                    title={
                        <Space align="center">
                            <Tooltip title="Quay lại">
                                <Button
                                    shape="circle"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handleCancel}
                                />
                            </Tooltip>
                            <Title level={3} style={{ margin: 0 }}>
                                Cập nhật khoản thu
                            </Title>
                        </Space>
                    }
                    extra={
                        <Space>
                            <Button onClick={handleCancel} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={isSubmitting}
                                onClick={handleSubmit}
                            >
                                Lưu
                            </Button>
                        </Space>
                    }
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={() => setIsFormDirty(true)}
                    >
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item
                                    label="Tên khoản thu"
                                    name="revenueName"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập tên khoản thu" },
                                    ]}
                                >
                                    <Input placeholder="VD: Học phí tháng 11" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Đơn vị"
                                    name="unit"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập đơn vị" },
                                        { validator: validateOnlyLetters },
                                    ]}
                                >
                                    <Input placeholder="VD: Tháng, Buổi, Năm..." />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Số tiền"
                                    name="amount"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số tiền" },
                                        {
                                            type: "number",
                                            min: 0,
                                            message: "Số tiền phải là số dương",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: "100%" }}
                                        min={0}
                                        step={1000}
                                        placeholder="VD: 2500000"
                                        formatter={(value) =>
                                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value?: string) =>
                                            value ? Number(value.replace(/[^\d]/g, "")) : 0
                                        }
                                        onKeyDown={allowOnlyNumbers}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </Spin>
        </div>
    );
};

export default RevenueEdit;
