import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Spin,
    Alert,
    DatePicker,
    Select,
    Row,
    Col,
    Typography,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { parentsApis } from "../../../services/apiServices";
import { UpdateParentDto, StudentRecord } from "../../../types/auth";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { noSpecialCharactersandNumberRule, useValidationRules } from "../../../utils/format";

const { Title } = Typography;
const { Option } = Select;

const EditParent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const user = useCurrentUser();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studentOptions, setStudentOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const { phoneValidationRule, idCardValidationRule } = useValidationRules();

    useEffect(() => {
        if (!id) {
            setError("Không tìm thấy ID phụ huynh trong URL.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await parentsApis.getParentById(id);
                const studentIds = data.students.map((s: StudentRecord) => s._id);
                const options = data.students.map((s: StudentRecord) => ({
                    label: `${s.fullName} (${s.studentCode})`,
                    value: s._id,
                }));
                setStudentOptions(options);

                form.setFieldsValue({
                    ...data,
                    dob: data.dob ? dayjs(data.dob) : null,
                    students: studentIds,
                });
            } catch (error) {
                typeof error === "string" ? toast.info(error) : toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, form]);

    const onFinish = async (values: any) => {
        if (!id || !user) return;

        setSubmitting(true);
        try {
            const body: UpdateParentDto = {
                fullName: values.fullName,
                dob: values.dob ? values.dob.toISOString() : undefined,
                phoneNumber: values.phoneNumber,
                email: values.email,
                gender: values.gender,
                students: values.students,
                IDCard: values.IDCard,
                job: values.job,
                address: values.address,
                updatedBy: user.email,
            };

            await parentsApis.updateParents(id, body);
            toast.success("Cập nhật thông tin thành công");
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Cập nhật thất bại")
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Spin
                tip="Đang tải dữ liệu..."
                size="large"
                fullscreen
            />
        );
    }

    if (error) {
        return (
            <Card style={{ margin: 24 }}>
                <Alert message="Lỗi" description={error} type="error" showIcon />
            </Card>
        );
    }

    return (
        <Card style={{ margin: 24 }} bordered={false}>
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16, paddingLeft: 0, fontWeight: 500 }}
            >
                Quay lại
            </Button>

            <Title level={3} style={{ marginTop: 0 }}>
                Chỉnh sửa thông tin Phụ huynh
            </Title>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={24}>
                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            label="Họ và tên"
                            name="fullName"
                            rules={[{ required: true, message: "Vui lòng nhập họ tên" }, noSpecialCharactersandNumberRule]}
                        >
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            name="dob"
                            label="Ngày sinh"
                            rules={[
                                { required: true, message: "Vui lòng chọn ngày sinh!" },
                                {
                                    validator: (_, value) => {
                                        if (!value || !dayjs.isDayjs(value)) {
                                            return Promise.resolve();
                                        }

                                        const today = dayjs();
                                        const age = today.diff(value, "year");

                                        if (value.isAfter(today, "day")) {
                                            return Promise.reject(
                                                new Error("Ngày sinh không được trong tương lai!")
                                            );
                                        }

                                        if (!value.isValid()) {
                                            return Promise.reject(new Error("Ngày sinh không hợp lệ!"));
                                        }

                                        if (age < 18) {
                                            return Promise.reject(
                                                new Error("Phụ huynh phải từ 18 tuổi trở lên!")
                                            );
                                        }

                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            label="Giới tính"
                            name="gender"
                            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                        >
                            <Select placeholder="Chọn giới tính">
                                <Option value="Nam">Nam</Option>
                                <Option value="Nữ">Nữ</Option>
                                <Option value="Khác">Khác</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            label="Số điện thoại"
                            name="phoneNumber"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }, phoneValidationRule]}
                        >
                            <Input type="number" placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            label="CCCD/CMND"
                            name="IDCard"
                            rules={[{ required: true, message: "Vui lòng nhập CCCD" }, idCardValidationRule]}
                        >
                            <Input type="number" placeholder="Nhập số CCCD" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            label="Nghề Nghiệp"
                            name="job"
                            rules={[{ required: true, message: "Vui lòng nhập Nghề nghiệp" }, noSpecialCharactersandNumberRule]}
                        >
                            <Input placeholder="Kỹ sư..." />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ type: "email", message: "Email không hợp lệ" }]}
                        >
                            <Input placeholder="Nhập email" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item label="Học sinh liên kết" name="students">
                            <Select
                                mode="multiple"
                                placeholder="Chọn học sinh"
                                options={studentOptions}
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Địa chỉ" name="address">
                            <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item style={{ textAlign: "right" }}>
                    <Button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        icon={<SaveOutlined />}
                    >
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default EditParent;
