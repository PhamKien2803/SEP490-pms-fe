import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, Spin, Button, Row, Col, Typography, Flex, Table,
    Form, Input, Modal, Popconfirm,
    Space, Select
} from 'antd';
import {
    ArrowLeftOutlined, UserAddOutlined, DeleteOutlined, SaveOutlined,
    TeamOutlined, NumberOutlined, HomeOutlined, SolutionOutlined,
    UsergroupAddOutlined, ExclamationCircleOutlined, SnippetsOutlined,
    CloseCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { StudentInClass, TeacherInClass, CreateClassDto, AvailableRoom } from '../../../types/class';
import { classApis } from '../../../services/apiServices';
import { ageOptions } from '../../../components/hard-code-action';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title } = Typography;
const { Option } = Select;

function CreateClass() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    usePageTitle('Tạo mới lớp học - Cá Heo Xanh');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);
    const [students, setStudents] = useState<StudentInClass[]>([]);
    const [allAvailableStudents, setAllAvailableStudents] = useState<StudentInClass[]>([]);
    const [allAvailableTeachers, setAllAvailableTeachers] = useState<TeacherInClass[]>([]);
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
    const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [allStudents, allTeachers, allRooms] = await Promise.all([
                    classApis.getAllAvailableStudents(),
                    classApis.getAllAvailableTeachers(),
                    classApis.getAllAvailableRoom()
                ]);
                setAllAvailableStudents(allStudents);
                setAllAvailableTeachers(allTeachers);
                setAvailableRooms(allRooms);
            } catch (error) {
                typeof error === "string" ? toast.info(error) : toast.error('Có lỗi xảy ra, vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    const handleTeacherChange = (selectedTeacherIds: string[]) => {
        if (selectedTeacherIds.length > 2) {
            toast.warn('Chỉ được chọn tối đa 2 giáo viên.');
            const limitedSelection = selectedTeacherIds.slice(0, 2);
            form.setFieldsValue({ teachers: limitedSelection });
        }
        setIsDirty(true);
    };

    const onFinish = async (values: { className: string; age: number; room?: string; teachers?: string[] }) => {
        setIsSubmitting(true);
        const payload: CreateClassDto = {
            className: values.className,
            age: values.age !== undefined ? String(values.age) : '',
            room: values.room,
            teachers: values.teachers || [],
            students: students.map(s => s._id),
        };

        try {
            await classApis.createClass(payload);
            toast.success('Tạo mới lớp học thành công!');
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Tạo mới lớp học thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const mainStudentColumns: ColumnsType<StudentInClass> = [
        { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: '25%' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Giới tính', dataIndex: 'gender', key: 'gender', width: '20%' },
        {
            title: 'Hành động', key: 'action', align: 'center', width: '15%',
            render: (_, record) => (
                <Popconfirm title="Xóa học sinh này?" onConfirm={() => handleDeleteStudent(record._id)} okText="Xóa" cancelText="Hủy">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    if (loading) {
        return <Flex align="center" justify="center" style={{ minHeight: '400px' }}><Spin size="large" /></Flex>;
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Row align="middle" style={{ marginBottom: 24 }}>
                <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={handleBackNavigation} style={{ marginRight: 16 }} />
                <Col>
                    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <SnippetsOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        Tạo mới Lớp học
                    </Title>
                </Col>
            </Row>

            <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={() => setIsDirty(true)}>
                <Card
                    title={<><TeamOutlined style={{ marginRight: 8 }} />Thông tin chung</>}
                    style={{ marginBottom: 24 }}
                    bordered={false}
                >
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="className" label="Tên Lớp" rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}>
                                <Input placeholder="Ví dụ: Lớp Mầm 1" prefix={<TeamOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="age" label="Độ tuổi">
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
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="room" label="Phòng học">
                                <Select
                                    placeholder="Chọn phòng học"
                                    optionFilterProp="children"
                                    filterOption={(input, option) => (String(option?.children) ?? '').toLowerCase().includes(input.toLowerCase())}
                                    allowClear
                                >
                                    {availableRooms.map(room => (
                                        <Option key={room._id} value={room._id}><HomeOutlined /> {room.roomName} (Sức chứa: {room.capacity})</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="teachers" label="Giáo viên phụ trách">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Chọn tối đa 2 giáo viên"
                            onChange={handleTeacherChange}
                        >
                            {allAvailableTeachers.map(teacher => (
                                <Option key={teacher._id} value={teacher._id}><SolutionOutlined /> {teacher.fullName} ({teacher.staffCode})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Card>

                <Card
                    title={<><UsergroupAddOutlined style={{ marginRight: 8 }} />Danh sách Học sinh</>}
                    extra={<Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsStudentModalVisible(true)}>Thêm Học sinh</Button>}
                    bordered={false}
                >
                    <Table columns={mainStudentColumns} dataSource={students} rowKey="_id" pagination={{ pageSize: 10, hideOnSinglePage: true }} />
                </Card>

                <Row justify="end" style={{ marginTop: 24 }}>
                    <Space>
                        <Button icon={<CloseCircleOutlined />} onClick={handleBackNavigation}>Hủy</Button>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={isSubmitting}>Lưu</Button>
                    </Space>
                </Row>
            </Form>

            <AddMemberTableModal
                title={<><UserAddOutlined style={{ color: '#1890ff' }} /> Thêm Học sinh vào lớp</>}
                open={isStudentModalVisible}
                onCancel={() => setIsStudentModalVisible(false)}
                onOk={handleAddStudents}
                dataSource={allAvailableStudents.filter(s => !students.some(existing => existing._id === s._id))}
            />

            <Modal
                title={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8, fontSize: '22px' }} />
                        Xác nhận quay lại
                    </span>
                }
                open={isBackConfirmVisible}
                onOk={() => navigate(-1)}
                onCancel={() => setIsBackConfirmVisible(false)}
                okText="Đồng ý"
                cancelText="Không"
                zIndex={1001}
            >
                <p>Các thay đổi chưa được lưu sẽ bị mất. Bạn có chắc muốn tiếp tục?</p>
            </Modal>
        </div>
    );
}

const AddMemberTableModal = ({ open, onCancel, onOk, dataSource, title }: any) => {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const columns = [
        { title: 'Mã', dataIndex: 'studentCode', key: 'code' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    ];

    const rowSelection = {
        onChange: (_: React.Key[], selectedRows: any[]) => {
            setSelectedRows(selectedRows);
        },
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
            okButtonProps={{ icon: <PlusOutlined /> }}
            cancelButtonProps={{ icon: <CloseCircleOutlined /> }}
            destroyOnClose
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

export default CreateClass;