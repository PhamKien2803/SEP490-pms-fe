import { useState, useEffect, useCallback } from 'react';
import {
    Form,
    Button,
    Card,
    Typography,
    Row,
    Col,
    Select,
    TimePicker,
    Spin,
    Flex,
    Space,
    Modal,
    Divider,
    Input
} from 'antd';
import {
    SaveOutlined,
    ArrowLeftOutlined,
    EditOutlined,
    InfoCircleOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    ClockCircleOutlined,
    FieldTimeOutlined,
    ProfileOutlined,
    TagOutlined,
    NumberOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { UpdateCurriculumDto } from '../../../types/curriculums';
import { curriculumsApis, eventApis, schoolYearApis } from '../../../services/apiServices';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { ageOptions, categoryOptions } from '../../../components/hard-code-action';
import { EventItem } from '../../../types/event';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { requiredTrimRule } from '../../../utils/format';

const { Title } = Typography;
const { Option } = Select;


function CurriculumsUpdate() {
    usePageTitle('Chỉnh sửa hoạt động - Cá Heo Xanh');
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const user = useCurrentUser();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activityType, setActivityType] = useState<'Cố định' | 'Bình thường' | 'Sự kiện' | undefined>(undefined);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);

    const [events, setEvents] = useState<EventItem[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [currentSchoolYear, setCurrentSchoolYear] = useState<string | null>(null);
    const [loadingSchoolYear, setLoadingSchoolYear] = useState<boolean>(true);


    useEffect(() => {
        const fetchCurrentSchoolYear = async () => {
            setLoadingSchoolYear(true);
            try {
                const response = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
                if (response.data && response.data.length > 0) {
                    const sortedData = response.data.sort((a: any, b: any) =>
                        b.schoolYear.localeCompare(a.schoolYear)
                    );
                    setCurrentSchoolYear(sortedData[0].schoolYear);
                } else {
                    toast.warn('Không tìm thấy năm học nào.');
                }
            } catch (error) {
                typeof error === "string" ? toast.info(error) : toast.error('Lỗi tải dữ liệu năm học.');
            } finally {
                setLoadingSchoolYear(false);
            }
        };

        fetchCurrentSchoolYear();
    }, []);

    const fetchData = useCallback(async (schoolYear: string) => {
        if (!id) {
            toast.error("ID chương trình học không hợp lệ.");
            navigate(-1);
            return;
        }
        setLoading(true);
        try {
            const data = await curriculumsApis.getCurriculumById(id);

            const formData: any = {
                activityName: data.activityName,
                type: data.type,
                active: data.active,
            };

            if (data.type === 'Cố định') {
                if (data.startTime != null && data.endTime != null) {
                    const start = dayjs().startOf('day').add(data.startTime, 'minute');
                    const end = dayjs().startOf('day').add(data.endTime, 'minute');
                    formData.timeRange = [start, end];
                }
            } else if (data.type === 'Bình thường') {
                formData.age = data.age;
                formData.category = data.category;
            } else if (data.type === 'Sự kiện') {
                formData.eventName = data.eventName;

                setIsLoadingEvents(true);
                try {
                    const eventResponse = await eventApis.getEventList({ page: 1, limit: 1000, schoolYear: schoolYear });
                    setEvents(eventResponse.data);
                } catch (error) {
                    typeof error === "string" ? toast.info(error) : toast.error("Lỗi tải danh sách sự kiện.");
                } finally {
                    setIsLoadingEvents(false);
                }
            }

            form.setFieldsValue(formData);
            setActivityType(data.type as any);

        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải dữ liệu chương trình học.");
            navigate(-1);
        } finally {
            setLoading(false);
            setIsDirty(false);
        }
    }, [id, form, navigate]);

    useEffect(() => {
        if (id && currentSchoolYear) {
            fetchData(currentSchoolYear);
        }
    }, [id, currentSchoolYear, fetchData]);


    const handleTypeChange = async (value: 'Cố định' | 'Bình thường' | 'Sự kiện') => {
        setActivityType(value);
        form.setFieldsValue({
            age: null,
            category: null,
            timeRange: null,
            eventName: null,
        });

        if (value === 'Sự kiện' && currentSchoolYear) {
            if (events.length === 0) {
                setIsLoadingEvents(true);
                try {
                    const response = await eventApis.getEventList({
                        page: 1,
                        limit: 1000,
                        schoolYear: currentSchoolYear
                    });
                    setEvents(response.data);
                } catch (error) {
                    typeof error === "string" ? toast.info(error) : toast.error('Lỗi tải danh sách sự kiện.');
                } finally {
                    setIsLoadingEvents(false);
                }
            }
        }
    };

    const handleBackNavigation = () => {
        if (isDirty) {
            setIsBackConfirmVisible(true);
        } else {
            navigate(-1);
        }
    };

    const onFinish = async (values: any) => {
        if (!id) return;

        setIsSubmitting(true);
        const currentUser = user?.email || 'admin';

        const payload: UpdateCurriculumDto = {
            activityName: values.activityName,
            type: values.type,
            active: values.active,
            updatedBy: currentUser,
        };

        if (values.type === 'Cố định') {
            const [start, end]: [Dayjs, Dayjs] = values.timeRange;
            const SCHOOL_START_HOUR = 7;
            if (start.hour() < SCHOOL_START_HOUR) {
                toast.info(`Thời gian bắt đầu không được trước ${SCHOOL_START_HOUR}:00 sáng.`);
                setIsSubmitting(false);
                return;
            }
            payload.startTime = start.hour() * 60 + start.minute();
            payload.endTime = end.hour() * 60 + end.minute();
            if (payload.endTime <= payload.startTime) {
                toast.info('Giờ kết thúc phải sau giờ bắt đầu.');
                setIsSubmitting(false);
                return;
            }
            payload.age = undefined;
            payload.category = undefined;
            payload.eventName = undefined;

        } else if (values.type === 'Bình thường') {
            payload.age = values.age;
            payload.category = values.category;
            payload.startTime = undefined;
            payload.endTime = undefined;
            payload.eventName = undefined;

        } else if (values.type === 'Sự kiện') {
            payload.eventName = values.eventName;
            payload.age = undefined;
            payload.category = undefined;
            payload.startTime = undefined;
            payload.endTime = undefined;
        }

        try {
            await curriculumsApis.updateCurriculum(id, payload);
            toast.success('Cập nhật chương trình học thành công!');
            setIsDirty(false);
            // navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : typeof error === "string" ? toast.warn(error) : toast.error('Cập nhật chương trình học thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || loadingSchoolYear) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={() => setIsDirty(true)}
            >
                <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            <Space align="center">
                                <EditOutlined style={{ color: '#1890ff' }} />
                                Chỉnh sửa Chương trình học
                            </Space>
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBackNavigation}
                                disabled={isSubmitting}
                            >
                                Quay lại
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={isSubmitting}
                            >
                                Lưu thay đổi
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Card
                    title={
                        <Space align="center">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                            Thông tin chương trình học
                        </Space>
                    }
                    bordered={false}
                >
                    <Spin spinning={isSubmitting}>
                        <Row gutter={24}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="activityName"
                                    label={
                                        <Space>
                                            <FileTextOutlined />
                                            Tên Hoạt động
                                        </Space>
                                    }
                                    rules={[
                                        requiredTrimRule("Tên hoạt động"),
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();
                                                if (/^\s|\s$/.test(value)) {
                                                    return Promise.reject(new Error("Không được để khoảng trắng ở đầu hoặc cuối!"));
                                                }
                                                if (/\s{2,}/.test(value)) {
                                                    return Promise.reject(new Error("Không được có nhiều khoảng trắng liên tiếp!"));
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <Input placeholder="Ví dụ: Đón trẻ, Thể dục sáng..." />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Form.Item
                                    name="type"
                                    label={
                                        <Space>
                                            <AppstoreOutlined />
                                            Loại Hoạt động
                                        </Space>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng chọn loại hoạt động!' }]}
                                >
                                    <Select placeholder="Chọn loại hoạt động" onChange={handleTypeChange}>
                                        <Option value="Cố định">Cố định (hàng ngày)</Option>
                                        <Option value="Bình thường">Bình thường (theo chủ đề)</Option>
                                        <Option value="Sự kiện">Sự kiện</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {activityType === 'Cố định' && (
                            <>
                                <Divider orientation="left">
                                    <Space>
                                        <ClockCircleOutlined />
                                        Khung giờ (cho hoạt động Cố định)
                                    </Space>
                                </Divider>
                                <Row gutter={24}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="timeRange"
                                            label={
                                                <Space>
                                                    <FieldTimeOutlined />
                                                    Khung giờ Bắt đầu - Kết thúc
                                                </Space>
                                            }
                                            rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
                                        >
                                            <TimePicker.RangePicker
                                                format="HH:mm"
                                                minuteStep={5}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {activityType === 'Bình thường' && (
                            <>
                                <Divider orientation="left">
                                    <Space>
                                        <ProfileOutlined />
                                        Chi tiết (cho hoạt động Bình thường)
                                    </Space>
                                </Divider>
                                <Row gutter={24}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="category"
                                            label={
                                                <Space>
                                                    <TagOutlined />
                                                    Danh mục
                                                </Space>
                                            }
                                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                        >
                                            <Select
                                                placeholder="Chọn danh mục hoạt động"
                                            >
                                                {categoryOptions.map(category => (
                                                    <Option key={category} value={category}>
                                                        {category}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="age"
                                            label={
                                                <Space>
                                                    <NumberOutlined />
                                                    Độ tuổi áp dụng
                                                </Space>
                                            }
                                            rules={[{ required: true, message: 'Vui lòng chọn độ tuổi!' }]}
                                        >
                                            <Select
                                                placeholder="Chọn độ tuổi áp dụng"
                                                style={{ width: '100%' }}
                                                allowClear
                                            >
                                                {ageOptions.map(age => (
                                                    <Option key={age.value} value={age.value}>
                                                        {age.label}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {activityType === 'Sự kiện' && (
                            <>
                                <Divider orientation="left">
                                    <Space>
                                        <CalendarOutlined />
                                        Chi tiết (cho hoạt động Sự kiện)
                                    </Space>
                                </Divider>
                                <Row gutter={24}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="eventName"
                                            label={
                                                <Space>
                                                    <TagOutlined />
                                                    Tên Sự kiện
                                                </Space>
                                            }
                                            rules={[{ required: true, message: 'Vui lòng chọn sự kiện!' }]}
                                        >
                                            <Select
                                                placeholder="Chọn sự kiện"
                                                loading={isLoadingEvents}
                                                showSearch
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    (option?.children?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                {events.map(event => (
                                                    <Option key={event._id} value={event.eventName}>
                                                        {event.eventName}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Spin>
                </Card>
            </Form>

            <Modal
                title={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8, fontSize: '22px' }} />
                        Xác nhận quay lại
                    </span>
                }
                open={isBackConfirmVisible}
                onOk={() => navigate(-1)}
                onCancel={() => setIsBackConfirmVisible(false)}
                okText="Đồng ý"
                cancelText="Không"
                zIndex={1001}
            >
                <p>Các thay đổi chưa được lưu sẽ bị mất. Bạn có chắc muốn tiếp tục?</p>
            </Modal>
        </div>
    );
}

export default CurriculumsUpdate;