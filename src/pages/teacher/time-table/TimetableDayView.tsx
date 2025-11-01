import React, { useState } from 'react';
import {
    Card,
    Tag,
    Button,
    Typography,
    Row,
    Col,
    Empty,
    Timeline,
} from 'antd';
import {
    CalendarOutlined,
    LeftOutlined,
    RightOutlined,
    LockOutlined,
    EditOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { IActivity } from '../../../types/teacher';

const { Text, Title } = Typography;

const formatMinutesToTime = (minutes?: number | null): string => {
    if (minutes == null || isNaN(minutes)) return '--:--';
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const getActivityProps = (activity: IActivity) => {
    if (activity.type === 'Cố định')
        return { color: 'blue', icon: <LockOutlined /> };
    if (activity.type === 'Bình thường')
        return { color: 'green', icon: <EditOutlined /> };
    if (activity.type === 'Sự kiện')
        return { color: 'gold', icon: <BulbOutlined /> };
    return { color: 'default', icon: <CalendarOutlined /> };
};

interface Props {
    getDaysOfWeek: {
        _id: string;
        date: string;
        dayName: string;
        activities: IActivity[];
    }[];
}

const TimetableDayView: React.FC<Props> = ({ getDaysOfWeek }) => {
    const today = dayjs();
    const defaultIndex = getDaysOfWeek.findIndex((d) =>
        today.isSame(dayjs(d.date), 'day'),
    );
    const [currentIndex, setCurrentIndex] = useState(
        defaultIndex >= 0 ? defaultIndex : 0,
    );
    const currentDay = getDaysOfWeek[currentIndex];

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleNext = () => {
        if (currentIndex < getDaysOfWeek.length - 1)
            setCurrentIndex(currentIndex + 1);
    };

    if (!currentDay) return <Empty description="Không có dữ liệu" />;

    const sortedActivities = [...currentDay.activities].sort(
        (a, b) => a.startTime - b.startTime,
    );

    return (
        <Card bordered style={{ padding: 0 }}>
            <Row
                align="middle"
                justify="space-between"
                style={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    background: '#fafafa',
                }}
            >
                <Button
                    icon={<LeftOutlined />}
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                />
                <Title level={5} style={{ margin: 0 }}>
                    {currentDay.dayName} - {dayjs(currentDay.date).format('DD/MM/YYYY')}
                </Title>
                <Button
                    icon={<RightOutlined />}
                    onClick={handleNext}
                    disabled={currentIndex === getDaysOfWeek.length - 1}
                />
            </Row>

            <div style={{ padding: '24px' }}>
                {currentDay.activities.length === 0 ? (
                    <Tag
                        icon={<CalendarOutlined />}
                        color="default"
                        style={{ padding: '6px 12px' }}
                    >
                        Ngày nghỉ
                    </Tag>
                ) : (
                    <Timeline>
                        {sortedActivities.map((act) => {
                            const { color, icon } = getActivityProps(act);
                            return (
                                <Timeline.Item
                                    key={act.activity}
                                    color={color}
                                    dot={icon}
                                >
                                    <Row gutter={8} style={{ width: '100%' }} align="top">
                                        <Col flex="60px">
                                            <Text strong style={{ fontSize: 16 }}>
                                                {formatMinutesToTime(act.startTime)}
                                            </Text>
                                        </Col>
                                        <Col flex="auto">
                                            <Title level={5} style={{ margin: 0 }}>
                                                {act.activityName}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Kết thúc: {formatMinutesToTime(act.endTime)}
                                            </Text>
                                            {act.type === 'Bình thường' && act.tittle && (
                                                <ul
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        marginTop: 6,
                                                        paddingLeft: 20,
                                                        marginBottom: 0,
                                                        color: 'rgba(0, 0, 0, 0.65)',
                                                    }}
                                                >
                                                    {act.tittle
                                                        .split('\n')
                                                        .map((line, i) => (
                                                            <li key={i} style={{ lineHeight: 1.5 }}>
                                                                {line.trim()}
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </Col>
                                    </Row>
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                )}
            </div>
        </Card>
    );
};

export default TimetableDayView;