import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Card, Typography, Row, Col, Select, Spin, Tag, Space, Button,
    theme, Alert, Flex, Input,
    Tooltip,
    Popover,
    List
} from 'antd';
import {
    ScheduleOutlined, ArrowLeftOutlined,
    LeftOutlined, RightOutlined, CloseCircleOutlined, PlusOutlined,
    CheckCircleOutlined
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

import './ScheduleCreate.css';
import { usePageTitle } from '../../../hooks/usePageTitle';

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
    usePageTitle('Tạo lịch học - Cá Heo Xanh');
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
    const [selectedActivity1, setSelectedActivity1] = useState<{
        date: string;
        index: number;
    } | null>(null);

    const [selectedActivity2, setSelectedActivity2] = useState<{
        date: string;
        index: number;
    } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef<number>(0);
    const scrollLeftStart = useRef<number>(0);
    const [popoverSlot, setPopoverSlot] = useState<{ date: string; startTime: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeftStart.current = scrollRef.current.scrollLeft;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = x - dragStartX.current;
        scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    };

    const stopDragging = () => {
        setIsDragging(false);
    };

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
            typeof error === "string" ? toast.info(error) : toast.error('Không thể tải danh sách hoạt động.');
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
            typeof error === "string" ? toast.info(error) : toast.error('Không thể tải hoạt động cố định.');
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
                    day1.activities[selectedActivity1.index] = {
                        ...day1.activities[selectedActivity1.index],
                        activity: act2.activity,
                        activityName: act2.activityName,
                        type: act2.type,
                    };

                    day2.activities[selectedActivity2.index] = {
                        ...day2.activities[selectedActivity2.index],
                        activity: act1.activity,
                        activityName: act1.activityName,
                        type: act1.type,
                    };

                    setFixedActivities([...updated]);
                    toast.success('Hoán đổi tiết học thành công!');
                } else {
                    toast.warning('Chỉ có thể hoán đổi các hoạt động “Bình thường”.');
                }
            }
            setSelectedActivity1(null);
            setSelectedActivity2(null);
        }
    }, [selectedActivity1, selectedActivity2, fixedActivities]);


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
        if (selectedSchoolYear && selectedMonth && classId) {
            fetchFixActivities();
            fetchAvailableActivities();
        } else {
            setFixedActivities([]);
            setAvailableActivities([]);
        }
    }, [selectedSchoolYear, selectedMonth, classId]);

    const groupedByDate = useMemo(() => {
        return fixedActivities.reduce((acc, item) => {
            const formattedDate = dayjs(item.date).format('YYYY-MM-DD');
            acc[formattedDate] = item;
            return acc;
        }, {} as Record<string, FixActivityResponseItem>);
    }, [fixedActivities]);

    const allDaysInMonth = useMemo(() => {
        if (!selectedSchoolYear || !selectedMonth) return [];
        const days: string[] = [];
        const start = dayjs().year(parseInt(selectedSchoolYear) || dayjs().year())
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
            const msg = error?.response?.data?.message || `Lịch học tháng này của lớp này đã được tạo`;
            typeof error === "string" ? toast.info(error) : toast.error(msg);
        }
    };

    const handleSelectActivity = (activityId: string) => {
        const selected = availableActivities.find(act => act._id === activityId);
        if (!selected || !popoverSlot) return;
        const { date, startTime } = popoverSlot;
        const targetDay = fixedActivities.find(day => dayjs(day.date).format('YYYY-MM-DD') === date);

        if (targetDay) {
            const isDuplicate = targetDay.activities.some(act => act.activity === selected._id && act.startTime !== startTime);
            if (isDuplicate) {
                toast.info('Hoạt động này đã có trong ngày.');
                setPopoverSlot(null);
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
                };
            });
            return {
                ...day,
                activities: updatedActivities,
            };
        });
        setFixedActivities(updatedFixedActivities);
        setPopoverSlot(null);
        toast.success('Đã thêm hoạt động!');
    };

    const handleRemoveActivityContent = (date: string, startTime: number) => {
        const day = fixedActivities.find(d => dayjs(d.date).format('YYYY-MM-DD') === date);
        if (!day) return;

        const target = day.activities.find(act => act.startTime === startTime);
        if (!target) return;
        if (!target.activity && !target.activityName) {
            toast.info("Bạn chưa thêm hoạt động nào để xóa !!");
            return;
        }

        setFixedActivities(prev => {
            const updated = [...prev];
            const dayIndex = updated.findIndex(d => dayjs(d.date).format('YYYY-MM-DD') === date);
            if (dayIndex === -1) return prev;

            const activityIndex = updated[dayIndex].activities.findIndex(act => act.startTime === startTime);
            if (activityIndex === -1) return prev;

            updated[dayIndex].activities[activityIndex] = {
                ...updated[dayIndex].activities[activityIndex],
                activity: '',
                activityName: '',
                type: null,
            };

            return updated;
        });

        toast.success("Đã xóa hoạt động thành công!");
    };

    return (
        <div className="schedule-create-page" style={{ background: token.colorBgLayout }}>
            <Title level={3}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="schedule-create-back-button"
                >
                    Quay lại
                </Button>
                <Space><ScheduleOutlined /> Tạo Lịch trình Tháng {selectedMonth}</Space>
            </Title>

            <Card bordered={false} className="schedule-create-filter-card">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Text strong className="schedule-create-filter-label">Năm học</Text>
                        <Input value={selectedSchoolYear} readOnly className="schedule-create-filter-input" />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Text strong className="schedule-create-filter-label">Tháng</Text>
                        <Select
                            className="schedule-create-filter-input"
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
                        <Text strong className="schedule-create-filter-label">Lớp học</Text>
                        <Select
                            className="schedule-create-filter-input"
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
                <Row justify="end" className="schedule-create-action-row">
                    <Col>
                        <Button
                            type="primary"
                            icon={<ScheduleOutlined />}
                            disabled={!selectedSchoolYear || !selectedMonth || !classId || fixedActivities.length === 0 || isLoadingFix}
                            onClick={handleCreateSchedule}
                            loading={isLoadingFix}
                        >
                            Tạo lịch học
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Flex justify="space-between" align="center" className="schedule-create-week-nav">
                <Button
                    disabled={weekIndex === 0 || isLoadingFix}
                    icon={<LeftOutlined />}
                    onClick={() => setWeekIndex(prev => Math.max(prev - 1, 0))}
                >
                    Tuần trước
                </Button>
                {groupedWeeks.length > 0 && <Text strong>Tuần {weekIndex + 1} / {groupedWeeks.length}</Text>}
                <Button
                    disabled={weekIndex === groupedWeeks.length - 1 || isLoadingFix}
                    icon={<RightOutlined />}
                    onClick={() => setWeekIndex(prev => Math.min(prev + 1, groupedWeeks.length - 1))}
                >
                    Tuần sau
                </Button>
            </Flex>

            {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
            <Spin spinning={isLoadingFix && fixedActivities.length === 0}> {/* Show spinner only when loading initial data */}
                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDragging}
                    onMouseLeave={stopDragging}
                    className="schedule-create-scroll-container"
                    style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: isDragging ? 'none' : 'auto',
                    }}
                >
                    <div className="schedule-create-days-row">
                        {currentWeekDays.map(date => {
                            const activityData = groupedByDate[date];
                            const displayDay = dayjs(date).format('dddd, DD/MM');
                            const dayIsHoliday = activityData?.isHoliday;

                            return (
                                <div key={date} className="schedule-create-day-column">
                                    <Card
                                        size="small"
                                        title={<Text>{displayDay}</Text>}
                                        className="schedule-create-day-card"
                                        headStyle={{
                                            ...(dayIsHoliday ? {
                                                backgroundColor: '#fff1f0',
                                                color: '#cf1322',
                                                borderBottomColor: '#ffccc7'
                                            } : {})
                                        }}
                                        bodyStyle={{
                                            ...(dayIsHoliday ? { backgroundColor: '#fff1f0' } : {})
                                        }}
                                    >
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            {dayIsHoliday ? (
                                                <Tag color="red">
                                                    Ngày nghỉ lễ {activityData.notes ? `- ${activityData.notes}` : ''}
                                                </Tag>
                                            ) : activityData && activityData.activities.length > 0 ? (
                                                activityData.activities
                                                    .sort((a, b) => a.startTime - b.startTime)
                                                    .map((a: IScheduleActivity, index) => {
                                                        const isFixed = a.type === 'Cố định';
                                                        const isSelectedForSwap =
                                                            (selectedActivity1?.date === date && selectedActivity1.index === index) ||
                                                            (selectedActivity2?.date === date && selectedActivity2.index === index);

                                                        return (
                                                            <Card
                                                                key={`card-${a.startTime}-${index}`}
                                                                size="small"
                                                                className={`schedule-create-activity-card ${!isFixed ? 'schedule-create-activity-display-card' : ''}`}
                                                                style={{
                                                                    border: isSelectedForSwap
                                                                        ? `2px solid ${token.colorPrimary}`
                                                                        : isFixed
                                                                            ? `1px solid ${token.colorBorder}`
                                                                            : `1px solid ${token.colorBorderSecondary}`,
                                                                    background: isFixed
                                                                        ? token.colorBgContainerDisabled
                                                                        : isSelectedForSwap
                                                                            ? token.colorInfoBg
                                                                            : token.colorBgElevated,
                                                                    cursor: isFixed ? 'not-allowed' : 'default'
                                                                }}
                                                                bodyStyle={{ padding: 10 }}
                                                            >
                                                                <Text className="schedule-create-activity-time">
                                                                    {formatMinutesToTime(a.startTime)} - {formatMinutesToTime(a.endTime)}
                                                                </Text>

                                                                <div className="schedule-create-activity-content">
                                                                    {a.activityName || a.activity ? (
                                                                        <>
                                                                            <span
                                                                                className="schedule-create-activity-name"
                                                                                style={{
                                                                                    color: token.colorText,
                                                                                    fontStyle: 'normal',
                                                                                }}
                                                                            >
                                                                                {a.activityName || '(Hoạt động không tên)'}
                                                                            </span>

                                                                            <div className="schedule-create-activity-controls">
                                                                                {a.type && (
                                                                                    <Tag
                                                                                        bordered
                                                                                        className="schedule-create-activity-tag"
                                                                                        color={
                                                                                            a.type === 'Cố định' ? 'default'
                                                                                                : a.type === 'Sự kiện' ? 'purple'
                                                                                                    : a.type === 'Bình thường' ? 'blue'
                                                                                                        : 'default'
                                                                                        }
                                                                                    >
                                                                                        {a.type}
                                                                                    </Tag>
                                                                                )}

                                                                                {!isFixed && (
                                                                                    <Tooltip title="Xóa hoạt động này">
                                                                                        <CloseCircleOutlined
                                                                                            className="schedule-create-activity-delete-icon"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleRemoveActivityContent(date, a.startTime);
                                                                                            }}
                                                                                        />
                                                                                    </Tooltip>
                                                                                )}
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Popover
                                                                                open={popoverSlot?.date === date && popoverSlot?.startTime === a.startTime}
                                                                                onOpenChange={(visible) => { if (!visible) setPopoverSlot(null); }}
                                                                                placement="bottomLeft"
                                                                                arrow={false}
                                                                                content={
                                                                                    <List
                                                                                        className="schedule-create-popover-list"
                                                                                        size="small"
                                                                                        loading={isFetchingActivities}
                                                                                        dataSource={availableActivities}
                                                                                        renderItem={(item) => (
                                                                                            <List.Item
                                                                                                key={item._id}
                                                                                                onClick={() => {
                                                                                                    handleSelectActivity(item._id);
                                                                                                }}
                                                                                                style={{ cursor: 'pointer' }}
                                                                                            >
                                                                                                <div>
                                                                                                    <strong>{item.activityName}</strong>
                                                                                                    {item.type === 'Sự kiện' && item.eventName ? ` (${item.eventName})` : ''} - [{item.type}]
                                                                                                </div>
                                                                                            </List.Item>
                                                                                        )}
                                                                                        locale={{ emptyText: 'Không có hoạt động phù hợp' }}
                                                                                    />
                                                                                }
                                                                            >
                                                                                <Button
                                                                                    size="small"
                                                                                    icon={<PlusOutlined />}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const currentSlot = { date: date, startTime: a.startTime };
                                                                                        const isOpen = popoverSlot?.date === currentSlot.date && popoverSlot?.startTime === currentSlot.startTime;
                                                                                        if (isOpen) {
                                                                                            setPopoverSlot(null);
                                                                                        } else {
                                                                                            fetchAvailableActivities();
                                                                                            setPopoverSlot(currentSlot);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    Thêm
                                                                                </Button>
                                                                            </Popover>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                {a.type === 'Bình thường' && (
                                                                    <Tooltip
                                                                        title={
                                                                            isSelectedForSwap
                                                                                ? 'Bỏ chọn'
                                                                                : selectedActivity1
                                                                                    ? 'Chọn hoạt động thứ 2 để hoán đổi'
                                                                                    : 'Chọn hoạt động đầu tiên để hoán đổi'
                                                                        }
                                                                    >
                                                                        <CheckCircleOutlined
                                                                            className="schedule-create-activity-swap-icon"
                                                                            style={{
                                                                                color: isSelectedForSwap ? token.colorPrimaryActive : token.colorTextQuaternary,
                                                                                right: !isFixed && (a.activityName || a.activity) ? 26 : 6,
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const selected = { date, index };
                                                                                if (isSelectedForSwap) {
                                                                                    if (selectedActivity1?.date === date && selectedActivity1.index === index) setSelectedActivity1(null);
                                                                                    if (selectedActivity2?.date === date && selectedActivity2.index === index) setSelectedActivity2(null);
                                                                                } else if (!selectedActivity1) {
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
                                                            </Card>
                                                        );
                                                    })
                                            ) : (
                                                <div
                                                    style={{
                                                        border: `1px dashed ${token.colorBorderSecondary}`,
                                                        borderRadius: token.borderRadiusLG,
                                                        padding: 12,
                                                        minHeight: 76,
                                                        textAlign: 'center',
                                                        cursor: 'not-allowed',
                                                        color: token.colorTextDisabled,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: token.colorBgContainerDisabled
                                                    }}
                                                >
                                                    (Không có khung giờ)
                                                </div>
                                            )}
                                        </Space>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Spin>
        </div>
    );
};

export default ScheduleCreate;