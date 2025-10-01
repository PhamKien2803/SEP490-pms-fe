import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { CreateFunctionDto } from '../../types/auth';
import { toast } from 'react-toastify';
// import { useCurrentUser } from '../../hooks/useCurrentUser';

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
    // const user = useCurrentUser();
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
                        rules={[{ required: true, message: 'Vui lòng nhập tên chức năng!' }]}
                    >
                        <Input placeholder="e.g., Quản lý người dùng" />
                    </Form.Item>

                    <Form.Item
                        name="urlSuffix"
                        label="Đường dẫn URL"
                        rules={[
                            { required: true, message: 'Vui lòng nhập đường dẫn URL!' },
                            { pattern: /^\//, message: 'Đường dẫn phải bắt đầu bằng "/"' },
                        ]}
                    >
                        <Input
                            addonBefore="/pms"
                            placeholder="/students"
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