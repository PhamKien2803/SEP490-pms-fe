import { useState } from 'react';
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
    Space,
    Modal,
    Divider
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


function CurriculumsCreate() {
    const user = useCurrentUser();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activityType, setActivityType] = useState<'Cố định' | 'Bình thường' | undefined>(undefined);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);

    const handleTypeChange = (value: 'Cố định' | 'Bình thường') => {
        setActivityType(value);
        form.setFieldsValue({
            age: [],
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
        setIsSubmitting(true);
        const currentUser = user?.email || 'admin';

        try {
            if (values.type === 'Cố định') {
                const payload: CreateCurriculumDto = {
                    activityName: values.activityName,
                    type: values.type,
                    active: values.active,
                    createdBy: currentUser,
                    updatedBy: currentUser,
                };

                const [start, end]: [Dayjs, Dayjs] = values.timeRange;
                payload.startTime = start.hour() * 60 + start.minute();
                payload.endTime = end.hour() * 60 + end.minute();

                if (payload.endTime <= payload.startTime) {
                    toast.warn('Giờ kết thúc phải sau giờ bắt đầu.');
                    setIsSubmitting(false);
                    return;
                }

                await curriculumsApis.createCurriculum(payload);

            } else if (values.type === 'Bình thường') {
                const basePayload = {
                    activityName: values.activityName,
                    type: values.type,
                    active: values.active,
                    createdBy: currentUser,
                    updatedBy: currentUser,
                    category: values.category,
                };

                const payloadsToCreate: CreateCurriculumDto[] = values.age.map((ageValue: number) => ({
                    ...basePayload,
                    age: ageValue,
                }));

                await Promise.all(
                    payloadsToCreate.map(payload =>
                        curriculumsApis.createCurriculum(payload)
                    )
                );
            }

            toast.success('Tạo chương trình học thành công!');
            setIsDirty(false);
            navigate(-1);

        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Tạo chương trình học thất bại.');
        } finally {
            setIsSubmitting(false);
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
                                            rules={[{ required: true, message: 'Vui lòng chọn độ tuổi!', type: 'array' }]}
                                        >
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="Chọn độ tuổi áp dụng"
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

export default CurriculumsCreate;