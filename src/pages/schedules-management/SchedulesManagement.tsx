import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
    Card, Typography, Row, Col, Select, Spin, Tag, Space, Button, Empty,
    Tooltip,
    Popconfirm,
    List,
    Popover,
    Modal
} from 'antd';
import {
    ScheduleOutlined, PlusOutlined, LeftOutlined, RightOutlined, BulbOutlined,
    EditOutlined, CloseCircleOutlined, SaveOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { IDailySchedule, TScheduleDetailResponse, ICreateSchedulePayload, IClassBySchoolYearItem, AvailableActivityItem } from '../../types/timetable';
import { scheduleApis } from '../../services/apiServices';
import { useNavigate, useParams } from 'react-router-dom';
import { constants } from '../../constants';
import { toast } from 'react-toastify';

import './SchedulesManagement.css';
import { usePageTitle } from '../../hooks/usePageTitle';

dayjs.locale('vi');
dayjs.extend(weekOfYear);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const formatMinutesToTime = (minutes?: number | null): string => {
    if (minutes == null || isNaN(minutes)) return '--:--';
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1, label: `Tháng ${i + 1}`
}));

const groupDaysByWeek = (days: TScheduleDetailResponse, year: number, month: number) => {
    const weeksMap = new Map<number, IDailySchedule[]>();
    const first = dayjs().year(year).month(month - 1).startOf('month');
    const last = dayjs().year(year).month(month - 1).endOf('month');
    const map = new Map(days.map(d => [dayjs(d.date).format('YYYY-MM-DD'), d]));

    let day = first;
    while (day.isBefore(last) || day.isSame(last, 'day')) {
        const w = day.week();
        if (!weeksMap.has(w)) weeksMap.set(w, []);
        const d = map.get(day.format('YYYY-MM-DD'));
        weeksMap.get(w)?.push(d || {
            date: day.toISOString(),
            dayName: day.format('dddd'),
            schoolYear: {} as any,
            class: {} as any,
            isHoliday: false,
            notes: '',
            activities: [],
            status: 'Dự thảo'
        });
        day = day.add(1, 'day');
    }

    return Array.from(weeksMap.entries())
        .map(([week, days]) => ({ week, days }))
        .sort((a, b) => dayjs(a.days[0].date).valueOf() - dayjs(b.days[0].date).valueOf());
};

function SchedulesManagement() {
    usePageTitle('Lịch học biểu - Cá Heo Xanh');
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [classes, setClasses] = useState<IClassBySchoolYearItem[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>();
    const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
    const [scheduleData, setScheduleData] = useState<TScheduleDetailResponse>([]);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const currentSchoolYear = dayjs().year().toString();
    const [scheduleStatus, setScheduleStatus] = useState<'Dự thảo' | 'Xác nhận' | null>(null);
    const [scheduleId, setScheduleId] = useState<string | null>(null)
    const [editMode, setEditMode] = useState(false);
    const [hasEditedAfterPreview, setHasEditedAfterPreview] = useState(false);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>('');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalScheduleData, setOriginalScheduleData] = useState<TScheduleDetailResponse>([]);
    const currentYear = dayjs().year();
    const scrollRef = useRef<HTMLDivElement>(null);
    const dragStateRef = useRef({ isDragging: false, startX: 0, scrollLeftStart: 0 });
    const [isPreview, setIsPreview] = useState(false);
    const [availableActivities, setAvailableActivities] = useState<AvailableActivityItem[]>([]);
    const [popoverSlot, setPopoverSlot] = useState<null | { date: string; startTime: number }>(null);
    const [isFetchingActivities, setIsFetchingActivities] = useState(false);
    const [selectedActivity1, setSelectedActivity1] = useState<{
        date: string;
        index: number;
    } | null>(null);

    const [selectedActivity2, setSelectedActivity2] = useState<{
        date: string;
        index: number;
    } | null>(null);


    const handleActivityClick = (date: string, index: number) => {
        if (!editMode) return;

        if (!selectedActivity1) {
            setSelectedActivity1({ date, index });
        } else if (!selectedActivity2) {
            setSelectedActivity2({ date, index });
        }
    };
    const handleExitPreview = () => {
        fetchScheduleData();
        toast.info("Đã thoát chế độ xem gợi ý.");
    };

    useEffect(() => {
        if (selectedActivity1 && selectedActivity2) {
            const updated = [...scheduleData];
            const day1 = updated.find(d => d.date === selectedActivity1.date);
            const day2 = updated.find(d => d.date === selectedActivity2.date);

            if (day1 && day2) {
                const slot1 = day1.activities[selectedActivity1.index];
                const slot2 = day2.activities[selectedActivity2.index];

                if (slot1?.type === 'Bình thường' && slot2?.type === 'Bình thường') {
                    const newSlot1 = {
                        ...slot1,
                        activity: slot2.activity,
                        activityName: slot2.activityName,
                        type: slot2.type,
                        category: slot2.category || null,
                        eventName: slot2.eventName || null,
                        _justSwapped: true,
                    };

                    const newSlot2 = {
                        ...slot2,
                        activity: slot1.activity,
                        activityName: slot1.activityName,
                        type: slot1.type,
                        category: slot1.category || null,
                        eventName: slot1.eventName || null,
                        _justSwapped: true,
                    };

                    day1.activities[selectedActivity1.index] = newSlot1;
                    day2.activities[selectedActivity2.index] = newSlot2;

                    setScheduleData([...updated]);

                    setTimeout(() => {
                        const cleaned = [...updated];
                        const d1 = cleaned.find(d => d.date === selectedActivity1.date);
                        const d2 = cleaned.find(d => d.date === selectedActivity2.date);
                        if (d1) {
                            (d1.activities[selectedActivity1.index] as any)._justSwapped = false;
                        }
                        if (d2) {
                            (d2.activities[selectedActivity2.index] as any)._justSwapped = false;
                        }
                        setScheduleData([...cleaned]);
                    }, 600); // 600ms

                    toast.success('Hoán đổi tiết học thành công!');
                } else {
                    toast.warning('Chỉ có thể hoán đổi các hoạt động “Bình thường”.');
                }
            }

            setSelectedActivity1(null);
            setSelectedActivity2(null);
        }
    }, [selectedActivity1, selectedActivity2, scheduleData]);


    const handleDeleteActivity = (date: string, index: number) => {
        const day = scheduleData.find(d => d.date === date);
        if (!day) return;
        const target = day.activities[index];

        if (!target.activity && !target.activityName) {
            toast.info("Bạn chưa thêm hoạt động nào để xóa !!");
            return;
        }

        setScheduleData((prev) => {
            const updated = [...prev];
            const dayToUpdate = updated.find(d => d.date === date);
            if (!dayToUpdate) return prev;

            const activities = [...dayToUpdate.activities];
            activities[index] = {
                ...activities[index],
                activity: null,
                activityName: '',
                activityCode: undefined,
                type: null,
                category: null,
                eventName: null
            };

            dayToUpdate.activities = activities;
            return updated;
        });
        toast.success("Đã xóa hoạt động thành công!");
    };

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const container = scrollRef.current;
        if (!container) return;
        e.preventDefault();
        dragStateRef.current = {
            isDragging: true,
            startX: e.clientX,
            scrollLeftStart: container.scrollLeft
        };
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none';
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragStateRef.current.isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.clientX;
        const walk = x - dragStateRef.current.startX;
        scrollRef.current.scrollLeft = dragStateRef.current.scrollLeftStart - walk;
    }, []);

    const stopDragging = useCallback(() => {
        const container = scrollRef.current;
        if (container) {
            container.style.cursor = 'grab';
            container.style.userSelect = 'auto';
        }
        dragStateRef.current.isDragging = false;
    }, []);

    const fetchClassList = useCallback(async () => {
        try {
            const res = await scheduleApis.getClassListByActiveSchoolYear();
            setClasses(res);
            if (!id) {
                setSelectedClassId(res?.[0]?._id);
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải lớp học")
            setClasses([]);
        }
    }, [id]);


    useEffect(() => {
        fetchClassList();
    }, [fetchClassList]);

    useEffect(() => {
        if (editMode) {
            setHasUnsavedChanges(true);
        }
    }, [scheduleData]);


    const fetchScheduleData = useCallback(async () => {
        if (!selectedClassId || !selectedMonth) return;

        setLoading(true);
        setScheduleStatus(null);
        setScheduleData([]);
        setEditMode(false);
        setIsPreview(false);

        try {
            const res = await scheduleApis.getScheduleParams({
                schoolYear: currentSchoolYear,
                class: selectedClassId,
                month: selectedMonth,
            });

            if (res && Array.isArray(res.scheduleDays)) {
                setScheduleData(res.scheduleDays);
                setScheduleStatus(res.status || 'Dự thảo');

                if (res._id) {
                    setScheduleId(res._id);
                }
            } else {
                setScheduleData([]);
                setScheduleStatus(null);
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải lịch học")
            setScheduleData([]);
            setScheduleStatus(null);
        } finally {
            setLoading(false);
        }
    }, [currentSchoolYear, selectedClassId, selectedMonth]);

    const fetchAvailableActivities = async () => {
        if (!selectedMonth || !selectedClassId) return;

        try {
            setIsFetchingActivities(true);
            const res = await scheduleApis.getAvailableActivities({
                month: selectedMonth.toString(),
                classId: selectedClassId,
            });

            setAvailableActivities(res);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Không thể tải danh sách hoạt động');
            setAvailableActivities([]);
        } finally {
            setIsFetchingActivities(false);
        }
    };
    const handleSelectActivity = (activityId: string) => {
        if (!popoverSlot) return;

        const { date, startTime } = popoverSlot;
        const selected = availableActivities.find(act => act._id === activityId);
        if (!selected) return;

        const updated = [...scheduleData];
        const day = updated.find(d => d.date === date);
        if (!day) return;

        const slotIdx = day.activities.findIndex(act => act.startTime === startTime);
        if (slotIdx !== -1) {
            day.activities[slotIdx] = {
                ...day.activities[slotIdx],
                activity: selected._id,
                activityName: selected.activityName,
                activityCode: selected.activityCode,
                category: selected.category,
                eventName: selected.eventName,
                type: selected.type,
            };
        }

        setScheduleData(updated);
        setPopoverSlot(null);
        toast.success('Đã thêm hoạt động!');
    };




    useEffect(() => {
        if (selectedClassId && selectedMonth && !id) {
            fetchScheduleData();
        }
    }, [selectedClassId, selectedMonth, fetchScheduleData, id]);

    useEffect(() => {
        if (scheduleStatus === 'Xác nhận') {
            setEditMode(false);
        }
    }, [scheduleStatus]);

    const handleFetchSuggestion = async () => {
        if (!selectedClassId || !selectedMonth) {
            toast.warning('Vui lòng chọn Lớp và Tháng trước khi gợi ý lịch học.');
            return;
        }

        const year = currentSchoolYear;
        setLoading(true);
        setScheduleData([]);
        setScheduleStatus(null);

        try {
            const res = await scheduleApis.getPreviewSchedule({
                year,
                month: selectedMonth.toString(),
                classId: selectedClassId,
            });

            if (res && Array.isArray(res.schedule?.scheduleDays) && res.schedule.scheduleDays.length > 0) {
                setScheduleData(res.schedule.scheduleDays);
                setIsPreview(true);
                // setEditMode(true);
                setScheduleStatus('Dự thảo');
                toast.success('Đã tải gợi ý lịch học thành công!');
            } else {
                toast.info('Không có dữ liệu gợi ý lịch học.');
                setScheduleData([]);
                setScheduleStatus(null);
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Không thể tải gợi ý lịch học. Vui lòng thử lại.');
            setScheduleData([]);
            setScheduleStatus(null);
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateSchedule = async () => {
        if (!scheduleId) {
            toast.error('Không xác định được ID lịch học để cập nhật.');
            return;
        }

        if (!selectedClassId || !selectedMonth) {
            toast.error('Thiếu thông tin Lớp hoặc Tháng.');
            return;
        }

        const payload: ICreateSchedulePayload = {
            schoolYear: currentSchoolYear,
            class: selectedClassId,
            month: selectedMonth.toString(),
            scheduleDays: scheduleData
        };

        setIsSaving(true);
        try {
            await scheduleApis.updateSchedule(scheduleId, payload);
            toast.success('Cập nhật lịch học thành công!');
            setEditMode(false);
            fetchScheduleData();
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Cập nhật lịch học thất bại. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };


    const handleConfirmSchedule = async () => {
        if (!scheduleId) {
            toast.error('Không xác định được ID lịch học để xác nhận.');
            return;
        }

        setIsSaving(true);
        try {
            await scheduleApis.confirmSchedule(scheduleId);
            toast.success('Lịch học đã được xác nhận!');
            fetchScheduleData();
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Xác nhận lịch học thất bại. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateSchedule = async () => {
        if (!selectedClassId || !selectedMonth) {
            toast.error('Thiếu thông tin Lớp hoặc Tháng.');
            return;
        }

        const payload: ICreateSchedulePayload = {
            schoolYear: currentSchoolYear,
            class: selectedClassId,
            month: selectedMonth.toString(),
            scheduleDays: scheduleData
        };

        setIsSaving(true);
        try {
            await scheduleApis.createSchedule(payload);
            toast.success('Tạo lịch học thành công!');
            fetchScheduleData();
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Tạo lịch học thất bại. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
            setIsPreview(false);
        }
    };

    const handleSaveTemporarySchedule = () => {
        const snapshot = JSON.stringify(scheduleData);
        setIsAutoSaving(true);

        setTimeout(() => {
            setOriginalScheduleData(JSON.parse(snapshot));
            setLastSavedSnapshot(snapshot);
            setHasUnsavedChanges(false);
            setIsAutoSaving(false);
            setJustSaved(true);

            setTimeout(() => setJustSaved(false), 1500);
        }, 300);
    };


    useEffect(() => {
        if (!isPreview || !editMode) return;

        const currentSnapshot = JSON.stringify(scheduleData);
        if (currentSnapshot === lastSavedSnapshot) return;

        setHasUnsavedChanges(true);

        // Clear previous timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new auto-save timer
        autoSaveTimerRef.current = setTimeout(() => {
            handleSaveTemporarySchedule();
        }, 3000); // ⏱️ Auto-save sau 3 giây không thay đổi
    }, [scheduleData, isPreview, editMode]);




    const weeklyGroupedDays = useMemo(() => {
        if (!scheduleData.length) return [];
        return groupDaysByWeek(scheduleData, currentYear, selectedMonth);
    }, [scheduleData, currentYear, selectedMonth]);

    useEffect(() => {
        setCurrentWeekIndex(0);
    }, [selectedClassId, selectedMonth]);

    const currentWeek = weeklyGroupedDays?.[currentWeekIndex];

    let weekHeader = '';
    if (currentWeek) {
        const first = dayjs(currentWeek.days[0].date);
        const last = dayjs(currentWeek.days[currentWeek.days.length - 1].date);
        const weekOfMonth = first.week() - first.startOf('month').week() + 1;
        weekHeader = `Tuần ${weekOfMonth} (${first.format('DD/MM')} - ${last.format('DD/MM')})`;
    }

    return (
        <div className="schedule-management-page">
            <Card bordered={false}>
                <Row justify="space-between" align="middle" className="schedule-header-row">
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            <Space>
                                <ScheduleOutlined />
                                {id ? 'Chỉnh sửa Lịch trình Tháng' : 'Quản lý Lịch trình Tháng'}
                                <Text type="secondary">(Năm {currentSchoolYear})</Text>
                                {scheduleStatus === 'Xác nhận' && <Tag color="success">ĐÃ XÁC NHẬN</Tag>}
                                {scheduleStatus === 'Dự thảo' && <Tag color="blue">DỰ THẢO</Tag>}
                            </Space>
                        </Title>
                    </Col>
                    <Col>
                        <Space wrap>
                            <Select
                                style={{ width: 150 }}
                                placeholder="Chọn lớp"
                                value={selectedClassId}
                                onChange={setSelectedClassId}
                                disabled={loading || !!id}
                            >
                                {classes.map(cls => (
                                    <Option key={cls._id} value={cls._id}>{cls.className}</Option>
                                ))}
                            </Select>
                            <Select
                                style={{ width: 120 }} // Giữ lại
                                placeholder="Chọn tháng"
                                value={selectedMonth}
                                onChange={setSelectedMonth}
                                options={monthOptions}
                                disabled={loading || !!id}
                            />
                            {!scheduleStatus && !id && (
                                <>
                                    <Button icon={<BulbOutlined />} onClick={handleFetchSuggestion}>
                                        Gợi ý lịch học
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => navigate(`${constants.APP_PREFIX}/schedules/create`)}
                                    >
                                        Tạo lịch học
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Col>
                </Row>

                <Spin spinning={loading || isSaving}>
                    {!loading && weeklyGroupedDays.length > 0 && currentWeek && (
                        <>
                            <Row justify="space-between" align="middle" className="week-navigation-row">
                                <Col>
                                    <Button
                                        icon={<LeftOutlined />}
                                        onClick={() => setCurrentWeekIndex(i => i - 1)}
                                        disabled={currentWeekIndex === 0}
                                    >
                                        Tuần trước
                                    </Button>
                                </Col>
                                <Col>
                                    <Title level={4} style={{ margin: 0 }}>{weekHeader}</Title>
                                </Col>
                                <Col>
                                    <Button
                                        icon={<RightOutlined />}
                                        onClick={() => setCurrentWeekIndex(i => i + 1)}
                                        disabled={currentWeekIndex === weeklyGroupedDays.length - 1}
                                    >
                                        Tuần sau
                                    </Button>
                                </Col>
                            </Row>

                            <Row className="schedule-action-buttons">
                                {isPreview && (
                                    <>
                                        {!hasEditedAfterPreview ? (
                                            // Gợi ý xong, chưa bấm chỉnh sửa → hiện đủ 3 nút
                                            <>
                                                <Button
                                                    icon={<CloseCircleOutlined />}
                                                    onClick={handleExitPreview}
                                                    disabled={isSaving || loading}
                                                >
                                                    Thoát gợi ý
                                                </Button>

                                                <Button
                                                    icon={<EditOutlined />}
                                                    onClick={() => {
                                                        setOriginalScheduleData(JSON.parse(JSON.stringify(scheduleData)));
                                                        setEditMode(true);
                                                        setHasEditedAfterPreview(true);
                                                        setHasUnsavedChanges(false);
                                                    }}
                                                    type="primary"
                                                >
                                                    Chỉnh sửa lịch
                                                </Button>

                                                <Button
                                                    type="primary"
                                                    icon={<SaveOutlined />}
                                                    onClick={handleCreateSchedule}
                                                    loading={isSaving}
                                                    disabled={!scheduleData.length}
                                                >
                                                    Tạo lịch học
                                                </Button>
                                            </>
                                        ) : (
                                            <> <Button
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => {
                                                    if (hasUnsavedChanges) {
                                                        setIsConfirmVisible(true);
                                                    } else {
                                                        setEditMode(false);
                                                        setHasEditedAfterPreview(false);
                                                    }
                                                }}
                                            >
                                                Thoát chỉnh sửa
                                            </Button>
                                            </>
                                        )}
                                    </>
                                )}

                                {!isPreview && scheduleStatus === 'Dự thảo' && (
                                    <>
                                        <Button
                                            icon={editMode ? <CloseCircleOutlined /> : <EditOutlined />}
                                            onClick={() => {
                                                if (editMode && hasUnsavedChanges) {
                                                    setIsConfirmVisible(true);
                                                } else {
                                                    if (!editMode) {
                                                        setOriginalScheduleData(JSON.parse(JSON.stringify(scheduleData)));
                                                    }
                                                    setEditMode(prev => !prev);
                                                    setHasUnsavedChanges(false);
                                                }
                                            }}
                                            type={editMode ? 'default' : 'primary'}
                                        >
                                            {editMode ? 'Thoát chỉnh sửa' : 'Chỉnh sửa lịch'}
                                        </Button>

                                        {editMode && (
                                            <Button
                                                type="primary"
                                                icon={<SaveOutlined />}
                                                onClick={handleUpdateSchedule}
                                                loading={isSaving}
                                            >
                                                Lưu thay đổi
                                            </Button>
                                        )}

                                        {!editMode && (
                                            <Popconfirm
                                                title="Xác nhận lịch học?"
                                                description="Sau khi xác nhận, bạn sẽ không thể chỉnh sửa lịch học nữa."
                                                onConfirm={handleConfirmSchedule}
                                                okText="Xác nhận"
                                                cancelText="Hủy"
                                            >
                                                <Button
                                                    style={{ color: "white", backgroundColor: "#8fd460" }}
                                                    icon={<CheckCircleOutlined />}
                                                    disabled={!scheduleData.length || isSaving}
                                                >
                                                    Xác nhận lịch học
                                                </Button>
                                            </Popconfirm>
                                        )}
                                    </>
                                )}
                            </Row>

                            <div className="scroll-container-wrapper">
                                <div
                                    ref={scrollRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={stopDragging}
                                    onMouseLeave={stopDragging}
                                    className="week-scroll-container"
                                >
                                    <div className="week-days-flex-row">
                                        {currentWeek.days.map(day => (
                                            <div
                                                key={day.date}
                                                className="day-column-card"
                                            >
                                                <div
                                                    className="day-column-header"
                                                    style={{
                                                        ...(day.isHoliday ? {
                                                            backgroundColor: '#fff1f0',
                                                            color: '#cf1322',
                                                            borderBottomColor: '#ffccc7'
                                                        } : {})
                                                    }}
                                                >
                                                    <Text strong>{dayjs(day.date).format('dddd, DD/MM')}</Text>
                                                </div>

                                                <div
                                                    className="day-activities-list"
                                                    style={{
                                                        ...(day.isHoliday ? { backgroundColor: '#fff1f0' } : {})
                                                    }}
                                                >
                                                    {day.isHoliday ? (
                                                        <Tag color="red" style={{ margin: '8px 0' }}>
                                                            Ngày nghỉ lễ {day.notes ? `- ${day.notes}` : ''}
                                                        </Tag>
                                                    ) : day.activities.length === 0 ? (
                                                        <Text type="secondary" italic>Chưa có hoạt động</Text>
                                                    ) : (
                                                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                            {day.activities.map((item, index) => {
                                                                const isFrozen = item.type === 'Cố định';
                                                                const isSelected =
                                                                    (selectedActivity1?.date === day.date && selectedActivity1.index === index) ||
                                                                    (selectedActivity2?.date === day.date && selectedActivity2.index === index);

                                                                const isSwappable = editMode && !isFrozen;

                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        className={`activity-item-card ${isSwappable ? 'swappable' : ''}`}

                                                                        style={{
                                                                            background: (item as any)._justSwapped
                                                                                ? '#d6e4ff'
                                                                                : isFrozen
                                                                                    ? '#fafafa'
                                                                                    : isSelected
                                                                                        ? '#e6f7ff'
                                                                                        : '#fff',
                                                                            border: isFrozen
                                                                                ? '1px solid #d9d9d9'
                                                                                : isSelected
                                                                                    ? '2px solid #1890ff'
                                                                                    : '1px solid #f0f0f0',
                                                                            opacity: isSelected ? 0.6 : 1,
                                                                            cursor: isSwappable ? 'pointer' : 'default',
                                                                            transition: (item as any)._justSwapped ? 'background 0.3s ease-in-out' : 'all 0.2s ease',
                                                                        }}
                                                                        onClick={() => {
                                                                            if (isSwappable && !popoverSlot) {
                                                                                handleActivityClick(day.date, index);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Thời gian */}
                                                                        <Text strong style={{ fontSize: 13 }}>
                                                                            {formatMinutesToTime(item.startTime)} - {formatMinutesToTime(item.endTime)}
                                                                        </Text>

                                                                        {/* Nội dung hoạt động */}
                                                                        <Paragraph
                                                                            className="activity-item-name"

                                                                            style={{
                                                                                color: isFrozen ? '#888' : undefined,
                                                                            }}
                                                                        >
                                                                            {item.activityName || <Text type="secondary" italic>Chưa có hoạt động</Text>}
                                                                        </Paragraph>

                                                                        {/* Tag */}
                                                                        {item.type && (
                                                                            <Tag
                                                                                className="activity-item-tag"
                                                                                color={
                                                                                    item.type === 'Cố định'
                                                                                        ? 'default'
                                                                                        : item.type === 'Bình thường'
                                                                                            ? 'green'
                                                                                            : item.type === 'Sự kiện'
                                                                                                ? 'purple'
                                                                                                : 'blue'
                                                                                }
                                                                            >
                                                                                {item.type}
                                                                            </Tag>
                                                                        )}

                                                                        {/* Nút Xóa */}
                                                                        {editMode && item.type !== 'Cố định' && (
                                                                            <Tooltip title="Xóa nội dung hoạt động">
                                                                                <CloseCircleOutlined
                                                                                    className="activity-item-delete-btn"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteActivity(day.date, index);
                                                                                    }}
                                                                                />
                                                                            </Tooltip>
                                                                        )}


                                                                        {/* Nút Chọn (Popover) */}
                                                                        {editMode && !isFrozen && (
                                                                            <div className="activity-item-popover-btn">
                                                                                <Popover
                                                                                    trigger="click"
                                                                                    open={popoverSlot?.date === day.date && popoverSlot?.startTime === item.startTime}
                                                                                    onOpenChange={(visible) => !visible && setPopoverSlot(null)}
                                                                                    placement="topRight"
                                                                                    content={
                                                                                        <List
                                                                                            size="small"
                                                                                            loading={isFetchingActivities}
                                                                                            dataSource={availableActivities}
                                                                                            renderItem={(act) => (
                                                                                                <List.Item
                                                                                                    key={act._id}
                                                                                                    className="popover-activity-item"
                                                                                                    onClick={() => {
                                                                                                        handleSelectActivity(act._id);
                                                                                                        setPopoverSlot(null);
                                                                                                    }}
                                                                                                >
                                                                                                    <div>
                                                                                                        <strong>{act.activityName}</strong>
                                                                                                        {act.type === 'Sự kiện' && act.eventName ? ` (${act.eventName})` : ''} - [{act.type}]
                                                                                                    </div>
                                                                                                </List.Item>
                                                                                            )}
                                                                                        />
                                                                                    }
                                                                                >
                                                                                    <Button
                                                                                        size="small"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            fetchAvailableActivities();
                                                                                            setPopoverSlot({ date: day.date, startTime: item.startTime });
                                                                                        }}
                                                                                    >
                                                                                        Chọn
                                                                                    </Button>
                                                                                </Popover>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </Space>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {!loading && weeklyGroupedDays.length === 0 && selectedClassId && selectedMonth && (
                        <Empty
                            description={
                                scheduleStatus === 'Xác nhận'
                                    ? "Lịch xác nhận không có dữ liệu."
                                    : (id ? "Không tải được dữ liệu lịch học." : "Không tìm thấy lịch trình. Bạn có thể 'Gợi ý lịch học' hoặc 'Tạo lịch học' mới.")
                            }
                            style={{ marginTop: 32 }}
                        />
                    )}
                </Spin>

            </Card>
            <Modal title="Bạn có chắc muốn hủy?"
                open={isConfirmVisible}
                onOk={() => {
                    setIsConfirmVisible(false);
                    setEditMode(false);
                    setHasUnsavedChanges(false);
                    if (originalScheduleData.length > 0) {
                        setScheduleData(JSON.parse(JSON.stringify(originalScheduleData)));
                    }

                    toast.info("Đã hủy chỉnh sửa, các thay đổi chưa lưu sẽ bị mất.");
                }}
                onCancel={() => setIsConfirmVisible(false)}
                okText="Đồng ý"
                cancelText="Không">
                <p>Các thay đổi sẽ không được lưu lại.</p>
            </Modal>

            {(isAutoSaving || justSaved) && (
                <div style={{
                    position: 'fixed',
                    bottom: 20,
                    left: 24,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    padding: '8px 12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    {isAutoSaving && (
                        <>
                            <Spin size="small" />
                            <span>Tự động lưu thay đổi...</span>
                        </>
                    )}
                    {justSaved && (
                        <>
                            <CheckCircleOutlined style={{ color: 'green' }} />
                            <span>Đã lưu thành công</span>
                        </>
                    )}
                </div>
            )}

        </div>
    );
}

export default SchedulesManagement;