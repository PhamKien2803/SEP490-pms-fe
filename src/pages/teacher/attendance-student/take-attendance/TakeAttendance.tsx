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
    EditOutlined,
    ArrowLeftOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import {
    IAttendanceCreatePayload,
    IAttendanceDetailResponse,
    IAttendanceStudentPayload,
    IClassInfo,
    IStudent,
    ITeacherClassStudentResponse
} from '../../../../types/teacher';
import { SchoolYearListItem } from '../../../../types/schoolYear';
import { teacherApis, schoolYearApis } from '../../../../services/apiServices';
import { usePageTitle } from '../../../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type TAttendanceStatus = 'Có mặt' | 'Vắng mặt';

const STATUS_CONFIG: Record<TAttendanceStatus, {
    icon: React.ReactNode;
    color: string;
    text: string;
}> = {
    'Có mặt': { icon: <CheckCircleOutlined />, color: '#52c41a', text: 'Có mặt' },
    'Vắng mặt': { icon: <CloseCircleOutlined />, color: '#f5222d', text: 'Vắng mặt' },
};

interface IStudentAttendanceState {
    status: TAttendanceStatus;
    note?: string;
    timeCheckIn?: string | null;
}


function TakeAttendance() {
    const user = useCurrentUser();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    usePageTitle('Tạo điểm danh - Cá Heo Xanh');
    const teacherId = useMemo(() => user?.staff, [user]);

    const [_, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [__, setSelectedSchoolYearId] = useState<string | undefined>();
    const [teacherData, setTeacherData] = useState<ITeacherClassStudentResponse | null>(null);
    const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
    const [attendanceState, setAttendanceState] = useState<Map<string, IStudentAttendanceState>>(new Map());
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [currentAttendanceId, setCurrentAttendanceId] = useState<string | null>(null);
    const [generalNote, setGeneralNote] = useState<string>('');
    const [isFutureDate, setIsFutureDate] = useState(false);
    const [isPastDate, setIsPastDate] = useState(false);
    const [isLoadingTeacherData, setIsLoadingTeacherData] = useState(true);
    const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const currentClass: IClassInfo | undefined = useMemo(
        () => teacherData?.classes?.find((c) => c._id === selectedClassId),
        [teacherData, selectedClassId]
    );
    const studentList: IStudent[] = useMemo(
        () => currentClass?.students || [],
        [currentClass]
    );

    useEffect(() => {
        const init = async () => {
            if (!teacherId) return;
            setIsLoadingTeacherData(true);

            try {
                const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
                const sorted = res.data.sort(
                    (a, b) =>
                        parseInt(b.schoolYear.split('-')[0]) -
                        parseInt(a.schoolYear.split('-')[0])
                );
                setSchoolYears(sorted);
                const activeYear = sorted.find((y) => y.state === 'Đang hoạt động')?._id || sorted[0]?._id;
                setSelectedSchoolYearId(activeYear);

                if (activeYear && !teacherData) {
                    const data = await teacherApis.getClassAndStudentByTeacher(teacherId, activeYear);
                    setTeacherData(data);
                    if (data.classes?.length > 0) {
                        setSelectedClassId(data.classes[0]._id);
                    }
                }
            } catch (error) {
                typeof error === "string"
                    ? toast.info(error)
                    : toast.error('Không thể tải thông tin giáo viên hoặc năm học.');
            } finally {
                setIsLoadingTeacherData(false);
            }
        };

        init();
    }, [teacherId, teacherData]);




    useEffect(() => {
        const defaultState = new Map<string, IStudentAttendanceState>();
        studentList.forEach((student) => {
            defaultState.set(student._id, {
                status: 'Vắng mặt',
                note: '',
                timeCheckIn: null,
            });
        });
        setAttendanceState(defaultState);
        setGeneralNote('');
        form.setFieldsValue({ generalNote: '' });
        // setCurrentAttendanceId(null);
    }, [studentList, form]);

    const fetchAttendanceData = useCallback(
        async (classId: string, date: string) => {
            if (!classId || !date || studentList.length === 0) return;
            setCurrentAttendanceId(null);
            setIsFetchingAttendance(true);
            try {
                const data: IAttendanceDetailResponse =
                    await teacherApis.getAttendanceByClassAndDate(classId, date);

                const newState = new Map<string, IStudentAttendanceState>();
                data.students.forEach((item) => {
                    let normalizedStatus: TAttendanceStatus;
                    const oldStatus = item.status as any;

                    if (oldStatus === 'Có mặt' || oldStatus === 'Đi muộn') {
                        normalizedStatus = 'Có mặt';
                    } else {
                        normalizedStatus = 'Vắng mặt';
                    }

                    newState.set(item.student._id, {
                        status: normalizedStatus,
                        note: item.note || item.noteCheckout || '',
                        timeCheckIn: item.timeCheckIn || null,
                    });
                });
                setAttendanceState(newState);
                setGeneralNote(data.generalNote || '');
                form.setFieldsValue({ generalNote: data.generalNote || '' });
                setCurrentAttendanceId(data._id);

                if (dayjs().isSame(selectedDate, 'day')) {
                    toast.info('Bạn đã điểm danh hôm nay. Không thể điểm danh lại.');
                }
            } catch (error: any) {
                if (error?.response?.status !== 404) {
                    console.error(error);
                }
            } finally {
                setIsFetchingAttendance(false);
            }
        },
        [form, studentList.length, selectedDate]
    );

    useEffect(() => {
        if (selectedClassId) {
            fetchAttendanceData(selectedClassId, selectedDate.format('YYYY-MM-DD'));
        }
    }, [selectedClassId, selectedDate, fetchAttendanceData]);

    useEffect(() => {
        const now = dayjs().startOf('day');
        const selected = selectedDate.startOf('day');
        setIsFutureDate(selected.isAfter(now));
        setIsPastDate(selected.isBefore(now));
    }, [selectedDate]);



    const handleAttendanceChange = (
        studentId: string,
        field: 'status' | 'note',
        value: string
    ) => {
        setAttendanceState((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(studentId) || {
                status: 'Vắng mặt',
                note: '',
                timeCheckIn: null,
            };
            if (field === 'status') {
                current.status = value as TAttendanceStatus;
                if (current.status === 'Có mặt') {
                    current.timeCheckIn = dayjs().toISOString();
                } else {
                    current.timeCheckIn = null;
                }
            } else if (field === 'note') {
                current.note = value;
            }
            newMap.set(studentId, current);
            return newMap;
        });
    };

    const handleSubmit = async () => {
        if (!currentClass || !teacherId || !teacherData) {
            toast.error('Thiếu thông tin giáo viên hoặc lớp học.');
            return;
        }

        if (currentAttendanceId) {
            toast.warning('Buổi học hôm nay đã được điểm danh.');
            return;
        }
        const guardianMap = new Map(
            teacherData.classes[0].students.map((s) => [
                s._id,
                s.guardianToday?._id || null
            ])
        );

        setIsSaving(true);
        const studentsPayload: IAttendanceStudentPayload[] =
            Array.from(attendanceState.entries()).map(([studentId, data]) => {
                const guardianId = guardianMap.get(studentId) || null;

                return {
                    student: studentId,
                    status: data.status,
                    note: data.note || undefined,
                    noteCheckout: undefined,
                    timeCheckIn: data.timeCheckIn || null,
                    timeCheckOut: null,
                    guardian: guardianId,
                };
            });

        const payload: IAttendanceCreatePayload = {
            class: currentClass._id,
            schoolYear: currentClass.schoolYear._id,
            date: selectedDate.format('YYYY-MM-DD'),
            students: studentsPayload,
            takenBy: teacherId,
            generalNote: generalNote || undefined,
        };

        try {
            const res = await teacherApis.createAttendance(payload);
            setCurrentAttendanceId(res._id);
            toast.success('Đã lưu điểm danh thành công!');
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Lưu điểm danh thất bại.');
        } finally {
            setIsSaving(false);
        }
    };

    const attendanceSummary = useMemo(() => {
        const stats = { present: 0, absent: 0, total: 0 };
        stats.total = studentList.length;
        for (const state of attendanceState.values()) {
            if (state.status === 'Có mặt') stats.present++;
            else if (state.status === 'Vắng mặt') stats.absent++;
        }
        return stats;
    }, [attendanceState, studentList]);

    if (isLoadingTeacherData) {
        return (
            <div style={{ padding: 100, textAlign: 'center' }}>
                <Spin tip="Đang tải dữ liệu giáo viên..." size="large" />
            </div>
        );
    }


    return (
        <div style={{ padding: '24px' }}>
            <Card
                bordered={false}
                title={
                    <Row align="middle" gutter={16}>
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
                            </Space>
                        </Col>
                    </Row>
                }
                extra={
                    <Space>
                        <Select
                            value={selectedClassId}
                            style={{ width: 200 }}
                            placeholder="Chọn lớp"
                            onChange={(val) => setSelectedClassId(val)}
                            disabled={!teacherData?.classes?.length}
                        >
                            {teacherData?.classes?.map((cls) => (
                                <Option key={cls._id} value={cls._id}>
                                    {cls.className}
                                </Option>
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
                            {isPastDate && (
                                <Tag color="warning">
                                    Ngày này đã qua, không thể điểm danh lại
                                </Tag>
                            )}
                            <Tag color="default">Sĩ số: {attendanceSummary.total}</Tag>
                            <Tag color="green">Có mặt: {attendanceSummary.present}</Tag>
                            <Tag color="red">Vắng mặt: {attendanceSummary.absent}</Tag>
                        </Space>
                        <Divider style={{ margin: '8px 0 16px' }} />
                    </>
                )}

                <Spin spinning={isFetchingAttendance || isSaving}>
                    {isFutureDate ? (
                        <Empty description="Ngày này hiện chưa có thông tin điểm danh. Vui lòng chọn ngày hôm nay hoặc quá khứ." />
                    ) : (
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            {!currentClass ? (
                                <Empty description="Vui lòng chọn lớp để điểm danh." />
                            ) : studentList.length === 0 ? (
                                <Empty description="Lớp học này chưa có học sinh." />
                            ) : (
                                <List
                                    itemLayout="vertical"
                                    dataSource={studentList}
                                    renderItem={(student) => {
                                        const state = attendanceState.get(student._id) || {
                                            status: 'Vắng mặt',
                                            note: '',
                                            timeCheckIn: null,
                                        };

                                        return (
                                            <List.Item
                                                key={student._id}
                                                style={{
                                                    padding: '16px 24px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                }}
                                            >
                                                <Row align="middle" gutter={[16, 16]}>
                                                    <Col xs={24} sm={8} md={6}>
                                                        <Space>
                                                            <Avatar
                                                                size={48}
                                                                src={student.imageStudent}
                                                                icon={!student.imageStudent && <UserOutlined />}
                                                                style={{ backgroundColor: '#f0f0f0' }}
                                                            />

                                                            <div>
                                                                <Text strong>{student.fullName}</Text>
                                                                <Text type="secondary" style={{ display: 'block' }}>
                                                                    {student.studentCode}
                                                                </Text>
                                                            </div>
                                                        </Space>
                                                    </Col>
                                                    <Col xs={24} sm={16} md={10}>
                                                        <Radio.Group
                                                            value={state.status}
                                                            onChange={(e) =>
                                                                handleAttendanceChange(student._id, 'status', e.target.value)
                                                            }
                                                        >
                                                            <Space wrap>
                                                                {Object.keys(STATUS_CONFIG).map((key) => {
                                                                    const sKey = key as TAttendanceStatus;
                                                                    const cfg = STATUS_CONFIG[sKey];
                                                                    return (
                                                                        <Radio.Button key={sKey} value={sKey}>
                                                                            <Space>
                                                                                {React.cloneElement(cfg.icon as any, {
                                                                                    style: {
                                                                                        color:
                                                                                            state.status === sKey
                                                                                                ? undefined
                                                                                                : cfg.color,
                                                                                    },
                                                                                })}
                                                                                {cfg.text}
                                                                            </Space>
                                                                        </Radio.Button>
                                                                    );
                                                                })}
                                                            </Space>
                                                        </Radio.Group>
                                                    </Col>

                                                    <Col xs={24} sm={24} md={8}>
                                                        {state.status === 'Có mặt' && state.timeCheckIn && (
                                                            <Text style={{ fontSize: '14px', color: '#595959' }}>
                                                                <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                                                Giờ vào: {dayjs(state.timeCheckIn).format('HH:mm')}
                                                            </Text>
                                                        )}
                                                        {state.status === 'Vắng mặt' && (
                                                            <Input
                                                                prefix={<EditOutlined style={{ color: '#8c8c8F' }} />}
                                                                placeholder="Ghi chú (Bị ốm, ...)"
                                                                value={state.note}
                                                                onChange={(e) =>
                                                                    handleAttendanceChange(
                                                                        student._id,
                                                                        'note',
                                                                        e.target.value
                                                                    )
                                                                }
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
                                label={<Title level={5}><ReadOutlined /> Ghi chú chung</Title>}
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
                                    disabled={!!currentAttendanceId || isPastDate || isFetchingAttendance}
                                >
                                    {currentAttendanceId
                                        ? 'Đã điểm danh'
                                        : isPastDate
                                            ? 'Không thể điểm danh'
                                            : 'Lưu điểm danh'}
                                </Button>

                            </Form.Item>
                        </Form>
                    )}
                </Spin>
            </Card>
        </div>
    );
}

export default TakeAttendance;