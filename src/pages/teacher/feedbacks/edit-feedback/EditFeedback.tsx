import { useEffect, useState } from 'react';
import {
    Card,
    Spin,
    Typography,
    Form,
    Input,
    Tabs,
    Button,
    AutoComplete,
    Select,
    Space,
    Row,
    Col,
} from 'antd';
import {
    ReadOutlined,
    ScheduleOutlined,
    TeamOutlined,
    HeartOutlined,
    StarOutlined,
    SendOutlined,
    FormOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApis } from '../../../../services/apiServices';
import {
    IFeedbackDetailResponse,
    IFeedbackUpdatePayload,
    IFeedbackBasePayload,
} from '../../../../types/teacher';
import { toast } from 'react-toastify';
import {
    BEHAVIOR_OPTIONS,
    EATING_OPTIONS,
    EMOTION_OPTIONS,
    FOCUS_OPTIONS,
    HANDWASH_OPTIONS,
    INTERACTION_OPTIONS,
    PARTICIPATION_OPTIONS,
    SLEEP_DURATION_OPTIONS,
    SLEEP_QUALITY_OPTIONS,
    TOILET_OPTIONS,
} from '../../../../components/hard-code-action';
import dayjs from 'dayjs';
import { usePageTitle } from '../../../../hooks/usePageTitle';

const { Title, Text } = Typography;
const { TextArea } = Input;

function EditFeedback() {
    usePageTitle('Chỉnh sửa phản hồi học sinh - Cá Heo Xanh');
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm<IFeedbackBasePayload>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackDetail, setFeedbackDetail] = useState<IFeedbackDetailResponse | null>(null);
    const [studentName, setStudentName] = useState<string>('');
    const [isExpired, setIsExpired] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const data = await teacherApis.getFeedbackById(id);
                setFeedbackDetail(data);
                form.setFieldsValue(data);

                if (data.studentId && typeof data.studentId === 'object' && 'fullName' in data.studentId) {
                    setStudentName((data.studentId as { fullName: string }).fullName);
                }

                const feedbackDate = dayjs(data.date);
                const hoursDiff = dayjs().diff(feedbackDate, 'hour');
                if (hoursDiff > 24) {
                    setIsExpired(true);
                    toast.info('Không thể chỉnh sửa phản hồi đã quá 24 giờ.');
                }
            } catch (error) {
                typeof error === "string" ? toast.info(error) : toast.error('Không thể tải dữ liệu phản hồi.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, form, navigate]);

    const handleSubmit = async (values: IFeedbackBasePayload) => {
        if (!feedbackDetail) return;
        if (isExpired) {
            toast.info('Không thể cập nhật phản hồi đã quá 24 giờ.');
            return;
        }

        setSubmitting(true);
        const payload: IFeedbackUpdatePayload = {
            ...values,
            students:
                typeof feedbackDetail.studentId === 'object'
                    ? feedbackDetail.studentId
                    : feedbackDetail.studentId,
            classId:
                typeof feedbackDetail.classId === 'object'
                    ? feedbackDetail.classId
                    : feedbackDetail.classId,
            teacherId: feedbackDetail.teacherId,
            date: feedbackDetail.date,
        };

        try {
            await teacherApis.updateFeedback(feedbackDetail._id, payload);
            toast.success('Cập nhật phản hồi thành công!');
            // navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Lỗi khi cập nhật phản hồi.');
        } finally {
            setSubmitting(false);
        }
    };

    const tabItems = [
        {
            key: '1',
            label: (
                <Space>
                    <ScheduleOutlined /> Sinh hoạt
                </Space>
            ),
            children: (
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name={['eating', 'breakfast']} label="Bữa sáng">
                            <Select options={EATING_OPTIONS} />
                        </Form.Item>
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
                            <Select options={TOILET_OPTIONS} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name={['eating', 'lunch']} label="Bữa trưa">
                            <Select options={EATING_OPTIONS} />
                        </Form.Item>
                        <Form.Item name={['sleeping', 'quality']} label="Chất lượng giấc ngủ">
                            <Select options={SLEEP_QUALITY_OPTIONS} />
                        </Form.Item>
                        <Form.Item name={['hygiene', 'handwash']} label="Rửa tay">
                            <Select options={HANDWASH_OPTIONS} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name={['eating', 'snack']} label="Bữa xế">
                            <Select options={EATING_OPTIONS} />
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
            label: (
                <Space>
                    <ReadOutlined /> Học tập
                </Space>
            ),
            children: (
                <>
                    <Form.Item name={['learning', 'focus']} label="Tập trung học">
                        <Select options={FOCUS_OPTIONS} />
                    </Form.Item>
                    <Form.Item name={['learning', 'participation']} label="Tham gia bài học">
                        <Select options={PARTICIPATION_OPTIONS} />
                    </Form.Item>
                    <Form.Item name={['learning', 'note']} label="Nhận xét học tập">
                        <TextArea rows={3} />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '3',
            label: (
                <Space>
                    <TeamOutlined /> Xã hội
                </Space>
            ),
            children: (
                <>
                    <Form.Item name={['social', 'friendInteraction']} label="Tương tác bạn bè">
                        <Select options={INTERACTION_OPTIONS} />
                    </Form.Item>
                    <Form.Item name={['social', 'emotionalState']} label="Cảm xúc">
                        <Select options={EMOTION_OPTIONS} />
                    </Form.Item>
                    <Form.Item name={['social', 'behavior']} label="Hành vi">
                        <Select options={BEHAVIOR_OPTIONS} />
                    </Form.Item>
                    <Form.Item name={['social', 'note']} label="Nhận xét xã hội">
                        <TextArea rows={3} />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '4',
            label: (
                <Space>
                    <HeartOutlined /> Sức khỏe
                </Space>
            ),
            children: (
                <Form.Item name={['health', 'note']} label="Tình trạng sức khỏe">
                    <AutoComplete
                        options={[
                            { value: 'Sức khỏe tốt, bình thường.' },
                            { value: 'Ho, sổ mũi.' },
                            { value: 'Sốt nhẹ.' },
                        ]}
                    >
                        <TextArea rows={4} />
                    </AutoComplete>
                </Form.Item>
            ),
        },
        {
            key: '5',
            label: (
                <Space>
                    <StarOutlined /> Khác
                </Space>
            ),
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
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}>
            <Spin spinning={loading}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ border: 'none', boxShadow: 'none' }}
                    />
                    <Title level={3}>
                        <FormOutlined /> Cập nhật phản hồi
                    </Title>
                    <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                        {studentName ? `Học sinh: ${studentName}` : ''}
                    </Text>
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={handleSubmit}
                        disabled={submitting || isExpired}
                    >
                        <Tabs defaultActiveKey="1" items={tabItems} />
                        <Row justify="end">
                            <Col>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SendOutlined />}
                                    loading={submitting}
                                    disabled={isExpired}
                                >
                                    Lưu cập nhật
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Space>
            </Spin>
        </Card>
    );
}

export default EditFeedback;
