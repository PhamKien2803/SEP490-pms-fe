import React, { useState, useEffect, useCallback } from 'react';
import { Form, InputNumber, Button, Space, Typography, Card, DatePicker, Row, Col, Spin, Flex, Tooltip, Modal, Tag, Descriptions, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolYearApis } from '../../services/apiServices';
import { SchoolYearListItem, UpdateSchoolYearDto } from '../../types/schoolYear';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const STATUS = {
    NOT_ACTIVE: 'Chưa hoạt động',
    ACTIVE: 'Đang hoạt động',
    EXPIRED: 'Hết thời hạn'
};

const STATUS_CONFIG = {
    [STATUS.NOT_ACTIVE]: { text: 'CHƯA HOẠT ĐỘNG', color: 'processing' },
    [STATUS.ACTIVE]: { text: 'ĐANG HOẠT ĐỘNG', color: 'success' },
    [STATUS.EXPIRED]: { text: 'HẾT THỜI HẠN', color: 'error' },
};

function EditSchoolyear() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useCurrentUser();
    const [form] = Form.useForm();
    const [modalApi, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [schoolYearData, setSchoolYearData] = useState<SchoolYearListItem | null>(null);
    const [isFormDirty, setIsFormDirty] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) {
            toast.error("URL không hợp lệ, thiếu ID năm học.");
            navigate(-1);
            return;
        }
        setLoading(true);
        try {
            const data = await schoolYearApis.getSchoolYearById(id);
            setSchoolYearData(data);
            form.setFieldsValue({
                dateRange: [dayjs(data.startDate), dayjs(data.endDate)],
                numberTarget: data.numberTarget,
            });
            setIsFormDirty(false);
        } catch (error) {
            toast.error("Không thể tải dữ liệu năm học.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [id, navigate, form]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdate = async () => {
        if (!id) return;
        try {
            const values = await form.validateFields();
            const [startDate, endDate] = values.dateRange;

            const payload: UpdateSchoolYearDto = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                numberTarget: values.numberTarget,
                createdBy: user.email,
            };

            setIsSubmitting(true);
            await schoolYearApis.updateSchoolYear(id, payload);
            toast.success('Cập nhật năm học thành công!');
            fetchData();
        } catch (error) {
            toast.error('Cập nhật thất bại, vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showConfirmAndUpdate = () => {
        form.validateFields()
            .then(() => {
                modalApi.confirm({
                    title: 'Xác nhận cập nhật',
                    content: 'Bạn có chắc chắn muốn lưu các thay đổi này không?',
                    okText: 'Lưu',
                    cancelText: 'Hủy',
                    onOk: handleUpdate,
                });
            })
            .catch(info => {
                console.log('Validation Failed:', info);
            });
    };

    const handleCancel = () => {
        if (isFormDirty) {
            modalApi.confirm({
                title: 'Bạn có chắc muốn hủy?',
                content: 'Các thay đổi sẽ không được lưu lại.',
                okText: 'Đồng ý',
                cancelText: 'Ở lại',
                onOk: () => navigate(-1),
            });
        } else {
            navigate(-1);
        }
    };

    const showConfirmAction = (action: 'activate' | 'end') => {
        const isActivating = action === 'activate';
        const actionText = isActivating ? 'xác nhận' : 'kết thúc';

        modalApi.confirm({
            title: `Xác nhận ${actionText} năm học?`,
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn ${actionText} năm học ${schoolYearData?.schoolYear}?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            okType: isActivating ? 'primary' : 'danger',
            onOk: () => {
                toast.info(`Chức năng "${actionText}" sẽ được phát triển trong tương lai.`);
            },
        });
    };

    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    };

    if (loading) {
        return <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 150px)' }}><Spin size="large" /></Flex>;
    }

    const statusInfo = schoolYearData?.state ? STATUS_CONFIG[schoolYearData.state as keyof typeof STATUS_CONFIG] : null;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            {contextHolder}
            <Card
                title={
                    <Space align="center">
                        <Tooltip title="Quay lại">
                            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={handleCancel} />
                        </Tooltip>
                        <Title level={3} style={{ margin: 0 }}>
                            Chi tiết năm học: {schoolYearData?.schoolYear}
                        </Title>
                    </Space>
                }
                extra={
                    <Space>
                        {schoolYearData?.state === STATUS.NOT_ACTIVE && (
                            <>
                                <Button onClick={handleCancel} disabled={isSubmitting}>Hủy</Button>
                                <Button type="primary" icon={<SaveOutlined />} loading={isSubmitting} onClick={showConfirmAndUpdate}>Cập nhật</Button>
                                <Button style={{ borderColor: '#52c41a', color: '#52c41a' }} icon={<CheckCircleOutlined />} loading={isSubmitting} onClick={() => showConfirmAction('activate')}>Xác nhận</Button>
                            </>
                        )}
                        {schoolYearData?.state === STATUS.ACTIVE && (
                            <>
                                <Button onClick={handleCancel} disabled={isSubmitting}>Hủy</Button>
                                <Button type="primary" danger icon={<StopOutlined />} loading={isSubmitting} onClick={() => showConfirmAction('end')}>Kết thúc</Button>
                            </>
                        )}
                        {schoolYearData?.state === STATUS.EXPIRED && (
                            <Button onClick={() => navigate(-1)}>Quay lại</Button>
                        )}
                    </Space>
                }
            >
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Mã năm học">{schoolYearData?.schoolyearCode}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {statusInfo && <Tag color={statusInfo.color}>{statusInfo.text}</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người tạo">{schoolYearData?.createdBy}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{dayjs(schoolYearData?.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Cấu hình chi tiết</Divider>

                <Form form={form} layout="vertical" onValuesChange={() => setIsFormDirty(true)}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="dateRange"
                                label="Khung thời gian năm học"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                            >
                                <RangePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    disabled={schoolYearData?.state !== STATUS.NOT_ACTIVE}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="numberTarget"
                                label="Chỉ tiêu tuyển sinh"
                                rules={[{ required: true, message: 'Vui lòng nhập chỉ tiêu!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    placeholder="Ví dụ: 150"
                                    disabled={schoolYearData?.state !== STATUS.NOT_ACTIVE}
                                    onKeyDown={allowOnlyNumbers}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}

export default EditSchoolyear;