import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, Radio, Row, Col } from 'antd';
import { UpdateParentDto, Parent } from '../../types/auth';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { Dayjs } from "dayjs";

export interface UpdateParentFormValues {
    fullName?: string;
    dob?: Dayjs;
    phoneNumber?: string;
    email?: string;
    gender?: "Nam" | "Nữ" | "Khác";
    students?: string[];
    address?: string;
    nation?: string;
    religion?: string;
    updatedBy: string;
}

interface UpdateParentProps {
    open: boolean;
    loading: boolean;
    initialData: Parent | null;
    onClose: () => void;
    onSubmit: (values: UpdateParentDto) => void;
}

const UpdateParent: React.FC<UpdateParentProps> = ({ open, loading, initialData, onClose, onSubmit }) => {
    const [form] = Form.useForm<UpdateParentFormValues>();
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    useEffect(() => {
        if (open && initialData) {
            form.setFieldsValue({
                ...initialData,
                dob: initialData.dob ? dayjs(initialData.dob) : undefined
            });
        }
        if (!open) {
            form.resetFields();
        }
    }, [open, initialData, form]);

    const handleFinish = (values: any) => {
        const finalValues: UpdateParentDto = {
            fullName: values.fullName,
            dob: values.dob ? dayjs(values.dob).toISOString() : undefined,
            phoneNumber: values.phoneNumber,
            email: values.email,
            gender: values.gender,
            address: values.address,
            nation: values.nation,
            religion: values.religion,
            updatedBy: ""
        };
        onSubmit(finalValues);
    };

    const handleFinishFailed = () => {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
    };

    const handleCancel = () => {
        if (form.isFieldsTouched()) {
            setIsConfirmVisible(true);
        } else {
            onClose();
        }
    };

    return (
        <>
            <Modal
                title="Cập nhật phụ huynh"
                open={open}
                onCancel={handleCancel}
                confirmLoading={loading}
                width={800}
                destroyOnClose
                footer={[
                    <Button key="back" onClick={handleCancel} disabled={loading}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                        Cập nhật
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    onFinishFailed={handleFinishFailed}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                                <Input placeholder="Nguyễn Văn A" />
                            </Form.Item>

                            <Form.Item
                                name="dob"
                                label="Ngày sinh"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                            >
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label="Giới tính"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                            >
                                <Radio.Group>
                                    <Radio value="Nam">Nam</Radio>
                                    <Radio value="Nữ">Nữ</Radio>
                                    <Radio value="Khác">Khác</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="IDCard"
                                label="CMND/CCCD"
                            >
                                <Input disabled />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[{ pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại phải từ 9-11 chữ số!' }]}
                            >
                                <Input placeholder="0912345678" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
                            >
                                <Input placeholder="abc@gmail.com" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                            >
                                <Input.TextArea rows={2} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                title="Bạn có chắc muốn hủy?"
                open={isConfirmVisible}
                onOk={() => {
                    setIsConfirmVisible(false);
                    onClose();
                }}
                onCancel={() => setIsConfirmVisible(false)}
                okText="Đồng ý"
                cancelText="Không"
            >
                <p>Các thay đổi sẽ không được lưu lại.</p>
            </Modal>
        </>
    );
};

export default UpdateParent;