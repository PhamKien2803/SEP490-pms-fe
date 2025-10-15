import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Spin, Alert, Button, Row, Col, Typography, Flex, Table, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { ClassDetail, StudentInClass, TeacherInClass } from '../../../types/class';
import { classApis } from '../../../services/apiServices';



const { Title, Text } = Typography;
const { TabPane } = Tabs;

function ClassDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<ClassDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Không tìm thấy ID của lớp học.');
            setLoading(false);
            return;
        }

        const fetchClassDetails = async () => {
            setLoading(true);
            try {
                const response = await classApis.getClassById(id);
                setClassData(response);
            } catch (err) {
                setError('Không thể tải thông tin chi tiết của lớp học.');
                toast.error('Có lỗi xảy ra, vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetails();
    }, [id]);

    const studentColumns: ColumnsType<StudentInClass> = [
        { title: 'Mã Học Sinh', dataIndex: 'studentCode', key: 'studentCode' },
        { title: 'Họ và Tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Ngày Sinh', dataIndex: 'dob', key: 'dob', render: (text) => dayjs(text).format('DD/MM/YYYY') },
        { title: 'Giới Tính', dataIndex: 'gender', key: 'gender' },
    ];

    const teacherColumns: ColumnsType<TeacherInClass> = [
        { title: 'Mã Nhân Viên', dataIndex: 'staffCode', key: 'staffCode' },
        { title: 'Họ và Tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số Điện Thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    ];

    const renderContent = () => {
        if (loading) {
            return <Flex align="center" justify="center" style={{ minHeight: '400px' }}><Spin size="large" /></Flex>;
        }

        if (error) {
            return <Alert message="Lỗi" description={error} type="error" showIcon />;
        }

        if (classData) {
            return (
                <>
                    <Card style={{ marginBottom: 24 }}>
                        <Descriptions title="Thông tin chung" bordered column={2}>
                            <Descriptions.Item label="Mã Lớp">{classData.classCode}</Descriptions.Item>
                            <Descriptions.Item label="Tên Lớp">{classData.className}</Descriptions.Item>
                            <Descriptions.Item label="Độ tuổi">{classData.age}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">{classData.active ? 'Đang hoạt động' : 'Đã khóa'}</Descriptions.Item>
                            <Descriptions.Item label="Sĩ số">{classData.students?.length || 0}</Descriptions.Item>
                            <Descriptions.Item label="Số Giáo viên">{classData.teachers?.length || 0}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab={`Danh sách Học sinh (${classData.students?.length || 0})`} key="1">
                                <Table
                                    columns={studentColumns}
                                    dataSource={classData.students}
                                    rowKey="_id"
                                    bordered
                                    pagination={{ pageSize: 10 }}
                                />
                            </TabPane>
                            <TabPane tab={`Danh sách Giáo viên (${classData.teachers?.length || 0})`} key="2">
                                <Table
                                    columns={teacherColumns}
                                    dataSource={classData.teachers}
                                    rowKey="_id"
                                    bordered
                                    pagination={{ pageSize: 5 }}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>
                </>
            );
        }

        return <Alert message="Không có dữ liệu" type="info" showIcon />;
    };

    return (
        <div style={{ padding: '24px' }}>
            <Row align="middle" style={{ marginBottom: 24 }}>
                <Button
                    shape="circle"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    style={{ marginRight: 16 }}
                />
                <Col>
                    <Title level={4} style={{ margin: 0 }}>
                        Chi tiết Lớp học
                    </Title>
                    {classData && <Text type="secondary">{classData.className}</Text>}
                </Col>
            </Row>
            {renderContent()}
        </div>
    );
}

export default ClassDetails;