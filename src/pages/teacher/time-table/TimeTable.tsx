import { useEffect, useMemo, useState } from 'react';
import {
    Button, Typography, Select, Table, Card, Row, Col, Space, Tag,
    Spin, Empty, Segmented
} from 'antd';
import {
    LeftOutlined, RightOutlined, LockOutlined,
    EditOutlined, BulbOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { teacherApis } from '../../../services/apiServices';
import { IActivity, IGetTimetableTeacherResponse } from '../../../types/teacher';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import TimetableDayView from './TimetableDayView';
import { usePageTitle } from '../../../hooks/usePageTitle';

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const { Title, Text } = Typography;

const formatMinutesToTime = (minutes?: number | null): string => {
    if (minutes == null || isNaN(minutes)) return '--:--';
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const getActivityProps = (activity: IActivity) => {
    const style = {
        width: '100%',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'normal' as const,
        padding: '6px',
        fontSize: '13px',
        margin: 0,
    };
    if (activity.type === 'Cố định') return { color: 'blue', icon: <LockOutlined />, style };
    if (activity.type === 'Bình thường') return { color: 'green', icon: <EditOutlined />, style };
    if (activity.type === 'Sự kiện') return { color: 'gold', icon: <BulbOutlined />, style };
    return { color: 'default', style };
};

interface IScheduleRow {
    key: string;
    time: string;
    [dataIndex: string]: any;
}

const TimeTable = () => {
    const user = useCurrentUser();
    const teacherId = user?.staff;
    usePageTitle('Thời khóa biểu - Cá Heo Xanh');
    const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>();
    const [schoolYears, setSchoolYears] = useState<{ schoolYear: string, startDate: string }[]>([]);
    const [timetableData, setTimetableData] = useState<IGetTimetableTeacherResponse | null>(null);
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

    useEffect(() => {
        teacherApis.getSchoolYearList({ page: 0, limit: 10 }).then((res) => {
            const sorted = res.data.sort((a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix());
            setSchoolYears(sorted);
            if (sorted.length > 0) setSelectedYear(sorted[0].schoolYear);
        });
    }, []);

    const totalWeeksInMonth = useMemo(() => {
        if (!selectedYear || !schoolYears.length || !currentMonth) return [];

        const selectedSchoolYearData = schoolYears.find(y => y.schoolYear === selectedYear);
        if (!selectedSchoolYearData) return [];

        const schoolStartDate = dayjs(selectedSchoolYearData.startDate);
        const schoolStartMonth = schoolStartDate.month() + 1;
        const schoolStartYear = schoolStartDate.year();

        const year = currentMonth >= schoolStartMonth
            ? schoolStartYear
            : schoolStartYear + 1;

        const firstDayOfMonth = dayjs(`${year}-${currentMonth}-01`);
        const lastDayOfMonth = firstDayOfMonth.endOf('month');

        let cursor;
        const dayOfWeek = firstDayOfMonth.day();
        if (dayOfWeek === 0) {
            cursor = firstDayOfMonth.subtract(6, 'day');
        } else {
            cursor = firstDayOfMonth.subtract(dayOfWeek - 1, 'day');
        }

        const weeks: { start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];

        while (cursor.isBefore(lastDayOfMonth) || cursor.isSame(lastDayOfMonth, 'day')) {
            const weekStart = cursor;
            const weekEnd = cursor.add(6, 'day');
            weeks.push({ start: weekStart, end: weekEnd });
            cursor = cursor.add(7, 'day');
        }

        return weeks;
    }, [currentMonth, selectedYear, schoolYears]);

    useEffect(() => {
        if (!teacherId || !selectedYear) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await teacherApis.getTimetableTeacher({
                    teacherId,
                    schoolYear: selectedYear,
                    month: String(currentMonth),
                });
                setTimetableData(res);
                const today = dayjs();

                const selectedSchoolYearData = schoolYears.find(y => y.schoolYear === selectedYear);
                if (!selectedSchoolYearData) {
                    setCurrentWeek(1);
                    return;
                }
                const schoolStartDate = dayjs(selectedSchoolYearData.startDate);
                const schoolStartMonth = schoolStartDate.month() + 1;
                const schoolStartYear = schoolStartDate.year();
                const year = currentMonth >= schoolStartMonth ? schoolStartYear : schoolStartYear + 1;

                if (currentMonth === today.month() + 1 && year === today.year()) {
                    const index = totalWeeksInMonth.findIndex(
                        (week) => today.isBetween(week.start, week.end, 'day', '[]')
                    );
                    setCurrentWeek(index >= 0 ? index + 1 : 1);
                } else {
                    setCurrentWeek(1);
                }

            } catch (err) {
                console.error(err);
                setTimetableData(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [teacherId, selectedYear, currentMonth, schoolYears, totalWeeksInMonth]);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentWeek > 1) {
            setCurrentWeek(currentWeek - 1);
        } else if (direction === 'next') {
            const nextWeek = currentWeek + 1;
            if (nextWeek <= totalWeeksInMonth.length) {
                setCurrentWeek(nextWeek);
            } else {
                toast.info('Đã hết các tuần trong tháng này. Vui lòng chọn tháng khác.');
            }
        }
    };

    const getDaysOfWeek = useMemo(() => {
        if (!timetableData) return [];
        const { start, end } = totalWeeksInMonth[currentWeek - 1] || {};
        if (!start || !end) return [];
        return timetableData.scheduleDays.filter((day) =>
            dayjs(day.date).isBetween(start, end, 'day', '[]')
        );
    }, [timetableData, currentWeek, totalWeeksInMonth]);

    const uniqueStartTimes = useMemo(() => {
        if (!getDaysOfWeek.length) return [];
        const all = getDaysOfWeek.flatMap((d) => d.activities);
        const times = [...new Set(all.map((a) => a.startTime))];
        times.sort((a, b) => (a || 0) - (b || 0));
        return times;
    }, [getDaysOfWeek]);

    const columns = useMemo<ColumnsType<IScheduleRow>>(() => {
        if (!getDaysOfWeek.length) return [];

        const base: ColumnsType<IScheduleRow> = [
            {
                title: 'Thời gian',
                dataIndex: 'time',
                fixed: 'left',
                width: 100,
                align: 'center',
            },
        ];

        const dayColumns = getDaysOfWeek.map((day, dayIndex) => ({
            title: (
                <div style={{ textAlign: 'center' }}>
                    <Text strong>{day.dayName}</Text>
                    <br />
                    <Text type="secondary">{dayjs(day.date).format('DD/MM')}</Text>
                </div>
            ),
            dataIndex: `day_${dayIndex}`,
            key: day._id,
            width: 250,
            render: (activity: IActivity | null, _record: any, _: any) => {
                if (!activity) return { children: null, props: { style: { padding: 8 } } };

                const props = getActivityProps(activity);

                if (activity.type === 'Cố định') {
                    const isFirstFixed =
                        dayIndex === 0 ||
                        (() => {
                            for (let i = dayIndex - 1; i >= 0; i--) {
                                const prevDay = getDaysOfWeek[i];
                                if (prevDay.activities.length === 0) return true;
                                const prevAct = prevDay.activities.find(
                                    (a) => a.startTime === activity.startTime
                                );
                                if (
                                    !prevAct ||
                                    prevAct.activityCode !== activity.activityCode ||
                                    prevAct.type !== 'Cố định'
                                ) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                            return true;
                        })();

                    if (!isFirstFixed) {
                        return { children: null, props: { colSpan: 0 } };
                    }

                    let colSpan = 1;
                    for (let j = dayIndex + 1; j < getDaysOfWeek.length; j++) {
                        const nextDay = getDaysOfWeek[j];
                        const isHoliday = nextDay.activities.length === 0;

                        if (isHoliday) break;

                        const nextActivity = nextDay.activities.find(
                            (a) => a.startTime === activity.startTime
                        );
                        if (
                            nextActivity &&
                            nextActivity.type === 'Cố định' &&
                            nextActivity.activityCode === activity.activityCode
                        ) {
                            colSpan++;
                        } else {
                            break;
                        }
                    }

                    if (!isFirstFixed) {
                        return { children: null, props: { colSpan: 0 } };
                    }

                    return {
                        children: (
                            <div style={{ textAlign: 'center' }}>
                                <Tag {...props}>{activity.activityName}</Tag>
                            </div>
                        ),
                        props: { colSpan, style: { padding: 8 } },
                    };
                }

                return {
                    children: (
                        <div style={{ textAlign: 'center' }}>
                            <Tag {...props}>{activity.activityName || 'Trống'}</Tag>
                            {activity.type === 'Bình thường' && activity.tittle && (
                                <ul
                                    style={{
                                        fontSize: 12,
                                        marginTop: 4,
                                        paddingLeft: 20,
                                        textAlign: 'left',
                                    }}
                                >
                                    {activity.tittle.split('\n').map((line, i) => (
                                        <li key={i} style={{ lineHeight: 1.4 }}>
                                            {line.trim()}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ),
                    props: { style: { padding: 8 } },
                };
            },
        }));

        return [...base, ...dayColumns];
    }, [getDaysOfWeek, uniqueStartTimes]);


    const dataSource = useMemo<IScheduleRow[]>(() => {
        if (!getDaysOfWeek.length || uniqueStartTimes.length === 0) return [];
        return uniqueStartTimes.map((startTime) => {
            const time = formatMinutesToTime(startTime);
            const row: IScheduleRow = { key: time, time };
            getDaysOfWeek.forEach((day, index) => {
                const activity = day.activities.find((a) => a.startTime === startTime);
                row[`day_${index}`] = activity || null;
            });
            return row;
        });
    }, [getDaysOfWeek, uniqueStartTimes]);

    const classInfo = timetableData ? `${timetableData.className || ''} (${timetableData.schoolYear || ''})` : '';

    return (
        <Card
            title={
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space direction="vertical" size={0}>
                            <Title level={4} style={{ margin: 0 }}>Thời khóa biểu giáo viên</Title>
                            {classInfo && <Text type="secondary">{classInfo}</Text>}
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Segmented
                                value={viewMode}
                                onChange={(val) => setViewMode(val as 'week' | 'day')}
                                options={[
                                    { label: 'Tuần', value: 'week' },
                                    { label: 'Ngày', value: 'day' },
                                ]}
                            />
                            <Select
                                value={selectedYear}
                                onChange={setSelectedYear}
                                options={schoolYears.map((y) => ({ label: y.schoolYear, value: y.schoolYear }))}
                                style={{ width: 150 }}
                            />
                            <Select
                                value={currentMonth}
                                onChange={(val) => {
                                    setCurrentMonth(val);
                                    setCurrentWeek(1);
                                }}
                                options={Array.from({ length: 12 }, (_, i) => ({
                                    label: `Tháng ${i + 1}`,
                                    value: i + 1,
                                }))}
                                style={{ width: 120 }}
                            />
                            <Space.Compact>
                                <Button icon={<LeftOutlined />} onClick={() => handleWeekChange('prev')} disabled={currentWeek === 1} />
                                <Button style={{ minWidth: 180, cursor: 'default' }}>
                                    {totalWeeksInMonth[currentWeek - 1]
                                        ? `${totalWeeksInMonth[currentWeek - 1].start.format('DD/MM')} - ${totalWeeksInMonth[currentWeek - 1].end.format('DD/MM')} (Tuần ${currentWeek})`
                                        : `Tuần ${currentWeek}`}
                                </Button>
                                <Button icon={<RightOutlined />} onClick={() => handleWeekChange('next')} disabled={currentWeek >= totalWeeksInMonth.length} />
                            </Space.Compact>
                        </Space>
                    </Col>
                </Row>
            }
            style={{ margin: 16 }}
        >
            <Spin spinning={loading}>
                {!getDaysOfWeek.length && !loading ? (
                    <Empty description="Không có dữ liệu thời khóa biểu" />
                ) : viewMode === 'week' ? (
                    <div
                        style={{ overflowX: 'auto', paddingBottom: 8 }}
                    >
                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            bordered
                            pagination={false}
                            style={{ width: '100%' }}
                        />
                    </div>
                ) : (
                    <TimetableDayView getDaysOfWeek={getDaysOfWeek} />
                )}
            </Spin>
        </Card>
    );
};

export default TimeTable;