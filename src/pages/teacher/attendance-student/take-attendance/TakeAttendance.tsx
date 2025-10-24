import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Card, DatePicker, List, Radio, Input, Button, Spin, Typography,
    Row, Col, Form, Empty, Select, Space, Tag, Avatar, Divider
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';
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
import { useCurrentUser } from '../../../../hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import { IAttendanceCreatePayload, IAttendanceDetailResponse, IAttendanceStudentPayload, IClassInfo, IStudent, ITeacherClassStudentResponse } from '../../../../types/teacher';
import { teacherApis } from '../../../../services/apiServices';


const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

interface IStudentAttendanceState {
    status: TAttendanceStatus;
    note?: string;
}

function TakeAttendance() {
    const user = useCurrentUser();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [teacherData, setTeacherData] = useState<ITeacherClassStudentResponse | null>(null);
    const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
    const [attendanceState, setAttendanceState] = useState<Map<string, IStudentAttendanceState>>(new Map());
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

    const [currentAttendanceId, setCurrentAttendanceId] = useState<string | null>(null);
    const [generalNote, setGeneralNote] = useState<string>('');

    const [isLoadingTeacherData, setIsLoadingTeacherData] = useState(true);
    const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const teacherId = useMemo(() => user?.staff, [user]);

    const currentClass: IClassInfo | undefined = useMemo(() => {
        return teacherData?.classes?.find(c => c._id === selectedClassId);
    }, [teacherData, selectedClassId]);

    const studentList: IStudent[] = useMemo(() => {
        return currentClass?.students || [];
    }, [currentClass]);

    useEffect(() => {
        if (teacherId) {
            setIsLoadingTeacherData(true);
            teacherApis.getClassAndStudentByTeacher(teacherId)
                .then(data => {
                    setTeacherData(data);
                    if (data.classes && data.classes.length > 0) {
                        setSelectedClassId(data.classes[0]._id);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Lỗi khi tải thông tin lớp học của giáo viên.');
                })
                .finally(() => {
                    setIsLoadingTeacherData(false);
                });
        }
    }, [teacherId]);

    useEffect(() => {
        const defaultState = new Map<string, IStudentAttendanceState>();
        studentList.forEach(student => {
            defaultState.set(student._id, { status: 'Vắng mặt không phép', note: '' });
        });
        setAttendanceState(defaultState);

        setGeneralNote('');
        form.setFieldsValue({ generalNote: '' });
        setCurrentAttendanceId(null);
    }, [studentList, form]);

    const fetchAttendanceData = useCallback(async (classId: string, date: string) => {
        if (!classId || !date || studentList.length === 0) {
            return;
        }

        setIsFetchingAttendance(true);
        try {
            const data: IAttendanceDetailResponse = await teacherApis.getAttendanceByClassAndDate(classId, date);

            const newAttendanceState = new Map<string, IStudentAttendanceState>();
            data.students.forEach(item => {
                newAttendanceState.set(item.student._id, {
                    status: item.status as TAttendanceStatus,
                    note: item.note || ''
                });
            });

            setAttendanceState(newAttendanceState);
            setGeneralNote(data.generalNote || '');
            form.setFieldsValue({ generalNote: data.generalNote || '' });
            setCurrentAttendanceId(data._id);
            if (dayjs().isSame(selectedDate, 'day')) {
                toast.info('Bạn đã điểm danh hôm nay. Không thể điểm danh lại.');
            }

        } catch (error: any) {
            if (error?.response?.status === 404) {
            } else {
                console.error(error);
            }
        } finally {
            setIsFetchingAttendance(false);
        }
    }, [form, studentList.length]);
    useEffect(() => {
        if (selectedClassId) {
            fetchAttendanceData(selectedClassId, selectedDate.format('YYYY-MM-DD'));
        }
    }, [selectedClassId, selectedDate, fetchAttendanceData]);

    const handleAttendanceChange = (
        studentId: string,
        field: 'status' | 'note',
        value: string
    ) => {
        setAttendanceState(prevMap => {
            const newMap = new Map(prevMap);
            const currentState = newMap.get(studentId) || { status: 'Vắng mặt không phép', note: '' };

            if (field === 'status') {
                currentState.status = value as TAttendanceStatus;
            } else {
                currentState.note = value;
            }

            newMap.set(studentId, currentState);
            return newMap;
        });
    };

    const handleSubmit = async () => {
        if (!currentClass || !teacherId || !teacherData) {
            toast.error('Lỗi: Không tìm thấy thông tin giáo viên hoặc lớp.');
            return;
        }

        if (currentAttendanceId) {
            toast.warning('Buổi học hôm nay đã được điểm danh.');
            return;
        }

        setIsSaving(true);
        const studentsPayload: IAttendanceStudentPayload[] = Array.from(attendanceState.entries())
            .map(([studentId, data]) => ({
                student: studentId,
                status: data.status,
                note: data.note || undefined
            }));

        const payload: IAttendanceCreatePayload = {
            class: currentClass._id,
            schoolYear: currentClass.schoolYear._id,
            date: selectedDate.format('YYYY-MM-DD'),
            students: studentsPayload,
            takenBy: teacherId,
            generalNote: generalNote || undefined
        };

        try {
            const newData = await teacherApis.createAttendance(payload);
            setCurrentAttendanceId(newData._id);
            toast.success('Đã lưu điểm danh thành công!');
        } catch (error) {
            console.error(error);
            toast.error('Lưu điểm danh thất bại. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    const attendanceSummary = useMemo(() => {
        const stats = {
            present: 0,
            late: 0,
            absentPermitted: 0,
            absentNotPermitted: 0,
            total: 0
        };
        stats.total = studentList.length;
        for (const state of attendanceState.values()) {
            if (state.status === 'Có mặt') stats.present++;
            else if (state.status === 'Đi muộn') stats.late++;
            else if (state.status === 'Vắng mặt có phép') stats.absentPermitted++;
            else if (state.status === 'Vắng mặt không phép') stats.absentNotPermitted++;
        }
        return stats;
    }, [attendanceState, studentList]);

    if (isLoadingTeacherData) {
        return <Spin tip="Đang tải thông tin giáo viên..." fullscreen />;
    }

    if (!teacherData || !teacherData.classes || teacherData.classes.length === 0) {
        return (
            <div style={{ padding: '50px' }}>
                <Empty description="Giáo viên chưa được gán vào lớp học nào." />
            </div>
        );
    }

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
                                    <TeamOutlined /> Điểm danh
                                </Title>
                                {teacherData.schoolYear && (
                                    <Tag color="cyan" style={{ fontSize: '16px', padding: '6px 12px' }}>
                                        Năm học: {teacherData.schoolYear.schoolYear}
                                    </Tag>
                                )}
                            </Space>
                        </Col>
                    </Row>
                }
                extra={
                    <Space>
                        <Select
                            value={selectedClassId}
                            style={{ width: 200 }}
                            size="large"
                            placeholder="Chọn lớp"
                            onChange={(value) => setSelectedClassId(value)}
                        >
                            {teacherData.classes.map(cls => (
                                <Option key={cls._id} value={cls._id}>{cls.className}</Option>
                            ))}
                        </Select>
                        <DatePicker
                            size="large"
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date || dayjs())}
                            format="DD/MM/YYYY"
                            allowClear={false}
                        />
                    </Space>
                }
            >
                {currentClass && (
                    <>
                        <Space wrap size="small" style={{ marginBottom: 16 }}>
                            <Tag color="default" style={{ fontSize: 14, padding: '4px 8px' }}>
                                Sĩ số: {attendanceSummary.total}
                            </Tag>
                            <Tag color="green" style={{ fontSize: 14, padding: '4px 8px' }}>
                                Có mặt: {attendanceSummary.present}
                            </Tag>
                            <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>
                                Đi muộn: {attendanceSummary.late}
                            </Tag>
                            <Tag color="orange" style={{ fontSize: 14, padding: '4px 8px' }}>
                                Vắng (P): {attendanceSummary.absentPermitted}
                            </Tag>
                            <Tag color="red" style={{ fontSize: 14, padding: '4px 8px' }}>
                                Vắng (K): {attendanceSummary.absentNotPermitted}
                            </Tag>
                        </Space>
                        <Divider style={{ margin: '8px 0 16px' }} />
                    </>
                )}

                <Spin spinning={isFetchingAttendance || isSaving} tip={isFetchingAttendance ? "Đang tải dữ liệu điểm danh..." : "Đang lưu..."}>
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        {!currentClass ? (
                            <Empty description="Vui lòng chọn một lớp để điểm danh." />
                        ) : studentList.length === 0 ? (
                            <Empty description="Lớp học này chưa có học sinh." />
                        ) : (
                            <List
                                itemLayout="vertical"
                                dataSource={studentList}
                                renderItem={(student) => {
                                    const state = attendanceState.get(student._id) || { status: 'Vắng mặt không phép', note: '' };
                                    const showNote = state.status !== 'Có mặt';

                                    return (
                                        <List.Item
                                            key={student._id}
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
                                                                {student.fullName}
                                                            </Text>
                                                            <Text type="secondary" style={{ display: 'block' }}>
                                                                {student.studentCode}
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </Col>

                                                <Col xs={24} sm={16} md={12}>
                                                    <Radio.Group
                                                        value={state.status}
                                                        onChange={(e) => handleAttendanceChange(student._id, 'status', e.target.value)}
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
                                                            onChange={(e) => handleAttendanceChange(student._id, 'note', e.target.value)}
                                                        />
                                                    )}
                                                </Col>
                                            </Row>
                                        </List.Item>
                                    );
                                }}
                            />
                        )}

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
                                disabled={isFetchingAttendance || studentList.length === 0 || !!currentAttendanceId}
                            >
                                {currentAttendanceId ? 'Đã điểm danh' : 'Lưu điểm danh'}
                            </Button>
                        </Form.Item>

                    </Form>
                </Spin>
            </Card>
        </div>
    );
}

export default TakeAttendance;