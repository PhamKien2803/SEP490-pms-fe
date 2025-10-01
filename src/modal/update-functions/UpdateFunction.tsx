import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { UpdateFunctionDto } from '../../types/auth';
import { toast } from 'react-toastify';
// import { useCurrentUser } from '../../hooks/useCurrentUser';

export interface UpdateFormValues {
    functionName: string;
    urlSuffix: string;
}
interface UpdateFunctionProps {
    open: boolean;
    loading: boolean;
    initialData: UpdateFormValues | null;
    onClose: () => void;
    onSubmit: (values: UpdateFunctionDto) => void;
}

const UpdateFunction: React.FC<UpdateFunctionProps> = ({ open, loading, initialData, onClose, onSubmit }) => {
    const [form] = Form.useForm<UpdateFormValues>();
    // const user = useCurrentUser();
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    useEffect(() => {
        if (open && initialData) {
            form.setFieldsValue(initialData);
        }
        if (!open) {
            form.resetFields();
        }
    }, [open, initialData, form]);

    const handleFinish = (values: UpdateFormValues) => {
        const finalValues: UpdateFunctionDto = {
            functionName: values.functionName,
            urlFunction: '/pms' + values.urlSuffix,
            updatedBy: ''
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
                title="Cập nhật chức năng"
                open={open}
                onCancel={handleCancel}
                confirmLoading={loading}
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
                            placeholder="students"
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

export default UpdateFunction;