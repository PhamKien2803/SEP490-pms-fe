import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Spin, Alert, Button, Row, Col, Typography, Flex, Table,
    Form, Input, Modal, Popconfirm,
    Space, Select, InputNumber, Upload, Tooltip
} from 'antd';
import { ArrowLeftOutlined, UserAddOutlined, DeleteOutlined, UploadOutlined, SaveOutlined, FileExcelOutlined, SwapOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { StudentInClass, TeacherInClass, UpdateClassDto, AvailableRoom, ClassListItem } from '../../../types/class';
import { classApis } from '../../../services/apiServices';
import {
    handleStudentExcelUpload as uploadStudentHandler,
    handleTeacherExcelUpload as uploadTeacherHandler,
    downloadExcelTemplate
} from '../../../services/uploadService';

const { Title, Text } = Typography;
const { Option } = Select;

function UpdateClass() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);
    const [students, setStudents] = useState<StudentInClass[]>([]);
    const [teachers, setTeachers] = useState<TeacherInClass[]>([]);
    const [allAvailableStudents, setAllAvailableStudents] = useState<StudentInClass[]>([]);
    const [allAvailableTeachers, setAllAvailableTeachers] = useState<TeacherInClass[]>([]);
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
    const [allClasses, setAllClasses] = useState<ClassListItem[]>([]);
    const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
    const [isTeacherModalVisible, setIsTeacherModalVisible] = useState(false);
    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
    const [transferringItem, setTransferringItem] = useState<{ type: 'student' | 'teacher', data: StudentInClass | TeacherInClass } | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError('ID lớp học không hợp lệ.');
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            try {
                const [classDetails, allStudents, allTeachers, allRooms] = await Promise.all([
                    classApis.getClassById(id),
                    classApis.getAllAvailableStudents(),
                    classApis.getAllAvailableTeachers(),
                    classApis.getAllAvailableRoom(),
                    // classApis.getAllClasses()
                ]);
                form.setFieldsValue({
                    className: classDetails.className,
                    age: parseInt(classDetails.age, 10),
                    room: classDetails.room,
                });
                setStudents(classDetails.students);
                setTeachers(classDetails.teachers);
                setAllAvailableStudents(allStudents);
                setAllAvailableTeachers(allTeachers);
                setAvailableRooms(allRooms);
                // setAllClasses(allClassesData.filter(cls => cls._id !== id));
            } catch (err) {
                setError('Không thể tải dữ liệu để chỉnh sửa.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, form]);

    const handleBackNavigation = () => isDirty ? setIsBackConfirmVisible(true) : navigate(-1);

    const handleDeleteStudent = (studentId: string) => {
        setStudents(prev => prev.filter(s => s._id !== studentId));
        setIsDirty(true);
        toast.info("Đã xóa học sinh khỏi danh sách.");
    };

    const handleAddStudents = (selectedStudentRecords: StudentInClass[]) => {
        const currentStudentIds = new Set(students.map(s => s._id));
        const uniqueNewStudents = selectedStudentRecords.filter(s => !currentStudentIds.has(s._id));
        setStudents(prev => [...prev, ...uniqueNewStudents]);
        setIsStudentModalVisible(false);
        if (uniqueNewStudents.length > 0) {
            setIsDirty(true);
            toast.success(`Đã thêm ${uniqueNewStudents.length} học sinh.`);
        }
    };

    const handleDeleteTeacher = (teacherId: string) => {
        setTeachers(prev => prev.filter(t => t._id !== teacherId));
        setIsDirty(true);
        toast.info("Đã xóa giáo viên khỏi danh sách.");
    };

    const handleAddTeachers = (selectedTeacherRecords: TeacherInClass[]) => {
        if (teachers.length + selectedTeacherRecords.length > 2) {
            toast.warn("Chỉ được phép có tối đa 2 giáo viên trong một lớp.");
            return;
        }
        const currentTeacherIds = new Set(teachers.map(t => t._id));
        const uniqueNewTeachers = selectedTeacherRecords.filter(t => !currentTeacherIds.has(t._id));
        setTeachers(prev => [...prev, ...uniqueNewTeachers]);
        setIsTeacherModalVisible(false);
        if (uniqueNewTeachers.length > 0) {
            setIsDirty(true);
            toast.success(`Đã thêm ${uniqueNewTeachers.length} giáo viên.`);
        }
    };

    const openTransferModal = (item: StudentInClass | TeacherInClass, type: 'student' | 'teacher') => {
        setTransferringItem({ data: item, type });
        setIsTransferModalVisible(true);
    };

    const handleConfirmTransfer = (newClassId: string) => {
        if (!transferringItem || !newClassId) {
            toast.warn("Vui lòng chọn lớp để chuyển.");
            return;
        }
        const { type, data } = transferringItem;
        const itemType = type === 'student' ? 'học sinh' : 'giáo viên';
        console.log(`Chuyển ${itemType} ${data.fullName} đến lớp ${newClassId}`);
        toast.info(`Chức năng chuyển lớp cho ${itemType} đang được phát triển.`);
        setIsTransferModalVisible(false);
        setTransferringItem(null);
    };

    const onFinish = async (values: { className: string; age: number; room?: string }) => {
        if (!id) return;
        setIsSubmitting(true);
        const payload: UpdateClassDto = {
            className: values.className,
            age: String(values.age),
            room: values.room,
            students: students.map(s => s._id),
            teachers: teachers.map(t => t._id),
        };
        try {
            await classApis.updateClass(id, payload);
            toast.success('Cập nhật lớp học thành công!');
            navigate(-1);
        } catch (err) {
            toast.error('Cập nhật lớp học thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadStudentTemplate = useCallback(() => {
        downloadExcelTemplate('Mau_Them_Hoc_Sinh', [{ 'Mã HS': 'HS001', 'Họ tên': 'Nguyễn Văn A', 'Giới tính': 'Nam' }]);
    }, []);

    const handleDownloadTeacherTemplate = useCallback(() => {
        downloadExcelTemplate('Mau_Them_Giao_Vien', [{ 'Mã GV': 'GV001', 'Họ tên': 'Trần Thị B', 'Email': 'tran.b@example.com' }]);
    }, []);

    const mainStudentColumns: ColumnsType<StudentInClass> = [
        { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
        {
            title: 'Hành động', key: 'action', align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chuyển lớp">
                        <Button type="text" icon={<SwapOutlined style={{ color: 'orange' }} />} onClick={() => openTransferModal(record, 'student')} />
                    </Tooltip>
                    <Popconfirm title="Xóa học sinh này?" onConfirm={() => handleDeleteStudent(record._id)}>
                        <Tooltip title="Xóa khỏi lớp">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const mainTeacherColumns: ColumnsType<TeacherInClass> = [
        { title: 'Mã GV', dataIndex: 'staffCode', key: 'staffCode' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Hành động', key: 'action', align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chuyển lớp">
                        <Button type="text" icon={<SwapOutlined style={{ color: 'orange' }} />} onClick={() => openTransferModal(record, 'teacher')} />
                    </Tooltip>
                    <Popconfirm title="Xóa giáo viên này?" onConfirm={() => handleDeleteTeacher(record._id)}>
                        <Tooltip title="Xóa khỏi lớp">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading) return <Flex align="center" justify="center" style={{ minHeight: '400px' }}><Spin size="large" /></Flex>;
    if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={() => setIsDirty(true)}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Space align="center">
                            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={handleBackNavigation} />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Chỉnh sửa Lớp học</Title>
                                <Text type="secondary">{form.getFieldValue('className')}</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button onClick={handleBackNavigation}>Hủy</Button>
                            <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={isSubmitting}>Lưu thay đổi</Button>
                        </Space>
                    </Col>
                </Row>

                <Card title="Thông tin chung" style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="className" label="Tên Lớp" rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}>
                                <Input placeholder="Ví dụ: Lớp Mầm 1" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="age" label="Độ tuổi" rules={[{ required: true, message: 'Vui lòng nhập độ tuổi!' }]}>
                                <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="Ví dụ: 3" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="room" label="Phòng học">
                                <Select showSearch placeholder="Chọn phòng học" optionFilterProp="children" allowClear
                                    filterOption={(input, option) => (String(option?.children) ?? '').toLowerCase().includes(input.toLowerCase())}
                                >
                                    {availableRooms.map(room => (
                                        <Option key={room._id} value={room._id}>{room.roomName} (Sức chứa: {room.capacity})</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="Danh sách Giáo viên" extra={
                    <Space>
                        <Button type="link" icon={<FileExcelOutlined />} onClick={handleDownloadTeacherTemplate}>Tải mẫu Excel</Button>
                        <Upload customRequest={(options) =>
                            uploadTeacherHandler(options, { teachers, allAvailableTeachers, handleAddTeachers })}
                            showUploadList={false}>
                            <Button type="dashed" icon={<UploadOutlined />}>Upload Excel</Button>
                        </Upload>
                        <Button icon={<UserAddOutlined />} onClick={() => setIsTeacherModalVisible(true)}>Thêm Giáo viên</Button>
                    </Space>
                } style={{ marginBottom: 24 }}>
                    <Table columns={mainTeacherColumns} dataSource={teachers} rowKey="_id" pagination={{ pageSize: 5 }} />
                </Card>

                <Card title="Danh sách Học sinh" extra={
                    <Space>
                        <Button type="link" icon={<FileExcelOutlined />} onClick={handleDownloadStudentTemplate}>Tải mẫu Excel</Button>
                        <Upload customRequest={(options) =>
                            uploadStudentHandler(options, { classId: id!, students, allAvailableStudents, handleAddStudents })}
                            showUploadList={false}>
                            <Button type="dashed" icon={<UploadOutlined />}>Upload Excel</Button>
                        </Upload>
                        <Button icon={<UserAddOutlined />} onClick={() => setIsStudentModalVisible(true)}>Thêm Học sinh</Button>
                    </Space>
                }>
                    <Table columns={mainStudentColumns} dataSource={students} rowKey="_id" pagination={{ pageSize: 10 }} />
                </Card>
            </Form>

            <AddMemberTableModal title="Thêm Giáo viên" open={isTeacherModalVisible} onCancel={() => setIsTeacherModalVisible(false)} onOk={handleAddTeachers}
                dataSource={allAvailableTeachers.filter(t => !teachers.some(existing => existing._id === t._id))}
                selectionLimit={2 - teachers.length}
            />
            <AddMemberTableModal title="Thêm Học sinh" open={isStudentModalVisible} onCancel={() => setIsStudentModalVisible(false)} onOk={handleAddStudents}
                dataSource={allAvailableStudents.filter(s => !students.some(existing => existing._id === s._id))}
            />
            <Modal title="Bạn có chắc muốn quay lại?" open={isBackConfirmVisible} onOk={() => navigate(-1)} onCancel={() => setIsBackConfirmVisible(false)} okText="Đồng ý" cancelText="Không" zIndex={1001}>
                <p>Các thay đổi chưa được lưu sẽ bị mất.</p>
            </Modal>

            {transferringItem && (
                <TransferModal
                    open={isTransferModalVisible}
                    itemName={transferringItem.data.fullName}
                    itemType={transferringItem.type}
                    allClasses={allClasses}
                    onCancel={() => {
                        setIsTransferModalVisible(false);
                        setTransferringItem(null);
                    }}
                    onConfirm={handleConfirmTransfer}
                />
            )}
        </div>
    );
}

const TransferModal = ({ open, onCancel, onConfirm, itemName, itemType, allClasses }: any) => {
    const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
    const title = `Chuyển lớp cho ${itemType === 'student' ? 'học sinh' : 'giáo viên'}: ${itemName}`;

    return (
        <Modal title={title} open={open} onCancel={onCancel} onOk={() => onConfirm(selectedClassId)} okText="Xác nhận chuyển" cancelText="Hủy">
            <Typography.Paragraph>Chọn lớp học mới để chuyển đến:</Typography.Paragraph>
            <Select
                showSearch
                placeholder="Chọn lớp mới"
                style={{ width: '100%' }}
                onChange={(value) => setSelectedClassId(value)}
                optionFilterProp="children"
                filterOption={(input, option) => (String(option?.children) ?? '').toLowerCase().includes(input.toLowerCase())}
            >
                {allClasses.map((cls: ClassListItem) => (
                    <Option key={cls._id} value={cls._id}>{cls.className}</Option>
                ))}
            </Select>
        </Modal>
    );
};

const AddMemberTableModal = ({ open, onCancel, onOk, dataSource, title, selectionLimit }: any) => {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const columns = [
        { title: 'Mã', dataIndex: dataSource?.[0]?.studentCode ? 'studentCode' : 'staffCode', key: 'code' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    ];
    const rowSelection = {
        onChange: (_: React.Key[], selectedRows: any[]) => setSelectedRows(selectedRows),
        getCheckboxProps: (record: any) => ({
            disabled: (selectionLimit !== undefined && selectionLimit <= 0) || (selectionLimit !== undefined && selectedRows.length >= selectionLimit && !selectedRows.some(row => row._id === record._id)),
            name: record.fullName,
        }),
    };
    const handleOk = () => {
        if (selectedRows.length > 0) onOk(selectedRows);
        onCancel();
        setSelectedRows([]);
    };
    const handleCancel = () => {
        onCancel();
        setSelectedRows([]);
    };
    return (
        <Modal title={title} open={open} onCancel={handleCancel} onOk={handleOk} width={600} okText="Thêm" cancelText="Hủy">
            <Table rowSelection={{ type: 'checkbox', ...rowSelection }} columns={columns} dataSource={dataSource} rowKey="_id" pagination={{ pageSize: 5 }} />
        </Modal>
    );
};

export default UpdateClass;