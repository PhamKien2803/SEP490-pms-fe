import { useState, useEffect, useCallback } from 'react';
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
    Flex,
    Checkbox,
} from 'antd';
import {
    SaveOutlined,
    ArrowLeftOutlined,
    EditOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    FormOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { UpdateEventDto } from '../../../types/event';
import { eventApis } from '../../../services/apiServices';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

function EventUpdate() {
    usePageTitle('Chỉnh sửa sự kiện - Cá Heo Xanh');
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const user = useCurrentUser();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) {
            toast.error("ID sự kiện không hợp lệ.");
            navigate(-1);
            return;
        }
        setLoading(true);
        try {
            const data = await eventApis.getEventById(id);

            const formData: any = {
                eventName: data.eventName,
                note: data.note,
                dateRange: [
                    data.holidayStartDate ? dayjs(data.holidayStartDate) : null,
                    data.holidayEndDate ? dayjs(data.holidayEndDate) : null
                ],
                isHoliday: data.isHoliday || false,
            };

            form.setFieldsValue(formData);

        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải dữ liệu sự kiện.");
            navigate(-1);
        } finally {
            setLoading(false);
            setIsDirty(false);
        }
    }, [id, form, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        const currentUser = user?.email;

        const [startDate, endDate]: [Dayjs, Dayjs] = values.dateRange;

        if (endDate.isBefore(startDate)) {
            toast.warn('Ngày kết thúc phải sau hoặc trùng với ngày bắt đầu.');
            setIsSubmitting(false);
            return;
        }

        const payload: UpdateEventDto = {
            eventName: values.eventName,
            holidayStartDate: startDate.startOf('day').toISOString(),
            holidayEndDate: endDate.startOf('day').toISOString(),
            note: values.note,
            isHoliday: values.isHoliday || false,
            updatedBy: currentUser,
        };

        try {
            await eventApis.updateEvent(id, payload);
            toast.success('Cập nhật sự kiện thành công!');
            setIsDirty(false);
            // navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Cập nhật sự kiện thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
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
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            <Space align="center">
                                <EditOutlined style={{ color: '#1890ff' }} />
                                Chỉnh sửa Sự kiện / Ngày lễ
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
                                    label={<Space><FileTextOutlined />Tên Sự kiện / Ngày lễ</Space>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
                                >
                                    <Input placeholder="Ví dụ: Tết Trung Thu, Ngày Hội Thể Thao..." />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="dateRange"
                                    label={<Space><ClockCircleOutlined />Thời gian diễn ra (Từ ngày - Đến ngày)</Space>}
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

                            <Col xs={24}>
                                <Form.Item
                                    name="note"
                                    label={<Space><FormOutlined />Ghi chú (nếu có)</Space>}
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

export default EventUpdate;