import { useEffect, useState } from 'react';
import {
    Card,
    DatePicker,
    Typography,
    Row,
    Col,
    Button,
    Spin,
    List,
    Form,
    Input,
    Tabs,
    Space,
    Tag,
    Avatar,
    Select,
    Empty,
    AutoComplete,
} from 'antd';
import {
    BankOutlined,
    CalendarOutlined,
    TeamOutlined,
    FormOutlined,
    SendOutlined,
    ScheduleOutlined,
    ReadOutlined,
    HeartOutlined,
    StarOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ThunderboltOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import {
    IClassInfo,
    IFeedbackBasePayload,
    IFeedbackCreatePayload,
    IFeedbackListItem,
} from '../../../../types/teacher';
import { teacherApis, schoolYearApis } from '../../../../services/apiServices';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
const { Title, Text } = Typography;
const { TextArea } = Input;


interface ITeacherData {
    classes: (IClassInfo & { students: IStudentInfo[] })[];
}

import { BEHAVIOR_OPTIONS, EATING_OPTIONS, EMOTION_OPTIONS, FOCUS_OPTIONS, GOOD_FEEDBACK_TEMPLATE, HANDWASH_OPTIONS, INTERACTION_OPTIONS, PARTICIPATION_OPTIONS, SLEEP_DURATION_OPTIONS, SLEEP_QUALITY_OPTIONS, TOILET_OPTIONS } from '../../../../components/hard-code-action';
import { usePageTitle } from '../../../../hooks/usePageTitle';
import { IStudentInfo } from '../../../../types/parent';

function TakeFeedback() {
    usePageTitle('Tạo phản hồi học sinh - Cá Heo Xanh');
    const [form] = Form.useForm<IFeedbackBasePayload>();
    const user = useCurrentUser();
    const teacherId = user?.staff;
    const navigate = useNavigate();
    const [date, setDate] = useState(dayjs());
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingTeacherData, setIsLoadingTeacherData] = useState(false);

    const [currentClass, setCurrentClass] = useState<IClassInfo | null>(null);
    const [currentStudents, setCurrentStudents] = useState<IStudentInfo[]>([]);
    const [existingFeedbacks, setExistingFeedbacks] = useState<IFeedbackListItem[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<IStudentInfo | null>(null);

    const [_, setSchoolYears] = useState<{ _id: string; schoolYear: string }[]>([]);
    const [__, setSelectedSchoolYearId] = useState<string | null>(null);

    const isPastDate = dayjs(date).isBefore(dayjs().startOf('day'));
    const hasFeedback = selectedStudent && existingFeedbacks.some(f => f.studentId._id === selectedStudent._id);
    const isFormDisabled = isPastDate || !!hasFeedback;

    const disabledDate = (current: dayjs.Dayjs) => current && current > dayjs().endOf('day');

    useEffect(() => {
        const init = async () => {
            if (!teacherId) return;
            setIsLoadingTeacherData(true);
            setLoading(true);

            try {
                const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });

                const sorted = res.data.sort(
                    (a, b) =>
                        parseInt(b.schoolYear.split('-')[0]) -
                        parseInt(a.schoolYear.split('-')[0])
                );

                setSchoolYears(sorted);

                const activeYear =
                    sorted.find((y) => y.state === 'Đang hoạt động')?._id ||
                    sorted[0]?._id;

                setSelectedSchoolYearId(activeYear);

                if (activeYear) {
                    const data: ITeacherData =
                        await teacherApis.getClassAndStudentByTeacher(
                            teacherId,
                            activeYear
                        );

                    if (data.classes?.length > 0) {
                        const firstClass = data.classes[0];
                        setCurrentClass(firstClass);
                        setCurrentStudents(firstClass.students || []);
                    } else {
                        setCurrentClass(null);
                        setCurrentStudents([]);
                        toast.warn('Giáo viên chưa được phân công lớp nào.');
                    }
                }
            } catch (error) {
                typeof error === 'string'
                    ? toast.info(error)
                    : toast.error('Không thể tải thông tin lớp hoặc năm học.');
            } finally {
                setIsLoadingTeacherData(false);
                setLoading(false);
            }
        };

        init();
    }, [teacherId]);


    const fetchExistingFeedbacks = async () => {
        if (!currentClass) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await teacherApis.getFeedbackByClassAndDate(currentClass._id, date.format('YYYY-MM-DD'));
            setExistingFeedbacks(data);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Không thể tải các phản hồi đã có.');
            setExistingFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExistingFeedbacks();
    }, [currentClass, date]);

    useEffect(() => {
        form.resetFields();
        if (selectedStudent) {
            const feedback = existingFeedbacks.find(f => f.studentId._id === selectedStudent._id);
            if (feedback) form.setFieldsValue(feedback);
        }
    }, [selectedStudent, existingFeedbacks, form]);

    const onFinish = async (values: IFeedbackBasePayload) => {
        const isEmpty = Object.values(values).every((section) =>
            typeof section === 'object'
                ? Object.values(section).every((v) => !v || (Array.isArray(v) && v.length === 0))
                : !section
        );

        if (isEmpty) {
            toast.warn('Vui lòng nhập ít nhất một nội dung trước khi lưu.');
            return;
        }
        if (!currentClass || !teacherId || !selectedStudent) return;

        if (isFormDisabled) {
            toast.warn('Không thể lưu phản hồi cho ngày đã qua hoặc feedback đã tồn tại.');
            return;
        }

        setIsSubmitting(true);
        const payload: IFeedbackCreatePayload = {
            ...values,
            students: [selectedStudent._id],
            classId: currentClass._id,
            teacherId,
            date: date.toISOString(),
        };

        try {
            await teacherApis.createFeedback(payload);
            toast.success(`Đã lưu phản hồi cho học sinh ${selectedStudent.fullName}!`);
            fetchExistingFeedbacks();
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Lưu phản hồi thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickFill = () => {
        form.setFieldsValue(GOOD_FEEDBACK_TEMPLATE);
        toast.success('Đã áp dụng mẫu phản hồi tốt!');
    };

    const tabItems = [
        {
            key: '1',
            label: <Space><ScheduleOutlined /> Sinh hoạt</Space>,
            children: (
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name={['eating', 'breakfast']} label="Bữa sáng">
                            <Select options={EATING_OPTIONS} placeholder="Chọn..." />
                        </Form.Item>
                        {/* <Form.Item name={['sleeping', 'duration']} label="Thời gian ngủ">
                            <AutoComplete options={SLEEP_DURATION_OPTIONS} placeholder="VD: 120 phút" allowClear />
                        </Form.Item> */}
                        <Form.Item name={['sleeping', 'duration']} label="Thời gian ngủ">
                            <Select
                                placeholder="Chọn thời gian ngủ"
                                allowClear
                                options={SLEEP_DURATION_OPTIONS}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>

                        <Form.Item name={['hygiene', 'toilet']} label="Đi vệ sinh">
                            <Select options={TOILET_OPTIONS} placeholder="Chọn..." />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name={['eating', 'lunch']} label="Bữa trưa">
                            <Select options={EATING_OPTIONS} placeholder="Chọn..." />
                        </Form.Item>
                        <Form.Item name={['sleeping', 'quality']} label="Chất lượng giấc ngủ">
                            <Select options={SLEEP_QUALITY_OPTIONS} placeholder="Chọn..." />
                        </Form.Item>
                        <Form.Item name={['hygiene', 'handwash']} label="Rửa tay">
                            <Select options={HANDWASH_OPTIONS} placeholder="Chọn..." />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name={['eating', 'snack']} label="Bữa xế">
                            <Select options={EATING_OPTIONS} placeholder="Chọn..." />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name={['eating', 'note']} label="Nhận xét ăn uống">
                            <TextArea rows={2} />
                        </Form.Item>
                        <Form.Item name={['sleeping', 'note']} label="Nhận xét giấc ngủ">
                            <TextArea rows={2} />
                        </Form.Item>
                        <Form.Item name={['hygiene', 'note']} label="Nhận xét vệ sinh">
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            label: <Space><ReadOutlined /> Học tập</Space>,
            children: (
                <>
                    <Form.Item name={['learning', 'focus']} label="Tập trung học">
                        <Select options={FOCUS_OPTIONS} placeholder="Chọn..." />
                    </Form.Item>
                    <Form.Item name={['learning', 'participation']} label="Tham gia bài học">
                        <Select options={PARTICIPATION_OPTIONS} placeholder="Chọn..." />
                    </Form.Item>
                    <Form.Item name={['learning', 'note']} label="Nhận xét học tập">
                        <TextArea rows={3} />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '3',
            label: <Space><TeamOutlined /> Xã hội</Space>,
            children: (
                <>
                    <Form.Item name={['social', 'friendInteraction']} label="Tương tác bạn bè">
                        <Select options={INTERACTION_OPTIONS} placeholder="Chọn..." />
                    </Form.Item>
                    <Form.Item name={['social', 'emotionalState']} label="Cảm xúc">
                        <Select options={EMOTION_OPTIONS} placeholder="Chọn..." />
                    </Form.Item>
                    <Form.Item name={['social', 'behavior']} label="Hành vi">
                        <Select options={BEHAVIOR_OPTIONS} placeholder="Chọn..." />
                    </Form.Item>
                    <Form.Item name={['social', 'note']} label="Nhận xét xã hội">
                        <TextArea rows={3} />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '4',
            label: <Space><HeartOutlined /> Sức khỏe</Space>,
            children: (
                <Form.Item name={['health', 'note']} label="Tình trạng sức khỏe">
                    <AutoComplete
                        options={[
                            { value: 'Sức khỏe tốt, bình thường.' },
                            { value: 'Ho, sổ mũi.' },
                            { value: 'Sốt nhẹ.' },
                        ]}
                        allowClear
                    >
                        <TextArea rows={4} />
                    </AutoComplete>
                </Form.Item>
            ),
        },
        {
            key: '5',
            label: <Space><StarOutlined /> Khác</Space>,
            children: (
                <>
                    <Form.Item name={'dailyHighlight'} label="Hoạt động nổi bật">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name={'teacherNote'} label="Giáo viên nhận xét chung">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name={'reminders'} label="Nhắc nhở phụ huynh">
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            placeholder="Gõ rồi Enter để thêm..."
                            options={[
                                { value: 'Mang thêm bỉm' },
                                { value: 'Mang thêm sữa' },
                                { value: 'Mang thêm quần áo' },
                                { value: 'Đóng học phí' },
                            ]}
                        />
                    </Form.Item>
                </>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}>
                <Spin spinning={isLoadingTeacherData && !currentClass}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate(-1)}
                                    style={{ border: 'none', boxShadow: 'none' }}
                                />
                                <BankOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    {currentClass ? currentClass?.className : 'Đang tải lớp...'}
                                </Title>
                                <Tag color="green">{currentStudents?.length} học sinh</Tag>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <CalendarOutlined />
                                <Text strong>Chọn ngày phản hồi:</Text>
                                <DatePicker
                                    value={date}
                                    onChange={(d) => {
                                        setDate(d || dayjs());
                                        setSelectedStudent(null);
                                        form.resetFields();
                                    }}
                                    format="DD/MM/YYYY"
                                    allowClear={false}
                                    disabledDate={disabledDate}
                                />
                            </Space>
                        </Col>
                    </Row>
                </Spin>
            </Card>

            <Row gutter={16}>
                <Col span={8}>
                    <Card
                        title={<Space><TeamOutlined /> DANH SÁCH HỌC SINH</Space>}
                        bordered={false}
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}
                    >
                        <Spin spinning={loading} tip="Đang tải...">
                            <List
                                itemLayout="horizontal"
                                dataSource={currentStudents}
                                renderItem={(student) => {
                                    const has = existingFeedbacks.some(f => f.studentId._id === student._id);
                                    const isSelected = selectedStudent?._id === student._id;
                                    return (
                                        <List.Item
                                            onClick={() => setSelectedStudent(student)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                                                borderRadius: 8,
                                                padding: 12,
                                                margin: '4px 0'
                                            }}
                                            actions={[
                                                has ? (
                                                    <Tag icon={<CheckCircleOutlined />} color="success">Đã lưu</Tag>
                                                ) : (
                                                    <Tag icon={<ClockCircleOutlined />} color="default">Chưa có</Tag>
                                                ),
                                            ]}
                                        >
                                            <List.Item.Meta avatar={<Avatar
                                                size={48}
                                                src={student?.imageStudent}
                                                icon={!student?.imageStudent && <UserOutlined />}
                                                style={{ backgroundColor: '#f0f0f0' }}
                                            />} title={<Text strong>{student?.fullName} - {student?.nickname}</Text>} />
                                        </List.Item>
                                    );
                                }}
                            />
                        </Spin>
                    </Card>
                </Col>

                <Col span={16}>
                    <Form form={form} onFinish={onFinish} layout="vertical" disabled={isFormDisabled}>
                        <Card
                            title={
                                <Space>
                                    <FormOutlined />
                                    {selectedStudent ? `Nhập phản hồi cho: ${selectedStudent.fullName}` : 'Vui lòng chọn một học sinh'}
                                </Space>
                            }
                            bordered={false}
                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}
                            extra={
                                selectedStudent && !isFormDisabled && (
                                    <Space>
                                        <Button icon={<ThunderboltOutlined />} onClick={handleQuickFill}>
                                            Gợi ý điền nhanh
                                        </Button>
                                        <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={isSubmitting}>
                                            Lưu phản hồi
                                        </Button>
                                    </Space>
                                )
                            }
                        >
                            {selectedStudent ? (
                                <Tabs defaultActiveKey="1" items={tabItems} />
                            ) : (
                                <Empty description="Chọn một học sinh từ danh sách bên trái để bắt đầu nhập phản hồi." />
                            )}
                        </Card>
                    </Form>
                </Col>
            </Row>
        </Space>
    );
}

export default TakeFeedback;
