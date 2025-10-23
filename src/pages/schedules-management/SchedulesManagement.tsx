import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
    Card, Typography, Row, Col, Select, Spin, Tag, Space, Button, Empty,
    Tooltip
} from 'antd';
import {
    ScheduleOutlined, PlusOutlined, LeftOutlined, RightOutlined, BulbOutlined,
    EditOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { IDailySchedule, TScheduleDetailResponse } from '../../types/timetable';
import { SchoolYearListItem } from '../../types/schoolYear';
import { ClassListItem } from '../../types/class';
import { scheduleApis } from '../../services/apiServices';
import { useNavigate } from 'react-router-dom';
import { constants } from '../../constants';
import { toast } from 'react-toastify';

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
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [classes, setClasses] = useState<ClassListItem[]>([]);
    const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>();
    const [_, setSelectedSchoolYearName] = useState<string>();
    const [selectedClassId, setSelectedClassId] = useState<string>();
    const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
    const [scheduleData, setScheduleData] = useState<TScheduleDetailResponse>([]);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const currentYear = dayjs().year();
    const scrollRef = useRef<HTMLDivElement>(null);
    const dragStateRef = useRef({ isDragging: false, startX: 0, scrollLeftStart: 0 });
    const [hasSuggestedSchedule, setHasSuggestedSchedule] = useState(false);
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


    useEffect(() => {
        if (selectedActivity1 && selectedActivity2) {
            const updated = [...scheduleData];
            const day1 = updated.find(d => d.date === selectedActivity1.date);
            const day2 = updated.find(d => d.date === selectedActivity2.date);

            if (day1 && day2) {
                const act1 = day1.activities[selectedActivity1.index];
                const act2 = day2.activities[selectedActivity2.index];

                // Chỉ swap nếu cả 2 là “Bình thường”
                if (act1?.type === 'Bình thường' && act2?.type === 'Bình thường') {
                    day1.activities[selectedActivity1.index] = { ...act2, _justSwapped: true };
                    day2.activities[selectedActivity2.index] = { ...act1, _justSwapped: true };
                    setScheduleData([...updated]);

                    setTimeout(() => {
                        const cleaned = [...updated];
                        const day1 = cleaned.find(d => d.date === selectedActivity1.date);
                        const day2 = cleaned.find(d => d.date === selectedActivity2.date);

                        if (day1?.activities[selectedActivity1.index]) {
                            day1.activities[selectedActivity1.index] = { ...act2 };
                        }
                        if (day2?.activities[selectedActivity2.index]) {
                            day2.activities[selectedActivity2.index] = { ...act1 };
                        }
                        setScheduleData([...cleaned]);
                    }, 600);

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
        const updated = [...scheduleData];
        const day = updated.find(d => d.date === date);
        if (!day) return;
        day.activities.splice(index, 1);
        setScheduleData(updated);
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

    const fetchClassList = useCallback(async (schoolYearId: string) => {
        try {
            const year = schoolYears.find(y => y._id === schoolYearId)?.schoolYear;
            if (!year) return;
            const res = await scheduleApis.getClassList({ year, page: 1, limit: 1000 });
            setClasses(res.data);
            setSelectedClassId(res.data?.[0]?._id);
        } catch {
            setClasses([]);
        }
    }, [schoolYears]);

    useEffect(() => {
        const fetchSchoolYears = async () => {
            setLoading(true);
            try {
                const res = await scheduleApis.getSchoolYearList({ page: 1, limit: 100 });
                const sorted = res.data.sort((a, b) => (
                    parseInt(b.schoolYear.split('-')[0]) - parseInt(a.schoolYear.split('-')[0])
                ));
                const latest = sorted[0];
                setSchoolYears(sorted);
                setSelectedSchoolYearId(latest._id);
                setSelectedSchoolYearName(latest.schoolYear);
            } catch { } finally {
                setLoading(false);
            }
        };
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        if (!selectedSchoolYearId) return;
        fetchClassList(selectedSchoolYearId);
    }, [selectedSchoolYearId, fetchClassList]);

    const fetchConfirmedSchedule = useCallback(async () => {
        if (!selectedSchoolYearId || !selectedClassId || !selectedMonth) return;
        setLoading(true);
        setIsConfirmed(false);
        setScheduleData([]);

        try {
            const res = await scheduleApis.getScheduleParams({
                schoolYear: selectedSchoolYearId,
                class: selectedClassId,
                month: selectedMonth,
                status: 'Xác nhận'
            });
            setScheduleData(res);
            if (res.length > 0) setIsConfirmed(true);
        } catch {
            setScheduleData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedSchoolYearId, selectedClassId, selectedMonth]);

    useEffect(() => {
        if (selectedSchoolYearId && selectedClassId && selectedMonth) {
            fetchConfirmedSchedule();
        }
    }, [selectedSchoolYearId, selectedClassId, selectedMonth, fetchConfirmedSchedule]);

    const handleFetchSuggestion = async () => {
        if (!selectedClassId || !selectedMonth) {
            toast.warning('Vui lòng chọn Lớp và Tháng trước khi gợi ý lịch học.');
            return;
        }

        const year = dayjs().year().toString();
        setLoading(true);
        setScheduleData([]);

        try {
            const res = await scheduleApis.getPreviewSchedule({
                year,
                month: selectedMonth.toString(),
                classId: selectedClassId,
            });

            if (res && Array.isArray(res.schedule?.scheduleDays) && res.schedule.scheduleDays.length > 0) {
                setScheduleData(res.schedule.scheduleDays);
                setHasSuggestedSchedule(true);
                toast.success('Đã tải gợi ý lịch học thành công!');
            } else {
                toast.info('Không có dữ liệu gợi ý lịch học.');
                setScheduleData([]);
            }
        } catch (error) {
            console.error('Lỗi khi gợi ý lịch học:', error);
            toast.error('Không thể tải gợi ý lịch học. Vui lòng thử lại.');
            setScheduleData([]);
        } finally {
            setLoading(false);
        }
    };


    const weeklyGroupedDays = useMemo(() => {
        if (!scheduleData.length) return [];
        return groupDaysByWeek(scheduleData, currentYear, selectedMonth);
    }, [scheduleData, currentYear, selectedMonth]);

    useEffect(() => {
        setCurrentWeekIndex(0);
    }, [selectedSchoolYearId, selectedClassId, selectedMonth]);

    const currentWeek = weeklyGroupedDays?.[currentWeekIndex];

    let weekHeader = '';
    if (currentWeek) {
        const first = dayjs(currentWeek.days[0].date);
        const last = dayjs(currentWeek.days[currentWeek.days.length - 1].date);
        const weekOfMonth = first.week() - first.startOf('month').week() + 1;
        weekHeader = `Tuần ${weekOfMonth} (${first.format('DD/MM')} - ${last.format('DD/MM')})`;
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card bordered={false}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            <Space>
                                <ScheduleOutlined />
                                Quản lý Lịch trình Tháng
                                {isConfirmed && <Tag color="success">ĐÃ XÁC NHẬN</Tag>}
                            </Space>
                        </Title>
                    </Col>
                    <Col>
                        <Space wrap>
                            <Select
                                style={{ width: 180 }}
                                placeholder="Chọn năm học"
                                value={selectedSchoolYearId}
                                onChange={(val) => {
                                    setSelectedSchoolYearId(val);
                                    const y = schoolYears.find(sy => sy._id === val);
                                    if (y) setSelectedSchoolYearName(y.schoolYear);
                                }}
                                disabled={loading}
                            >
                                {schoolYears.map(sy => (
                                    <Option key={sy._id} value={sy._id}>{sy.schoolYear}</Option>
                                ))}
                            </Select>
                            <Select
                                style={{ width: 150 }}
                                placeholder="Chọn lớp"
                                value={selectedClassId}
                                onChange={setSelectedClassId}
                                disabled={loading}
                            >
                                {classes.map(cls => (
                                    <Option key={cls._id} value={cls._id}>{cls.className}</Option>
                                ))}
                            </Select>
                            <Select
                                style={{ width: 120 }}
                                placeholder="Chọn tháng"
                                value={selectedMonth}
                                onChange={setSelectedMonth}
                                options={monthOptions}
                                disabled={loading}
                            />
                            {!isConfirmed && (
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
                                    {hasSuggestedSchedule && (
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => setEditMode(prev => !prev)}
                                            type={editMode ? 'default' : 'dashed'}
                                        >
                                            {editMode ? 'Thoát chỉnh sửa' : 'Chỉnh sửa lịch'}
                                        </Button>
                                    )}
                                </>
                            )}
                        </Space>
                    </Col>
                </Row>

                <Spin spinning={loading}>
                    {!loading && weeklyGroupedDays.length > 0 && currentWeek && (
                        <>
                            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
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

                            <div style={{ position: 'relative' }}>
                                <div
                                    ref={scrollRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={stopDragging}
                                    onMouseLeave={stopDragging}
                                    style={{
                                        width: '100%',
                                        overflowX: 'auto',
                                        padding: '16px 40px',
                                        cursor: 'grab'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        {currentWeek.days.map(day => (
                                            <div
                                                key={day.date}
                                                style={{
                                                    flex: '0 0 260px',
                                                    width: 260,
                                                    background: '#f7f7f7',
                                                    borderRadius: 8,
                                                    border: '1px solid #e8e8e8',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                            >
                                                <div style={{
                                                    padding: '12px 16px',
                                                    borderBottom: '1px solid #e8e8e8',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    ...(day.isHoliday ? {
                                                        backgroundColor: '#fff1f0',
                                                        color: '#cf1322',
                                                        borderBottomColor: '#ffccc7'
                                                    } : { background: '#fff' })
                                                }}>
                                                    <Text strong>{dayjs(day.date).format('dddd, DD/MM')}</Text>
                                                    <Tooltip title="Thêm/Sửa hoạt động"> <Button size="small" type="text" icon={<PlusOutlined />} />
                                                    </Tooltip>
                                                </div>
                                                <div style={{
                                                    padding: '12px 16px',
                                                    minHeight: '200px',
                                                    overflowY: 'auto',
                                                    flexGrow: 1,
                                                    ...(day.isHoliday ? { backgroundColor: '#fff1f0' } : {})
                                                }}>
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

                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        onClick={() => handleActivityClick(day.date, index)}
                                                                        style={{
                                                                            position: 'relative',
                                                                            background: isFrozen ? '#fafafa' : isSelected ? '#e6f7ff' : '#fff',
                                                                            borderRadius: 6,
                                                                            padding: '8px 12px',
                                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                            border: isFrozen
                                                                                ? '1px solid #d9d9d9'
                                                                                : isSelected
                                                                                    ? '2px solid #1890ff'
                                                                                    : '1px solid #f0f0f0',
                                                                            cursor: isFrozen ? 'not-allowed' : editMode ? 'pointer' : 'default',
                                                                            opacity: isSelected ? 0.6 : 1,
                                                                            transition: 'opacity 0.2s ease-in-out'
                                                                        }}
                                                                    >
                                                                        {editMode && item.type === 'Bình thường' && (
                                                                            <Tooltip title="Xóa hoạt động">
                                                                                <CloseCircleOutlined
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteActivity(day.date, index);
                                                                                    }}
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        top: 6,
                                                                                        right: 6,
                                                                                        fontSize: 16,
                                                                                        color: '#ff4d4f',
                                                                                        cursor: 'pointer'
                                                                                    }}
                                                                                />
                                                                            </Tooltip>

                                                                        )}
                                                                        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                                                                            {formatMinutesToTime(item.startTime)}-{formatMinutesToTime(item.endTime)}
                                                                        </Text>

                                                                        <Paragraph
                                                                            style={{
                                                                                marginBottom: 0,
                                                                                fontSize: 13,
                                                                                whiteSpace: 'pre-wrap',
                                                                                color: isFrozen ? '#888' : undefined
                                                                            }}
                                                                        >
                                                                            {item.activityName}
                                                                        </Paragraph>

                                                                        <Tag
                                                                            color={
                                                                                item.type === 'Cố định'
                                                                                    ? 'default'
                                                                                    : item.type === 'Bình thường'
                                                                                        ? 'green'
                                                                                        : item.type === 'Sự kiện'
                                                                                            ? 'purple'
                                                                                            : 'blue'
                                                                            }
                                                                            style={{ marginTop: 4 }}
                                                                        >
                                                                            {item.type}
                                                                        </Tag>
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
                    {!loading && weeklyGroupedDays.length === 0 && selectedSchoolYearId && selectedClassId && selectedMonth && (
                        <Empty
                            description={isConfirmed ? "Lịch xác nhận không có dữ liệu." : "Không tìm thấy lịch trình. Bạn có thể 'Gợi ý lịch học' hoặc 'Tạo lịch học' mới."}
                            style={{ marginTop: 32 }}
                        />
                    )}
                </Spin>
            </Card>
        </div>
    );
}

export default SchedulesManagement;
