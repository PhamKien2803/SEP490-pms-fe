import React, { useState, useCallback } from "react";
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
    Upload,
} from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { CreateUserData } from "../../../types/student-management";
import { studentApis, enrollmentApis } from "../../../services/apiServices";
import { usePageTitle } from "../../../hooks/usePageTitle";
import {
    ArrowLeftOutlined,
    UserOutlined,
    SolutionOutlined,
    IdcardOutlined,
    SaveOutlined,
    PlusOutlined,
    UploadOutlined
} from "@ant-design/icons";
import { ETHNIC_OPTIONS } from "../../../components/hard-code-action";
import { beforeUploadPDF, beforeUploadImage } from "../../../utils/upload";
import { constants } from "../../../constants";

dayjs.extend(customParseFormat);
const { Option } = Select;
const { Title, Text } = Typography;

const THEME_COLOR = "black";
const BACKGROUND_GREY = "#f0f2f5";

const requiredRule = (message: string) => ({
    required: true,
    message: message,
});

const nameValidationRule = {
    pattern: /^[\p{L} ]+$/u,
    message: "Chỉ được nhập chữ cái và dấu cách!",
};

const idCardValidationRule = {
    pattern: /^\d{12}$/,
    message: "CCCD phải có đúng 12 chữ số!",
};

const phoneValidationRule = {
    pattern: /^\d{10}$/,
    message: "Số điện thoại phải có đúng 10 chữ số!",
};

const emailValidationRule = {
    type: "email" as const,
    message: "Email không hợp lệ!",
};

const jobValidationRule = nameValidationRule;

const parentDobValidation = (_: any, value: dayjs.Dayjs) => {
    if (!value || !dayjs.isDayjs(value)) {
        return Promise.resolve();
    }

    const today = dayjs();
    const age = today.diff(value, "year");

    if (value.isAfter(today, "day")) {
        return Promise.reject(new Error("Ngày sinh không được trong tương lai!"));
    }

    if (!value.isValid()) {
        return Promise.reject(new Error("Ngày sinh không hợp lệ!"));
    }

    if (age < 18) {
        return Promise.reject(new Error("Phụ huynh phải từ 18 tuổi trở lên!"));
    }

    return Promise.resolve();
};


const StudentCreate: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);
    const navigate = useNavigate();
    const user = useCurrentUser();
    usePageTitle("Tạo mới Hồ sơ Học sinh - Cá Heo Xanh");

    const [dobError, setDobError] = useState<string | null>(null);

    const [imageStudent, setImageStudent] = useState<string | null>(null);
    const [birthCertId, setBirthCertId] = useState<string | null>(null);
    const [healthCertId, setHealthCertId] = useState<string | null>(null);

    const [birthCertFile, setBirthCertFile] = useState<any[]>([]);
    const [healthCertFile, setHealthCertFile] = useState<any[]>([]);
    const [designImageFile, setDesignImageFile] = useState<any[]>([]);

    const allowOnlyNumbers = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (
                !/[0-9]/.test(event.key) &&
                !["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(event.key) &&
                !event.ctrlKey
            ) {
                event.preventDefault();
            }
        },
        []
    );
    const handleViewPDF = useCallback(async (fileId: string) => {
        try {
            const arrayBuffer = await enrollmentApis.getPDFById(fileId);
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Không thể mở file PDF.');
        }
    }, []);

    const customRequestPDF = async (options: any, type: "birth" | "health") => {
        const { file, onSuccess, onError } = options;
        try {
            const response = await enrollmentApis.uploadPDF(file as File);
            if (type === "birth") setBirthCertId(response.fileId);
            if (type === "health") setHealthCertId(response.fileId);
            toast.success(`Tải lên ${type === "birth" ? "giấy khai sinh" : "giấy khám sức khỏe"} thành công!`);
            if (onSuccess) onSuccess(response, { ...response, fileId: response.fileId }); // Pass fileId in response
        } catch (err) {
            toast.error("Upload file thất bại");
            if (onError) onError(err);
        }
    };

    const customRequestImage = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            const response = await enrollmentApis.uploadEnrollmentImage(file as File);
            setImageStudent(response.url ?? null);
            setDesignImageFile([
                {
                    uid: String(Date.now()),
                    name: file.name,
                    status: "done",
                    url: response.url,
                },
            ]);
            toast.success("Tải ảnh học sinh thành công!");
            if (onSuccess) onSuccess(response);
        } catch (err) {
            toast.error("Upload ảnh thất bại");
            if (onError) onError(err);
        }
    };

    const onFileChange = (info: any, type: "birth" | "health" | "image") => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1);

        if ((type === 'birth' || type === 'health') && info.file.status === 'done') {
            const fileId = info.file.response?.fileId;
            if (fileId && fileList.length > 0) {
                fileList[0].onPreview = () => handleViewPDF(fileId);
            }
        }

        if (type === "birth") setBirthCertFile(fileList);
        else if (type === "health") setHealthCertFile(fileList);
        else setDesignImageFile(fileList);
    };

    const onFileRemove = (type: "birth" | "health" | "image") => {
        if (type === "birth") {
            setBirthCertId(null);
            setBirthCertFile([]);
        } else if (type === "health") {
            setHealthCertId(null);
            setHealthCertFile([]);
        } else {
            setImageStudent(null);
            setDesignImageFile([]);
        }
    };

    const handleSubmit = async (values: any) => {
        if (!user) {
            toast.error("Vui lòng đăng nhập lại.");
            return;
        }

        if (!imageStudent) {
            toast.warn("Vui lòng tải lên ảnh học sinh!");
            return;
        }
        if (!birthCertId) {
            toast.warn("Vui lòng tải lên Giấy khai sinh!");
            return;
        }
        if (!healthCertId) {
            toast.warn("Vui lòng tải lên Giấy khám sức khỏe!");
            return;
        }

        if (dobError) {
            toast.error("Ngày sinh học sinh không hợp lệ.");
            return;
        }

        const payload: CreateUserData = {
            ...values,
            studentName: values.studentName,
            studentDob: values.studentDob.toISOString(),
            fatherDob: values.fatherDob.toISOString(),
            motherDob: values.motherDob.toISOString(),
            imageStudent,
            birthCertId,
            healthCertId,
            createdBy: user.email,
        };

        setLoading(true);
        try {
            await studentApis.createStudent(payload);
            toast.success("Tạo hồ sơ học sinh thành công!");
            form.resetFields();
            setImageStudent(null);
            setBirthCertId(null);
            setHealthCertId(null);
            setBirthCertFile([]);
            setHealthCertFile([]);
            setDesignImageFile([]);
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Tạo hồ sơ học sinh thất bại.');
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
            <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
                <Col>
                    <Space align="center">
                        <Tooltip title="Quay lại">
                            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={handleCancel} />
                        </Tooltip>
                        <Title level={3} style={{ margin: 0, color: THEME_COLOR }}>Tạo mới Hồ sơ Học sinh</Title>
                    </Space>
                </Col>
            </Row>

            <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                <Form layout="vertical" form={form} onFinish={handleSubmit}>

                    <Card
                        type="inner"
                        title={<Title level={4}><SolutionOutlined style={{ marginRight: 8 }} />Thông tin Học sinh</Title>}
                    >
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item
                                    name="studentName"
                                    label="Họ và tên"
                                    rules={[requiredRule("Vui lòng nhập họ tên học sinh!"), nameValidationRule, {
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
                                    }]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên học sinh" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="studentDob"
                                    label="Ngày sinh"
                                    rules={[requiredRule("Vui lòng chọn ngày sinh học sinh!")]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sinh (DD/MM/YYYY)"
                                        onChange={(date) => {
                                            form.setFieldValue("studentDob", date);
                                            if (date) {
                                                const age = dayjs().diff(date, "year");
                                                if (age < 1 || age > 5) {
                                                    setDobError("Học sinh phải từ 1 đến 5 tuổi!");
                                                } else setDobError(null);
                                            } else {
                                                setDobError(null); // Clear error if date is cleared
                                            }
                                        }}
                                    />
                                </Form.Item>
                                {dobError && <Text type="danger">{dobError}</Text>}
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="studentGender"
                                    label="Giới tính"
                                    rules={[requiredRule("Vui lòng chọn giới tính!")]}
                                >
                                    <Select placeholder="Chọn giới tính">
                                        <Option value="Nam">Nam</Option>
                                        <Option value="Nữ">Nữ</Option>
                                        <Option value="Khác">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="studentIdCard"
                                    label="CCCD/Định danh"
                                    rules={[requiredRule("Vui lòng nhập CCCD/Định danh!"), idCardValidationRule]}
                                >
                                    <Input onKeyPress={allowOnlyNumbers} prefix={<IdcardOutlined />} placeholder="Nhập 12 số CCCD/Định danh" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="studentNation"
                                    label="Dân tộc"
                                    rules={[requiredRule("Vui lòng chọn dân tộc!")]}
                                >
                                    <Select showSearch placeholder="Chọn dân tộc">
                                        {ETHNIC_OPTIONS.map(e => (
                                            <Option key={e} value={e}>{e}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="studentReligion"
                                    label="Tôn giáo"
                                    rules={[requiredRule("Vui lòng chọn tôn giáo!")]}
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
                                    rules={[requiredRule("Vui lòng nhập địa chỉ!"), {
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
                                    }]}
                                >
                                    <Input.TextArea rows={2} placeholder="Nhập địa chỉ (số nhà, đường, phường/xã, quận/huyện, tỉnh/TP)" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Card type="inner" style={{ marginTop: 24 }} title="Ảnh & Tài liệu">
                        <Row gutter={32}>
                            <Col span={8}>
                                <Form.Item label="Ảnh học sinh (PNG/JPG)" required>
                                    <Upload
                                        listType="picture-card"
                                        fileList={designImageFile}
                                        beforeUpload={beforeUploadImage}
                                        customRequest={customRequestImage}
                                        onChange={(info) => onFileChange(info, "image")}
                                        onRemove={() => onFileRemove("image")}
                                        onPreview={(file) => {
                                            let previewUrl = file.url;

                                            if (previewUrl && !previewUrl.startsWith("http")) {
                                                previewUrl = `${constants.APP_PREFIX}/files/${previewUrl}`;
                                            }

                                            if (!previewUrl && file.thumbUrl) {
                                                previewUrl = file.thumbUrl;
                                            }

                                            if (!previewUrl) {
                                                toast.info("Không tìm thấy ảnh để mở!");
                                                return;
                                            }

                                            // window.open(previewUrl, "_blank");
                                        }}

                                    >
                                        {designImageFile.length < 1 && (
                                            <div>
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item label="Giấy khai sinh (PDF)" required>
                                    <Upload
                                        fileList={birthCertFile}
                                        beforeUpload={beforeUploadPDF}
                                        customRequest={(options) => customRequestPDF(options, "birth")}
                                        onChange={(info) => onFileChange(info, "birth")}
                                        onRemove={() => onFileRemove("birth")}
                                        // onPreview={(file) => {
                                        //     if (file.url) {
                                        //         handleViewPDF(file.url);
                                        //     } else {
                                        //         toast.info("Không tìm thấy file để xem!");
                                        //     }
                                        // }}

                                        maxCount={1}
                                    >
                                        <Button icon={<UploadOutlined />}>Tải PDF</Button>
                                    </Upload>
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item label="Giấy khám sức khỏe (PDF)" required>
                                    <Upload
                                        fileList={healthCertFile}
                                        beforeUpload={beforeUploadPDF}
                                        customRequest={(options) => customRequestPDF(options, "health")}
                                        onChange={(info) => onFileChange(info, "health")}
                                        onRemove={() => onFileRemove("health")}
                                        // onPreview={(file) => {
                                        //     if (file.url) {
                                        //         handleViewPDF(file.url);
                                        //     } else {
                                        //         toast.info("Không tìm thấy file để xem!");
                                        //     }
                                        // }}

                                        maxCount={1}
                                    >
                                        <Button icon={<UploadOutlined />}>Tải PDF</Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Card type="inner" style={{ marginTop: 24 }} title="Thông tin Cha">
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item
                                    name="fatherName"
                                    label="Họ và tên Cha"
                                    rules={[requiredRule("Vui lòng nhập họ tên Cha!"), nameValidationRule, {
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
                                    }]}
                                >
                                    <Input placeholder="Nhập họ và tên Cha" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="fatherDob"
                                    label="Ngày sinh Cha"
                                    rules={[
                                        requiredRule("Vui lòng chọn ngày sinh Cha!"),
                                        { validator: parentDobValidation }
                                    ]}
                                >
                                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn ngày sinh (DD/MM/YYYY)" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="fatherJob"
                                    label="Nghề nghiệp Cha"
                                    rules={[requiredRule("Vui lòng nhập nghề nghiệp Cha!"), jobValidationRule, {
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
                                    }]}
                                >
                                    <Input placeholder="Nhập nghề nghiệp Cha" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="fatherIdCard"
                                    label="CCCD Cha"
                                    rules={[requiredRule("Vui lòng nhập CCCD Cha!"), idCardValidationRule]}
                                >
                                    <Input onKeyPress={allowOnlyNumbers} placeholder="Nhập 12 số CCCD Cha" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="fatherPhoneNumber"
                                    label="SĐT Cha"
                                    rules={[requiredRule("Vui lòng nhập SĐT Cha!"), phoneValidationRule]}
                                >
                                    <Input onKeyPress={allowOnlyNumbers} placeholder="Nhập 10 số SĐT Cha" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="fatherEmail"
                                    label="Email Cha"
                                    rules={[emailValidationRule, {
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
                                    }]}
                                >
                                    <Input placeholder="Nhập email Cha" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Card type="inner" style={{ marginTop: 24 }} title="Thông tin Mẹ">
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item
                                    name="motherName"
                                    label="Họ và tên Mẹ"
                                    rules={[requiredRule("Vui lòng nhập họ tên Mẹ!"), nameValidationRule, {
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
                                    }]}
                                >
                                    <Input placeholder="Nhập họ và tên Mẹ" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="motherDob"
                                    label="Ngày sinh Mẹ"
                                    rules={[
                                        requiredRule("Vui lòng chọn ngày sinh Mẹ!"),
                                        { validator: parentDobValidation }
                                    ]}
                                >
                                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn ngày sinh (DD/MM/YYYY)" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="motherJob"
                                    label="Nghề nghiệp Mẹ"
                                    rules={[requiredRule("Vui lòng nhập nghề nghiệp Mẹ!"), jobValidationRule, {
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
                                    }]}
                                >
                                    <Input placeholder="Nhập nghề nghiệp Mẹ" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="motherIdCard"
                                    label="CCCD Mẹ"
                                    rules={[requiredRule("Vui lòng nhập CCCD Mẹ!"), idCardValidationRule, {
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
                                    }]}
                                >
                                    <Input onKeyPress={allowOnlyNumbers} placeholder="Nhập 12 số CCCD Mẹ" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="motherPhoneNumber"
                                    label="SĐT Mẹ"
                                    rules={[requiredRule("Vui lòng nhập SĐT Mẹ!"), phoneValidationRule]}
                                >
                                    <Input onKeyPress={allowOnlyNumbers} placeholder="Nhập 10 số SĐT Mẹ" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name="motherEmail"
                                    label="Email Mẹ"
                                    rules={[emailValidationRule, {
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
                                    }]}
                                >
                                    <Input placeholder="Nhập email Mẹ" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Row justify="end" style={{ marginTop: 24 }}>
                        <Space>
                            <Button onClick={handleCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
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
                <p>Các thay đổi bạn đã nhập sẽ <strong>không</strong> được lưu lại.</p>
            </Modal>
        </div>
    );
};

export default StudentCreate;