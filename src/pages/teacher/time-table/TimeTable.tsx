import React, { useState } from 'react';
import {
    Card, Calendar, Button, Flex, Typography, Tag, Radio,
    ConfigProvider, theme, Space, Table, List
} from 'antd';
import {
    PlusOutlined, LeftOutlined, RightOutlined, CalendarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { Dayjs } from 'dayjs';
import viVN from 'antd/locale/vi_VN';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.locale('vi');
dayjs.extend(weekOfYear);

const { Title, Text } = Typography;
const { useToken } = theme;
type Token = ReturnType<typeof useToken>['token'];
type ViewMode = 'month' | 'week' | 'day';

// ===================================================================
// DỮ LIỆU GIẢ (MOCK DATA) CHO LỊCH THÁNG
// ===================================================================
const getMonthMockData = (value: Dayjs) => {
    if (value.month() !== 9 || value.year() !== 2025) {
        return null;
    }

    const day = value.date();
    switch (day) {
        case 8:
        case 22:
        case 23:
            return { type: 'holiday', title: 'Nghỉ' };
        case 19:
        case 26:
            return null;
        default:
            if (day > 0 && day < 32) {
                return { type: 'event', title: '12 hoạt động' };
            }
            return null;
    }
};

// ===================================================================
// COMPONENT LỊCH TUẦN (WEEK VIEW)
// ===================================================================
const ActivityCell: React.FC<{ title: string; color: string; token: Token }> = ({ title, color, token }) => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
        blue: { bg: token.colorPrimaryBg, border: token.colorPrimaryBorder, text: token.colorPrimary },
        green: { bg: token.colorSuccessBg, border: token.colorSuccessBorder, text: token.colorSuccess },
        purple: { bg: token.colorInfoBg, border: token.colorInfoBorder, text: token.colorInfo },
        yellow: { bg: token.colorWarningBg, border: token.colorWarningBorder, text: token.colorWarning },
    };

    const style: React.CSSProperties = {
        backgroundColor: colorMap[color]?.bg || token.colorBgContainer,
        borderColor: colorMap[color]?.border || token.colorBorder,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: token.borderRadius,
        padding: '8px 12px',
        width: '100%',
        cursor: 'pointer',
    };

    return <div style={style}><Text style={{ color: colorMap[color]?.text }}>{title}</Text></div>;
};

const getWeekColumns = (token: Token, currentDate: Dayjs): TableProps<any>['columns'] => {
    const startOfWeek = currentDate.startOf('week');
    
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    const dataIndex = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    const columns: TableProps<any>['columns'] = [
        {
            title: 'Thời gian',
            dataIndex: 'time',
            key: 'time',
            width: 100,
            align: 'center',
            fixed: 'left',
            className: 'time-cell'
        },
    ];

    days.forEach((day, index) => {
        const date = startOfWeek.add(index, 'day');
        columns.push({
            title: <div style={{ lineHeight: 1.2 }}><Text strong>{day}</Text><br /><Text type="secondary">{date.format('D/M')}</Text></div>,
            dataIndex: dataIndex[index],
            key: dataIndex[index],
            align: 'center',
            render: (activity) => activity ? <ActivityCell {...activity} token={token} /> : null,
        });
    });

    return columns;
};

const weekData = [
    { key: '1', time: '07:00', mon: { title: 'Hoạt động 1', color: 'blue' }, tue: { title: 'Hoạt động 1', color: 'blue' }, wed: { title: 'Hoạt động 1', color: 'blue' }, thu: { title: 'Hoạt động 1', color: 'blue' }, fri: { title: 'Hoạt động 1', color: 'blue' }, sat: { title: 'Hoạt động 1', color: 'blue' }, sun: null, },
    { key: '2', time: '09:00', mon: { title: 'Hoạt động 2', color: 'green' }, tue: { title: 'Hoạt động 2', color: 'green' }, wed: { title: 'Hoạt động 2', color: 'green' }, thu: { title: 'Hoạt động 2', color: 'green' }, fri: { title: 'Hoạt động 2', color: 'green' }, sat: null, sun: null, },
    { key: '3', time: '11:00', mon: { title: 'Hoạt động 3', color: 'purple' }, tue: { title: 'Hoạt động 3', color: 'purple' }, wed: { title: 'Hoạt động 3', color: 'purple' }, thu: { title: 'Hoạt động 3', color: 'purple' }, fri: { title: 'Hoạt động 3', color: 'purple' }, sat: null, sun: null, },
    { key: '4', time: '13:00', mon: { title: 'Hoạt động 4', color: 'yellow' }, tue: { title: 'Hoạt động 4', color: 'yellow' }, wed: { title: 'Hoạt động 4', color: 'yellow' }, thu: { title: 'Hoạt động 4', color: 'yellow' }, fri: null, sat: null, sun: null, },
];

const WeekView: React.FC<{ token: Token; currentDate: Dayjs }> = ({ token, currentDate }) => {
    return (
        <div style={{ padding: '0 12px 12px' }}>
            <Table
                columns={getWeekColumns(token, currentDate)}
                dataSource={weekData}
                bordered
                pagination={false}
                scroll={{ x: 1200 }}
                className="week-timetable"
            />
        </div>
    );
};

// ===================================================================
// COMPONENT LỊCH NGÀY (DAY VIEW)
// ===================================================================
const dayMockData = (token: Token) => [
    { key: '1', time: '07:15 - 07:30', title: 'Đón trẻ', duration: '30 phút', color: token.colorPrimary, tagColor: 'blue' },
    { key: '2', time: '07:30 - 08:30', title: 'Ăn sáng', duration: '30 phút', color: token.colorSuccess, tagColor: 'green' },
    { key: '3', time: '08:30 - 09:00', title: 'Vệ sinh cá nhân', duration: '30 phút', color: token.colorInfo, tagColor: 'purple' },
    { key: '4', time: '09:00 - 09:30', title: 'Hoạt động ngoài trời', duration: '30 phút', color: token.colorWarning, tagColor: 'orange' },
];

const DayView: React.FC<{ token: Token; currentDate: Dayjs }> = ({ token, currentDate }) => {
    const data = dayMockData(token);
    return (
        <div style={{ padding: '16px 8px' }}>
            <Title level={5} style={{ marginBottom: 16, paddingLeft: 16, textTransform: 'capitalize' }}>
                {currentDate.format('dddd, DD/MM/YYYY')}
            </Title>
            <List
                itemLayout="horizontal"
                dataSource={data}
                className="day-timetable-list"
                renderItem={(item) => (
                    <List.Item style={{ padding: '16px' }}>
                        <Flex align="center" gap="middle" style={{ width: '100%' }}>
                            <Flex align="center" justify="center" style={{ width: 24, height: 60, position: 'relative' }}>
                                <div style={{
                                    width: 2,
                                    height: '100%',
                                    backgroundColor: item.color,
                                    position: 'absolute',
                                    opacity: 0.3
                                }} />
                                <ClockCircleOutlined style={{
                                    fontSize: 20,
                                    color: item.color,
                                    backgroundColor: token.colorBgContainer,
                                    borderRadius: '50%',
                                    padding: 2,
                                    zIndex: 1
                                }} />
                            </Flex>

                            <Flex justify="space-between" align="center" style={{ flex: 1 }}>
                                <div>
                                    <Text type="secondary">{item.time}</Text>
                                    <br />
                                    <Text strong style={{ fontSize: 16 }}>{item.title}</Text>
                                </div>
                                <Tag color={item.tagColor} style={{ fontSize: 13, padding: '4px 8px' }}>
                                    {item.duration}
                                </Tag>
                            </Flex>
                        </Flex>
                    </List.Item>
                )}
            />
        </div>
    );
};

// ===================================================================
// COMPONENT HEADER CHUNG
// ===================================================================
interface TimeTableHeaderProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    currentDate: Dayjs;
    setCurrentDate: (date: Dayjs) => void;
}

const TimeTableHeader: React.FC<TimeTableHeaderProps> = ({
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate
}) => {
    const handleNav = (direction: 'prev' | 'next') => {
        const unit = viewMode === 'month' ? 'month' : viewMode;
        const newDate = direction === 'prev' ? currentDate.subtract(1, unit) : currentDate.add(1, unit);
        setCurrentDate(newDate);
    };

    const getTitle = () => {
        if (viewMode === 'month') {
            return currentDate.format('MMMM, YYYY');
        }
        if (viewMode === 'week') {
            const startOfWeek = currentDate.startOf('week').format('DD/MM');
            const endOfWeek = currentDate.endOf('week').format('DD/MM/YYYY');
            return `Tuần ${currentDate.week()}, ${startOfWeek} - ${endOfWeek}`;
        }
        if (viewMode === 'day') {
            return currentDate.format('dddd, DD/MM/YYYY');
        }
    };

    return (
        <Flex justify="space-between" align="center" style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
            <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
            >
                <Radio.Button value="month">Lịch tháng</Radio.Button>
                <Radio.Button value="week">Lịch tuần</Radio.Button>
                <Radio.Button value="day">Lịch ngày</Radio.Button>
            </Radio.Group>

            <Flex align="center" gap="middle">
                <Button icon={<LeftOutlined />} shape="circle" onClick={() => handleNav('prev')} />
                <Title level={4} style={{ margin: 0, textTransform: 'capitalize', minWidth: 250, textAlign: 'center' }}>
                    {getTitle()}
                </Title>
                <Button icon={<RightOutlined />} shape="circle" onClick={() => handleNav('next')} />
                <Tag color="success" style={{ marginLeft: 16, fontSize: 14, padding: '4px 8px' }}>Xác nhận</Tag>
            </Flex>
        </Flex>
    );
};

// ===================================================================
// COMPONENT CHÍNH (TIME TABLE)
// ===================================================================
const TimeTable: React.FC = () => {
    const { token } = useToken();
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(dayjs());

    const dateCellRender = (value: Dayjs) => {
        const data = getMonthMockData(value);
        if (!data) return <div style={{ minHeight: 70 }} />;

        if (data.type === 'holiday') {
            return (
                <div style={{
                    backgroundColor: token.colorErrorBg,
                    borderRadius: token.borderRadius,
                    padding: '4px 8px',
                    height: '100%',
                    minHeight: 70,
                    borderTop: `2px solid ${token.colorError}`,
                }}>
                    <Tag color="error">{data.title}</Tag>
                </div>
            );
        }

        if (data.type === 'event') {
            return (
                <div style={{
                    backgroundColor: token.colorPrimaryBg,
                    borderRadius: token.borderRadius,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    height: '100%',
                    minHeight: 70,
                    borderTop: `2px solid ${token.colorPrimary}`,
                }}>
                    <Text style={{ color: token.colorPrimary, fontSize: 12, fontWeight: 500 }}>{data.title}</Text>
                </div>
            );
        }
        return <div style={{ minHeight: 70 }} />;
    };

    return (
        <ConfigProvider locale={viVN}>
            <div style={{ padding: 24 }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>
                        <Space><CalendarOutlined /> Thời khóa biểu</Space>
                    </Title>
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                        Thêm hoạt động
                    </Button>
                </Flex>

                <Card bordered={false} style={{ boxShadow: token.boxShadowSecondary }} bodyStyle={{ padding: 0 }}>
                    <TimeTableHeader
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                    />

                    {viewMode === 'month' && (
                        <Calendar
                            value={currentDate}
                            onChange={setCurrentDate}
                            dateCellRender={dateCellRender}
                            headerRender={() => null} // Tắt header mặc định của Calendar
                            fullscreen
                            className="teacher-timetable-calendar"
                        />
                    )}

                    {viewMode === 'week' && (
                        <WeekView token={token} currentDate={currentDate} />
                    )}
                    
                    {viewMode === 'day' && (
                         <DayView token={token} currentDate={currentDate} />
                    )}
                </Card>

                <style>{`
                    .teacher-timetable-calendar .ant-picker-content th {
                        text-align: center;
                        font-weight: 500;
                        color: ${token.colorTextSecondary};
                        padding-bottom: 8px;
                        text-transform: capitalize;
                    }
                    .teacher-timetable-calendar .ant-picker-cell-inner {
                        padding: 4px;
                        margin: 0 4px;
                    }
                    .teacher-timetable-calendar .ant-picker-calendar-date-value {
                        text-align: left;
                        font-size: 14px;
                        font-weight: 500;
                        padding-left: 4px;
                    }
                    .teacher-timetable-calendar .ant-picker-cell-selected .ant-picker-cell-inner,
                    .teacher-timetable-calendar .ant-picker-cell-today .ant-picker-cell-inner {
                        background: #fff;
                    }
                    .teacher-timetable-calendar .ant-picker-cell-today .ant-picker-calendar-date-value {
                        color: ${token.colorPrimary};
                    }
                    .teacher-timetable-calendar .ant-picker-calendar-date {
                        border-top: 0;
                        padding: 0;
                    }
                    .teacher-timetable-calendar .ant-picker-calendar-header {
                        display: none; // Ẩn hoàn toàn header mặc định
                    }
                    .teacher-timetable-calendar .ant-picker-body {
                        padding: 0 12px 12px;
                    }
                    .teacher-timetable-calendar .ant-picker-cell-other .ant-picker-calendar-date-value {
                        color: ${token.colorTextDisabled} !important;
                    }

                    .week-timetable .ant-table-cell {
                        padding: 8px;
                    }
                    .week-timetable .ant-table-cell.time-cell {
                        font-weight: 500;
                        color: ${token.colorTextSecondary};
                    }

                    .day-timetable-list .ant-list-item {
                        border-block-end: 1px solid ${token.colorBorderSecondary} !important;
                    }
                    .day-timetable-list .ant-list-item:last-child {
                        border-block-end: none !important;
                    }
                `}</style>
            </div>
        </ConfigProvider>
    );
};

export default TimeTable;