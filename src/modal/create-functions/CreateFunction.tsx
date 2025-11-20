import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { CreateFunctionDto } from '../../types/auth';
import { toast } from 'react-toastify';
import { noSpecialCharactersandNumberRule } from '../../utils/format';

interface CreateFunctionProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (values: CreateFunctionDto) => void;
}

interface FormValues {
    functionName: string;
    urlSuffix: string;
}

const CreateFunction: React.FC<CreateFunctionProps> = ({ open, loading, onClose, onSubmit }) => {
    const [form] = Form.useForm<FormValues>();
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleFinish = (values: FormValues) => {
        const finalValues: CreateFunctionDto = {
            functionName: values.functionName,
            urlFunction: '/pms' + values.urlSuffix,
            createdBy: ''
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
                title="Tạo mới chức năng"
                open={open}
                onCancel={handleCancel}
                confirmLoading={loading}
                footer={[
                    <Button key="back" onClick={handleCancel} disabled={loading}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                        Tạo
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    onFinishFailed={handleFinishFailed}
                >
                    <Form.Item
                        name="functionName"
                        label="Tên chức năng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chức năng!' }, noSpecialCharactersandNumberRule]}
                    >
                        <Input placeholder="e.g., Quản lý người dùng" />
                    </Form.Item>

                    <Form.Item
                        name="urlSuffix"
                        label="Đường dẫn URL"
                        normalize={(value) => {
                            if (!value) return value;
                            //Trim khoảng trắng đầu cuối
                            //Chuyển khoảng trắng giữa thành dấu gạch ngang
                            return value.trim().replace(/\s+/g, '-').toLowerCase();
                        }}
                        rules={[
                            { required: true, message: 'Vui lòng nhập đường dẫn URL!' },
                            {
                                pattern: /^\//,
                                message: 'Đường dẫn phải bắt đầu bằng dấu "/" (ví dụ: /students)'
                            },
                            {
                                pattern: /^\/[a-z0-9\-_/]*$/,
                                message: 'URL chỉ được chứa chữ thường, số, gạch ngang (-) hoặc gạch dưới (_)'
                            },
                            {
                                pattern: /^(?!.*\/\/).*$/,
                                message: 'Không được chứa hai dấu gạch chéo liên tiếp "//"'
                            }
                        ]}
                    >
                        <Input
                            addonBefore="/pms"
                            placeholder="/students"
                            onKeyPress={(event) => {
                                if (!/[a-z0-9\-_/]/.test(event.key)) {
                                    event.preventDefault(); // Bỏ comment dòng này nếu muốn chặn gõ cứng
                                }
                            }}
                        />
                    </Form.Item>
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

export default CreateFunction;