import { useEffect, useMemo, useState } from 'react';
import { Button, Typography, Input, Space, Tag } from 'antd';
import { PlusOutlined, RollbackOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import './UpdateReport.css';
import {
    ILessonDetailResponse,
    IActivity,
    ILessonPayload,
    IScheduleDay
} from '../../../../types/teacher';
import { teacherApis } from '../../../../services/apiServices';
import { toast } from 'react-toastify';
import { usePageTitle } from '../../../../hooks/usePageTitle';

const { Title, Text } = Typography;

const formatMinutesToTime = (minutes?: number | null): string => {
    if (minutes == null || isNaN(minutes)) return '--:--';
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const getActivityStyle = (activity: IActivity) => {
    const baseStyle = {
        padding: 8,
        borderRadius: 6,
        fontSize: 15,
        fontWeight: 500,
        textAlign: 'center' as const,
        border: '1px solid',
        marginBottom: 4
    };

    if (activity.type === 'Cố định') {
        return {
            ...baseStyle,
            background: '#e6f4ff',
            color: '#096dd9',
            borderColor: '#91d5ff'
        };
    }

    if (activity.type === 'Bình thường') {
        return {
            ...baseStyle,
            background: '#f6ffed',
            color: '#237804',
            borderColor: '#b7eb8f'
        };
    }

    return {
        ...baseStyle,
        background: '#fffbe6',
        color: '#ad8b00',
        borderColor: '#ffe58f'
    };
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Dự thảo':
            return 'gold';
        case 'Hoàn thành':
            return 'green';
        case 'Chờ duyệt':
            return 'blue';
        default:
            return 'default';
    }
};

function UpdateReport() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    usePageTitle('Cập nhật báo giảng - Cá Heo Xanh');
    const [lessonData, setLessonData] = useState<ILessonDetailResponse | null>(null);
    const [_, setLoading] = useState(false);
    const [topicName, setTopicName] = useState('');
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingSend, setLoadingSend] = useState(false);

    const isDraft = useMemo(() => lessonData?.status === 'Dự thảo', [lessonData?.status]);
    const isEditable = isDraft;

    const fetchLessonData = async (lessonId: string) => {
        setLoading(true);
        try {
            const data = await teacherApis.getLessonById(lessonId);
            setLessonData(data);
            setTopicName(data.topicName || '');
        } catch {
            toast.error('Không thể tải dữ liệu báo giảng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchLessonData(id);
    }, [id]);

    const handleActivityTitleChange = (value: string, dayId: string, activityId: string) => {
        setLessonData((prev) => {
            if (!prev) return null;
            const updatedScheduleDays = prev.scheduleDays.map((day) => {
                if (day._id === dayId) {
                    const updatedActivities = day.activities.map((act) =>
                        act.activity === activityId ? { ...act, tittle: value } : act
                    );
                    return { ...day, activities: updatedActivities };
                }
                return day;
            });
            return { ...prev, scheduleDays: updatedScheduleDays };
        });
    };

    const handleUpdate = async () => {
        if (!lessonData || !id || !isEditable) return;

        const payload: ILessonPayload = {
            classId: lessonData.classId,
            schoolYearId: lessonData.schoolYearId,
            month: lessonData.month,
            weekNumber: lessonData.weekNumber,
            topicName: lessonData.topicName,
            class: '',
            schoolYear: '',
            scheduleDays: lessonData.scheduleDays.map((day) => ({
                date: day.date,
                dayName: day.dayName,
                isHoliday: day.isHoliday || false,
                notes: day.notes || '',
                activities: day.activities.map((act) => ({
                    activity: act.activity,
                    activityCode: act.activityCode || '',
                    activityName: act.activityName || '',
                    type: act.type || '',
                    tittle: act.tittle || '',
                    startTime: act.startTime,
                    endTime: act.endTime
                }))
            })),
        };

        try {
            setLoadingUpdate(true);
            await teacherApis.updateLesson(id, payload);
            toast.success('Cập nhật báo giảng thành công!');
            await fetchLessonData(id);
        } catch {
            toast.error('Cập nhật báo giảng thất bại.');
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleSend = async () => {
        if (!id) return;
        try {
            setLoadingSend(true);
            await teacherApis.sendLesson(id);
            toast.success('Gửi duyệt báo giảng thành công!');
            await fetchLessonData(id);
        } catch {
            toast.error('Gửi duyệt báo giảng thất bại.');
        } finally {
            setLoadingSend(false);
        }
    };

    const timeSlots = useMemo(() => {
        if (!lessonData) return [];
        const allActivities = lessonData.scheduleDays.flatMap((day) => day.activities);
        const uniqueStartTimes = [...new Set(allActivities.map((act) => act.startTime))];
        uniqueStartTimes.sort((a, b) => (a || 0) - (b || 0));
        return uniqueStartTimes.map(formatMinutesToTime);
    }, [lessonData]);

    return (
        <div style={{ padding: 16 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: 16
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Cập nhật Báo giảng Tuần {lessonData?.weekNumber}
                </Title>
                <Space size="small">
                    <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)}>
                        Trở về
                    </Button>
                    {isEditable && (
                        <>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleUpdate}
                                loading={loadingUpdate}
                            >
                                Cập nhật
                            </Button>
                            <Button
                                icon={<SendOutlined />}
                                onClick={handleSend}
                                loading={loadingSend}
                                style={{ background: '#52c41a', color: '#fff', borderColor: '#52c41a' }}
                            >
                                Gửi chờ duyệt
                            </Button>
                        </>
                    )}
                </Space>
            </div>

            <div
                style={{
                    marginBottom: 16,
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e8e8e8'
                }}
            >
                <Space size="large" wrap>
                    <Text>
                        <strong>Lớp:</strong>{' '}
                        <Tag color="blue">{lessonData?.className || 'N/A'}</Tag>
                    </Text>
                    <Text>
                        <strong>Năm học:</strong>{' '}
                        <Tag color="green">{lessonData?.schoolYear || 'N/A'}</Tag>
                    </Text>
                    <Text>
                        <strong>Trạng thái:</strong>{' '}
                        <Tag color={getStatusColor(lessonData?.status || '')}>
                            {lessonData?.status || 'Đang tải...'}
                        </Tag>
                    </Text>
                </Space>
                <div style={{ marginTop: 12 }}>
                    <Text strong>Chủ đề: </Text>
                    <Input value={topicName} disabled style={{ width: 300 }} />
                </div>
            </div>

            <div className="schedule-table-container">
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Thời gian</th>
                            {lessonData?.scheduleDays.map((day) => (
                                <th key={day._id}>
                                    <div>{day.dayName}</div>
                                    <div className="header-date">{dayjs(day.date).format('DD/MM')}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((time) => {
                            const rowCells = [];
                            const days: IScheduleDay[] = lessonData?.scheduleDays || [];

                            for (let i = 0; i < days.length; i++) {
                                const day = days[i];
                                const activity = day.activities.find(
                                    (act) => formatMinutesToTime(act.startTime) === time
                                );

                                if (activity && activity.type === 'Cố định') {
                                    let colSpan = 1;
                                    for (let j = i + 1; j < days.length; j++) {
                                        const nextDay = days[j];
                                        const nextActivity = nextDay.activities.find(
                                            (act) => formatMinutesToTime(act.startTime) === time
                                        );
                                        if (
                                            nextActivity &&
                                            nextActivity.type === 'Cố định' &&
                                            nextActivity.activityCode === activity.activityCode
                                        ) {
                                            colSpan++;
                                        } else break;
                                    }

                                    rowCells.push(
                                        <td key={day._id} colSpan={colSpan}>
                                            <div style={getActivityStyle(activity)}>
                                                <div>{activity.activityName || 'Trống'}</div>
                                            </div>
                                        </td>
                                    );
                                    i += colSpan - 1;
                                } else {
                                    rowCells.push(
                                        <td key={day._id}>
                                            {activity && (
                                                <div style={getActivityStyle(activity)}>
                                                    <div>{activity.activityName || 'Trống'}</div>
                                                    {activity.type === 'Bình thường' && (
                                                        <div style={{ marginTop: 4 }}>
                                                            {isEditable ? (
                                                                <Input.TextArea
                                                                    defaultValue={activity.tittle}
                                                                    onChange={(e) =>
                                                                        handleActivityTitleChange(e.target.value, day._id, activity.activity)
                                                                    }
                                                                    placeholder="Nhập nội dung bài giảng"
                                                                    autoSize={{ minRows: 1, maxRows: 3 }}
                                                                    style={{ fontSize: 13, width: '100%' }}
                                                                />
                                                            ) : (
                                                                <div style={{ fontSize: 13, textAlign: 'left', marginTop: 4 }}>
                                                                    {activity.tittle?.split('\n').map((line, idx) => (
                                                                        <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: 4 }}>
                                                                            <span style={{ fontWeight: 'bold', color: '#52c41a' }}>•</span>
                                                                            <span>{line}</span>
                                                                        </div>
                                                                    ))}

                                                                </div>

                                                            )}
                                                        </div>
                                                    )}

                                                </div>
                                            )}
                                        </td>
                                    );
                                }
                            }

                            return (
                                <tr key={time}>
                                    <td style={{ textAlign: 'center', fontWeight: 500 }}>{time}</td>
                                    {rowCells}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UpdateReport;
