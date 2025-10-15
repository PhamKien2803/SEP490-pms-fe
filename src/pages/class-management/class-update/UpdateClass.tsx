import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Spin, Alert, Button, Row, Col, Typography, Flex, Table,
    Form, Input, Modal, Popconfirm,
    Space, Select, InputNumber, Upload
} from 'antd';
import { ArrowLeftOutlined, UserAddOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { StudentInClass, TeacherInClass, UpdateClassDto } from '../../../types/class';
import { classApis } from '../../../services/apiServices';

const { Title, Text } = Typography;
const { Option } = Select;

interface RoomItem {
    _id: string;
    name: string;
    capacity: number;
}
const mockAvailableRooms: RoomItem[] = [
    { _id: 'room_01', name: 'Phòng A1 (Sức chứa: 20)', capacity: 20 },
    { _id: 'room_02', name: 'Phòng A2 (Sức chứa: 25)', capacity: 25 },
    { _id: 'room_03', name: 'Phòng B1 (Sức chứa: 20)', capacity: 20 },
    { _id: 'room_04', name: 'Phòng C1 (Sức chứa: 30)', capacity: 30 },
];

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
    const [availableRooms, setAvailableRooms] = useState<RoomItem[]>([]);

    const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
    const [isTeacherModalVisible, setIsTeacherModalVisible] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('Không tìm thấy ID của lớp học.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [classDetails, allStudents, allTeachers] = await Promise.all([
                    classApis.getClassById(id),
                    classApis.getAllAvailableStudents(),
                    classApis.getAllAvailableTeachers()
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
                setAvailableRooms(mockAvailableRooms);

            } catch (err) {
                setError('Không thể tải dữ liệu để chỉnh sửa.');
                toast.error('Có lỗi xảy ra, vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, form]);

    const handleBackNavigation = () => {
        if (isDirty) {
            setIsBackConfirmVisible(true);
        } else {
            navigate(-1);
        }
    };

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
        const currentTeacherIds = new Set(teachers.map(t => t._id));
        const uniqueNewTeachers = selectedTeacherRecords.filter(t => !currentTeacherIds.has(t._id));

        if (teachers.length + uniqueNewTeachers.length > 2) {
            toast.warn("Chỉ được phép có tối đa 2 giáo viên trong một lớp.");
            return;
        }

        setTeachers(prev => [...prev, ...uniqueNewTeachers]);
        setIsTeacherModalVisible(false);
        if (uniqueNewTeachers.length > 0) {
            setIsDirty(true);
            toast.success(`Đã thêm ${uniqueNewTeachers.length} giáo viên.`);
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
            navigate(-1);
        } catch (err) {
            toast.error('Cập nhật lớp học thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const mainStudentColumns: ColumnsType<StudentInClass> = [
        { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
        {
            title: 'Hành động', key: 'action', align: 'center',
            render: (_, record) => (
                <Popconfirm title="Xóa học sinh này?" onConfirm={() => handleDeleteStudent(record._id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
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
                <Popconfirm title="Xóa giáo viên này?" onConfirm={() => handleDeleteTeacher(record._id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    if (loading) {
        return <Flex align="center" justify="center" style={{ minHeight: '400px' }}><Spin size="large" /></Flex>;
    }
    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Row align="middle" style={{ marginBottom: 24 }}>
                <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={handleBackNavigation} style={{ marginRight: 16 }} />
                <Col>
                    <Title level={4} style={{ margin: 0 }}>Chỉnh sửa Lớp học</Title>
                    <Text type="secondary">{form.getFieldValue('className')}</Text>
                </Col>
            </Row>

            <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={() => setIsDirty(true)}>
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
                                <Select
                                    placeholder="Chọn phòng học"
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (String(option?.children) ?? '').toLowerCase().includes(input.toLowerCase())}
                                    allowClear
                                >
                                    {availableRooms.map(room => (
                                        <Option key={room._id} value={room._id}>{room.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="Danh sách Giáo viên" extra={
                    <Space>
                        <Upload>
                            <Button icon={<UploadOutlined />}>Upload Excel</Button>
                        </Upload>
                        <Button icon={<UserAddOutlined />} onClick={() => setIsTeacherModalVisible(true)}>Thêm Giáo viên</Button>
                    </Space>
                } style={{ marginBottom: 24 }}>
                    <Table columns={mainTeacherColumns} dataSource={teachers} rowKey="_id" pagination={{ pageSize: 5 }} />
                </Card>

                <Card title="Danh sách Học sinh" extra={
                    <Space>
                        <Upload>
                            <Button icon={<UploadOutlined />}>Upload Excel</Button>
                        </Upload>
                        <Button icon={<UserAddOutlined />} onClick={() => setIsStudentModalVisible(true)}>Thêm Học sinh</Button>
                    </Space>
                }>
                    <Table columns={mainStudentColumns} dataSource={students} rowKey="_id" pagination={{ pageSize: 10 }} />
                </Card>

                <Row justify="end" style={{ marginTop: 24 }}>
                    <Space>
                        <Button onClick={handleBackNavigation}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>Lưu thay đổi</Button>
                    </Space>
                </Row>
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
                okText="Đồng ý"
                cancelText="Không"
                zIndex={1001}
            >
                <p>Các thay đổi chưa được lưu sẽ bị mất.</p>
            </Modal>
        </div>
    );
}

const AddMemberTableModal = ({ open, onCancel, onOk, dataSource, title, selectionLimit }: any) => {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const columns = [
        { title: 'Mã', dataIndex: dataSource[0]?.studentCode ? 'studentCode' : 'staffCode', key: 'code' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    ];

    const rowSelection = {
        onChange: (_: React.Key[], selectedRows: any[]) => {
            setSelectedRows(selectedRows);
        },
        getCheckboxProps: (record: any) => ({
            disabled: (selectionLimit !== undefined && selectionLimit <= 0) || (selectionLimit !== undefined && selectedRows.length >= selectionLimit && !selectedRows.some(row => row._id === record._id)),
            name: record.fullName,
        }),
    };

    const handleOk = () => {
        if (selectedRows.length > 0) {
            onOk(selectedRows);
        }
        onCancel();
        setSelectedRows([]);
    };

    const handleCancel = () => {
        onCancel();
        setSelectedRows([]);
    };

    return (
        <Modal
            title={title}
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
            width={600}
            okText="Thêm"
            cancelText="Hủy"
        >
            <Table
                rowSelection={{
                    type: 'checkbox',
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={dataSource}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
            />
        </Modal>
    );
};

export default UpdateClass;