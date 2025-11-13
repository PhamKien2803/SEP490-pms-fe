import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    Spin,
    Flex,
    Upload,
    Tooltip,
    Space,
} from "antd";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { studentApis, enrollmentApis } from "../../../services/apiServices";
import {
    StudentRecord,
    UpdateUserData,
} from "../../../types/student-management";
import { usePageTitle } from "../../../hooks/usePageTitle";
import {
    ArrowLeftOutlined,
    UserOutlined,
    SolutionOutlined,
    IdcardOutlined,
    SaveOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { ETHNIC_OPTIONS } from "../../../components/hard-code-action";

dayjs.extend(customParseFormat);
const { Option } = Select;
const { Title, Text } = Typography;

const THEME_COLOR = "black";
const BACKGROUND_GREY = "#f0f2f5";

const StudentEdit: React.FC = () => {
    usePageTitle("Chỉnh sửa thông tin - Cá Heo Xanh");
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const navigate = useNavigate();
    const user = useCurrentUser();
    const [studentImageId, setStudentImageId] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<UploadFile[]>([]);
    const [studentAge, setStudentAge] = useState<number | null>(null);
    const [dobError, setDobError] = useState<string | null>(null);

    const idCardValidationRule = useMemo(() => ({
        pattern: /^\d{12}$/,
        message: 'CCCD phải có đúng 12 chữ số!',
    }), []);

    const nameValidationRule = {
        pattern: /^[\p{L} ]+$/u,
        message: 'Chỉ được nhập chữ cái và dấu cách!',
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

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const res = await studentApis.getStudentById(id);
                const student: StudentRecord = res.student;

                form.setFieldsValue({
                    fullName: student.fullName,
                    dob: dayjs(student.dob),
                    idCard: student.idCard,
                    gender: student.gender,
                    nation: student.nation,
                    religion: student.religion,
                    address: student.address,
                });

                if (student.imageStudent) {
                    setStudentImageId(student.imageStudent);
                    setImagePreview([
                        {
                            uid: "-1",
                            name: "image.png",
                            status: "done",
                            url: student.imageStudent,
                        },
                    ]);
                }
            } catch (error) {
                typeof error === "string" ? toast.info(error) : toast.error("Không thể tải dữ liệu học sinh.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, form]);

    const handleSubmit = async (values: any) => {
        if (!user || !id) {
            toast.error("Thiếu thông tin người dùng hoặc học sinh.");
            return;
        }

        if (dobError) {
            toast.error("Ngày sinh không hợp lệ, vui lòng kiểm tra lại.");
            return;
        }

        const payload: UpdateUserData = {
            fullName: values.fullName,
            dob: values.dob.toISOString(),
            idCard: values.idCard,
            gender: values.gender,
            nation: values.nation,
            religion: values.religion,
            address: values.address,
            updatedBy: user.email,
            relationship: "",
            imageStudent: studentImageId || "",
        };

        setSubmitting(true);
        try {
            await studentApis.updateStudent(id, payload);
            toast.success("Cập nhật học sinh thành công!");
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Cập nhật học sinh thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (form.isFieldsTouched()) {
            setConfirmCancel(true);
        } else {
            navigate(-1);
        }
    };

    const beforeUploadImage = (file: RcFile) => {
        const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
        if (!isJpgOrPng) {
            toast.error("Bạn chỉ có thể tải lên file JPG/PNG!");
        }
        return isJpgOrPng || Upload.LIST_IGNORE;
    };

    const customRequestImage = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            const response = await enrollmentApis.uploadEnrollmentImage(file as File);

            if (response?.url) {
                setStudentImageId(response.url);

                setImagePreview([
                    {
                        uid: String(Date.now()),
                        name: (file as File).name,
                        status: "done",
                        url: response.url,
                    },
                ]);

                toast.success("Tải ảnh học sinh thành công!");
                onSuccess?.("ok");
            } else {
                throw new Error("Server không trả về url!");
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Tải ảnh thất bại!");
            onError?.(error);
        }
    };


    const onFileChange: UploadProps['onChange'] = (info) => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1);

        fileList = fileList.map(file => {
            if (file.response) {
                file.url = URL.createObjectURL(file.originFileObj as RcFile);
            }
            return file;
        });
        setImagePreview(fileList);
    };

    const onFileRemove = () => {
        setStudentImageId(null);
        setImagePreview([]);
    };

    if (loading) {
        return (
            <Flex
                align="center"
                justify="center"
                style={{ minHeight: "calc(100vh - 150px)" }}
            >
                <Spin size="large" />
            </Flex>
        );
    }

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
                            Chỉnh sửa Hồ sơ Học sinh
                        </Title>
                    </Space>
                </Col>
                <Col>
                    <Space>
                        <Button onClick={handleCancel} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            onClick={form.submit}
                            icon={<SaveOutlined />}
                        >
                            Cập nhật
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onFinishFailed={() =>
                    toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!")
                }
            >
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card
                            bordered={false}
                            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                            title={
                                <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                    <SolutionOutlined style={{ marginRight: 8 }} />
                                    Thông tin cá nhân
                                </Title>
                            }
                        >
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="fullName"
                                        label={<Text strong>Họ và Tên</Text>}
                                        rules={[
                                            { required: true, message: "Vui lòng nhập họ và tên!" },
                                            nameValidationRule
                                        ]}
                                    >
                                        <Input prefix={<UserOutlined />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="dob"
                                        label={<Text strong>Ngày sinh</Text>}
                                        rules={[
                                            { required: true, message: "Vui lòng chọn ngày sinh!" },
                                        ]}
                                    >
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            format="DD/MM/YYYY"
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
                                                current &&
                                                current.isAfter(dayjs().subtract(1, "year"), "day")
                                            }
                                        />
                                    </Form.Item>
                                    {studentAge !== null && !dobError && (
                                        <Text type="secondary" style={{ marginTop: -12, display: 'block' }}>→ {studentAge} tuổi</Text>
                                    )}
                                    {dobError && <Text type="danger" style={{ marginTop: -12, display: 'block' }}>{dobError}</Text>}
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="idCard"
                                        label={<Text strong>CCCD/ Mã định danh</Text>}
                                        rules={[
                                            { required: true, message: "Vui lòng nhập số định danh!" },
                                            idCardValidationRule,
                                        ]}
                                    >
                                        <Input prefix={<IdcardOutlined />} onKeyPress={allowOnlyNumbers} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="gender"
                                        label={<Text strong>Giới tính</Text>}
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
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="nation"
                                        label={<Text strong>Dân tộc</Text>}
                                        rules={[
                                            { required: true, message: "Vui lòng chọn dân tộc!" },
                                        ]}
                                    >
                                        <Select showSearch optionFilterProp="children" placeholder="Kinh/Tày/Thái...">
                                            {ETHNIC_OPTIONS.map((ethnic) => (
                                                <Option key={ethnic} value={ethnic}>{ethnic}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="religion"
                                        label={<Text strong>Tôn giáo</Text>}
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
                                        label={<Text strong>Địa chỉ</Text>}
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
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            bordered={false}
                            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                            title={
                                <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                    <UserOutlined style={{ marginRight: 8 }} />
                                    Ảnh đại diện
                                </Title>
                            }
                        >
                            <Flex justify="center">
                                <Form.Item name="imageStudent">
                                    <Upload
                                        listType="picture-card"
                                        fileList={imagePreview}
                                        beforeUpload={beforeUploadImage}
                                        customRequest={customRequestImage}
                                        onChange={onFileChange}
                                        onRemove={onFileRemove}
                                        accept="image/png,image/jpeg"
                                        onPreview={(file) => {
                                            Modal.info({
                                                title: file.name,
                                                content: (
                                                    <img
                                                        alt="preview"
                                                        style={{ width: "100%" }}
                                                        src={file.url || file.thumbUrl}
                                                    />
                                                ),
                                                maskClosable: true,
                                            });
                                        }}
                                    >
                                        {imagePreview.length < 1 && (
                                            <div>
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Flex>
                        </Card>
                    </Col>
                </Row>
            </Form>

            <Modal
                open={confirmCancel}
                onCancel={() => setConfirmCancel(false)}
                onOk={() => navigate(-1)}
                okText="Đồng ý"
                cancelText="Không"
                title="Bạn có chắc muốn hủy?"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Các thay đổi bạn đã chỉnh sẽ Tran <strong>không</strong> được lưu lại.
                </p>
            </Modal>
        </div>
    );
};

export default StudentEdit;