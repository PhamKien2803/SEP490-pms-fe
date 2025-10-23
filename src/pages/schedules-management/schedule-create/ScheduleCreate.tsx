import { useState, useEffect, useMemo } from 'react';
import {
    Card, Typography, Row, Col, Select, Spin, Tag, List, Space, Button, Collapse, Empty, theme, Alert, Flex, Input
} from 'antd';
import { ScheduleOutlined, CalendarOutlined, BulbOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { toast } from 'react-toastify';
import { ICreateSchedulePayload, IDailySchedule, IScheduleActivity, TCreateScheduleResponse } from '../../../types/timetable';
import { ageOptions } from '../../../components/hard-code-action';
import { scheduleApis } from '../../../services/apiServices';
import { useNavigate } from 'react-router-dom';


dayjs.extend(weekOfYear);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { useToken } = theme;

const formatMinutesToTime = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return '--:--';
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
};

const groupDaysByWeek = (days: IDailySchedule[], year: number, month: number): { week: number; days: IDailySchedule[] }[] => {
    if (!days || days.length === 0) return [];
    const weeksMap = new Map<number, IDailySchedule[]>();
    const firstDayOfMonth = dayjs().year(year).month(month - 1).startOf('month');
    const lastDayOfMonth = dayjs().year(year).month(month - 1).endOf('month');
    const daysDataMap = new Map(days.map(d => [dayjs(d.date).format('YYYY-MM-DD'), d]));
    let currentDay = firstDayOfMonth;

    while (currentDay.isBefore(lastDayOfMonth) || currentDay.isSame(lastDayOfMonth, 'day')) {
        const weekNumber = currentDay.week();
        if (!weeksMap.has(weekNumber)) weeksMap.set(weekNumber, []);
        const dayData = daysDataMap.get(currentDay.format('YYYY-MM-DD'));
        weeksMap.get(weekNumber)?.push(
            dayData || {
                date: currentDay.toISOString(),
                activities: [],
                isHoliday: false,
                dayName: currentDay.format('dddd'),
                notes: '',
                schoolYear: { _id: '', schoolYear: '' },
                class: { _id: '', className: '' },
                status: 'Dự thảo',
            }
        );
        currentDay = currentDay.add(1, 'day');
    }

    return Array.from(weeksMap.entries())
        .map(([week, daysInWeek]) => ({ week, days: daysInWeek }))
        .sort((a, b) => dayjs(a.days[0].date).valueOf() - dayjs(b.days[0].date).valueOf());
};

function ScheduleCreate() {
    const { token } = useToken();
    const navigate = useNavigate();
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>();
    const [selectedAge, setSelectedAge] = useState<string | undefined>();
    const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
    const [scheduleDraftData, setScheduleDraftData] = useState<TCreateScheduleResponse | null>(null);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const currentYear = dayjs().year().toString();
        setSelectedSchoolYear(currentYear);
    }, []);

    const handleCreateDraft = async () => {
        if (!selectedSchoolYear || !selectedAge || !selectedMonth) {
            toast.warn('Vui lòng chọn Năm học, Độ tuổi và Tháng.');
            return;
        }
        setIsLoadingDraft(true);
        setScheduleDraftData(null);
        setError(null);

        const payload: ICreateSchedulePayload = {
            year: selectedSchoolYear,
            age: selectedAge,
            month: selectedMonth.toString(),
        };

        try {
            const draftData: TCreateScheduleResponse = await scheduleApis.createSchedule(payload);
            setScheduleDraftData(draftData);
            toast.success('Tạo bản nháp lịch trình thành công! Kiểm tra bên dưới.');
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Tạo bản nháp thất bại. Vui lòng thử lại.';
            toast.error(errorMsg);
            setError(errorMsg);
        } finally {
            setIsLoadingDraft(false);
        }
    };

    const weeklyGroupedDays = useMemo(() => {
        if (!scheduleDraftData || !selectedMonth) return [];
        const year = selectedSchoolYear ? parseInt(selectedSchoolYear, 10) : dayjs().year();
        if (isNaN(year)) return [];
        return groupDaysByWeek(scheduleDraftData, year, selectedMonth);
    }, [scheduleDraftData, selectedMonth, selectedSchoolYear]);

    const renderDayActivities = (day: IDailySchedule) => {
        if (day.isHoliday) {
            return (
                <Tag icon={<CalendarOutlined />} color="warning" style={{ margin: '10px 0', display: 'block', textAlign: 'center' }}>
                    Ngày nghỉ {day.notes ? `- ${day.notes}` : ''}
                </Tag>
            );
        }
        if (!day.activities || day.activities.length === 0) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có hoạt động" style={{ padding: '10px 0' }} />;
        }
        return (
            <List
                size="small"
                dataSource={day.activities.sort((a, b) => a.startTime - b.startTime)}
                renderItem={(item: IScheduleActivity) => (
                    <List.Item style={{ padding: '4px 0', fontSize: '13px', borderBottom: `1px dashed ${token.colorBorderSecondary}` }} >
                        <Flex justify='space-between' align='flex-start' style={{ width: '100%' }}>
                            <Text style={{ flexShrink: 0, marginRight: 8, color: token.colorPrimary, whiteSpace: 'nowrap' }}>
                                {formatMinutesToTime(item.startTime)}-{formatMinutesToTime(item.endTime)}:
                            </Text>
                            <Text style={{ flexGrow: 1, textAlign: 'left', wordBreak: 'break-word' }}>{item.activityName}</Text>
                            <Tag
                                bordered={false}
                                color={item.type === 'Cố định' ? 'blue' : item.type === 'Bình thường' ? 'green' : 'purple'}
                                style={{ marginLeft: 8, flexShrink: 0 }}
                            >
                                {item.type}
                            </Tag>
                        </Flex>
                    </List.Item>
                )}
            />
        );
    };

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `Tháng ${i + 1}`,
    }));

    return (
        <div style={{ padding: '24px', background: token.colorBgLayout }}>
            <Title level={3} style={{ marginBottom: token.marginLG }}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: 16, paddingLeft: 0 }}
                >
                    Quay lại
                </Button>

                <Space><ScheduleOutlined /> Tạo Lịch trình Tháng mới</Space>
            </Title>

            <Card bordered={false} style={{ marginBottom: token.marginLG }}>
                <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} sm={8} md={6}>
                        <Text strong>Năm học</Text>
                        <Input
                            style={{ width: '100%', marginTop: '8px' }}
                            value={selectedSchoolYear}
                            readOnly
                        />
                    </Col>

                    <Col xs={24} sm={8} md={6}>
                        <Text strong>Độ tuổi</Text>
                        <Select
                            style={{ width: '100%', marginTop: '8px' }}
                            placeholder="Chọn độ tuổi"
                            value={selectedAge}
                            onChange={setSelectedAge}
                            options={ageOptions}
                            disabled={isLoadingDraft}
                        />
                    </Col>

                    <Col xs={24} sm={8} md={6}>
                        <Text strong>Tháng</Text>
                        <Select
                            style={{ width: '100%', marginTop: '8px' }}
                            placeholder="Chọn tháng"
                            value={selectedMonth}
                            onChange={setSelectedMonth}
                            options={monthOptions}
                            disabled={!selectedAge || isLoadingDraft}
                        />
                    </Col>

                    <Col xs={24} sm={24} md={6}>
                        <Button
                            type="primary"
                            icon={<BulbOutlined />}
                            onClick={handleCreateDraft}
                            loading={isLoadingDraft}
                            disabled={!selectedSchoolYear || !selectedAge || !selectedMonth || isLoadingDraft}
                            style={{ width: '100%' }}
                        >
                            Tạo bản nháp
                        </Button>
                    </Col>
                </Row>
            </Card>

            {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: token.marginLG }} />}

            <Spin spinning={isLoadingDraft} tip="Đang tạo lịch trình...">
                <Card
                    title={selectedSchoolYear && selectedAge && selectedMonth ? `Bản nháp Lịch trình Tháng ${selectedMonth}/${selectedSchoolYear} - Độ tuổi ${selectedAge}` : 'Xem trước Lịch trình'}
                    bordered={false}
                    size="small"
                    style={{ minHeight: '60vh', background: token.colorBgContainerDisabled }}
                >
                    {!isLoadingDraft && !scheduleDraftData && (
                        <Flex justify='center' align='center' style={{ height: '50vh' }}>
                            <Text type='secondary'>Chọn Độ tuổi, Tháng và nhấn "Tạo bản nháp" để xem trước.</Text>
                        </Flex>
                    )}
                    {!isLoadingDraft && scheduleDraftData && weeklyGroupedDays.length === 0 && (
                        <Empty description="Không có dữ liệu lịch trình." />
                    )}
                    {!isLoadingDraft && scheduleDraftData && weeklyGroupedDays.length > 0 && (
                        <Collapse defaultActiveKey={weeklyGroupedDays.map(w => w.week)} ghost accordion>
                            {weeklyGroupedDays.map(({ week, days }) => {
                                const firstDayOfWeek = dayjs(days[0].date);
                                const lastDayOfWeek = dayjs(days[days.length - 1].date);
                                const weekOfMonth = Math.ceil(firstDayOfWeek.date() / 7);
                                const weekHeader = `Tuần ${weekOfMonth} (${firstDayOfWeek.format('DD/MM')} - ${lastDayOfWeek.format('DD/MM')})`;

                                return (
                                    <Panel
                                        header={<Title level={5}>{weekHeader}</Title>}
                                        key={`${firstDayOfWeek.year()}-${week}`}
                                        style={{ background: token.colorBgContainer, marginBottom: token.marginSM, borderRadius: token.borderRadius }}
                                    >
                                        <Row gutter={[8, 8]}>
                                            {days.map(day => (
                                                <Col key={day.date} xs={24} sm={12} md={12} lg={24 / 7} style={{ flexBasis: `${100 / 7}%`, maxWidth: `${100 / 7}%` }}>
                                                    <Card
                                                        size="small"
                                                        title={<Text strong style={{ fontSize: '13px' }}>{dayjs(day.date).format('dddd, DD')}</Text>}
                                                        headStyle={day.isHoliday ? { backgroundColor: token.colorWarningBg, color: token.colorWarningText } : { backgroundColor: token.colorInfoBg }}
                                                        style={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: token.boxShadowTertiary, border: `1px solid ${token.colorBorderSecondary}` }}
                                                        bodyStyle={{ flexGrow: 1, overflowY: 'auto', padding: '8px' }}
                                                    >
                                                        {renderDayActivities(day)}
                                                        {day.notes && !day.isHoliday && (
                                                            <Paragraph italic type="secondary" style={{ marginTop: '8px', fontSize: '12px', marginBottom: 0 }}>
                                                                * {day.notes}
                                                            </Paragraph>
                                                        )}
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Panel>
                                );
                            })}
                        </Collapse>
                    )}
                </Card>
            </Spin>
        </div>
    );
}

export default ScheduleCreate;
