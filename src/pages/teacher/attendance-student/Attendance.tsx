import { useState, useEffect, useMemo } from 'react';
import {
    Card, Table, Spin, Typography, Row, Col, Select, Empty, Button, Tooltip, Space, Tag
} from 'antd';
import { EyeOutlined, HistoryOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SchoolYearListItem } from '../../../types/schoolYear';
import {
    IAttendanceDetailResponse,
    ITeacherClassStudentResponse,
    IClassInfo
} from '../../../types/teacher';
import { schoolYearApis, teacherApis } from '../../../services/apiServices';
import { constants } from '../../../constants';
import { usePagePermission } from '../../../hooks/usePagePermission';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { Option } = Select;

interface AttendanceTableRecord extends IAttendanceDetailResponse {
    key: string;
}

function AttendanceHistory() {
    usePageTitle('Điểm danh học sinh - Cá Heo Xanh');
    const navigate = useNavigate();
    const user = useCurrentUser();
    const teacherId = useMemo(() => user?.staff, [user]);
    const { canUpdate, canCreate } = usePagePermission();
    const [loading, setLoading] = useState(false);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string | undefined>(undefined);
    const [teacherClassInfo, setTeacherClassInfo] = useState<IClassInfo | null>(null);
    const [attendanceList, setAttendanceList] = useState<AttendanceTableRecord[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: AttendanceTableRecord, b: AttendanceTableRecord) =>
                dayjs(a.date).unix() - dayjs(b.date).unix(),
            defaultSortOrder: 'descend' as const,
            width: 120,
        },
        {
            title: 'Năm học',
            dataIndex: ['schoolYear', 'schoolYear'],
            key: 'schoolYear',
            width: 120,
        },
        {
            title: 'Người điểm danh',
            dataIndex: ['takenBy', 'fullName'],
            key: 'takenBy',
        },
        {
            title: 'Ghi chú chung',
            dataIndex: 'generalNote',
            key: 'generalNote',
            ellipsis: true,
        },
        {
            title: 'Sĩ số',
            dataIndex: 'students',
            key: 'studentCount',
            render: (students: any[]) => students?.length || 0,
            width: 80,
            align: 'center' as const,
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            width: 100,
            render: (_: any, record: AttendanceTableRecord) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            shape="circle"
                            icon={<EyeOutlined />}
                            onClick={() =>
                                navigate(`${constants.APP_PREFIX}/attendances/detail/${record._id}`)
                            }
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        {canUpdate && (
                            <Button
                                shape="circle"
                                icon={<EditOutlined />}
                                onClick={() =>
                                    navigate(`${constants.APP_PREFIX}/attendances/update/${record._id}`)
                                }
                            />
                        )}
                    </Tooltip>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        const init = async () => {
            if (!teacherId) return;

            setLoading(true);
            try {
                const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
                const sorted = res.data.sort(
                    (a, b) =>
                        parseInt(b.schoolYear.split('-')[0]) - parseInt(a.schoolYear.split('-')[0])
                );
                setSchoolYears(sorted);

                const firstYearId = sorted[0]?._id;
                setSelectedSchoolYearId(firstYearId);
                if (!firstYearId) return;

                const teacherData: ITeacherClassStudentResponse =
                    await teacherApis.getClassAndStudentByTeacher(teacherId, firstYearId);
                const currentClass = teacherData.classes?.[0];

                if (!currentClass) {
                    setTeacherClassInfo(null);
                    toast.warn('Không tìm thấy lớp học trong năm học này');
                    return;
                }

                setTeacherClassInfo(currentClass);

                const attendanceData = await teacherApis.getAttendanceByClassAndSchoolYear(
                    currentClass._id,
                    firstYearId
                );
                const listData = Array.isArray(attendanceData)
                    ? attendanceData
                    : [attendanceData];

                setAttendanceList(listData.map((item) => ({ ...item, key: item._id })));
                setPagination((prev) => ({ ...prev, current: 1, total: listData.length }));
            } catch (error) {
                console.error('Lỗi tải dữ liệu:', error);
                toast.error('Không thể tải dữ liệu điểm danh.');
                setAttendanceList([]);
                setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [teacherId]);

    const handleNavigateToTakeAttendance = () => {
        navigate(`${constants.APP_PREFIX}/attendances/take-attendance`);
    };

    const handleSchoolYearChange = async (yearId: string) => {
        setSelectedSchoolYearId(yearId);
        setAttendanceList([]);
        setPagination((prev) => ({ ...prev, current: 1, total: 0 }));

        if (!teacherId) return;

        setLoading(true);
        try {
            const teacherData: ITeacherClassStudentResponse =
                await teacherApis.getClassAndStudentByTeacher(teacherId, yearId);
            const currentClass = teacherData.classes?.[0];

            if (!currentClass) {
                setTeacherClassInfo(null);
                toast.warn('Không tìm thấy lớp học trong năm học này');
                return;
            }

            setTeacherClassInfo(currentClass);
            const attendanceData = await teacherApis.getAttendanceByClassAndSchoolYear(
                currentClass._id,
                yearId
            );
            const listData = Array.isArray(attendanceData)
                ? attendanceData
                : [attendanceData];

            setAttendanceList(listData.map((item) => ({ ...item, key: item._id })));
            setPagination((prev) => ({ ...prev, current: 1, total: listData.length }));
        } catch (error) {
            console.error('Lỗi khi đổi năm học:', error);
            toast.error('Không thể tải dữ liệu điểm danh.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card bordered={false}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Space direction="vertical">
                            <Title level={3} style={{ margin: 0 }}>
                                <HistoryOutlined /> Điểm danh lớp học
                            </Title>
                            {teacherClassInfo && (
                                <Text type="secondary">
                                    Lớp phụ trách:{' '}
                                    <Tag color="blue">{teacherClassInfo.className}</Tag>
                                </Text>
                            )}
                        </Space>
                    </Col>
                    <Col>
                        {canCreate && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={handleNavigateToTakeAttendance}
                                disabled={!teacherClassInfo}
                            >
                                Điểm danh hôm nay
                            </Button>
                        )}

                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Chọn năm học"
                            value={selectedSchoolYearId}
                            onChange={handleSchoolYearChange}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            loading={schoolYears.length === 0 && loading}
                        >
                            {schoolYears.map((sy) => (
                                <Option key={sy._id} value={sy._id}>
                                    {sy.schoolYear}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                <Spin spinning={loading} tip="Đang tải dữ liệu...">
                    <Table
                        columns={columns}
                        dataSource={attendanceList}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} bản ghi`,
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description={
                                        !teacherClassInfo
                                            ? 'Vui lòng chọn năm học để xem lớp.'
                                            : 'Không có dữ liệu điểm danh nào cho lớp/năm học này.'
                                    }
                                />
                            ),
                        }}
                        scroll={{ x: 'max-content' }}
                        bordered
                    />
                </Spin>
            </Card>
        </div>
    );
}

export default AttendanceHistory;
