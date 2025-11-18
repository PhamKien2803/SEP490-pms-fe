import React, { useState, useEffect, useCallback } from 'react';
import {
    Form, Input, Button, Space, Card, Select, DatePicker, Row, Col, Tooltip,
    Spin, Flex, Upload, Popconfirm, Modal, Typography, Tag, Tabs
} from 'antd';
import {
    ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined,
    EditOutlined, SaveOutlined, ClockCircleOutlined, DollarOutlined, StopOutlined,
    QuestionCircleOutlined,
    TeamOutlined, SolutionOutlined, FileAddOutlined, PlusOutlined
} from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { enrollmentApis } from '../../../services/apiServices';
import { EnrollmentListItem } from '../../../types/enrollment';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { constants } from '../../../constants';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { ETHNIC_OPTIONS } from '../../../components/hard-code-action';
import { useValidationRules } from '../../../utils/format';
import { beforeUploadImage, beforeUploadPDF } from '../../../utils/upload';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const THEME_COLOR = "black";
const BACKGROUND_GREY = "#f0f2f5";

const EnrollmentEdit: React.FC = () => {
    usePageTitle('Chỉnh sửa thông tin - Cá Heo Xanh');
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const user = useCurrentUser();
    const [studentAge, setStudentAge] = useState<number | null>(null);
    const [dobError, setDobError] = useState<string | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState<EnrollmentListItem | null>(null);
    const [birthCertId, setBirthCertId] = useState<string | null>(null);
    const [healthCertId, setHealthCertId] = useState<string | null>(null);
    const [birthCertFile, setBirthCertFile] = useState<UploadFile[]>([]);
    const [healthCertFile, setHealthCertFile] = useState<UploadFile[]>([]);
    const [designImageFile, setDesignImageFile] = useState<UploadFile[]>([]);
    const [studentImageId, setStudentImageId] = useState<string | null>(null);
    const { phoneValidationRule, idCardValidationRule, nameValidationRule } = useValidationRules();


    const fetchData = useCallback(async () => {
        if (!id) {
            toast.error("URL không hợp lệ, thiếu ID của đơn.");
            navigate(-1);
            return;
        }
        setPageLoading(true);
        try {
            const data = await enrollmentApis.getEnrollmentById(id);
            setEnrollmentData(data);
            form.setFieldsValue({
                ...data,
                studentDob: data.studentDob ? dayjs(data.studentDob) : null,
            });
            form.setFieldValue("fatherDob", data.fatherDob ? dayjs(data.fatherDob) : null);
            form.setFieldValue("motherDob", data.motherDob ? dayjs(data.motherDob) : null);

            if (data.birthCertFiles) {
                setBirthCertId(data.birthCertId);
                setBirthCertFile([{ uid: data.birthCertFiles._id, name: `${data.birthCertFiles.filename} (tải lên lúc ${dayjs(data.birthCertFiles.uploadDate).format('DD/MM/YYYY')})`, status: 'done', url: data.birthCertFiles._id }]);
            } else {
                setBirthCertFile([]);
            }
            if (data.healthCertFiles) {
                setHealthCertId(data.healthCertId);
                setHealthCertFile([{ uid: data.healthCertFiles._id, name: `${data.healthCertFiles.filename} (tải lên lúc ${dayjs(data.healthCertFiles.uploadDate).format('DD/MM/YYYY')})`, status: 'done', url: data.healthCertFiles._id }]);
            } else {
                setHealthCertFile([]);
            }

            if (data.imageStudent) {
                setStudentImageId(data.imageStudent);
                setDesignImageFile([
                    {
                        uid: data.imageStudent,
                        name: 'Ảnh học sinh',
                        url: data.imageStudent,
                        status: 'done',
                    },
                ]);
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Không thể tải chi tiết đơn đăng ký.');
            navigate(-1);
        } finally {
            setPageLoading(false);
        }
    }, [id, navigate, form]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdate = useCallback(async () => {
        if (!id) return;
        try {
            const values = await form.validateFields();
            setIsUpdating(true);
            const payload = { ...values, _id: id, studentDob: dayjs(values.studentDob).toISOString(), birthCertId, healthCertId, imageStudent: studentImageId };
            await enrollmentApis.updateEnrollment(id, payload);
            toast.success('Cập nhật thông tin thành công!');
            setIsEditing(false);
            fetchData();
        } catch (formError) {
            typeof formError === "string" ? toast.info(formError) : toast.error('Dữ liệu chưa hợp lệ để cập nhật. Vui lòng kiểm tra lại.');
        } finally {
            setIsUpdating(false);
        }
    }, [id, form, birthCertId, healthCertId, studentImageId, fetchData]);

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

    const handleApprove = useCallback(async () => {
        if (!id) return;
        if (!birthCertId || !healthCertId) {
            toast.warn('Vui lòng tải đầy đủ Giấy khai sinh và Giấy khám sức khỏe.');
            return;
        }

        try {
            const values = await form.validateFields();
            setIsApproving(true);
            const payload = {
                _id: id,
                ...values,
                studentDob: dayjs(values.studentDob).toISOString(),
                birthCertId,
                healthCertId,
                imageStudent: studentImageId,
                approvedBy: user.email,
            };
            await enrollmentApis.approveEnrollment(payload);
            toast.success('Đã duyệt đơn, chuyển sang trạng thái chờ thanh toán!');
            fetchData();
        } catch (err) {
            typeof err === "string" ? toast.info(err) : toast.error('Duyệt đơn thất bại. Vui lòng kiểm tra dữ liệu.');
        } finally {
            setIsApproving(false);
        }
    }, [id, birthCertId, healthCertId, studentImageId, form, user.email, fetchData]);

    const handleReject = useCallback(async () => {
        if (!id || !rejectReason.trim()) {
            toast.warn('Vui lòng nhập lý do từ chối.');
            return;
        }
        setIsRejecting(true);
        try {
            await enrollmentApis.rejectEnrollment(id, { _id: id, reason: rejectReason });
            toast.success('Đã từ chối đơn đăng ký thành công.');
            setIsRejectModalVisible(false);
            navigate(`${constants.APP_PREFIX}/enrollments`);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Từ chối đơn đăng ký thất bại. Vui lòng thử lại!');
        } finally {
            setIsRejecting(false);
        }
    }, [id, rejectReason, navigate]);

    const handleCancelEdit = useCallback(() => {
        if (enrollmentData) {
            form.setFieldsValue({
                ...enrollmentData,
                studentDob: enrollmentData.studentDob ? dayjs(enrollmentData.studentDob) : null,
                fatherDob: enrollmentData.fatherDob ? dayjs(enrollmentData.fatherDob) : null,
                motherDob: enrollmentData.motherDob ? dayjs(enrollmentData.motherDob) : null,
            });
            if (enrollmentData.birthCertFiles) {
                setBirthCertId(enrollmentData.birthCertId);
                setBirthCertFile([{ uid: enrollmentData.birthCertFiles._id, name: `${enrollmentData.birthCertFiles.filename} (tải lên lúc ${dayjs(enrollmentData.birthCertFiles.uploadDate).format('DD/MM/YYYY')})`, status: 'done', url: enrollmentData.birthCertFiles._id }]);
            } else {
                setBirthCertId(null);
                setBirthCertFile([]);
            }
            if (enrollmentData.healthCertFiles) {
                setHealthCertId(enrollmentData.healthCertId);
                setHealthCertFile([{ uid: enrollmentData.healthCertFiles._id, name: `${enrollmentData.healthCertFiles.filename} (tải lên lúc ${dayjs(enrollmentData.healthCertFiles.uploadDate).format('DD/MM/YYYY')})`, status: 'done', url: enrollmentData.healthCertFiles._id }]);
            } else {
                setHealthCertId(null);
                setHealthCertFile([]);
            }
            if (enrollmentData.imageStudent) {
                setStudentImageId(enrollmentData.imageStudent);
                setDesignImageFile([
                    {
                        uid: enrollmentData.imageStudent,
                        name: 'Ảnh học sinh',
                        url: enrollmentData.imageStudent,
                        status: 'done',
                    },
                ]);
            } else {
                setStudentImageId(null);
                setDesignImageFile([]);
            }
        }
        setIsEditing(false);
    }, [enrollmentData, form]);

    const handleBackClick = useCallback(() => {
        if (isEditing) {
            setIsBackConfirmVisible(true);
        } else {
            navigate(-1);
        }
    }, [isEditing, navigate]);


    const customRequestPDF = async (options: any, type: 'birth' | 'health') => {
        const { file, onSuccess, onError } = options;
        try {
            const response = await enrollmentApis.uploadPDF(file as File);
            if (type === 'birth') {
                setBirthCertId(response.fileId);
            } else {
                setHealthCertId(response.fileId);
            }
            toast.success(`Tải lên ${type === 'birth' ? 'giấy khai sinh' : 'giấy khám sức khỏe'} thành công!`);
            if (onSuccess) onSuccess(response);
        } catch (error) {
            toast.error('Tải file thất bại.');
            if (onError) onError(error);
        }
    };

    const customRequestImage = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            const response = await enrollmentApis.uploadEnrollmentImage(file as File);

            const url = response.url;
            if (url) {
                setStudentImageId(url);
                setDesignImageFile([
                    {
                        uid: String(Date.now()),
                        name: (file as File).name,
                        status: "done",
                        url: url,
                    },
                ]);
                toast.success("Tải ảnh học sinh thành công!");
                if (onSuccess) onSuccess(response);
            } else {
                throw new Error("Không nhận được URL từ server");
            }
        } catch (err) {
            toast.error("Tải ảnh thất bại!");
            if (onError) onError(err as Error);
        }
    };


    const onFileChange = (info: any, type: 'birth' | 'health' | 'image') => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1);

        fileList = fileList.map(file => {
            if (file.response) {
                file.url = type === 'image' ? URL.createObjectURL(file.originFileObj as RcFile) : file.response.fileId;
            }
            return file;
        });

        if (type === 'birth') setBirthCertFile(fileList);
        else if (type === 'health') setHealthCertFile(fileList);
        else setDesignImageFile(fileList);
    };

    const onFileRemove = (type: 'birth' | 'health' | 'image') => {
        if (type === 'birth') {
            setBirthCertId(null);
            setBirthCertFile([]);
        } else if (type === 'health') {
            setHealthCertId(null);
            setHealthCertFile([]);
        } else {
            setStudentImageId(null);
            setDesignImageFile([]);
        }
    };

    const allowOnlyNumbers = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    }, []);

    const getTagProps = (state?: string): { color: string; icon: React.ReactNode } => {
        switch (state) {
            case "Chờ xử lý":
                return { color: "default", icon: <ClockCircleOutlined /> };
            case "Chờ thanh toán":
                return { color: "gold", icon: <DollarOutlined /> };
            case "Chờ BGH phê duyệt":
                return { color: "blue", icon: <ClockCircleOutlined /> };
            case "Chưa đủ điều kiện nhập học":
                return { color: "red", icon: <StopOutlined /> };
            case "Từ chối":
                return { color: "volcano", icon: <CloseCircleOutlined /> };
            case "Hoàn thành":
                return { color: "green", icon: <CheckCircleOutlined /> };
            default:
                return { color: "default", icon: <QuestionCircleOutlined /> };
        }
    };

    if (pageLoading) {
        return <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 150px)' }}><Spin size="large" /></Flex>;
    }

    return (
        <div style={{ padding: '24px', background: BACKGROUND_GREY }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Space align="center">
                        <Tooltip title="Quay lại">
                            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={handleBackClick} />
                        </Tooltip>
                        <Title level={2} style={{ margin: 0, color: THEME_COLOR }}>
                            {isEditing ? 'Chỉnh sửa' : 'Chi tiết'} phiếu đăng ký
                        </Title>
                        <Title level={4} style={{ margin: 0, color: "#595959" }}>
                            ({enrollmentData?.enrollmentCode})
                        </Title>
                        <Tag
                            color={getTagProps(enrollmentData?.state).color}
                            icon={getTagProps(enrollmentData?.state).icon}
                            style={{ fontSize: 16, padding: "4px 12px", height: "auto", marginLeft: 8 }}
                        >
                            {enrollmentData?.state || "Không rõ"}
                        </Tag>
                    </Space>
                </Col>
                <Col>
                    {isEditing ? (
                        <Space size="middle">
                            <Button onClick={() => setIsCancelConfirmVisible(true)}>Hủy</Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={isUpdating}
                                onClick={handleUpdate}
                            >
                                Lưu thay đổi
                            </Button>
                        </Space>
                    ) : (
                        <Space size="middle">
                            {enrollmentData?.state === 'Chờ xử lý' && (
                                <>
                                    <Button danger icon={<CloseCircleOutlined />} onClick={() => setIsRejectModalVisible(true)}>Từ chối</Button>
                                    <Popconfirm
                                        title="Xác nhận duyệt đơn?"
                                        description="Hành động này sẽ duyệt đơn đăng ký. Bạn chắc chắn chứ?"
                                        onConfirm={handleApprove}
                                        okText="Đồng ý"
                                        cancelText="Không"
                                    >
                                        <Button type="primary" icon={<CheckCircleOutlined />} loading={isApproving}>Duyệt đơn</Button>
                                    </Popconfirm>
                                </>
                            )}
                            {enrollmentData?.state === 'Chờ thanh toán' &&
                                enrollmentData?.statePayment === 'Tiền mặt' && (
                                    <Popconfirm
                                        title="Xác nhận đã thanh toán?"
                                        description="Hành động này sẽ chuyển sang trạng thái chờ BGH phê duyệt."
                                        onConfirm={async () => {
                                            try {
                                                await enrollmentApis.confirmEnrollmentPayment(enrollmentData._id);
                                                toast.success('Xác nhận thanh toán thành công!');
                                                fetchData();
                                            } catch (error) {
                                                toast.error('Xác nhận thất bại!');
                                            }
                                        }}
                                        okText="Xác nhận"
                                        cancelText="Hủy"
                                    >
                                        <Button type="primary" icon={<CheckCircleOutlined />} danger>
                                            Đã thanh toán
                                        </Button>
                                    </Popconfirm>
                                )}
                            {enrollmentData?.state !== 'Chờ BGH phê duyệt' && enrollmentData?.state !== 'Chưa đủ điều kiện nhập học' && enrollmentData?.state !== 'Hoàn thành' && (
                                <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</Button>
                            )}
                        </Space>
                    )}
                </Col>
            </Row>

            <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
                <Form form={form} layout="vertical" disabled={!isEditing}>
                    <Card
                        type="inner"
                        title={
                            <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                                <SolutionOutlined style={{ marginRight: 8 }} />
                                Thông tin học sinh
                            </Title>
                        }
                    >
                        <Row gutter={32}>
                            <Col xs={24} md={8}>
                                <Form.Item name="studentName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }, nameValidationRule]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="studentDob" label="Ngày sinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                                    <DatePicker
                                        onChange={(date) => {
                                            form.setFieldValue("studentDob", date);
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
                                        style={{ width: '100%' }}
                                        format="DD/MM/YYYY"
                                    />
                                </Form.Item>
                                {studentAge !== null && !dobError && (
                                    <Text type="secondary" style={{ marginTop: -12, display: 'block' }}>→ {studentAge} tuổi</Text>
                                )}
                                {dobError && <Text type="danger" style={{ marginTop: -12, display: 'block' }}>{dobError}</Text>}
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="studentIdCard" label="CCCD/ Mã định danh" rules={[{ required: true, message: 'Vui lòng nhập mã định danh!' }, idCardValidationRule]}>
                                    <Input onKeyPress={allowOnlyNumbers} />
                                </Form.Item>
                                <Form.Item name="studentGender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                                    <Select>
                                        <Option value="Nam">Nam</Option>
                                        <Option value="Nữ">Nữ</Option>
                                        <Option value="Khác">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="studentNation" label="Dân tộc" rules={[{ required: true, message: 'Vui lòng chọn dân tộc!' }]}>
                                    <Select showSearch optionFilterProp="children">
                                        {ETHNIC_OPTIONS.map((ethnic) => (
                                            <Option key={ethnic} value={ethnic}>{ethnic}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="studentReligion" label="Tôn giáo" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
                                    <Select>
                                        <Option value="Có">Có</Option>
                                        <Option value="Không">Không</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="address" label="Địa chỉ thường trú" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
                                    <Input.TextArea rows={2} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Card
                        type="inner"
                        title={
                            <Title level={4} style={{ margin: 0, color: THEME_COLOR, marginTop: 24 }}>
                                <TeamOutlined style={{ marginRight: 8 }} />
                                Thông tin phụ huynh
                            </Title>
                        }
                    >
                        <Tabs defaultActiveKey="father">
                            <TabPane tab="Thông tin Cha" key="father">
                                <Row gutter={32}>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="fatherName" label="Họ và tên Cha" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }, nameValidationRule]}><Input /></Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="fatherJob" label="Nghề nghiệp" rules={[{ required: true, message: 'Vui lòng nhập nghề nghiệp!' }, nameValidationRule]}><Input /></Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="fatherPhoneNumber" label="Số điện thoại Cha" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, phoneValidationRule]}><Input onKeyPress={allowOnlyNumbers} /></Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="fatherIdCard" label="CCCD Cha" rules={[{ required: true, message: 'Vui lòng nhập CCCD!' }, idCardValidationRule]}><Input onKeyPress={allowOnlyNumbers} /></Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item
                                            name="fatherDob"
                                            label="Ngày sinh Cha"
                                            rules={[
                                                { required: true, message: "Vui lòng chọn ngày sinh Cha!" },
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
                                                                new Error("Cha phải từ 18 tuổi trở lên!")
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

                                    <Col xs={24} md={8}>
                                        <Form.Item name="fatherEmail" label="Email Cha" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}><Input /></Form.Item>
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tab="Thông tin Mẹ" key="mother">
                                <Row gutter={32}>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="motherName" label="Họ và tên Mẹ" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }, nameValidationRule]}><Input /></Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="motherJob" label="Nghề nghiệp" rules={[{ required: true, message: 'Vui lòng nhập nghề nghiệp!' }, nameValidationRule]}><Input /></Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="motherPhoneNumber" label="Số điện thoại Mẹ" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, phoneValidationRule]}><Input onKeyPress={allowOnlyNumbers} /></Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="motherIdCard" label="CCCD Mẹ" rules={[{ required: true, message: 'Vui lòng nhập CCCD!' }, idCardValidationRule]}><Input onKeyPress={allowOnlyNumbers} /></Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item
                                            name="motherDob"
                                            label="Ngày sinh Mẹ"
                                            rules={[
                                                { required: true, message: "Vui lòng chọn ngày sinh Mẹ!" },
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
                                                                new Error("Mẹ phải từ 18 tuổi trở lên!")
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

                                    <Col xs={24} md={8}>
                                        <Form.Item name="motherEmail" label="Email Mẹ" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}><Input /></Form.Item>
                                    </Col>
                                </Row>
                            </TabPane>
                        </Tabs>
                    </Card>

                    <Card
                        type="inner"
                        title={
                            <Title level={4} style={{ margin: 0, color: THEME_COLOR, marginTop: 24 }}>
                                <FileAddOutlined style={{ marginRight: 8 }} />
                                Tài liệu đính kèm & Thanh toán
                            </Title>
                        }
                    >
                        <Row gutter={32}>
                            <Col xs={24} md={8} style={{ display: "flex", justifyContent: "center" }}>
                                <Form.Item
                                    label="Ảnh học sinh (PNG/JPG)"
                                    required
                                    style={{ width: "100%" }}
                                >
                                    <Upload
                                        disabled={!isEditing}
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
                                            window.open(previewUrl, "_blank");
                                        }}
                                        maxCount={1}
                                        style={{ width: 200, height: 200 }}
                                    >
                                        {designImageFile.length < 1 && (
                                            <div style={{ padding: 10 }}>
                                                <PlusOutlined style={{ fontSize: 24 }} />
                                                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item label="Giấy khai sinh (PDF)" required>
                                    <Upload
                                        disabled={!isEditing}
                                        fileList={birthCertFile}
                                        beforeUpload={beforeUploadPDF}
                                        customRequest={(options) => customRequestPDF(options, 'birth')}
                                        onChange={(info) => onFileChange(info, 'birth')}
                                        onRemove={() => onFileRemove('birth')}
                                        onPreview={(file) => { if (file.url) handleViewPDF(file.url); }}
                                        maxCount={1}
                                    >
                                        <Button icon={<UploadOutlined />} disabled={!isEditing}>
                                            {birthCertFile.length > 0 ? "Thay đổi file" : "Tải lên file PDF"}
                                        </Button>
                                    </Upload>
                                </Form.Item>
                                <Form.Item label="Giấy khám sức khỏe (PDF)" required>
                                    <Upload
                                        disabled={!isEditing}
                                        fileList={healthCertFile}
                                        beforeUpload={beforeUploadPDF}
                                        customRequest={(options) => customRequestPDF(options, 'health')}
                                        onChange={(info) => onFileChange(info, 'health')}
                                        onRemove={() => onFileRemove('health')}
                                        onPreview={(file) => { if (file.url) handleViewPDF(file.url); }}
                                        maxCount={1}
                                    >
                                        <Button icon={<UploadOutlined />} disabled={!isEditing}>
                                            {healthCertFile.length > 0 ? "Thay đổi file" : "Tải lên file PDF"}
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="statePayment"
                                    label="Phương thức thanh toán"
                                    rules={[{ required: true, message: "Vui lòng chọn trạng thái thanh toán!" }]}
                                >
                                    <Select placeholder="Chọn phương thức">
                                        <Option value="Chuyển khoản">Chuyển khoản</Option>
                                        <Option value="Tiền mặt">Tiền mặt</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Form>
            </Card>

            <Modal
                title="Xác nhận từ chối đơn đăng ký"
                open={isRejectModalVisible}
                onOk={handleReject}
                onCancel={() => { setIsRejectModalVisible(false); setRejectReason(''); }}
                confirmLoading={isRejecting}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
            >
                <p>Vui lòng nhập lý do từ chối.</p>
                <TextArea rows={4} placeholder="Nhập lý do..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </Modal>
            <Modal
                title="Bạn có chắc muốn hủy?"
                open={isCancelConfirmVisible}
                onOk={() => { handleCancelEdit(); setIsCancelConfirmVisible(false); }}
                onCancel={() => setIsCancelConfirmVisible(false)}
                okText="Đồng ý"
                cancelText="Không"
                zIndex={1001}
            >
                <p>Các thay đổi chưa được lưu sẽ bị mất.</p>
            </Modal>
            <Modal
                title="Bạn có chắc muốn quay lại?"
                open={isBackConfirmVisible}
                onOk={() => navigate(-1)}
                onCancel={() => setIsBackConfirmVisible(false)}
                okText="Đồng ý"
                cancelText="Không"
                zIndex={1001}
            >
                <p>Các thay đổi chưa được lưu sẽ bị mất.</p>
            </Modal>
        </div>
    );
};

export default EnrollmentEdit;