import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Input, Button, Space, Typography, Card, Select, DatePicker, Row, Col, Tooltip, Spin, Flex, Upload, Popconfirm, Modal } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { enrollmentApis } from '../../../services/apiServices';
import { ApproveEnrollmentDto, EnrollmentListItem } from '../../../types/enrollment';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { constants } from '../../../constants';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { ETHNIC_OPTIONS } from '../../../components/hard-code-action';

const { Title } = Typography;
const { Option } = Select;

const EnrollmentEdit: React.FC = () => {
    usePageTitle('Chỉnh sửa thông tin - Cá Heo Xanh');
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const user = useCurrentUser();

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

    const phoneValidationRule = useMemo(() => ({
        pattern: /^\d{10}$/,
        message: 'Số điện thoại phải có đúng 10 chữ số!',
    }), []);

    const idCardValidationRule = useMemo(() => ({
        pattern: /^\d{12}$/,
        message: 'CCCD phải có đúng 12 chữ số!',
    }), []);

    const nameValidationRule = {
        pattern: /^[\p{L} ]+$/u,
        message: 'Chỉ được nhập chữ cái và dấu cách!',
    };


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
            const payload = { ...values, _id: id, studentDob: dayjs(values.studentDob).toISOString(), birthCertId, healthCertId };
            await enrollmentApis.updateEnrollment(id, payload);
            toast.success('Cập nhật thông tin thành công!');
            setIsEditing(false);
            fetchData();
        } catch (formError) {
            typeof formError === "string" ? toast.info(formError) : toast.error('Dữ liệu chưa hợp lệ để cập nhật. Vui lòng kiểm tra lại.');
        } finally {
            setIsUpdating(false);
        }
    }, [id, form, birthCertId, healthCertId, fetchData]);

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
            toast.warn('Vui lòng tải lên đầy đủ Giấy khai sinh và Giấy khám sức khỏe.');
            return;
        }
        try {
            const values = await form.validateFields();
            setIsApproving(true);
            const payload = { _id: id, ...values, studentDob: dayjs(values.studentDob).toISOString(), birthCertId, healthCertId, approvedBy: user.email };
            await enrollmentApis.approveEnrollment(payload as ApproveEnrollmentDto);
            toast.success('Duyệt đơn đăng ký thành công!');
            navigate(`${constants.APP_PREFIX}/enrollments`);
        } catch (formError) {
            typeof formError === "string" ? toast.info(formError) : toast.error('Dữ liệu chưa hợp lệ để duyệt. Vui lòng kiểm tra lại.');
        } finally {
            setIsApproving(false);
        }
    }, [id, birthCertId, healthCertId, form, user.email, navigate]);

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
            form.setFieldsValue({ ...enrollmentData, studentDob: enrollmentData.studentDob ? dayjs(enrollmentData.studentDob) : null });
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

    const handleUpload = useCallback(async (file: File, type: 'birth' | 'health') => {
        try {
            const response = await enrollmentApis.uploadPDF(file);
            const newFile = { uid: response.fileId, name: file.name, status: 'done' as const, url: response.fileId };
            if (type === 'birth') {
                setBirthCertId(response.fileId);
                setBirthCertFile([newFile]);
            } else {
                setHealthCertId(response.fileId);
                setHealthCertFile([newFile]);
            }
            toast.success(`Tải lên ${type === 'birth' ? 'giấy khai sinh' : 'giấy khám sức khỏe'} thành công!`);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Tải file thất bại. Vui lòng thử lại!');
        }
    }, []);

    const beforeUploadPDF = useCallback((file: RcFile, type: 'birth' | 'health') => {
        if (file.type !== 'application/pdf') {
            toast.error('Bạn chỉ có thể tải lên file có định dạng .pdf!');
            return false;
        }
        handleUpload(file, type);
        return false;
    }, [handleUpload]);

    const allowOnlyNumbers = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    }, []);

    if (pageLoading) {
        return <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 150px)' }}><Spin size="large" /></Flex>;
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card bordered={false}>
                <Space align="center" style={{ marginBottom: '24px' }}>
                    <Tooltip title="Quay lại">
                        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={handleBackClick} />
                    </Tooltip>
                    <Title level={2} style={{ margin: 0 }}>
                        {isEditing ? 'Chỉnh sửa' : 'Chi tiết'} phiếu đăng ký: {enrollmentData?.enrollmentCode}
                    </Title>
                </Space>

                <Form form={form} layout="vertical">
                    <Row gutter={32}>
                        <Col xs={24} md={8}>
                            <Title level={4}>Thông tin học sinh</Title>
                            <Form.Item name="studentName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }, nameValidationRule]}>
                                <Input disabled={!isEditing} />
                            </Form.Item>
                            <Form.Item name="studentDob" label="Ngày sinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={!isEditing} />
                            </Form.Item>
                            <Form.Item name="studentIdCard" label="CCCD/ Mã định danh" rules={[{ required: true, message: 'Vui lòng nhập mã định danh!' }, idCardValidationRule]}><Input onKeyPress={allowOnlyNumbers} disabled={!isEditing} /></Form.Item>
                            <Form.Item name="address" label="Địa chỉ thường trú" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}><Input.TextArea rows={3} disabled={!isEditing} /></Form.Item>
                            <Form.Item name="studentGender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                                <Select disabled={!isEditing}>
                                    <Option value="Nam">Nam</Option>
                                    <Option value="Nữ">Nữ</Option>
                                    <Option value="Khác">Khác</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="studentReligion"
                                label="Tôn giáo"
                                rules={[{ required: true, message: 'Vui lòng chọn!' }]}
                            >
                                <Select disabled={!isEditing}>
                                    <Option value="Có">Có</Option>
                                    <Option value="Không">Không</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="studentNation"
                                label="Dân tộc"
                                rules={[{ required: true, message: 'Vui lòng chọn dân tộc!' }]}
                            >
                                <Select showSearch optionFilterProp="children" disabled={!isEditing}>
                                    {ETHNIC_OPTIONS.map((ethnic) => (
                                        <Option key={ethnic} value={ethnic}>{ethnic}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                        </Col>
                        <Col xs={24} md={8}>
                            <Title level={4}>Thông tin cha</Title>
                            <Form.Item name="fatherName" label="Họ và tên Cha" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }, nameValidationRule]}><Input disabled={!isEditing} /></Form.Item>
                            <Form.Item name="fatherJob" label="Nghề nghiệp" rules={[{ required: true, message: 'Vui lòng nhập nghề nghiệp!' }, nameValidationRule]}><Input disabled={!isEditing} /></Form.Item>
                            <Form.Item name="fatherPhoneNumber" label="Số điện thoại Cha" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, phoneValidationRule]}><Input onKeyPress={allowOnlyNumbers} disabled={!isEditing} /></Form.Item>
                            <Form.Item name="fatherIdCard" label="CCCD Cha" rules={[{ required: true, message: 'Vui lòng nhập CCCD!' }, idCardValidationRule]}><Input onKeyPress={allowOnlyNumbers} disabled={!isEditing} /></Form.Item>
                            <Form.Item name="fatherEmail" label="Email Cha" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}><Input disabled={!isEditing} /></Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Title level={4}>Thông tin mẹ</Title>
                            <Form.Item name="motherName" label="Họ và tên Mẹ" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }, nameValidationRule]}><Input disabled={!isEditing} /></Form.Item>
                            <Form.Item name="motherJob" label="Nghề nghiệp" rules={[{ required: true, message: 'Vui lòng nhập nghề nghiệp!' }, nameValidationRule]}><Input disabled={!isEditing} /></Form.Item>
                            <Form.Item name="motherPhoneNumber" label="Số điện thoại Mẹ" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, phoneValidationRule]}><Input onKeyPress={allowOnlyNumbers} disabled={!isEditing} /></Form.Item>
                            <Form.Item name="motherIdCard" label="CCCD Mẹ" rules={[{ required: true, message: 'Vui lòng nhập CCCD!' }, idCardValidationRule]}><Input onKeyPress={allowOnlyNumbers} disabled={!isEditing} /></Form.Item>
                            <Form.Item name="motherEmail" label="Email Mẹ" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}><Input disabled={!isEditing} /></Form.Item>
                        </Col>
                    </Row>
                    <Title level={4} style={{ marginTop: '24px' }}>Tài liệu đính kèm</Title>
                    <Row gutter={32}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Giấy khai sinh (PDF)">
                                <Upload
                                    disabled={!isEditing}
                                    fileList={birthCertFile}
                                    beforeUpload={(file) => beforeUploadPDF(file, 'birth')}
                                    onRemove={() => { setBirthCertId(null); setBirthCertFile([]); }}
                                    onPreview={(file) => { if (file.url) handleViewPDF(file.url); }}
                                    maxCount={1}
                                >
                                    {birthCertFile.length < 1 && <Button icon={<UploadOutlined />} disabled={!isEditing}>Tải lên file mới</Button>}
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Giấy khám sức khỏe (PDF)">
                                <Upload
                                    disabled={!isEditing}
                                    fileList={healthCertFile}
                                    beforeUpload={(file) => beforeUploadPDF(file, 'health')}
                                    onRemove={() => { setHealthCertId(null); setHealthCertFile([]); }}
                                    onPreview={(file) => { if (file.url) handleViewPDF(file.url); }}
                                    maxCount={1}
                                >
                                    {healthCertFile.length < 1 && <Button icon={<UploadOutlined />} disabled={!isEditing}>Tải lên file mới</Button>}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end" style={{ marginTop: '32px' }}>
                        {isEditing ? (
                            <Space size="middle">
                                <Button onClick={() => setIsCancelConfirmVisible(true)}>Hủy</Button>
                                <Button type="primary" icon={<SaveOutlined />} loading={isUpdating} onClick={handleUpdate}>
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
                                {enrollmentData?.state !== 'Chờ BGH phê duyệt' && enrollmentData?.state !== 'Chưa đủ điều kiện nhập học' && enrollmentData?.state !== 'Hoàn thành' && (
                                    <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</Button>
                                )}
                            </Space>
                        )}
                    </Row>
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