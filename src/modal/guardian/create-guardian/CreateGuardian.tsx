import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Space, Row, Col, Divider } from 'antd';
import { SaveOutlined, CloseCircleOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { IGuardianForm } from '../../../types/guardians';

const { Option } = Select;
const ACCENT_COLOR = "#1890ff";

interface CreateGuardianProps {
    open: boolean;
    loading: boolean;
    studentId: string | null;
    parentId: string | null;
    onClose: () => void;
    onSubmit: (values: IGuardianForm) => Promise<void>;
}

const CreateGuardian: React.FC<CreateGuardianProps> = ({
    open, loading, studentId, parentId, onClose, onSubmit,
}) => {
    const [form] = Form.useForm<IGuardianForm>();

    useEffect(() => {
        if (open) {
            form.resetFields();
            // Thiết lập giá trị mặc định/hidden
            form.setFieldsValue({
                studentId: studentId,
                parentId: parentId,
            } as Partial<IGuardianForm>);
        }
    }, [open, studentId, parentId, form]);

    const handleCancel = () => {
        // Logic xác nhận hủy giữ nguyên như trong code gốc của bạn
        form.isFieldsTouched() ? 
            Modal.confirm({
                title: 'Xác nhận hủy',
                content: 'Các thay đổi bạn đang thực hiện sẽ không được lưu lại. Bạn có chắc muốn hủy?',
                okText: 'Đồng ý',
                cancelText: 'Không',
                okButtonProps: { danger: true },
                onOk: () => onClose(),
            }) 
            : onClose();
    };

    return (
        <Modal
            title="Thêm Người Đưa Đón Mới"
            open={open}
            onCancel={handleCancel}
            footer={null}
            closeIcon={<CloseCircleOutlined style={{ color: ACCENT_COLOR }} />}
            destroyOnClose={true}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit} // Gọi trực tiếp onSubmit từ props
                initialValues={{ active: true }}
                disabled={loading}
            >
                {/* Form Fields (giữ nguyên) */}
                <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
                </Form.Item>
                {/* ... Các trường khác như dob, phoneNumber, relationship, pickUpDate ... */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Ngày/Tháng/Năm" maxDate={dayjs()} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
                            <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="relationship" label="Mối quan hệ" rules={[{ required: true }]}>
                    <Select placeholder="Chọn quan hệ">
                        {["Ông", "Bà", "Cô", "Dì", "Chú", "Bác", "Bạn bố mẹ", "Anh", "Chị", "Khác"].map(rel => (<Option key={rel} value={rel}>{rel}</Option>))}
                    </Select>
                </Form.Item>
                <Form.Item name="pickUpDate" label="Ngày Bắt Đầu Ủy Quyền" rules={[{ required: true }]}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Ngày bắt đầu" />
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Ghi chú về việc đưa đón" />
                </Form.Item>

                {/* Trường ẩn */}
                <Form.Item name="studentId" hidden><Input /></Form.Item>
                <Form.Item name="parentId" hidden><Input /></Form.Item>

                <Divider style={{ margin: "20px 0" }} />
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Space>
                        <Button onClick={handleCancel} disabled={loading}>Hủy</Button>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}>
                            Lưu
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateGuardian;