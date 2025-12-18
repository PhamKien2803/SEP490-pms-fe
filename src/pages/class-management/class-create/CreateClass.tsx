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
import { requiredTrimRule } from '../../../utils/format';

const { Title } = Typography;
const { Option } = Select;

function CreateClass() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    usePageTitle('Tạo mới lớp học - Cá Heo Xanh');

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);

    const [students, setStudents] = useState<StudentInClass[]>([]);
    const [allAvailableStudents, setAllAvailableStudents] = useState<StudentInClass[]>([]);
    const [allAvailableTeachers, setAllAvailableTeachers] = useState<TeacherInClass[]>([]);
    const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
    const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [allTeachers, allRooms] = await Promise.all([
                    classApis.getAllAvailableTeachers(),
                    classApis.getAllAvailableRoom()
                ]);
                setAllAvailableTeachers(allTeachers);
                setAvailableRooms(allRooms);
            } catch (error) {
                typeof error === "string" ? toast.info(error) : toast.error('Có lỗi xảy ra, vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchStudentsByAge = async (age?: number) => {
        try {
            const students = await classApis.getAllAvailableStudents(age);
            setAllAvailableStudents(students);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Không thể tải danh sách học sinh.');
        }
    };

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

    const handleValuesChange = (changed: any) => {
        setIsDirty(true);
        if ('age' in changed) {
            fetchStudentsByAge(changed.age);
            setStudents([]);
        }
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

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
            >
                <Card
                    title={<><TeamOutlined style={{ marginRight: 8 }} />Thông tin chung</>}
                    style={{ marginBottom: 24 }}
                    bordered={false}
                >
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="className" label="Tên Lớp" rules={[
                                requiredTrimRule("Tên lớp"),
                                // noSpecialCharactersRule,
                                {
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
                                },
                            ]}>
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
                                        <Option key={room?._id} value={room?._id}><HomeOutlined /> {room?.roomName}</Option>
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
                                <Option key={teacher?._id} value={teacher?._id}><SolutionOutlined /> {teacher?.fullName} ({teacher?.staffCode})</Option>
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
                // dataSource={allAvailableStudents.filter(s => !students.some(existing => existing._id === s._id))}
                originalData={allAvailableStudents.filter(s => !students.some(existing => existing._id === s._id))}
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

// const AddMemberTableModal = ({ open, onCancel, onOk, dataSource, title }: any) => {
//     const [selectedRows, setSelectedRows] = useState<any[]>([]);

//     const columns = [
//         { title: 'Mã', dataIndex: 'studentCode', key: 'code' },
//         { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
//     ];

//     const rowSelection = {
//         onChange: (_: React.Key[], selectedRows: any[]) => {
//             setSelectedRows(selectedRows);
//         },
//     };

//     const handleOk = () => {
//         if (selectedRows.length > 0) {
//             onOk(selectedRows);
//         }
//         onCancel();
//         setSelectedRows([]);
//     };

//     const handleCancel = () => {
//         onCancel();
//         setSelectedRows([]);
//     };

//     return (
//         <Modal
//             title={title}
//             open={open}
//             onCancel={handleCancel}
//             onOk={handleOk}
//             width={600}
//             okText="Thêm"
//             cancelText="Hủy"
//             okButtonProps={{ icon: <PlusOutlined /> }}
//             cancelButtonProps={{ icon: <CloseCircleOutlined /> }}
//             destroyOnClose
//         >
//             <Table
//                 rowSelection={{
//                     type: 'checkbox',
//                     ...rowSelection,
//                 }}
//                 columns={columns}
//                 dataSource={dataSource}
//                 rowKey="_id"
//                 pagination={{ pageSize: 5 }}
//             />
//         </Modal>
//     );
// };

const AddMemberTableModal = ({ open, onCancel, onOk, originalData, title }: any) => {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filteredData, setFilteredData] = useState<any[]>([]);

    useEffect(() => {
        setFilteredData(originalData);
    }, [originalData]);

    const handleSearch = (value: string) => {
        const lowerKeyword = value.toLowerCase();
        setSearchKeyword(value);
        const filtered = originalData.filter((student: { fullName: string; studentCode: string; }) =>
            student.fullName.toLowerCase().includes(lowerKeyword) ||
            student.studentCode?.toLowerCase().includes(lowerKeyword)
        );
        setFilteredData(filtered);
    };

    const columns = [
        { title: 'Mã', dataIndex: 'studentCode', key: 'code' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
    ];

    const rowSelection = {
        onChange: (_: React.Key[], selected: any[]) => {
            setSelectedRows(selected);
        },
    };

    const handleOk = () => {
        if (selectedRows.length > 0) {
            onOk(selectedRows);
        }
        onCancel();
        setSelectedRows([]);
        setSearchKeyword('');
    };

    const handleCancel = () => {
        onCancel();
        setSelectedRows([]);
        setSearchKeyword('');
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
            <Input.Search
                placeholder="Tìm theo tên hoặc mã học sinh..."
                onSearch={handleSearch}
                value={searchKeyword}
                onChange={e => handleSearch(e.target.value)}
                allowClear
                style={{ marginBottom: 16 }}
            />

            <Table
                rowSelection={{
                    type: 'checkbox',
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={filteredData}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
            />
        </Modal>
    );
};


export default CreateClass;
