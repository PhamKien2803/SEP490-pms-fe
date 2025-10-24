import { useState, useEffect, useMemo } from 'react';
import {
    Card, Typography, Row, Col, Select, Spin, Tag, Space, Button,
    Empty, theme, Alert, Flex, Input
} from 'antd';
import {
    ScheduleOutlined, PlusOutlined, ArrowLeftOutlined,
    LeftOutlined, RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { toast } from 'react-toastify';
import { scheduleApis } from '../../../services/apiServices';
import {
    FixActivityResponseItem,
    IScheduleActivity,
    IClassBySchoolYearItem,
    ICreateSchedulePayload,
    AvailableActivityItem
} from '../../../types/timetable';
import { useNavigate } from 'react-router-dom';

dayjs.extend(weekOfYear);
dayjs.locale('vi');

const { Title, Text } = Typography;
const { useToken } = theme;

const formatMinutesToTime = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return '--:--';
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
};

const ScheduleCreate = () => {
    const { token } = useToken();
    const navigate = useNavigate();

    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>();
    const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
    const [classId, setClassId] = useState<string>();
    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([]);
    const [fixedActivities, setFixedActivities] = useState<FixActivityResponseItem[]>([]);
    const [isLoadingFix, setIsLoadingFix] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [weekIndex, setWeekIndex] = useState(0);
    const [selectingDay, setSelectingDay] = useState<string | null>(null);
    const [availableActivities, setAvailableActivities] = useState<AvailableActivityItem[]>([]);
    const [isFetchingActivities, setIsFetchingActivities] = useState(false);


    const fetchFixActivities = async () => {
        if (!selectedSchoolYear || !selectedMonth || !classId) return;
        setIsLoadingFix(true);
        setFixedActivities([]);
        setError(null);
        try {
            const data = await scheduleApis.getFixActivity({
                year: selectedSchoolYear,
                month: selectedMonth.toString(),
                classId,
            });
            setFixedActivities(data);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Không thể tải hoạt động cố định.';
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setIsLoadingFix(false);
        }
    };

    useEffect(() => {
        scheduleApis.getClassListByActiveSchoolYear()
            .then(res => {
                const options = res.map((cls: IClassBySchoolYearItem) => ({
                    label: cls.className,
                    value: cls._id
                }));
                setClassOptions(options);
                if (res.length > 0) {
                    setSelectedSchoolYear(res[0].schoolYear || dayjs().year().toString());
                }
            })
            .catch(() => toast.error('Không thể tải danh sách lớp học'));
    }, []);

    useEffect(() => {
        fetchFixActivities();
    }, [selectedSchoolYear, selectedMonth, classId]);

    const groupedByDate = useMemo(() => {
        return fixedActivities.reduce((acc, item) => {
            const formattedDate = dayjs(item.date).format('YYYY-MM-DD');
            acc[formattedDate] = item;
            return acc;
        }, {} as Record<string, FixActivityResponseItem>);
    }, [fixedActivities]);

    const allDaysInMonth = useMemo(() => {
        const days: string[] = [];
        const start = dayjs().year(parseInt(selectedSchoolYear || '') || dayjs().year())
            .month(selectedMonth - 1)
            .startOf('month');
        const end = start.endOf('month');
        let current = start;
        while (current.isSame(end) || current.isBefore(end)) {
            days.push(current.format('YYYY-MM-DD'));
            current = current.add(1, 'day');
        }
        return days;
    }, [selectedSchoolYear, selectedMonth]);

    const groupedWeeks = useMemo(() => {
        const weeks: string[][] = [];
        let currentWeek: string[] = [];

        allDaysInMonth.forEach((dayStr, idx) => {
            const date = dayjs(dayStr);
            currentWeek.push(dayStr);

            // Nếu là Chủ nhật hoặc là ngày cuối tháng thì kết thúc tuần
            if (date.day() === 0 || idx === allDaysInMonth.length - 1) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        return weeks;
    }, [allDaysInMonth]);

    const currentWeekDays = groupedWeeks[weekIndex] || [];
  
    const handleCreateSchedule = async () => {
        if (!selectedSchoolYear || !selectedMonth || !classId) {
            toast.error('Vui lòng chọn đầy đủ năm học, tháng và lớp học.');
            return;
        }

        try {
            const payload: ICreateSchedulePayload = {
                schoolYear: selectedSchoolYear,
                class: classId,
                month: selectedMonth.toString(),
                scheduleDays: fixedActivities.map(day => ({
                    date: day.date,
                    dayName: day.dayName,
                    isHoliday: day.isHoliday || false,
                    notes: day.notes || '',
                    activities: day.activities.map(act => ({
                        activity: act.activity,
                        activityName: act.activityName,
                        type: act.type,
                        startTime: act.startTime,
                        endTime: act.endTime
                    }))
                }))
            };


            await scheduleApis.createSchedule(payload);
            toast.success('Tạo lịch học thành công!');
            navigate(-1);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Tạo lịch học thất bại.';
            toast.error(msg);
        }
    };

    const handleAddActivity = async (date: string) => {
        setSelectingDay(date);
        setIsFetchingActivities(true);
        try {
            const data = await scheduleApis.getAvailableActivities({
                month: selectedMonth.toString(),
                classId: classId!,
            });
            setAvailableActivities(data);
        } catch (err) {
            toast.error("Không thể tải hoạt động khả dụng.");
        } finally {
            setIsFetchingActivities(false);
        }
    };



    return (
        <div style={{ padding: 24, background: token.colorBgLayout }}>
            <Title level={3}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: 16, paddingLeft: 0 }}
                >
                    Quay lại
                </Button>
                <Space><ScheduleOutlined /> Lịch trình Cố định - Tháng {selectedMonth}</Space>
            </Title>

            <Card bordered={false} style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Text strong>Năm học</Text>
                        <Input value={selectedSchoolYear} readOnly style={{ marginTop: 8 }} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Text strong>Tháng</Text>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Chọn tháng"
                            value={selectedMonth}
                            onChange={(value) => {
                                setSelectedMonth(value);
                                setWeekIndex(0);
                            }}
                            options={Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: i + 1 }))}
                            disabled={isLoadingFix}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Text strong>Lớp học</Text>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Chọn lớp"
                            value={classId}
                            onChange={(value) => {
                                setClassId(value);
                                setWeekIndex(0);
                            }}
                            options={classOptions}
                            disabled={isLoadingFix}
                        />
                    </Col>
                </Row>
                <Row justify="end" style={{ marginTop: 24 }}>
                    <Col>
                        <Button
                            type="primary"
                            icon={<ScheduleOutlined />}
                            disabled={!selectedSchoolYear || !selectedMonth || !classId || fixedActivities.length === 0}
                            onClick={handleCreateSchedule}
                        >
                            Tạo lịch học
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                <Button
                    disabled={weekIndex === 0}
                    icon={<LeftOutlined />}
                    onClick={() => setWeekIndex(prev => Math.max(prev - 1, 0))}
                >
                    Tuần trước
                </Button>
                <Text strong>Tuần {weekIndex + 1} / {groupedWeeks.length}</Text>
                <Button
                    disabled={weekIndex === groupedWeeks.length - 1}
                    icon={<RightOutlined />}
                    onClick={() => setWeekIndex(prev => Math.min(prev + 1, groupedWeeks.length - 1))}
                >
                    Tuần sau
                </Button>
            </Flex>

            {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}

            <Spin spinning={isLoadingFix}>
                <Row gutter={[16, 16]}>
                    {currentWeekDays.map(date => {
                        const activity = groupedByDate[date];
                        const displayDay = dayjs(date).format('dddd, DD/MM');
                        return (
                            <Col key={date} xs={24} sm={12} md={6} lg={24 / 7}>
                                <Card
                                    size="small"
                                    title={
                                        <Flex justify="space-between" align="center">
                                            <Text strong style={{ fontSize: 13 }}>{displayDay}</Text>
                                            <Button type="text" icon={<PlusOutlined />} onClick={() => handleAddActivity(date)} />
                                        </Flex>
                                    }
                                    style={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: `1px solid ${token.colorBorderSecondary}`,
                                        borderRadius: 10,
                                        background: token.colorBgContainer
                                    }}
                                    bodyStyle={{ flexGrow: 1, overflowY: 'auto', padding: 12 }}
                                >
                                    {!activity || activity.activities.length === 0 ? (
                                        <Empty description="Chưa có hoạt động" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    ) : (
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            {activity.activities
                                                .sort((a, b) => a.startTime - b.startTime)
                                                .map((a: IScheduleActivity, index) => (
                                                    <Card
                                                        key={index}
                                                        size="small"
                                                        style={{
                                                            border: `1px solid ${token.colorBorder}`,
                                                            borderRadius: 8,
                                                            background: token.colorBgElevated,
                                                            boxShadow: token.boxShadowTertiary
                                                        }}
                                                        bodyStyle={{ padding: 10 }}
                                                    >
                                                        <Text strong style={{ fontSize: 13 }}>
                                                            {formatMinutesToTime(a.startTime)} - {formatMinutesToTime(a.endTime)}
                                                        </Text>
                                                        <div style={{ marginTop: 4, fontSize: 13, color: token.colorText }}>
                                                            {a.activityName}
                                                        </div>
                                                        <Tag
                                                            bordered
                                                            color="default"
                                                            style={{
                                                                fontSize: 11,
                                                                marginTop: 6,
                                                                borderRadius: 6
                                                            }}
                                                        >
                                                            {a.type}
                                                        </Tag>
                                                    </Card>
                                                ))}
                                        </Space>
                                    )}
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Spin>


        </div>
    );
};

export default ScheduleCreate;
