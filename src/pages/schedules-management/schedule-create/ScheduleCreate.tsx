import { useState, useEffect, useMemo } from 'react';
import {
    Card, Typography, Row, Col, Select, Spin, Tag, Space, Button,
    theme, Alert, Flex, Input,
    Tooltip
} from 'antd';
import {
    ScheduleOutlined, ArrowLeftOutlined,
    LeftOutlined, RightOutlined, CloseCircleOutlined, SwapOutlined, PlusOutlined
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
    const [availableActivities, setAvailableActivities] = useState<AvailableActivityItem[]>([]);
    const [isFetchingActivities, setIsFetchingActivities] = useState(false);
    const [addingToSlot, setAddingToSlot] = useState<{ date: string; startTime: number } | null>(null);
    const [selectedActivity1, setSelectedActivity1] = useState<{
        date: string;
        index: number;
    } | null>(null);

    const [selectedActivity2, setSelectedActivity2] = useState<{
        date: string;
        index: number;
    } | null>(null);


    const fetchAvailableActivities = async () => {
        if (!selectedMonth || !classId) return;

        try {
            setIsFetchingActivities(true);
            const res = await scheduleApis.getAvailableActivities({
                month: selectedMonth.toString(),
                classId: classId,
            });

            setAvailableActivities(res);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hoạt động:', error);
            toast.error('Không thể tải danh sách hoạt động.');
        } finally {
            setIsFetchingActivities(false);
        }
    };


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
        if (selectedActivity1 && selectedActivity2) {
            const updated = [...fixedActivities];
            const day1 = updated.find(d => dayjs(d.date).format('YYYY-MM-DD') === selectedActivity1.date);
            const day2 = updated.find(d => dayjs(d.date).format('YYYY-MM-DD') === selectedActivity2.date);

            if (day1 && day2) {
                const act1 = day1.activities[selectedActivity1.index];
                const act2 = day2.activities[selectedActivity2.index];

                if (act1?.type === 'Bình thường' && act2?.type === 'Bình thường') {
                    // Swap
                    day1.activities[selectedActivity1.index] = { ...act2, _justSwapped: true };
                    day2.activities[selectedActivity2.index] = { ...act1, _justSwapped: true };
                    setFixedActivities([...updated]);

                    setTimeout(() => {
                        const cleaned = [...updated];
                        const day1Clean = cleaned.find(d => dayjs(d.date).format('YYYY-MM-DD') === selectedActivity1.date);
                        const day2Clean = cleaned.find(d => dayjs(d.date).format('YYYY-MM-DD') === selectedActivity2.date);

                        if (day1Clean?.activities[selectedActivity1.index]) {
                            day1Clean.activities[selectedActivity1.index] = { ...act2 };
                        }
                        if (day2Clean?.activities[selectedActivity2.index]) {
                            day2Clean.activities[selectedActivity2.index] = { ...act1 };
                        }

                        setFixedActivities([...cleaned]);
                    }, 600);

                    toast.success('Hoán đổi tiết học thành công!');
                } else {
                    toast.warning('Chỉ có thể hoán đổi các hoạt động “Bình thường”.');
                }
            }

            setSelectedActivity1(null);
            setSelectedActivity2(null);
        }
    }, [selectedActivity1, selectedActivity2]);


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
        fetchAvailableActivities();
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


    const handleSelectActivity = (activityId: string) => {
        const selected = availableActivities.find(act => act._id === activityId);

        if (!selected || !addingToSlot) return;

        const { date, startTime } = addingToSlot;

        const targetDay = fixedActivities.find(day => dayjs(day.date).format('YYYY-MM-DD') === date);

        if (targetDay) {
            // Kiểm tra xem activityId này đã tồn tại trong mảng activities của ngày đó chưa
            const isDuplicate = targetDay.activities.some(act => act.activity === selected._id);
            if (isDuplicate) {
                toast.info('Hoạt động này đã có trong ngày.');
                setAddingToSlot(null);
                return;
            }
        }
        const newActivityData = {
            activity: selected._id,
            activityName: selected.activityName,
            activityCode: selected.activityCode,
            category: selected.category,
            eventName: selected.eventName,
            type: selected.type,
        };

        const updatedFixedActivities = fixedActivities.map(day => {
            if (dayjs(day.date).format('YYYY-MM-DD') !== date) {
                return day;
            }

            const updatedActivities = day.activities.map(slot => {
                if (slot.startTime !== startTime) {
                    return slot;
                }

                return {
                    ...slot,
                    ...newActivityData,
                    startTime: startTime,
                };
            });

            return {
                ...day,
                activities: updatedActivities,
            };
        });

        setFixedActivities(updatedFixedActivities);
        setAddingToSlot(null);
        toast.success('Đã thêm hoạt động!');
    };

    const handleRemoveActivityContent = (date: string, startTime: number) => {
        const updated = [...fixedActivities];
        const idx = updated.findIndex(d => dayjs(d.date).format('YYYY-MM-DD') === date);
        if (idx !== -1) {
            const activityIdx = updated[idx].activities.findIndex(act => act.startTime === startTime);
            if (activityIdx !== -1) {
                updated[idx].activities[activityIdx] = {
                    ...updated[idx].activities[activityIdx],
                    activity: '',
                    activityName: '',
                    // activityCode: '',
                    type: 'Bình thường',
                    // category: null,
                    // eventName: null,
                };
                setFixedActivities(updated);
            }
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
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        {activity && activity.activities
                                            .sort((a, b) => a.startTime - b.startTime)
                                            .map((a: IScheduleActivity, index) => {
                                                const isAddingToThisSlot =
                                                    addingToSlot?.date === date &&
                                                    addingToSlot?.startTime === a.startTime;

                                                const isFixed = a.type === 'Cố định';

                                                const isSelectedForSwap =
                                                    (selectedActivity1?.date === date && selectedActivity1.index === index) ||
                                                    (selectedActivity2?.date === date && selectedActivity2.index === index);

                                                if (isAddingToThisSlot) {
                                                    return (
                                                        <Card
                                                            key={`select-${a.startTime}-${index}`}
                                                            size="small"
                                                            style={{
                                                                border: `1px dashed ${token.colorBorderSecondary}`,
                                                                borderRadius: 8,
                                                                background: token.colorBgContainer,
                                                                minHeight: 76,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            }}
                                                            bodyStyle={{ padding: 10 }}
                                                        >
                                                            <Select
                                                                style={{ width: '100%' }}
                                                                size="large"
                                                                placeholder="Chọn hoạt động"
                                                                loading={isFetchingActivities}
                                                                onChange={(value) => handleSelectActivity(value)}
                                                                options={availableActivities.map((act) => {
                                                                    const eventInfo = act.type === 'Sự kiện' && act.eventName ? ` (${act.eventName})` : '';
                                                                    const label = `${act.activityName}${eventInfo} - [${act.type}]`;
                                                                    return { label, value: act._id };
                                                                })}
                                                                onBlur={() => setAddingToSlot(null)}
                                                                autoFocus
                                                            />
                                                        </Card>
                                                    );
                                                }

                                                return (
                                                    <Card
                                                        key={`card-${a.startTime}-${index}`}
                                                        size="small"
                                                        style={{
                                                            border: isSelectedForSwap
                                                                ? `2px solid ${token.colorPrimary}`
                                                                : isFixed
                                                                    ? `1px solid ${token.colorBorder}`
                                                                    : `1px dashed ${token.colorPrimary}`,
                                                            borderRadius: 8,
                                                            background: isFixed
                                                                ? token.colorBgContainerDisabled
                                                                : token.colorBgElevated,
                                                            minHeight: 76,
                                                            position: 'relative',
                                                            transition: 'all 0.2s',
                                                        }}
                                                        bodyStyle={{ padding: 10 }}
                                                        onClick={() => {
                                                            if (!isFixed) {
                                                                fetchAvailableActivities();
                                                                setAddingToSlot({ date: date, startTime: a.startTime });
                                                            }
                                                        }}
                                                    >
                                                        <Text strong style={{ fontSize: 13 }}>
                                                            {formatMinutesToTime(a.startTime)} - {formatMinutesToTime(a.endTime)}
                                                        </Text>

                                                        <div
                                                            style={{
                                                                marginTop: 4,
                                                                fontSize: 13,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                color: a.activityName ? token.colorText : token.colorTextSecondary,
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    flex: 1,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                {a.activityName || 'Click để thêm hoạt động'}
                                                            </span>

                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 6,
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {a.activityName && (
                                                                    <Tag
                                                                        bordered
                                                                        color={a.type === 'Cố định' ? 'default' : 'blue'}
                                                                        style={{
                                                                            fontSize: 11,
                                                                            borderRadius: 6,
                                                                            flexShrink: 0,
                                                                            margin: 0,
                                                                        }}
                                                                    >
                                                                        {a.type}
                                                                    </Tag>
                                                                )}

                                                                {/* Icon Swap chỉ hiện nếu là “Bình thường” */}
                                                                {a.type === 'Bình thường' && (
                                                                    <Tooltip
                                                                        title={
                                                                            isSelectedForSwap
                                                                                ? 'Đã chọn để hoán đổi'
                                                                                : 'Chọn hoạt động này để hoán đổi'
                                                                        }
                                                                    >
                                                                        <SwapOutlined
                                                                            style={{
                                                                                color: isSelectedForSwap
                                                                                    ? token.colorPrimary
                                                                                    : token.colorTextSecondary,
                                                                                cursor: 'pointer',
                                                                                fontSize: 15,
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const selected = { date, index };
                                                                                if (!selectedActivity1) {
                                                                                    setSelectedActivity1(selected);
                                                                                } else if (!selectedActivity2) {
                                                                                    setSelectedActivity2(selected);
                                                                                } else {
                                                                                    setSelectedActivity1(selected);
                                                                                    setSelectedActivity2(null);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </Tooltip>
                                                                )}

                                                                {a.type !== 'Cố định' && a.activityName && (
                                                                    <Tooltip title="Xóa hoạt động này">
                                                                        <CloseCircleOutlined
                                                                            style={{
                                                                                color: token.colorError,
                                                                                cursor: 'pointer',
                                                                                fontSize: 14,
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRemoveActivityContent(date, a.startTime);
                                                                            }}
                                                                        />
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}

                                        {(!activity || activity.activities.length === 0) && (
                                            <div
                                                onClick={() => {
                                                    fetchAvailableActivities();
                                                    setAddingToSlot({ date: date, startTime: 0 });
                                                }}
                                                style={{
                                                    border: `1px dashed ${token.colorBorderSecondary}`,
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    minHeight: 76,
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    color: token.colorTextSecondary,
                                                }}
                                            >
                                                <PlusOutlined /> Thêm hoạt động
                                            </div>
                                        )}
                                    </Space>
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