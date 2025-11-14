import React, { useState, useCallback, useMemo } from "react";
import {
    Form,
    Input,
    Button,
    DatePicker,
    Select,
    Row,
    Col,
    Card,
    Typography,
    Modal,
    Space,
    Tooltip,
} from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { CreateUserData } from "../../../types/student-management";
import { studentApis } from "../../../services/apiServices";
import { usePageTitle } from "../../../hooks/usePageTitle";
import {
    ArrowLeftOutlined,
    UserOutlined,
    SolutionOutlined,
    IdcardOutlined,
    FlagOutlined,
    SafetyOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { ETHNIC_OPTIONS } from "../../../components/hard-code-action";

dayjs.extend(customParseFormat);
const { Option } = Select;
const { Title, Text } = Typography;

const THEME_COLOR = "black";
const BACKGROUND_GREY = "#f0f2f5";

const StudentCreate: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);
    const navigate = useNavigate();
    const user = useCurrentUser();
    usePageTitle("Tạo mới Hồ sơ Học sinh - Cá Heo Xanh");

    const [studentAge, setStudentAge] = useState<number | null>(null);
    const [dobError, setDobError] = useState<string | null>(null);

    const idCardValidationRule = useMemo(
        () => ({
            pattern: /^\d{12}$/,
            message: "CCCD phải có đúng 12 chữ số!",
        }),
        []
    );

    const nameValidationRule = {
        pattern: /^[\p{L} ]+$/u,
        message: "Chỉ được nhập chữ cái và dấu cách!",
    };

    const allowOnlyNumbers = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (
                !/[0-9]/.test(event.key) &&
                !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(
                    event.key
                ) &&
                !event.ctrlKey
            ) {
                event.preventDefault();
            }
        },
        []
    );

    const handleSubmit = async (values: any) => {
        if (!user) {
            toast.error("Vui lòng đăng nhập lại.");
            return;
        }

        if (dobError) {
            toast.error("Ngày sinh không hợp lệ, vui lòng kiểm tra lại.");
            return;
        }

        const payload: CreateUserData = {
            ...values,
            dob: values.dob.toISOString(),
            createdBy: user.email,
        };

        setLoading(true);
        try {
            await studentApis.createStudent(payload);
            toast.success("Tạo hồ sơ học sinh thành công!");
            form.resetFields();
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Tạo hồ sơ thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (form.isFieldsTouched()) {
            setConfirmCancelVisible(true);
        } else {
            navigate(-1);
        }
    };

    return (
        <div style={{ padding: "24px", background: BACKGROUND_GREY }}>
            <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: "24px" }}
            >
                <Col>
                    <Space align="center">
                        <Tooltip title="Quay lại">
                            <Button
                                shape="circle"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleCancel}
                            />
                        </Tooltip>
                        <Title level={3} style={{ margin: 0, color: THEME_COLOR }}>
                            Tạo mới Hồ sơ Học sinh
                        </Title>
                    </Space>
                </Col>
            </Row>

            <Card
                bordered={false}
                style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleSubmit}
                    onFinishFailed={() =>
                        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!")
                    }
                >
                    <Card
                        type="inner"
                        title={
                            <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                <SolutionOutlined style={{ marginRight: 8 }} />
                                Thông tin cá nhân
                            </Title>
                        }
                    >
                        <Row gutter={24}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="fullName"
                                    label="Họ và Tên"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập họ và tên!" },
                                        nameValidationRule,
                                    ]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="dob"
                                    label="Ngày sinh"
                                    rules={[
                                        { required: true, message: "Vui lòng chọn ngày sinh!" },
                                    ]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày"
                                        onChange={(date) => {
                                            form.setFieldValue("dob", date);
                                            if (date) {
                                                const today = dayjs();
                                                const age = today.diff(date, "year");
                                                if (date.isAfter(today, "day")) {
                                                    setDobError("Ngày sinh không được trong tương lai!");
                                                    setStudentAge(null);
                                                } else if (age < 1) {
                                                    setDobError("Học sinh phải đủ ít nhất 1 tuổi!");
                                                    setStudentAge(null);
                                                } else if (age > 5) {
                                                    setDobError("Học sinh không được quá 5 tuổi!");
                                                    setStudentAge(null);
                                                } else {
                                                    setDobError(null);
                                                    setStudentAge(age);
                                                }
                                            } else {
                                                setStudentAge(null);
                                                setDobError(null);
                                            }
                                        }}
                                        disabledDate={(current) =>
                                            current && current > dayjs().endOf("day")
                                        }
                                    />
                                </Form.Item>
                                {studentAge !== null && !dobError && (
                                    <Text type="secondary" style={{ marginTop: -12, display: 'block' }}>→ {studentAge} tuổi</Text>
                                )}
                                {dobError && <Text type="danger" style={{ marginTop: -12, display: 'block' }}>{dobError}</Text>}
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="gender"
                                    label="Giới tính"
                                    rules={[
                                        { required: true, message: "Vui lòng chọn giới tính!" },
                                    ]}
                                >
                                    <Select placeholder="Chọn giới tính">
                                        <Option value="Nam">Nam</Option>
                                        <Option value="Nữ">Nữ</Option>
                                        <Option value="Khác">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="idCard"
                                    label="CCCD/ Mã định danh"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập số định danh!",
                                        },
                                        idCardValidationRule,
                                    ]}
                                >
                                    <Input
                                        prefix={<IdcardOutlined />}
                                        placeholder="012345678901"
                                        onKeyPress={allowOnlyNumbers}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="nation"
                                    label="Dân tộc"
                                    rules={[
                                        { required: true, message: "Vui lòng chọn dân tộc!" },
                                    ]}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        placeholder="Kinh/Tày/Thái..."
                                        prefix={<FlagOutlined />}
                                    >
                                        {ETHNIC_OPTIONS.map((ethnic) => (
                                            <Option key={ethnic} value={ethnic}>
                                                {ethnic}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="religion"
                                    label={<Text strong><SafetyOutlined style={{ marginRight: 4 }} />Tôn giáo</Text>}
                                    rules={[
                                        { required: true, message: "Vui lòng chọn tôn giáo!" },
                                    ]}
                                >
                                    <Select placeholder="Chọn tôn giáo">
                                        <Option value="Có">Có</Option>
                                        <Option value="Không">Không</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="address"
                                    label="Địa chỉ"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập địa chỉ!" },
                                    ]}
                                >
                                    <Input.TextArea
                                        rows={2}
                                        placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Row justify="end" style={{ marginTop: 24 }}>
                        <Space>
                            <Button onClick={handleCancel} disabled={loading}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<SaveOutlined />}
                            >
                                Tạo hồ sơ
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Card>

            <Modal
                open={confirmCancelVisible}
                title="Bạn có chắc muốn hủy?"
                onOk={() => navigate(-1)}
                onCancel={() => setConfirmCancelVisible(false)}
                okText="Đồng ý"
                cancelText="Không"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Các thay đổi bạn đã nhập sẽ <strong>không</strong> được lưu lại.
                </p>
            </Modal>
        </div>
    );
};

export default StudentCreate;