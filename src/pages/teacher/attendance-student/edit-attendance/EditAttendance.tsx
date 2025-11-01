import React, { useState, useEffect, useMemo } from 'react';
import {
    Card, List, Radio, Input, Button, Spin, Typography,
    Row, Col, Form, Empty, Space, Tag, Avatar, Divider
} from 'antd';
import {
    SaveOutlined,
    TeamOutlined,
    ReadOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MinusCircleOutlined,
    ClockCircleOutlined,
    EditOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { teacherApis } from '../../../../services/apiServices';
import { IAttendanceDetailResponse, IAttendanceUpdatePayload } from '../../../../types/teacher';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { TextArea } = Input;

type TAttendanceStatus = 'Có mặt' | 'Vắng mặt có phép' | 'Vắng mặt không phép' | 'Đi muộn';

const STATUS_CONFIG: Record<TAttendanceStatus, {
    icon: React.ReactNode;
    color: string;
    text: string;
}> = {
    'Có mặt': {
        icon: <CheckCircleOutlined />,
        color: '#52c41a',
        text: 'Có mặt'
    },
    'Đi muộn': {
        icon: <ClockCircleOutlined />,
        color: '#1890ff',
        text: 'Đi muộn'
    },
    'Vắng mặt có phép': {
        icon: <MinusCircleOutlined />,
        color: '#faad14',
        text: 'Vắng (P)'
    },
    'Vắng mặt không phép': {
        icon: <CloseCircleOutlined />,
        color: '#f5222d',
        text: 'Vắng (K)'
    },
};

function EditAttendance() {
    usePageTitle('Chỉnh sửa điểm danh - Cá Heo Xanh');
    const { id: attendanceId } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [attendanceData, setAttendanceData] = useState<IAttendanceDetailResponse | null>(null);
    const [attendanceState, setAttendanceState] = useState<Map<string, { status: TAttendanceStatus; note?: string }>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [generalNote, setGeneralNote] = useState<string>('');
    const [isEditLocked, setIsEditLocked] = useState(false);


    useEffect(() => {
        if (attendanceId) {
            setIsLoading(true);
            teacherApis.getAttendanceById(attendanceId)
                .then(data => {
                    setAttendanceData(data);
                    setGeneralNote(data.generalNote || '');
                    form.setFieldsValue({ generalNote: data.generalNote || '' });

                    const stateMap = new Map();
                    data.students.forEach(item => {
                        stateMap.set(item.student._id, {
                            status: item.status as TAttendanceStatus,
                            note: item.note || ''
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

    const handleAttendanceChange = (studentId: string, field: 'status' | 'note', value: string) => {
        setAttendanceState(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(studentId) || { status: 'Vắng mặt không phép', note: '' };
            if (field === 'status') current.status = value as TAttendanceStatus;
            else current.note = value;
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
                note: data.note || undefined
            }))
        };

        setIsSaving(true);
        try {
            await teacherApis.updateAttendance(attendanceId!, payload);
            toast.success('Cập nhật điểm danh thành công!');
            // navigate(-1);
        } catch (error) {
            console.error(error);
            toast.error('Cập nhật thất bại.');
        } finally {
            setIsSaving(false);
        }
    };

    const summary = useMemo(() => {
        const stats = { present: 0, late: 0, absentPermitted: 0, absentNotPermitted: 0, total: attendanceData?.students.length || 0 };
        attendanceState.forEach(val => {
            if (val.status === 'Có mặt') stats.present++;
            else if (val.status === 'Đi muộn') stats.late++;
            else if (val.status === 'Vắng mặt có phép') stats.absentPermitted++;
            else if (val.status === 'Vắng mặt không phép') stats.absentNotPermitted++;
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
                                    Lớp: {attendanceData.class.className}
                                </Tag>
                                <Tag color="cyan">
                                    Ngày: {dayjs(attendanceData.date).format('DD/MM/YYYY')}
                                </Tag>
                            </Space>
                        </Col>
                    </Row>
                }
            >
                <Space wrap size="small" style={{ marginBottom: 16 }}>
                    <Tag color="default" style={{ fontSize: 14, padding: '4px 8px' }}>Sĩ số: {summary.total}</Tag>
                    <Tag color="green" style={{ fontSize: 14, padding: '4px 8px' }}>Có mặt: {summary.present}</Tag>
                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>Đi muộn: {summary.late}</Tag>
                    <Tag color="orange" style={{ fontSize: 14, padding: '4px 8px' }}>Vắng (P): {summary.absentPermitted}</Tag>
                    <Tag color="red" style={{ fontSize: 14, padding: '4px 8px' }}>Vắng (K): {summary.absentNotPermitted}</Tag>
                </Space>

                <Divider style={{ margin: '8px 0 16px' }} />

                <Spin spinning={isSaving} tip="Đang lưu...">
                    <Form layout="vertical" form={form} onFinish={handleSubmit}>
                        <List
                            itemLayout="vertical"
                            dataSource={attendanceData.students}
                            renderItem={(item) => {
                                const state = attendanceState.get(item.student._id) || { status: 'Vắng mặt không phép', note: '' };
                                const showNote = state.status !== 'Có mặt';

                                return (
                                    <List.Item
                                        key={item.student._id}
                                        style={{
                                            padding: '16px 24px',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                    >
                                        <Row align="middle" gutter={[16, 16]}>
                                            <Col xs={24} sm={8} md={6}>
                                                <Space>
                                                    <Avatar
                                                        style={{ backgroundColor: '#87d068' }}
                                                        icon={<UserOutlined />}
                                                    />
                                                    <div>
                                                        <Text strong style={{ fontSize: '15px' }}>
                                                            {item.student.fullName}
                                                        </Text>
                                                        <Text type="secondary" style={{ display: 'block' }}>
                                                            {item.student.studentCode}
                                                        </Text>
                                                    </div>
                                                </Space>
                                            </Col>

                                            <Col xs={24} sm={16} md={12}>
                                                <Radio.Group
                                                    value={state.status}
                                                    onChange={(e) => handleAttendanceChange(item.student._id, 'status', e.target.value)}
                                                >
                                                    <Space wrap>
                                                        {Object.keys(STATUS_CONFIG).map((key) => {
                                                            const statusKey = key as TAttendanceStatus;
                                                            const config = STATUS_CONFIG[statusKey];
                                                            return (
                                                                <Radio.Button key={statusKey} value={statusKey}>
                                                                    <Space>
                                                                        {React.isValidElement(config.icon) &&
                                                                            React.cloneElement(config.icon, {
                                                                                ...(React.isValidElement(config.icon) && { style: { color: state.status === statusKey ? undefined : config.color } })
                                                                            })}
                                                                        {config.text}
                                                                    </Space>
                                                                </Radio.Button>
                                                            );
                                                        })}
                                                    </Space>
                                                </Radio.Group>
                                            </Col>

                                            <Col xs={24} sm={24} md={6}>
                                                {showNote && (
                                                    <Input
                                                        prefix={<EditOutlined style={{ color: '#8c8c8c' }} />}
                                                        placeholder="Ghi chú (Bị ốm, ...)"
                                                        value={state.note}
                                                        onChange={(e) => handleAttendanceChange(item.student._id, 'note', e.target.value)}
                                                    />
                                                )}
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
