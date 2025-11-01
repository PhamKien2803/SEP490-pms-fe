import { useState, useEffect } from 'react';
import {
    Spin, Card, Typography, Tabs, Table, Tag, Flex, Empty, Avatar,
    Statistic, Row, Col, Space, Divider, theme, Tooltip, Select, Button
} from 'antd';
import {
    UserOutlined, TeamOutlined, EyeOutlined, ReadOutlined, CalendarOutlined,
    HomeOutlined, BarcodeOutlined, SmileOutlined, UsergroupAddOutlined,
    ManOutlined, WomanOutlined
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { IClassInfo, IStudent, ITeacherClassStudentResponse } from '../../../types/teacher';
import { teacherApis, schoolYearApis } from '../../../services/apiServices';
import { toast } from 'react-toastify';
import { SchoolYearListItem } from '../../../types/schoolYear';
import StudentDetailModal from '../../../modal/student-details/StudentDetailModal';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useToken } = theme;
const { Option } = Select;

function ClassInfor() {
    const user = useCurrentUser();
    const { token } = useToken();
    usePageTitle('Thông tin lớp học - Cá Heo Xanh');
    const teacherId = user?.staff;
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>();
    const [classData, setClassData] = useState<ITeacherClassStudentResponse | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const getAvatarLetter = (name: string) => {
        return name?.[0]?.toUpperCase() || <UserOutlined />;
    };

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
            fixed: 'left',
            render: (fullName: string) => (
                <Space>
                    <Avatar size="small" style={{ backgroundColor: token.colorPrimary, color: '#fff' }}>
                        {getAvatarLetter(fullName)}
                    </Avatar>
                    <Text>{fullName}</Text>
                </Space>
            )
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
            render: (gender: string) => {
                const isMale = gender === 'Nam';
                return (
                    <Tag
                        color={isMale ? 'blue' : 'pink'}
                        icon={isMale ? <ManOutlined /> : <WomanOutlined />}
                        style={{ margin: 0 }}
                    >
                        {gender}
                    </Tag>
                );
            },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Xem chi tiết',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 100,
            render: (_, record) => (
                <Tooltip title="Xem chi tiết học sinh">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<EyeOutlined style={{ color: token.colorPrimary }} />}
                        onClick={() => {
                            setSelectedStudentId(record._id);
                            setIsDetailModalOpen(true);
                        }}
                    />
                </Tooltip>
            ),
        },
    ];

    useEffect(() => {
        schoolYearApis
            .getSchoolYearList({ page: 1, limit: 100 })
            .then((res) => {
                const sorted = [...res.data].sort((a, b) => {
                    const endYearA = parseInt(a.schoolYear.split('-')[1]);
                    const endYearB = parseInt(b.schoolYear.split('-')[1]);
                    return endYearB - endYearA;
                });
                setSchoolYears(sorted);
                if (sorted.length > 0) {
                    setSelectedYear(sorted[0]._id);
                }
            })
            .catch(() => {
                toast.error('Không thể tải danh sách năm học.');
            });
    }, []);

    useEffect(() => {
        if (!teacherId || !selectedYear) return;

        setIsLoadingData(true);

        teacherApis
            .getClassAndStudentByTeacher(teacherId, selectedYear)
            .then((response) => setClassData(response))
            .catch(() => toast.error('Không thể tải thông tin lớp học.'))
            .finally(() => setIsLoadingData(false));
    }, [teacherId, selectedYear]);

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
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<Text strong>Giáo viên hiện chưa được phân công lớp học nào trong năm học này.</Text>}
                    />
                </Card>
            );
        }

        const { teacher, schoolYear, classes } = classData;

        return (
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card bordered={false} style={{ background: `linear-gradient(135deg, ${token.colorBgLayout}, ${token.colorInfoBg})` }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col>
                            <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
                        </Col>
                        <Col flex="auto">
                            <Title level={4} style={{ marginBottom: 0 }}>{teacher?.fullName || user?.email || 'Giáo viên'}</Title>
                            <Text type="secondary">{teacher?.email || user?.email}</Text>
                        </Col>
                        <Col>
                            <Tag color="cyan" style={{ padding: '5px 10px', fontSize: '14px' }}>
                                Năm học: {schoolYear.schoolYear}
                            </Tag>
                        </Col>
                    </Row>
                </Card>

                <Card bordered={false} bodyStyle={{ padding: 0 }}>
                    <Tabs
                        defaultActiveKey={classes[0]?._id}
                        tabPosition="top"
                        size="large"
                        type="line"
                        style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG }}
                        tabBarStyle={{
                            padding: `0 ${token.paddingLG}px`,
                            marginBottom: 0,
                            borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        }}
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
                                <Row gutter={[24, 24]} style={{ marginBottom: token.marginLG }}>
                                    <Col xs={24} sm={12} md={6}>
                                        <Statistic
                                            title="Mã lớp"
                                            value={classInfo.classCode}
                                            prefix={<BarcodeOutlined style={{ color: token.colorTextSecondary }} />}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Statistic
                                            title="Phòng học"
                                            value={classInfo.room?.roomName || '--'}
                                            prefix={<HomeOutlined style={{ color: token.colorSuccess }} />}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Statistic
                                            title="Độ tuổi"
                                            value={`${classInfo.age || '--'} tuổi`}
                                            prefix={<SmileOutlined style={{ color: token.colorWarning }} />}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <Statistic
                                            title="Sĩ số"
                                            value={classInfo.students?.length || 0}
                                            suffix="học sinh"
                                            prefix={<UsergroupAddOutlined style={{ color: token.colorPrimary }} />}
                                        />
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
                                    scroll={{ x: 1000 }}
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
            <div>
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }} wrap="wrap" gap="middle">
                    <Space>
                        <Title level={2} style={{ margin: 0, color: token.colorPrimary }}>
                            <ReadOutlined style={{ marginRight: 12 }} />
                            Thông tin Lớp học phụ trách
                        </Title>
                    </Space>
                    <Select
                        value={selectedYear}
                        onChange={(val) => setSelectedYear(val)}
                        style={{ width: 250 }}
                        placeholder="Chọn năm học"
                        size="large"
                    >
                        {schoolYears.map((item) => (
                            <Option key={item._id} value={item._id}>
                                <CalendarOutlined style={{ marginRight: 8, color: token.colorTextSecondary }} />
                                {item.schoolYear}
                            </Option>
                        ))}
                    </Select>
                </Flex>

                {renderContent()}

                {selectedStudentId && (
                    <StudentDetailModal
                        studentId={selectedStudentId}
                        open={isDetailModalOpen}
                        onClose={() => setIsDetailModalOpen(false)}
                    />
                )}
            </div>
        </>
    );
}

export default ClassInfor;

const styleSheet = document.createElement("style");
styleSheet.innerText = `
 .table-row-hover:hover > td {
   background-color: #f5f5ff !important;
 }
`;
document.head.appendChild(styleSheet);