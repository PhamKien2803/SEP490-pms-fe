import React, { useState, useEffect, useMemo } from 'react';
import {
    Card, List, Radio, Input, Button, Spin, Typography,
    Row, Col, Form, Empty, Space, Tag, Avatar, Divider, DatePicker,
    Tooltip
} from 'antd';
import {
    SaveOutlined,
    TeamOutlined,
    ReadOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MinusCircleOutlined,
    EditOutlined, ArrowLeftOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs, { Dayjs } from 'dayjs';

import { teacherApis } from '../../../../services/apiServices';
import {
    IAttendanceDetailResponse,
    IAttendanceUpdatePayload,
    IGuardian
} from '../../../../types/teacher';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { TextArea } = Input;

type TAttendanceStatus = 'Có mặt' | 'Đã đón trẻ' | 'Vắng mặt';

const STATUS_CONFIG: Record<TAttendanceStatus, {
    icon: React.ReactNode;
    color: string;
    text: string;
}> = {
    'Có mặt': { icon: <CheckCircleOutlined />, color: '#52c41a', text: 'Có mặt' },
    'Đã đón trẻ': { icon: <MinusCircleOutlined />, color: '#fa8c16', text: 'Đã đón trẻ' },
    'Vắng mặt': { icon: <CloseCircleOutlined />, color: '#f5222d', text: 'Vắng mặt' },
};

interface IStudentAttendanceState {
    status: TAttendanceStatus;
    note?: string;
    noteCheckout?: string;
    timeCheckIn?: string | null;
    timeCheckOut?: string | null;
    guardian?: IGuardian | null;
}

function EditAttendance() {
    usePageTitle('Chỉnh sửa điểm danh - Cá Heo Xanh');
    const { id: attendanceId } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [attendanceData, setAttendanceData] = useState<IAttendanceDetailResponse | null>(null);
    const [attendanceState, setAttendanceState] = useState<Map<string, IStudentAttendanceState>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [generalNote, setGeneralNote] = useState<string>('');
    const [isEditLocked, setIsEditLocked] = useState(false);
    const [editingTimeStudentId, setEditingTimeStudentId] = useState<string | null>(null);


    useEffect(() => {
        if (attendanceId) {
            setIsLoading(true);
            teacherApis.getAttendanceById(attendanceId)
                .then(data => {
                    setAttendanceData(data);
                    setGeneralNote(data.generalNote || '');
                    form.setFieldsValue({ generalNote: data.generalNote || '' });

                    const stateMap = new Map<string, IStudentAttendanceState>();
                    data.students.forEach(item => {
                        let normalizedStatus: TAttendanceStatus;
                        const oldStatus = item.status as any;

                        if (oldStatus === 'Có mặt' || oldStatus === 'Đi muộn') {
                            normalizedStatus = 'Có mặt';
                        } else if (oldStatus === 'Đã đón trẻ') {
                            normalizedStatus = 'Đã đón trẻ';
                        } else {
                            normalizedStatus = 'Vắng mặt';
                        }

                        stateMap.set(item.student._id, {
                            status: normalizedStatus,
                            note: item.note || '',
                            noteCheckout: item.noteCheckout || '',
                            timeCheckIn: item.timeCheckIn || null,
                            timeCheckOut: item.timeCheckOut || null,
                            guardian: item.guardian || null
                        });
                    });
                    setAttendanceState(stateMap);

                    const attendanceDate = dayjs(data.date);
                    const today = dayjs();
                    const diffDays = today.diff(attendanceDate, 'day');

                    if (diffDays > 0) {
                        setIsEditLocked(true);
                        toast.info('Điểm danh này đã quá hạn 1 ngày và không thể chỉnh sửa.');
                    }

                })
                .catch(error => {
                    console.error(error);
                    toast.error('Không thể tải dữ liệu điểm danh.');
                })
                .finally(() => setIsLoading(false));
        }
    }, [attendanceId, form]);

    const handleAttendanceChange = (
        studentId: string,
        field: 'status' | 'note' | 'noteCheckout' | 'timeCheckOut',
        value: string | Dayjs | null
    ) => {
        setAttendanceState(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(studentId) || {
                status: 'Vắng mặt',
                note: '',
                noteCheckout: '',
                timeCheckIn: null,
                timeCheckOut: null,
                guardian: null
            };

            if (field === 'status') {
                current.status = value as TAttendanceStatus;
                if (current.status === 'Đã đón trẻ' && !current.timeCheckOut) {
                    current.timeCheckOut = dayjs().toISOString();
                }
            } else if (field === 'note') {
                current.note = value as string;
            } else if (field === 'noteCheckout') {
                current.noteCheckout = value as string;
            } else if (field === 'timeCheckOut') {
                current.timeCheckOut = dayjs.isDayjs(value) ? value.toISOString() : (value as string | null);
                // Không tắt edit ở đây, để onBlur xử lý
            }

            newMap.set(studentId, current);
            return newMap;
        });
    };

    const handleSubmit = async () => {
        if (!attendanceData) return;

        const payload: IAttendanceUpdatePayload = {
            class: attendanceData.class._id,
            schoolYear: attendanceData.schoolYear._id,
            date: attendanceData.date,
            generalNote: generalNote || undefined,
            takenBy: attendanceData.takenBy._id,
            students: Array.from(attendanceState.entries()).map(([studentId, data]) => ({
                student: studentId,
                status: data.status,
                note: data.note || undefined,
                noteCheckout: data.noteCheckout || undefined,
                timeCheckIn: data.timeCheckIn || null,
                timeCheckOut: data.timeCheckOut || null,
                guardian: data.guardian?._id || null,
            }))
        };

        setIsSaving(true);
        try {
            await teacherApis.updateAttendance(attendanceId!, payload);
            toast.success('Cập nhật điểm danh thành công!');
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Cập nhật thất bại.');
        } finally {
            setIsSaving(false);
        }
    };

    const summary = useMemo(() => {
        const stats = { present: 0, absent: 0, pickedUpChild: 0, total: attendanceData?.students.length || 0 };
        attendanceState.forEach(val => {
            if (val.status === 'Có mặt') stats.present++;
            else if (val.status === 'Đã đón trẻ') stats.pickedUpChild++;
            else if (val.status === 'Vắng mặt') stats.absent++;
        });
        return stats;
    }, [attendanceState, attendanceData]);

    if (isLoading) return <Spin fullscreen tip="Đang tải dữ liệu..." />;

    if (!attendanceData) return <Empty description="Không tìm thấy dữ liệu điểm danh." />;

    return (
        <div style={{ padding: '24px' }}>
            <Card
                bordered={false}
                title={
                    <Row align="middle" gutter={16} wrap={false}>
                        <Col>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                                style={{ border: 'none', boxShadow: 'none' }}
                            />
                        </Col>
                        <Col flex="auto">
                            <Space size="large" wrap>
                                <Title level={3} style={{ margin: 0 }}>
                                    <TeamOutlined /> Cập nhật điểm danh
                                </Title>
                                <Tag color="blue">
                                    Lớp: {attendanceData?.class?.className}
                                </Tag>
                                <Tag color="cyan">
                                    Ngày: {dayjs(attendanceData?.date).format('DD/MM/YYYY')}
                                </Tag>
                            </Space>
                        </Col>
                    </Row>
                }
            >
                <Space wrap size="small" style={{ marginBottom: 16 }}>
                    <Tag color="default" style={{ fontSize: 14, padding: '4px 8px' }}>Sĩ số: {summary?.total}</Tag>
                    <Tag color="green" style={{ fontSize: 14, padding: '4px 8px' }}>Có mặt: {summary?.present}</Tag>
                    <Tag color="orange" style={{ fontSize: 14, padding: '4px 8px' }}>Đã đón trẻ: {summary?.pickedUpChild}</Tag>
                    <Tag color="red" style={{ fontSize: 14, padding: '4px 8px' }}>Vắng mặt: {summary?.absent}</Tag>
                </Space>

                <Divider style={{ margin: '8px 0 16px' }} />

                <Spin spinning={isSaving} tip="Đang lưu...">
                    <Form layout="vertical" form={form} onFinish={handleSubmit}>
                        <List
                            itemLayout="vertical"
                            dataSource={attendanceData.students}
                            renderItem={(item) => {
                                const state = attendanceState.get(item.student._id) || {
                                    status: 'Vắng mặt',
                                    note: '',
                                    noteCheckout: '',
                                    timeCheckIn: null,
                                    timeCheckOut: null,
                                    guardian: null
                                };

                                const isEditingTime = editingTimeStudentId === item.student._id;

                                return (
                                    <List.Item
                                        key={item?.student._id}
                                        style={{
                                            padding: '16px 24px',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                    >
                                        <Row align="top" gutter={[16, 16]}>
                                            <Col xs={24} sm={8} md={6}>
                                                <Space>
                                                    <Avatar
                                                        size={48}
                                                        src={item?.student?.imageStudent}
                                                        icon={!item?.student?.imageStudent && <UserOutlined />}
                                                        style={{ backgroundColor: '#f0f0f0' }}
                                                    />

                                                    <div>
                                                        <Text strong style={{ fontSize: '15px' }}>
                                                            {item?.student?.fullName} - {item?.student?.nickname}
                                                        </Text>
                                                        <Text type="secondary" style={{ display: 'block' }}>
                                                            {item?.student?.studentCode}
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </Col>

                                            <Col xs={24} sm={16} md={8}>
                                                <Radio.Group
                                                    value={state.status}
                                                    onChange={(e) => handleAttendanceChange(item?.student._id, 'status', e.target.value)}
                                                >
                                                    <Space wrap>
                                                        {Object.keys(STATUS_CONFIG).map((key) => {
                                                            const statusKey = key as TAttendanceStatus;
                                                            const config = STATUS_CONFIG[statusKey];
                                                            return (
                                                                <Radio.Button key={statusKey} value={statusKey}>
                                                                    <Space>
                                                                        {React.cloneElement(config.icon as any, {
                                                                            style: {
                                                                                color:
                                                                                    state.status === statusKey
                                                                                        ? undefined
                                                                                        : config.color,
                                                                            },
                                                                        })}
                                                                        {config.text}
                                                                    </Space>
                                                                </Radio.Button>
                                                            );
                                                        })}
                                                    </Space>
                                                </Radio.Group>
                                            </Col>

                                            <Col xs={24} sm={24} md={10}>
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    {(state?.status === 'Có mặt' || state?.status === 'Đã đón trẻ') && state?.timeCheckIn && (
                                                        <Text style={{ fontSize: '14px', color: '#595959' }}>
                                                            <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                                            Giờ vào: {dayjs(state?.timeCheckIn).format('HH:mm')}
                                                        </Text>
                                                    )}

                                                    {state?.status === 'Đã đón trẻ' && (
                                                        isEditingTime ? (
                                                            <DatePicker
                                                                picker="time"
                                                                format="HH:mm"
                                                                value={state?.timeCheckOut ? dayjs(state?.timeCheckOut) : null}
                                                                onChange={(time) => handleAttendanceChange(item.student._id, 'timeCheckOut', time)}
                                                                onBlur={() => setEditingTimeStudentId(null)}
                                                                placeholder="Chọn giờ đón"
                                                                suffixIcon={<ClockCircleOutlined />}
                                                                style={{ width: '100%' }}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <Text
                                                                style={{ fontSize: '14px', color: '#595959', cursor: 'pointer', display: 'inline-block' }}
                                                                onClick={() => setEditingTimeStudentId(item.student._id)}
                                                            >
                                                                <Tooltip title="Chỉnh sửa giờ ra">
                                                                    <EditOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                                                                    Giờ ra: {state?.timeCheckOut ? dayjs(state?.timeCheckOut).format('HH:mm') : 'Chưa có'}
                                                                </Tooltip>

                                                            </Text>
                                                        )
                                                    )}

                                                    {state?.status === 'Đã đón trẻ' && (
                                                        <Input
                                                            prefix={<EditOutlined style={{ color: '#8c8c8c' }} />}
                                                            placeholder="Ghi chú khi đón"
                                                            value={state?.noteCheckout}
                                                            onChange={(e) => handleAttendanceChange(item.student._id, 'noteCheckout', e.target.value)}
                                                        />
                                                    )}

                                                    {state?.status === 'Vắng mặt' && (
                                                        <Input
                                                            prefix={<EditOutlined style={{ color: '#8c8c8c' }} />}
                                                            placeholder="Ghi chú (Bị ốm, ...)"
                                                            value={state?.note}
                                                            onChange={(e) => handleAttendanceChange(item.student._id, 'note', e.target.value)}
                                                        />
                                                    )}

                                                    <div style={{ marginTop: 8 }}>
                                                        <Text strong>Người đón:</Text>{' '}
                                                        <Text>
                                                            {state?.guardian?.fullName || '-'} ({state?.guardian?.relationship || '...'}) - ({state.guardian?.phoneNumber || '...'})
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </List.Item>
                                );
                            }}
                        />

                        <Form.Item
                            name="generalNote"
                            label={<Title level={5}><ReadOutlined /> Ghi chú chung cho buổi học</Title>}
                            style={{ marginTop: '24px' }}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Nhập ghi chú chung (ví dụ: Lớp ngoan, thời tiết...)"
                                onChange={(e) => setGeneralNote(e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                icon={<SaveOutlined />}
                                loading={isSaving}
                                disabled={isEditLocked}
                            >
                                Lưu cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );

}

export default EditAttendance;