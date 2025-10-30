import { useEffect, useMemo, useState } from 'react';
import {
    Select,
    Table,
    Typography,
    Spin,
    Button,
    Card,
    Space,
    Tooltip,
    Tag,
} from 'antd';
import {
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { SchoolYearListItem } from '../../../types/schoolYear';
import { ILessonListItem } from '../../../types/teacher';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { teacherApis } from '../../../services/apiServices';
import { constants } from '../../../constants';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const getStatusTag = (status: string) => {
    if (status === 'Dự thảo') {
        return <Tag color="blue">Dự thảo</Tag>;
    }
    if (status === 'Chờ duyệt') {
        return <Tag color="orange">Chờ duyệt</Tag>;
    }
    if (status === 'Hoàn thành') {
        return <Tag color="green">Hoàn thành</Tag>;
    }
    return <Tag>{status}</Tag>;
};

function TeacherReport() {
    const user = useCurrentUser();
    const teacherId = useMemo(() => user?.staff, [user]);
    const navigate = useNavigate();
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [lessonData, setLessonData] = useState<ILessonListItem[]>([]);
    console.log(lessonData);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        teacherApis.getSchoolYearList({ page: 0, limit: 10 }).then((res) => {
            const sorted = res.data.sort(
                (a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix(),
            );
            setSchoolYears(sorted);
            if (sorted.length > 0) setSelectedYear(sorted[0].schoolYear);
        });
    }, []);

    useEffect(() => {
        if (!teacherId || !selectedYear) return;
        setLoading(true);
        teacherApis
            .getListLesson({
                teacherId,
                schoolYear: selectedYear,
                limit: '30',
                page: '0',
            })
            .then((res) => setLessonData(res.data))
            .finally(() => setLoading(false));
    }, [teacherId, selectedYear]);

    const columns: ColumnsType<ILessonListItem> = [
        {
            title: 'Lớp học',
            dataIndex: 'className',
            key: 'className',
        },
        {
            title: 'Năm học',
            dataIndex: 'schoolYear',
            key: 'schoolYear',
        },
        {
            title: 'Tháng',
            dataIndex: 'month',
            key: 'month',
        },
        {
            title: 'Tuần',
            dataIndex: 'weekNumber',
            key: 'weekNumber',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`${constants.APP_PREFIX}/lessons/detail/${record._id}`)}
                        />
                    </Tooltip>
                    {(record.status === 'Dự thảo' || record.status === 'Chờ duyệt' || record.status === 'Hoàn thành') && (
                        <Tooltip title="Cập nhật">
                            <Button
                                type="text"
                                shape="circle"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`${constants.APP_PREFIX}/lessons/edit/${record._id}`)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <Title level={3} style={{ margin: 0 }}>
                    Báo cáo thời khóa biểu theo tuần
                </Title>
            }
            extra={
                <Button
                    onClick={() => navigate(`${constants.APP_PREFIX}/lessons/create`)}
                    type="primary"
                    icon={<PlusOutlined />}
                >
                    Tạo mới báo giảng
                </Button>
            }
            style={{ margin: 24 }}
        >
            <div style={{ marginBottom: 16 }}>
                <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    options={schoolYears.map((item) => ({
                        label: item.schoolYear,
                        value: item.schoolYear,
                    }))}
                    style={{ minWidth: 220 }}
                />
            </div>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={lessonData}
                    rowKey="_id"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    scroll={{ x: 'max-content' }}
                />
            </Spin>
        </Card>
    );
}

export default TeacherReport;