import { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Row,
    Col,
    Select,
    TimePicker,
    InputNumber,
    Spin,
    Space,
    Modal
} from 'antd';
import {
    SaveOutlined,
    ArrowLeftOutlined,
    FileAddOutlined,
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
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { Dayjs } from 'dayjs';
import { CreateCurriculumDto } from '../../../types/curriculums';
import { curriculumsApis } from '../../../services/apiServices';

const { Title } = Typography;
const { Option } = Select;

const categoryOptions = [
    "Phát triển thể chất",
    "Phát triển nhận thức",
    "Phát triển ngôn ngữ",
    "Phát triển tình cảm",
    "Phát triển thẩm mỹ",
    "Phát triển kỹ năng xã hội",
    "Hoạt động sự kiện"
];

function CurriculumsCreate() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activityType, setActivityType] = useState<'Cố định' | 'Bình thường' | undefined>(undefined);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);

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

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const currentUser = "admin_pms";

        const payload: CreateCurriculumDto = {
            activityName: values.activityName,
            type: values.type,
            active: values.active,
            createdBy: currentUser,
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
        } else if (values.type === 'Bình thường') {
            payload.age = values.age;
            payload.category = values.category;
        }

        try {
            await curriculumsApis.createCurriculum(payload);
            toast.success('Tạo chương trình học thành công!');
            setIsDirty(false);
            navigate(-1);
        } catch (error) {
            toast.error('Tạo chương trình học thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    };

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ active: true }}
                onValuesChange={() => setIsDirty(true)}
            >
                <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            <Space align="center">
                                <FileAddOutlined style={{ color: '#1890ff' }} />
                                Tạo mới Chương trình học
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
                                Lưu
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Card
                    title={
                        <Space align="center">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                            Thông tin cơ bản
                        </Space>
                    }
                    bordered={false}
                    style={{ marginBottom: 24 }}
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
                                    rules={[{ required: true, message: 'Vui lòng nhập tên hoạt động!' }]}
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
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Spin>
                </Card>

                {activityType === 'Cố định' && (
                    <Card
                        title={
                            <Space align="center">
                                <ClockCircleOutlined style={{ color: '#faad14' }} />
                                Khung giờ (cho hoạt động Cố định)
                            </Space>
                        }
                        bordered={false}
                    >
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
                    </Card>
                )}

                {activityType === 'Bình thường' && (
                    <Card
                        title={
                            <Space align="center">
                                <ProfileOutlined style={{ color: '#52c41a' }} />
                                Chi tiết (cho hoạt động Bình thường)
                            </Space>
                        }
                        bordered={false}
                    >
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
                                    rules={[{ required: true, message: 'Vui lòng nhập độ tuổi!' }]}
                                >
                                    <InputNumber
                                        min={1}
                                        max={10}
                                        placeholder="Ví dụ: 4"
                                        style={{ width: '100%' }}
                                        onKeyPress={allowOnlyNumbers}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                )}
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

export default CurriculumsCreate;