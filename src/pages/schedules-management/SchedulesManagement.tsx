import { useState, useEffect, useMemo } from 'react';
import {
    Card, Typography, Row, Col, Select, Spin, Tag, List, Tooltip, Space, Button, Collapse, Empty
} from 'antd';
import { ScheduleOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const formatMinutesToTime = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return '--:--';
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
};

interface MockActivity { _id: string; name: string; }
interface ScheduleActivity { activity: MockActivity; startTime?: number; endTime?: number; _id: string; }
interface ScheduleDay { date: string; activities: ScheduleActivity[]; isHoliday: boolean; notes?: string; }
interface MockSchedule { _id: string; schoolYear: string; class: string; month: number; scheduleDays: ScheduleDay[]; status: "Dự thảo" | "Xác nhận"; }

const mockScheduleData: MockSchedule | null = {
    _id: 'sched001', schoolYear: 'sy001', class: 'class001', month: 10, status: "Dự thảo",
    scheduleDays: [
        { date: '2025-10-20', isHoliday: false, activities: [{ _id: 'actSched1', activity: { _id: 'act1', name: 'Đón trẻ' }, startTime: 450, endTime: 510 }, { _id: 'actSched2', activity: { _id: 'act2', name: 'Thể dục sáng' }, startTime: 510, endTime: 540 }, { _id: 'actSched3', activity: { _id: 'act3', name: 'Hoạt động học (Toán)' }, startTime: 540, endTime: 600 }, { _id: 'actSched4', activity: { _id: 'act7', name: 'Ăn trưa' }, startTime: 660, endTime: 720 }, { _id: 'actSched5', activity: { _id: 'act8', name: 'Ngủ trưa' }, startTime: 720, endTime: 840 },], notes: 'Buổi học Toán quan trọng.' },
        { date: '2025-10-21', isHoliday: false, activities: [{ _id: 'actSched6', activity: { _id: 'act1', name: 'Đón trẻ' }, startTime: 450, endTime: 510 }, { _id: 'actSched7', activity: { _id: 'act4', name: 'Hoạt động ngoài trời' }, startTime: 540, endTime: 600 }, { _id: 'actSched8', activity: { _id: 'act7', name: 'Ăn trưa' }, startTime: 660, endTime: 720 }, { _id: 'actSched9', activity: { _id: 'act8', name: 'Ngủ trưa' }, startTime: 720, endTime: 840 },] },
        { date: '2025-10-22', isHoliday: true, activities: [], notes: 'Nghỉ lễ Quốc Khánh (Ví dụ)' },
        { date: '2025-10-27', isHoliday: false, activities: [{ _id: 'actSched10', activity: { _id: 'act1', name: 'Đón trẻ' }, startTime: 450, endTime: 510 }] },
    ]
};

const groupDaysByWeek = (days: ScheduleDay[], year: number, month: number): { week: number; days: ScheduleDay[] }[] => {
    const weeksMap = new Map<number, ScheduleDay[]>();
    const firstDayOfMonth = dayjs().year(year).month(month - 1).startOf('month');
    const lastDayOfMonth = dayjs().year(year).month(month - 1).endOf('month');
    const daysDataMap = new Map(days.map(d => [dayjs(d.date).format('YYYY-MM-DD'), d]));

    let currentDay = firstDayOfMonth;
    while (currentDay.isBefore(lastDayOfMonth) || currentDay.isSame(lastDayOfMonth, 'day')) {
        const weekNumber = currentDay.week();
        if (!weeksMap.has(weekNumber)) {
            weeksMap.set(weekNumber, []);
        }
        const dayData = daysDataMap.get(currentDay.format('YYYY-MM-DD'));
        weeksMap.get(weekNumber)?.push(dayData || { date: currentDay.toISOString(), activities: [], isHoliday: false });
        currentDay = currentDay.add(1, 'day');
    }

    return Array.from(weeksMap.entries())
        .map(([week, days]) => ({ week, days }))
        .sort((a, b) => {
            const firstDayA = dayjs(a.days[0].date);
            const firstDayB = dayjs(b.days[0].date);
            return firstDayA.valueOf() - firstDayB.valueOf();
        });
};


function SchedulesManagement() {
    const [loading, setLoading] = useState(false);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | undefined>('sy001');
    const [selectedClass, setSelectedClass] = useState<string | undefined>('class001');
    const [selectedMonth, setSelectedMonth] = useState<number>(10);
    const [scheduleData, setScheduleData] = useState<MockSchedule | null>(null);

    const mockSchoolYears = [{ _id: 'sy001', name: 'Năm học 2025-2026' }];
    const mockClasses = [{ _id: 'class001', name: 'Lớp Mầm 1' }];
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));

    const currentYear = 2025;

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedSchoolYear || !selectedClass || !selectedMonth) {
                setScheduleData(null);
                return;
            }
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            if (selectedSchoolYear === 'sy001' && selectedClass === 'class001' && selectedMonth === 10) {
                setScheduleData(mockScheduleData);
            } else {
                setScheduleData(null);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedSchoolYear, selectedClass, selectedMonth]);

    const weeklyGroupedDays = useMemo(() => {
        if (!scheduleData) return [];
        return groupDaysByWeek(scheduleData.scheduleDays, currentYear, selectedMonth);
    }, [scheduleData, currentYear, selectedMonth]);

    const renderDayActivities = (day: ScheduleDay) => {
        if (day.isHoliday) {
            return (
                <Tag color="red" style={{ margin: '10px 0' }}>Ngày nghỉ {day.notes ? `- ${day.notes}` : ''}</Tag>
            );
        }
        if (!day.activities || day.activities.length === 0) {
            return <Text type="secondary" style={{ fontStyle: 'italic', display: 'block', marginTop: '10px' }}>Chưa có hoạt động</Text>;
        }
        return (
            <List
                size="small"
                dataSource={day.activities}
                renderItem={(item) => (
                    <List.Item style={{ padding: '4px 0', fontSize: '13px' }}>
                        <Text strong style={{ marginRight: '8px', minWidth: '80px', display: 'inline-block' }}>
                            {formatMinutesToTime(item.startTime)}-{formatMinutesToTime(item.endTime)}:
                        </Text>
                        <Text >{item.activity?.name ?? 'N/A'}</Text>
                    </List.Item>
                )}
            />
        );
    };

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card bordered={false}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col> <Title level={3} style={{ margin: 0 }}> <Space><ScheduleOutlined /> Quản lý Lịch trình Tháng </Space> </Title> </Col>
                    <Col> <Space wrap> <Select style={{ width: 180 }} placeholder="Chọn năm học" value={selectedSchoolYear} onChange={setSelectedSchoolYear} disabled={loading}> {mockSchoolYears.map(sy => <Option key={sy._id} value={sy._id}>{sy.name}</Option>)} </Select> <Select style={{ width: 150 }} placeholder="Chọn lớp" value={selectedClass} onChange={setSelectedClass} disabled={loading}> {mockClasses.map(cls => <Option key={cls._id} value={cls._id}>{cls.name}</Option>)} </Select> <Select style={{ width: 120 }} placeholder="Chọn tháng" value={selectedMonth} onChange={setSelectedMonth} options={monthOptions} disabled={loading} /> </Space> </Col>
                </Row>

                {scheduleData && (
                    <Row justify="space-between" align="middle" style={{ marginBottom: 16, padding: '0 8px' }}>
                        <Col> <Space> <Text strong>Trạng thái:</Text> <Tag color={scheduleData.status === 'Xác nhận' ? 'success' : 'processing'}>{scheduleData.status}</Tag> </Space> </Col>
                        <Col> <Space> {scheduleData.status === 'Dự thảo' && (<Button icon={<CheckCircleOutlined />} type="primary" ghost> Xác nhận </Button>)} <Button icon={<EditOutlined />}>Sửa</Button> <Button icon={<DeleteOutlined />} danger>Xóa</Button> </Space> </Col>
                    </Row>
                )}

                <Spin spinning={loading} tip="Đang tải lịch trình...">
                    {!loading && scheduleData && weeklyGroupedDays.length > 0 && (
                        <Collapse defaultActiveKey={weeklyGroupedDays.map(w => w.week)} ghost accordion>
                            {weeklyGroupedDays.map(({ week, days }) => {
                                const firstDayOfWeek = dayjs(days[0].date);
                                const lastDayOfWeek = dayjs(days[days.length - 1].date);
                                const weekOfMonth = firstDayOfWeek.week() - firstDayOfWeek.startOf('month').week() + 1;
                                const weekHeader = `Tuần ${weekOfMonth} (${firstDayOfWeek.format('DD/MM')} - ${lastDayOfWeek.format('DD/MM')})`;

                                return (
                                    <Panel header={<Title level={5}>{weekHeader}</Title>} key={week}>
                                        <Row gutter={[16, 16]}>
                                            {days.map(day => (
                                                <Col xs={24} md={12} lg={24 / 7} key={day.date} style={{ flexBasis: `${100 / 7}%`, maxWidth: `${100 / 7}%` }} /* Cố định 7 cột */ >
                                                    <Card
                                                        size="small"
                                                        title={dayjs(day.date).format('dddd, DD/MM')}
                                                        headStyle={day.isHoliday ? { backgroundColor: '#fff1f0', color: '#cf1322', fontWeight: 'bold' } : { fontWeight: 'bold' }}
                                                        extra={!day.isHoliday && <Tooltip title="Thêm/Sửa hoạt động"><Button size="small" type="text" icon={<PlusOutlined />} /></Tooltip>}
                                                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                                        bodyStyle={{ flexGrow: 1, overflowY: 'auto' }} // Cho phép scroll nếu nội dung dài
                                                    >
                                                        {renderDayActivities(day)}
                                                        {day.notes && !day.isHoliday && <Paragraph italic type="secondary" style={{ marginTop: '8px', fontSize: '12px', marginBottom: 0 }}>* {day.notes}</Paragraph>}
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Panel>
                                );
                            })}
                        </Collapse>
                    )}
                    {!loading && !scheduleData && selectedSchoolYear && selectedClass && selectedMonth && (
                        <Empty description="Không tìm thấy lịch trình cho lựa chọn này." style={{ marginTop: 32 }} />
                    )}
                    {!loading && weeklyGroupedDays.length === 0 && scheduleData && (
                        <Empty description="Không có dữ liệu ngày nào trong lịch trình này." style={{ marginTop: 32 }} />
                    )}
                </Spin>
            </Card>
        </div>
    );
}

export default SchedulesManagement; // Đổi tên export thành SchedulesManagement nếu bạn muốn thay thế hoàn toàn component cũ