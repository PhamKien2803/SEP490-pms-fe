import React, { useState } from 'react';
import { Form, InputNumber, Button, Space, Typography, Card, DatePicker, Row, Col, Tooltip, Modal } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolYearApis } from '../../../services/apiServices';
import { CreateSchoolYearDto } from '../../../types/schoolYear';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title } = Typography;
const { RangePicker } = DatePicker;

function CreateSchoolyear() {
    usePageTitle('Tạo năm học - Cá Heo Xanh');
    const navigate = useNavigate();
    const user = useCurrentUser();
    const [form] = Form.useForm();
    const [modalApi, contextHolder] = Modal.useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            const [startDate, endDate] = values.dateRange;
            const [enrollmentStartDate, enrollmentEndDate] = values.enrollmentDateRange;

            const payload: CreateSchoolYearDto = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                enrollmentStartDate: enrollmentStartDate.toISOString(),
                enrollmentEndDate: enrollmentEndDate.toISOString(),
                numberTarget: values.numberTarget,
                createdBy: user.email,
            };

            setIsSubmitting(true);
            await schoolYearApis.createSchoolYear(payload);
            toast.success('Thêm mới năm học thành công!');
            navigate(-1);
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Đã có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
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

    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    };

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
                            Tạo mới Năm học
                        </Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Button onClick={handleCancel} disabled={isSubmitting}>Hủy</Button>
                        <Button type="primary" icon={<SaveOutlined />} loading={isSubmitting} onClick={handleCreate}>
                            Lưu
                        </Button>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={() => setIsFormDirty(true)}
                >
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
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="enrollmentDateRange"
                                label="Khung thời gian tuyển sinh"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian tuyển sinh!' }]}
                            >
                                <RangePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
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

export default CreateSchoolyear;