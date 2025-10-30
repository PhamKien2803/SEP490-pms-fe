import { useEffect, useState, useCallback } from 'react';
import {
    Card,
    Typography,
    List,
    Flex,
    Table,
    Tag,
    Button,
    Segmented,
    Spin,
    Empty,
    Select,
} from 'antd';
import {
    ClockCircleOutlined,
    LeftOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { useToken } from 'antd/es/theme/internal';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { IDailySchedule } from '../../../types/timetable';
import { teacherApis } from '../../../services/apiServices';
import { ILessonListItem, IScheduleDay } from '../../../types/teacher';

dayjs.extend(weekOfYear);
const { Title, Text } = Typography;

const TimeTable = () => {
    const [token] = useToken();
    const user = useCurrentUser();
    const teacherId = user?.staff;

    const [currentDate, setCurrentDate] = useState(dayjs());
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [scheduleData, setScheduleData] = useState<IDailySchedule[]>([]);
    const [lessonData, setLessonData] = useState<ILessonListItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [schoolYears, setSchoolYears] = useState<{ schoolYear: string }[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>();

    // 1. Lấy danh sách năm học
    useEffect(() => {
        teacherApis.getSchoolYearList({ page: 0, limit: 10 }).then((res) => {
            const sorted = res.data.sort(
                (a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix()
            );
            setSchoolYears(sorted);
            if (sorted.length > 0) setSelectedYear(sorted[0].schoolYear);
        });
    }, []);

    // 2. Lấy danh sách bài học theo năm học (luôn truyền teacherId)
    const fetchLessonList = useCallback(() => {
        if (!selectedYear || !teacherId) return;

        const params = {
            schoolYear: selectedYear,
            teacherId,
            limit: '30',
            page: '0',
        };

        setLoading(true);
        teacherApis
            .getListLesson(params)
            .then((res) => setLessonData(res.data))
            .finally(() => setLoading(false));
    }, [teacherId, selectedYear]);

    useEffect(() => {
        fetchLessonList();
    }, [fetchLessonList]);

    // 3. Lấy TKB tuần
    useEffect(() => {
        const fetchSchedule = async () => {
            if (!teacherId) return;
            try {
                setLoading(true);
                const params = {
                    teacherId,
                    month: String(currentDate.month() + 1),
                    week: String(currentDate.week()),
                };
                const res = await teacherApis.getScheduleWeek(params);
                if (res.status === 'Hoàn thành') {
                    setScheduleData(
                        res.scheduleDays.map((day: IScheduleDay) => ({
                            ...day,
                            activities: day.activities.map((activity: IActivity) => ({
                                ...activity,
                                activityName: activity.activityName || 'Unknown Activity',
                            })),
                        }))
                    );
                } else {
                    setScheduleData([]);
                }
            } catch (err) {
                console.error(err);
                setScheduleData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [currentDate, teacherId]);

    const getWeekColumns = () => {
        const days = [];
        for (let i = 1; i <= 5; i++) {
            const date = currentDate.startOf('week').add(i, 'day');
            days.push({
                title: `${date.format('dddd')} (${date.format('DD/MM')})`,
                dataIndex: date.format('YYYY-MM-DD'),
                key: date.format('YYYY-MM-DD'),
                align: 'center' as const,
                render: (val: any) =>
                    val ? <Tag color={val.color}>{val.title}</Tag> : null,
            });
        }

        return [
            {
                title: 'Giờ học',
                dataIndex: 'time',
                key: 'time',
                fixed: 'left' as const,
                render: (val: string) => <b>{val}</b>,
            },
            ...days,
        ];
    };

    const WeekView = () => {
        if (!scheduleData.length) {
            return <Empty description="Không có thời khóa biểu tuần này." />;
        }

        const timeSlots = Array.from(
            new Set(scheduleData.flatMap((day) => day.activities.map((act) => act.startTime)))
        ).sort((a, b) => a - b);

        const dataSource = timeSlots.map((startTime, idx) => {
            const row: any = {
                key: idx,
                time: `${Math.floor(startTime / 60)
                    .toString()
                    .padStart(2, '0')}:${(startTime % 60).toString().padStart(2, '0')}`,
            };
            scheduleData.forEach((day) => {
                const act = day.activities.find((a) => a.startTime === startTime);
                const colKey = dayjs(day.date).format('YYYY-MM-DD');
                if (act) {
                    row[colKey] = {
                        title: act.activityName,
                        color: act.type === 'Cố định' ? 'purple' : 'blue',
                    };
                }
            });
            return row;
        });

        return (
            <Table
                columns={getWeekColumns()}
                dataSource={dataSource}
                bordered
                pagination={false}
                scroll={{ x: 1000 }}
            />
        );
    };

    const DayView = () => {
        const todayData = scheduleData.find((day) =>
            dayjs(day.date).isSame(currentDate, 'day')
        );
        if (!todayData) {
            return <Empty description="Không có thời khóa biểu ngày này." />;
        }

        const data = todayData.activities.map((a, idx) => ({
            key: idx,
            time: `${Math.floor(a.startTime / 60)
                .toString()
                .padStart(2, '0')}:${(a.startTime % 60).toString().padStart(2, '0')}`,
            title: a.activityName,
            duration: `${a.endTime - a.startTime} phút`,
            color: a.type === 'Cố định' ? token.colorPurple : token.colorPrimary,
            tagColor: a.type === 'Cố định' ? 'purple' : 'blue',
        }));

        return (
            <List
                dataSource={data}
                renderItem={(item) => (
                    <List.Item>
                        <Flex align="center" gap={16} style={{ width: '100%' }}>
                            <ClockCircleOutlined style={{ color: item.color }} />
                            <div style={{ flex: 1 }}>
                                <Text type="secondary">{item.time}</Text>
                                <br />
                                <Text strong>{item.title}</Text>
                            </div>
                            <Tag color={item.tagColor}>{item.duration}</Tag>
                        </Flex>
                    </List.Item>
                )}
            />
        );
    };

    return (
        <Card
            title={
                <Flex justify="space-between">
                    <Title level={4}>Thời khóa biểu</Title>
                    <Select
                        value={selectedYear}
                        onChange={(val) => setSelectedYear(val)}
                        options={schoolYears.map((y) => ({
                            label: y.schoolYear,
                            value: y.schoolYear,
                        }))}
                        style={{ minWidth: 160 }}
                    />
                </Flex>
            }
            extra={
                <Segmented
                    value={viewMode}
                    onChange={(val) => setViewMode(val as 'week' | 'day')}
                    options={[
                        { label: 'Tuần', value: 'week' },
                        { label: 'Ngày', value: 'day' },
                    ]}
                />
            }
        >
            <Flex justify="space-between" style={{ marginBottom: 16 }}>
                <Button
                    icon={<LeftOutlined />}
                    onClick={() => setCurrentDate((prev) => prev.subtract(1, 'week'))}
                >
                    Tuần trước
                </Button>
                <Text strong>
                    Tuần {currentDate.week()} - Tháng {currentDate.month() + 1}
                </Text>
                <Button
                    icon={<RightOutlined />}
                    onClick={() => setCurrentDate((prev) => prev.add(1, 'week'))}
                >
                    Tuần sau
                </Button>
            </Flex>

            <Spin spinning={loading}>
                {viewMode === 'week' ? <WeekView /> : <DayView />}
            </Spin>
        </Card>
    );
};

export default TimeTable;
