import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Card,
    Row,
    Col,
    Typography,
    Divider,
    Button,
    Select,
    Spin,
    Alert,
    Table,
    Space,
    Modal,
    Form,
    Input,
    DatePicker,
    Popconfirm,
    Tooltip,
    Tag,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    LoadingOutlined,
    SyncOutlined,
    TeamOutlined,
    CloseCircleOutlined,
    PlusOutlined,
    SaveOutlined,
    PhoneOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";

import { IDelegationPeriod, IGuardianForm, IGuardianPayload, IGuardianRecord } from "../../types/guardians";
import { ParentStudentsListResponse } from "../../types/parent";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { guardianApis, parentDashboardApis } from "../../services/apiServices";
import { usePagePermission } from "../../hooks/usePagePermission";

const { Title, Text } = Typography;
const { Option } = Select;

const ACCENT_COLOR = "#1890ff";
const TEXT_COLOR = "#1890ff";

const convertFormToPayload = (formData: IGuardianForm, parentId: string): IGuardianPayload => {
    return {
        ...formData,
        parentId: parentId,
        pickUpDate: formData.pickUpDate
    } as IGuardianPayload;
};

const convertRecordToForm = (record: IGuardianRecord): IGuardianForm => {
    const dobDayjs = record.dob ? dayjs(record.dob) : null;
    let pickUpDateDayjs: Dayjs | null = null;

    if (typeof record.delegationPeriod !== 'string' && record.delegationPeriod?.fromDate) {
        pickUpDateDayjs = dayjs(record.delegationPeriod.fromDate);
    }

    return {
        ...record,
        dob: dobDayjs,
        pickUpDate: pickUpDateDayjs,
        studentId: typeof record.studentId === 'string' ? record.studentId : record.studentId?._id || '',
        parentId: typeof record.parentId === 'string' ? record.parentId : record.parentId?._id || '',
    } as IGuardianForm;
};

const GuardianManagement: React.FC = () => {
    const [studentsData, setStudentsData] = useState<ParentStudentsListResponse | null>(null);
    const [guardians, setGuardians] = useState<IGuardianRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingGuardian, setEditingGuardian] = useState<IGuardianRecord | null>(null);
    const [form] = Form.useForm<IGuardianForm>();
    const [isConfirmCancelVisible, setIsConfirmCancelVisible] = useState(false);


    const currentUser = useCurrentUser();
    const parentId = currentUser?.parent;

    const { canCreate, canUpdate, canDelete } = usePagePermission();

    const fetchParentStudents = useCallback(async () => {
        if (!parentId) {
            setError("Không tìm thấy ID Phụ huynh.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await parentDashboardApis.getParentStudent(parentId);

            if (response.students.length > 0 && !selectedStudentId) {
                setSelectedStudentId(response.students[0]._id);
            }
            setStudentsData(response);
        } catch (err) {
            const errorMessage =
                error ||
                "Không thể tải danh sách học sinh. Vui lòng thử lại.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [parentId, selectedStudentId]);

    const fetchGuardians = useCallback(async (studentId: string) => {
        setIsLoading(true);
        try {
            const response = await guardianApis.getListGuardianByStudent(studentId);
            setGuardians(response.data);
        } catch (err) {
            const errorMessage =
                error ||
                "Tải danh sách người đưa đón thất bại.";
            toast.error(errorMessage);
            setGuardians([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchParentStudents();
    }, [fetchParentStudents]);

    useEffect(() => {
        if (selectedStudentId) {
            fetchGuardians(selectedStudentId);
        } else {
            setGuardians([]);
        }
    }, [selectedStudentId, fetchGuardians]);

    const handleOpenModal = (record?: IGuardianRecord) => {
        setEditingGuardian(record || null);
        if (record) {
            form.setFieldsValue(convertRecordToForm(record));
        } else {
            form.resetFields();
            form.setFieldsValue({
                studentId: selectedStudentId,
                parentId: parentId,
            } as Partial<IGuardianForm>);
        }
        setIsModalVisible(true);
    };

    const finalizeCloseModal = () => {
        setIsModalVisible(false);
        setIsConfirmCancelVisible(false);
        setEditingGuardian(null);
        form.resetFields();
    }

    const handleCloseModal = () => {
        if (form.isFieldsTouched()) {
            setIsConfirmCancelVisible(true);
        } else {
            finalizeCloseModal();
        }
    };

    const handleFormSubmit = async (values: IGuardianForm) => {
        if (!selectedStudentId || !parentId) {
            toast.error("Lỗi dữ liệu: Không tìm thấy ID học sinh hoặc phụ huynh.");
            return;
        }

        const payload = convertFormToPayload(values, parentId);

        try {
            if (editingGuardian) {
                if (!canUpdate) {
                    toast.error("Bạn không có quyền cập nhật.");
                    return;
                }
                await guardianApis.updateGuardian(editingGuardian._id, payload);
                toast.success("Cập nhật thông tin người đưa đón thành công!");
            } else {
                if (!canCreate) {
                    toast.error("Bạn không có quyền tạo mới.");
                    return;
                }
                await guardianApis.createGuardian(payload);
                toast.success("Thêm người đưa đón mới thành công!");
            }
            finalizeCloseModal();
            fetchGuardians(selectedStudentId);
        } catch (error: any) {
            const errorMessage =
                error ||
                `Thực hiện thất bại: ${editingGuardian ? 'Cập nhật' : 'Thêm mới'}.`;
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!selectedStudentId) return;
        if (!canDelete) {
            toast.error("Bạn không có quyền xóa.");
            return;
        }
        try {
            await guardianApis.deleteGuardian(id);
            toast.success("Xóa người đưa đón thành công!");
            fetchGuardians(selectedStudentId);
        } catch (error: any) {
            const errorMessage =
                error ||
                "Xóa người đưa đón thất bại.";
            toast.error(errorMessage);
        }
    };


    const currentStudent = useMemo(() => {
        return studentsData?.students.find((s) => s._id === selectedStudentId) || null;
    }, [studentsData, selectedStudentId]);

    const columns = [
        {
            title: "Họ và Tên",
            dataIndex: "fullName",
            key: "fullName",
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Quan Hệ",
            dataIndex: "relationship",
            key: "relationship",
            render: (text: string, record: IGuardianRecord) => (
                <Space direction="vertical" size={0}>
                    <Text>{text}</Text>
                    {record.relationshipDetail && <Text type="secondary" italic style={{ fontSize: 12 }}>({record.relationshipDetail})</Text>}
                </Space>
            )
        },
        {
            title: "SĐT",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            render: (text: string) => <Text>{text}</Text>,
        },
        {
            title: "Ngày ủy quyền",
            dataIndex: "delegationPeriod",
            key: "delegationPeriod",
            render: (period: IDelegationPeriod | null | undefined) => {

                if (!period || (typeof period === 'object' && !period.fromDate)) {
                    return <Tag>Chưa ủy quyền</Tag>;
                }

                if (typeof period === 'string') {
                    return <Tag>Chưa ủy quyền</Tag>;
                }

                const fromDate = period.fromDate
                    ? dayjs(period.fromDate).format("DD/MM/YYYY")
                    : 'N/A';

                const toDate = period.toDate
                    ? dayjs(period.toDate).format("DD/MM/YYYY")
                    : 'N/A';

                if (period.toDate) {
                    return `${fromDate} - ${toDate}`;
                }
                return fromDate;
            },
        },
        {
            title: "Hành động",
            key: "action",
            align: 'center' as 'center',
            render: (_: any, record: IGuardianRecord) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleOpenModal(record)}
                            type="text"
                            style={{ color: ACCENT_COLOR }}
                            disabled={!canUpdate}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa người đưa đón này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                        placement="left"
                        disabled={!canDelete}
                    >
                        <Tooltip title="Xóa">
                            <Button icon={<DeleteOutlined />} danger type="text" disabled={!canDelete} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const cardHeader = useMemo(
        () => (
            <Row justify="space-between" align="middle" style={{ padding: "20px 24px" }}>
                <Col>
                    <Title level={3} style={{ margin: 0, fontWeight: 700, color: TEXT_COLOR }}>
                        <TeamOutlined style={{ marginRight: 10, color: ACCENT_COLOR }} /> Quản lý Người đưa đón
                    </Title>
                </Col>
                <Col>
                    <Space size="middle">
                        <Tooltip title="Làm mới dữ liệu">
                            <Button
                                icon={<SyncOutlined spin={isLoading} style={{ fontSize: 16 }} />}
                                onClick={() => selectedStudentId && fetchGuardians(selectedStudentId)}
                                loading={isLoading}
                                type="text"
                                style={{ color: TEXT_COLOR }}
                            />
                        </Tooltip>

                        {studentsData && studentsData.students.length > 0 && (
                            <Select
                                value={selectedStudentId}
                                onChange={setSelectedStudentId}
                                style={{ width: 250 }}
                                size="large"
                                placeholder="Chọn học sinh..."
                                suffixIcon={<UserOutlined style={{ color: ACCENT_COLOR }} />}
                                disabled={isLoading}
                            >
                                {studentsData.students.map((student) => (
                                    <Option key={student._id} value={student._id}>
                                        {student.fullName}
                                    </Option>
                                ))}
                            </Select>
                        )}

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                            disabled={!selectedStudentId || isLoading || !canCreate} 
                            style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
                        >
                            Thêm Người Đón
                        </Button>
                    </Space>
                </Col>
            </Row>
        ),
        [studentsData, selectedStudentId, isLoading, fetchGuardians, canCreate] 
    );

    if (isLoading && !studentsData) { 
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 50, color: ACCENT_COLOR }} spin />} tip="Đang tải dữ liệu ban đầu..." style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }} />
            </div>
        );
    }

    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon style={{ margin: 24 }} />;
    }

    return (
        <div style={{ padding: "40px", minHeight: "100vh" }}>
            <Card
                title={cardHeader}
                bordered={false}
                style={{
                    marginBottom: 24,
                    borderRadius: 12,
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
                    border: "none",
                }}
                bodyStyle={{ padding: 0 }}
            >
                {(!studentsData || studentsData.students.length === 0) && (
                    <Alert
                        message="Thông báo"
                        description="Tài khoản này chưa liên kết với học sinh nào. Không thể quản lý người đưa đón."
                        type="warning"
                        showIcon
                        style={{ margin: 24, borderRadius: 8 }}
                    />
                )}

                {currentStudent && (
                    <Alert
                        message={<Text strong>Học sinh đang chọn: {currentStudent.fullName} (Mã HS: {currentStudent.studentCode})</Text>}
                        description={`Phụ huynh (bạn): ${studentsData?.parent.fullName} | SĐT: ${studentsData?.parent.phoneNumber}`}
                        type="info"
                        showIcon
                        style={{ margin: "10px 24px" }}
                    />
                )}

                {selectedStudentId && (
                    <Table
                        columns={columns}
                        dataSource={guardians}
                        rowKey="_id"
                        loading={isLoading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                        style={{ padding: "0 24px 24px" }}
                    />
                )}

            </Card>

            <Modal
                title={
                    <Title level={4} style={{ margin: 0, color: ACCENT_COLOR }}>
                        {editingGuardian ? <EditOutlined style={{ marginRight: 8 }} /> : <PlusOutlined style={{ marginRight: 8 }} />}
                        {editingGuardian ? "Cập nhật Người Đưa Đón" : "Thêm Người Đưa Đón Mới"}
                    </Title>
                }
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={600} 
                closeIcon={<CloseCircleOutlined style={{ color: ACCENT_COLOR }} />}
                destroyOnClose 
            >
                <Divider style={{ margin: '10px 0 20px 0' }} />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{
                        active: true,
                    }}
                    autoComplete="off"
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên người đưa đón!' }]}
                        tooltip="Nhập họ và tên đầy đủ của người được ủy quyền đưa đón"
                    >
                        <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" size="large" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="dob"
                                label="Ngày sinh"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                            >
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Ngày/Tháng/Năm" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="relationship"
                                label="Mối quan hệ"
                                rules={[{ required: true, message: 'Vui lòng chọn mối quan hệ!' }]}
                            >
                                <Select placeholder="Chọn quan hệ" size="large">
                                    {["Ông", "Bà", "Cô", "Dì", "Chú", "Bác", "Bạn bố mẹ", "Anh", "Chị", "Khác"].map(rel => (
                                        <Option key={rel} value={rel}>{rel}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="relationshipDetail"
                                label="Chi tiết quan hệ"
                                tooltip="Ví dụ: Cô ruột, Chú họ, Bạn thân của mẹ..."
                            >
                                <Input placeholder="Chi tiết (Không bắt buộc)" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" style={{ margin: "10px 0 20px 0" }}>
                        <Text strong style={{ color: ACCENT_COLOR }}>
                            <TeamOutlined style={{ marginRight: 8 }} /> Thời Gian Ủy Quyền
                        </Text>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="pickUpDate"
                                label="Ngày Bắt Đầu"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày ủy quyền!' }]}
                                tooltip="Ngày người này bắt đầu được phép đưa đón"
                            >
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Ngày bắt đầu" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="pickUpEndDate"
                                label="Ngày Kết Thúc (Không bắt buộc)"
                                tooltip="Nếu không chọn, ủy quyền sẽ vô thời hạn"
                            >
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Ngày kết thúc" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="note"
                        label="Ghi chú"
                        tooltip="Ghi chú quan trọng về việc đưa đón (Ví dụ: Chỉ đón vào thứ 5, Cần mang theo CMND)"
                    >
                        <Input.TextArea rows={3} placeholder="Ghi chú chi tiết (Không bắt buộc)" />
                    </Form.Item>

                    <Form.Item name="studentId" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="parentId" hidden>
                        <Input />
                    </Form.Item>


                    <Divider style={{ margin: "20px 0 10px 0" }} />
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={handleCloseModal}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
                                disabled={editingGuardian ? !canUpdate : !canCreate}
                            >
                                Lưu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Xác nhận Hủy bỏ */}
            <Modal
                title="Bạn có chắc muốn hủy?"
                open={isConfirmCancelVisible}
                onOk={finalizeCloseModal}
                onCancel={() => setIsConfirmCancelVisible(false)}
                okText="Đồng ý"
                cancelText="Không"
                okButtonProps={{ danger: true }}
            >
                <p>Các thay đổi bạn đang thực hiện sẽ không được lưu lại.</p>
            </Modal>
        </div>
    );
};

export default GuardianManagement;