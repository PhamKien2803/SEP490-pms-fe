import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Spin, Alert, Button, Row, Col, Typography, Flex, Table,
    Form, Input, Modal, Popconfirm,
    Space, Select, Upload, Tooltip
} from 'antd';
import { ArrowLeftOutlined, UserAddOutlined, DeleteOutlined, UploadOutlined, SaveOutlined, FileExcelOutlined, SwapOutlined, UsergroupDeleteOutlined, SlidersOutlined, NumberOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import {
    StudentInClass, TeacherInClass, UpdateClassDto, AvailableRoom,
    AvailableClassForStudent, AvailableClassForTeacher
} from '../../../types/class';
import { classApis } from '../../../services/apiServices';
import {
    handleStudentExcelUpload as uploadStudentHandler,
    handleTeacherExcelUpload as uploadTeacherHandler,
    downloadExcelTemplate
} from '../../../services/uploadService';
import AddMemberTableModal from '../../../modal/class-modal/AddMemberTableModal';
import TransferModal from '../../../modal/class-modal/TransferModal';
import { ageOptions } from '../../../components/hard-code-action';

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
    const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
    const [isTeacherModalVisible, setIsTeacherModalVisible] = useState(false);

    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
    const [transferringItem, setTransferringItem] = useState<{ type: 'student' | 'teacher', data: StudentInClass | TeacherInClass } | null>(null);
    const [transferableClasses, setTransferableClasses] = useState<(AvailableClassForStudent | AvailableClassForTeacher)[]>([]);
    const [isTransferLoading, setIsTransferLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) {
            setLoading(false);
            setError('ID lớp học không hợp lệ.');
            return;
        }
        setLoading(true);
        try {
            const [classDetails, allStudents, allTeachers, allRooms] = await Promise.all([
                classApis.getClassById(id),
                classApis.getAllAvailableStudents(),
                classApis.getAllAvailableTeachers(),
                classApis.getAllAvailableRoom(),
            ]);

            const currentRoom = classDetails.room;
            if (currentRoom && !allRooms.some(room => room._id === currentRoom._id)) {
                allRooms.unshift(currentRoom);
            }
            form.setFieldsValue({
                className: classDetails.className,
                age: parseInt(classDetails.age, 10),
                room: currentRoom?._id,
            });

            setStudents(classDetails.students);
            setTeachers(classDetails.teachers);
            setAllAvailableStudents(allStudents);
            setAllAvailableTeachers(allTeachers);
            setAvailableRooms(allRooms);
        } catch (err) {
            setError('Không thể tải dữ liệu để chỉnh sửa.');
        } finally {
            setLoading(false);
        }
    }, [id, form]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const openTransferModal = async (item: StudentInClass | TeacherInClass, type: 'student' | 'teacher') => {
        setTransferringItem({ data: item, type });
        setIsTransferModalVisible(true);
        try {
            const classAge = form.getFieldValue('age');
            if (!classAge) {
                toast.warn("Không tìm thấy độ tuổi của lớp học.");
                setIsTransferModalVisible(false);
                return;
            }
            const apiCall = type === 'student'
                ? classApis.getAvailableClassForStudent({ classAge })
                : classApis.getAvailableClassForTeacher({ classAge });
            const availableClasses = await apiCall;
            setTransferableClasses(availableClasses.filter(cls => cls._id !== id));
        } catch (error) {
            toast.error("Không thể tải danh sách lớp có thể chuyển.");
            setIsTransferModalVisible(false);
        }
    };

    const handleConfirmTransfer = async (newClassId?: string) => {
        const classAge = form.getFieldValue('age');
        if (!transferringItem || !newClassId || !id || !classAge) {
            toast.warn("Vui lòng chọn đầy đủ thông tin để chuyển lớp.");
            return;
        }

        setIsTransferLoading(true);
        const { type, data } = transferringItem;
        const itemType = type === 'student' ? 'học sinh' : 'giáo viên';

        try {
            if (type === 'student') {
                await classApis.studentChangeClass({
                    studentId: data._id,
                    oldClassId: id,
                    newClassId: newClassId,
                    classAge: classAge
                });
                setStudents(prev => prev.filter(s => s._id !== data._id));
            } else {
                await classApis.teacherChangeClass({
                    teacherId: data._id,
                    oldClassId: id,
                    newClassId: newClassId,
                });
                setTeachers(prev => prev.filter(t => t._id !== data._id));
            }
            toast.success(`Chuyển ${itemType} thành công!`);
            await fetchData();
        } catch (error) {
            toast.error(`Chuyển ${itemType} thất bại.`);
        } finally {
            setIsTransferLoading(false);
            setIsTransferModalVisible(false);
            setTransferringItem(null);
            setTransferableClasses([]);
        }
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
            setIsDirty(false);
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
    // ...

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

                <Card title={<><SlidersOutlined style={{ marginRight: 8 }} />Thông tin chung</>} style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="className" label="Tên Lớp" rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}>
                                <Input placeholder="Ví dụ: Lớp Mầm 1" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="age" label="Độ tuổi" rules={[{ required: true, message: 'Vui lòng chọn độ tuổi!' }]}>
                                <Select
                                    placeholder="Chọn độ tuổi"
                                    style={{ width: '100%' }}
                                    allowClear
                                >
                                    {ageOptions.map(age => (
                                        <Option key={age.value} value={age.value}>
                                            <NumberOutlined style={{ marginRight: 8 }} /> {age.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="room" label="Phòng học">

                                <Select placeholder="Chọn phòng học" optionFilterProp="children" allowClear
                                    filterOption={(input, option) => (String(option?.children) ?? '').toLowerCase().includes(input.toLowerCase())}
                                >
                                    {availableRooms.map(room => {
                                        return <Option key={room?._id} value={room._id}>{room?.roomName} (Sức chứa: {room.capacity})</Option>;
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title={<><UsergroupDeleteOutlined style={{ marginRight: 8 }} />Danh sách Giáo viên</>} extra={
                    <Space>
                        <Button type="link" icon={<FileExcelOutlined />} onClick={handleDownloadTeacherTemplate} style={{ color: '#1D6F42', fontWeight: 500 }}>Tải mẫu Excel</Button>
                        <Upload customRequest={(options) => uploadTeacherHandler(options, { teachers, allAvailableTeachers, handleAddTeachers })} showUploadList={false}>
                            <Button icon={<UploadOutlined />} style={{ backgroundColor: '#1D6F42', color: '#fff', borderColor: '#1D6F42' }}>Upload Excel</Button>
                        </Upload>
                        <Button icon={<UserAddOutlined />} onClick={() => setIsTeacherModalVisible(true)} style={{ backgroundColor: '#e6f4ff', color: '#1677ff', borderColor: '#91caff' }}>Thêm Giáo viên</Button>
                    </Space>
                } style={{ marginBottom: 24 }}>
                    <Table columns={mainTeacherColumns} dataSource={teachers} rowKey="_id" pagination={{ pageSize: 5 }} />
                </Card>

                <Card title={<><UsergroupDeleteOutlined style={{ marginRight: 8 }} />Danh sách Học sinh</>} extra={
                    <Space>
                        <Button style={{ color: '#1D6F42', fontWeight: 500 }} type="link" icon={<FileExcelOutlined />} onClick={handleDownloadStudentTemplate}>Tải mẫu Excel</Button>
                        <Upload customRequest={(options) => uploadStudentHandler(options, { classId: id!, students, allAvailableStudents, handleAddStudents })} showUploadList={false}>
                            <Button icon={<UploadOutlined />} style={{ backgroundColor: '#1D6F42', color: '#fff', borderColor: '#1D6F42' }}>Upload Excel</Button>
                        </Upload>
                        <Button style={{ backgroundColor: '#e6f4ff', color: '#1677ff', borderColor: '#91caff' }} icon={<UserAddOutlined />} onClick={() => setIsStudentModalVisible(true)}>Thêm Học sinh</Button>
                    </Space>
                }>
                    <Table columns={mainStudentColumns} dataSource={students} rowKey="_id" pagination={{ pageSize: 10 }} />
                </Card>
            </Form>

            <AddMemberTableModal
                title="Thêm Giáo viên"
                open={isTeacherModalVisible}
                onCancel={() => setIsTeacherModalVisible(false)}
                onOk={handleAddTeachers}
                dataSource={allAvailableTeachers.filter(t => !teachers.some(existing => existing._id === t._id))}
                selectionLimit={2 - teachers.length}
            />

            <AddMemberTableModal
                title="Thêm Học sinh"
                open={isStudentModalVisible}
                onCancel={() => setIsStudentModalVisible(false)}
                onOk={handleAddStudents}
                dataSource={allAvailableStudents.filter(s => !students.some(existing => existing._id === s._id))}
            />

            <Modal
                title="Bạn có chắc muốn quay lại?"
                open={isBackConfirmVisible}
                onOk={() => navigate(-1)}
                onCancel={() => setIsBackConfirmVisible(false)}
                okText="Đồng ý" cancelText="Không"
                zIndex={1001}
            >
                <p>Các thay đổi chưa được lưu sẽ bị mất.</p>
            </Modal>

            {transferringItem && (
                <TransferModal
                    open={isTransferModalVisible}
                    itemName={transferringItem.data.fullName}
                    itemType={transferringItem.type}
                    transferableClasses={transferableClasses}
                    isLoading={isTransferLoading}
                    onCancel={() => {
                        setIsTransferModalVisible(false);
                        setTransferringItem(null);
                        setTransferableClasses([]);
                    }}
                    onConfirm={handleConfirmTransfer}
                />
            )}
        </div>
    );
}

export default UpdateClass;