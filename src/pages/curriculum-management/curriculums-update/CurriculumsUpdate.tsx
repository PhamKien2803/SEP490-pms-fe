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
    Divider
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
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { UpdateCurriculumDto } from '../../../types/curriculums';
import { curriculumsApis } from '../../../services/apiServices';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { ageOptions, categoryOptions } from '../../../components/hard-code-action';

const { Title } = Typography;
const { Option } = Select;

const activityNameOptions = [
    "Đón trẻ",
    "Thể dục sáng",
    "Hoạt động học",
    "Chơi ngoài trời",
    "Ăn trưa",
    "Ngủ trưa",
    "Ăn xế",
    "Chơi và hoạt động chiều",
    "Trả trẻ"
];

function CurriculumsUpdate() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const user = useCurrentUser();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activityType, setActivityType] = useState<'Cố định' | 'Bình thường' | undefined>(undefined);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);

    const fetchData = useCallback(async () => {
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
            }

            form.setFieldsValue(formData);
            setActivityType(data.type);

        } catch (error) {
            toast.error("Không thể tải dữ liệu chương trình học.");
            navigate(-1);
        } finally {
            setLoading(false);
            setIsDirty(false);
        }
    }, [id, form, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleTypeChange = (value: 'Cố định' | 'Bình thường') => {
        setActivityType(value);
        form.setFieldsValue({
            age: null,
            category: null,
            timeRange: null,
        });
    };

    const handleBackNavigation = () => {
        if (isDirty) {
            setIsBackConfirmVisible(true);
        } else {
            navigate(-1);
        }
    };

    const handleActivityNameChange = (value: string) => {
        form.setFieldsValue({ activityName: value });
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
            payload.startTime = start.hour() * 60 + start.minute();
            payload.endTime = end.hour() * 60 + end.minute();
            if (payload.endTime <= payload.startTime) {
                toast.warn('Giờ kết thúc phải sau giờ bắt đầu.');
                setIsSubmitting(false);
                return;
            }
            payload.age = undefined;
            payload.category = undefined;

        } else if (values.type === 'Bình thường') {
            payload.age = values.age;
            payload.category = values.category;
            payload.startTime = undefined;
            payload.endTime = undefined;
        }

        try {
            await curriculumsApis.updateCurriculum(id, payload);
            toast.success('Cập nhật chương trình học thành công!');
            setIsDirty(false);
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Cập nhật chương trình học thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
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

                {/* 3. Dùng 1 Card duy nhất */}
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
                                {/* <Form.Item
                                    name="activityName"
                                    label={
                                        <Space>
                                            <FileTextOutlined />
                                            Tên Hoạt động
                                        </Space>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng nhập tên hoạt động!' }]}
                                >
                                    <Input placeholder="Ví dụ: Đón trẻ, Thể dục sáng..." />
                                </Form.Item> */}
                                <Form.Item
                                    name="activityName"
                                    label={
                                        <Space>
                                            <FileTextOutlined />
                                            Tên Hoạt động
                                        </Space>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng chọn tên hoạt động!' }]}
                                >
                                    <Select
                                        placeholder="Chọn tên hoạt động"
                                        allowClear
                                        onChange={handleActivityNameChange}
                                    >
                                        {activityNameOptions.map(name => (
                                            <Option key={name} value={name}>
                                                {name}
                                            </Option>
                                        ))}
                                    </Select>
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