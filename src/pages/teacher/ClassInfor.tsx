import { useState, useEffect } from 'react';
import {
    Spin,
    Card,
    Typography,
    Tabs,
    Table,
    Tag,
    Flex,
    Empty,
    Avatar,
    Statistic,
    Row,
    Col,
    Space,
    Divider,
    theme,
} from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { IClassInfo, IStudent, ITeacherClassStudentResponse } from '../../types/teacher';
import { teacherApis } from '../../services/apiServices';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useToken } = theme;

const studentColumns: TableProps<IStudent>['columns'] = [
    {
        title: 'Mã HS',
        dataIndex: 'studentCode',
        key: 'studentCode',
        width: 150,
        fixed: 'left',
    },
    {
        title: 'Họ và Tên',
        dataIndex: 'fullName',
        key: 'fullName',
        ellipsis: true,
    },
    {
        title: 'Ngày sinh',
        dataIndex: 'dob',
        key: 'dob',
        width: 120,
        render: (dob: string) => (dob ? dayjs(dob).format('DD/MM/YYYY') : '-'),
    },
    {
        title: 'Giới tính',
        dataIndex: 'gender',
        key: 'gender',
        width: 100,
        align: 'center',
        render: (gender: string) => (
            <Tag color={gender === 'Nam' ? 'blue' : 'pink'} style={{ margin: 0 }}>{gender}</Tag>
        ),
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        ellipsis: true,
    },
];

function ClassInfor() {
    const user = useCurrentUser();
    const { token } = useToken();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [classData, setClassData] =
        useState<ITeacherClassStudentResponse | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const teacherId = user?.staff;

    useEffect(() => {
        if (!teacherId || hasFetched) {
            if (!teacherId && user !== undefined) {
                toast.error('Không thể xác định thông tin giáo viên.');
                setIsLoadingData(false);
            }
            return;
        }

        setIsLoadingData(true);

        teacherApis
            .getClassAndStudentByTeacher(teacherId)
            .then((response) => {
                setClassData(response);
                setHasFetched(true);
            })
            .catch(() => {
                toast.error('Không thể tải thông tin lớp học. Vui lòng thử lại.');
            })
            .finally(() => {
                setIsLoadingData(false);
            });
    }, [teacherId, hasFetched, user]);

    const renderContent = () => {
        if (isLoadingData || user === undefined) {
            return (
                <Flex justify="center" align="center" style={{ minHeight: '50vh' }}>
                    <Spin tip="Đang tải thông tin..." size="large" />
                </Flex>
            );
        }

        if (!classData || classData.classes.length === 0) {
            return (
                <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Empty description={<Text strong>Giáo viên hiện chưa được phân công lớp học nào.</Text>} />
                </Card>
            );
        }

        const { teacher, schoolYear, classes } = classData;

        return (
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card bordered={false} style={{ background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorInfoBg})` }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col>
                            <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
                        </Col>
                        <Col flex="auto">
                            <Title level={4} style={{ marginBottom: 0 }}>{teacher?.fullName || user?.email || 'Giáo viên'}</Title>
                            <Text type="secondary">{teacher?.email || user?.email}</Text>
                        </Col>
                        <Col>
                            <Tag color="cyan" style={{ padding: '5px 10px', fontSize: '14px' }}>Năm học: {schoolYear.schoolYear}</Tag>
                        </Col>
                    </Row>
                </Card>

                <Card bordered={false} bodyStyle={{ padding: 0 }}>
                    <Tabs
                        defaultActiveKey={classes[0]?._id}
                        tabPosition="top"
                        size="large"
                        type="line"
                        style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG, overflow: 'hidden' }}
                        tabBarStyle={{ padding: `0 ${token.paddingLG}px`, marginBottom: 0, borderBottom: `1px solid ${token.colorBorderSecondary}` }}
                    >
                        {classes.map((classInfo: IClassInfo) => (
                            <TabPane
                                tab={
                                    <Space>
                                        <TeamOutlined style={{ color: token.colorPrimary }} />
                                        <Text strong>{classInfo.className}</Text>
                                    </Space>
                                }
                                key={classInfo._id}
                                style={{ padding: token.paddingLG }}
                            >
                                <Row gutter={[24, 16]} align="middle" style={{ marginBottom: token.marginLG }}>
                                    <Col xs={24} sm={12} md={6}>
                                        <Statistic title="Mã lớp" value={classInfo.classCode} />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Statistic title="Phòng học" value={classInfo.room?.roomName || '--'} />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Statistic title="Độ tuổi" value={`${classInfo.age || '--'} tuổi`} />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Statistic title="Sĩ số" value={classInfo.students?.length || 0} suffix="học sinh" />
                                    </Col>
                                </Row>

                                <Divider />

                                <Title level={5} style={{ marginBottom: token.margin }}>Danh sách học sinh</Title>
                                <Table
                                    columns={studentColumns}
                                    dataSource={classInfo.students}
                                    rowKey="_id"
                                    pagination={{ pageSize: 10, showSizeChanger: true, size: 'small' }}
                                    bordered
                                    size="middle"
                                    scroll={{ x: 800 }}
                                    rowClassName={() => 'table-row-hover'}
                                />
                            </TabPane>
                        ))}
                    </Tabs>
                </Card>
            </Space>
        );
    };

    return (
        <>
            <div style={{ maxWidth: 1200, margin: 'auto' }}>
                <Title level={2} style={{ marginBottom: 24, color: token.colorPrimary }}>
                    Thông tin Lớp học phụ trách
                </Title>
                {renderContent()}
            </div>
        </>
    );
}

export default ClassInfor;

const styleSheet = document.createElement("style");
styleSheet.innerText = `
 .table-row-hover:hover > td {
    background-color: #f5f5f5 !important;
 }
`;
document.head.appendChild(styleSheet);