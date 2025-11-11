import { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Row,
    Col,
    DatePicker,
    Spin,
    Space,
    Modal,
    Checkbox,
} from 'antd';
import {
    SaveOutlined,
    ArrowLeftOutlined,
    CalendarOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    FormOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { Dayjs } from 'dayjs';
import { CreateEventDto } from '../../../types/event';
import { eventApis } from '../../../services/apiServices';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

function EventCreate() {
    usePageTitle('Tạo sự kiện - Cá Heo Xanh');
    const user = useCurrentUser();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);

    const handleBackNavigation = () => {
        if (isDirty) {
            setIsBackConfirmVisible(true);
        } else {
            navigate(-1);
        }
    };

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const currentUser = user?.email;

        const [startDate, endDate]: [Dayjs, Dayjs] = values.dateRange;

        if (endDate.isBefore(startDate)) {
            toast.warn('Ngày kết thúc phải sau hoặc trùng với ngày bắt đầu.');
            setIsSubmitting(false);
            return;
        }

        const payload: CreateEventDto = {
            eventName: values.eventName,
            holidayStartDate: startDate.startOf('day').toISOString(),
            holidayEndDate: endDate.startOf('day').toISOString(),
            note: values.note,
            isHoliday: values.isHoliday || false,
            createdBy: currentUser,
            updatedBy: currentUser,
        };

        try {
            await eventApis.createEvent(payload);
            toast.success('Tạo sự kiện thành công!');
            setIsDirty(false);
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Tạo sự kiện thất bại.');
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
                onValuesChange={() => setIsDirty(true)}
                initialValues={{ isHoliday: false }}
            >
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            <Space align="center">
                                <CalendarOutlined style={{ color: '#1890ff' }} />
                                Tạo mới Sự kiện / Ngày lễ
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
                            <FileTextOutlined style={{ color: '#1890ff' }} />
                            Thông tin sự kiện
                        </Space>
                    }
                    bordered={false}
                >
                    <Spin spinning={isSubmitting}>
                        <Row gutter={24}>
                            {/* Event Name */}
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="eventName"
                                    label={
                                        <Space>
                                            <FileTextOutlined />
                                            Tên Sự kiện / Ngày lễ
                                        </Space>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
                                >
                                    <Input placeholder="Ví dụ: Tết Trung Thu, Ngày Hội Thể Thao..." />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="dateRange"
                                    label={
                                        <Space>
                                            <ClockCircleOutlined />
                                            Thời gian diễn ra (Từ ngày - Đến ngày)
                                        </Space>
                                    }
                                    rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                                >
                                    <RangePicker
                                        style={{ width: '100%' }}
                                        format="DD/MM/YYYY"
                                        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    name="isHoliday"
                                    valuePropName="checked"
                                >
                                    <Checkbox>
                                        <Space>
                                            Đánh dấu là ngày nghỉ lễ (toàn trường nghỉ)
                                        </Space>
                                    </Checkbox>
                                </Form.Item>
                            </Col>
                            {/* Note */}
                            <Col xs={24}>
                                <Form.Item
                                    name="note"
                                    label={
                                        <Space>
                                            <FormOutlined />
                                            Ghi chú (nếu có)
                                        </Space>
                                    }
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder="Nhập ghi chú thêm cho sự kiện..."
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
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
                onOk={() => {
                    setIsDirty(false);
                    navigate(-1);
                }}
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

export default EventCreate;