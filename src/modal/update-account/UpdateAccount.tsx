import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, Switch } from 'antd';
import { toast } from 'react-toastify';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { accountsApis } from '../../services/apiServices';
import { AccountListItem, UpdateAccountDto, RoleNameItem } from '../../types/account';

export interface UpdateAccountFormValues {
    email: string;
    password?: string;
    confirmPassword?: string;
    roleList: string[];
    isAdmin: boolean;
}

interface UpdateAccountProps {
    open: boolean;
    loading: boolean;
    initialData: AccountListItem | null;
    onClose: () => void;
    onSubmit: (values: UpdateAccountDto) => void;
}

const UpdateAccount: React.FC<UpdateAccountProps> = ({ open, loading, initialData, onClose, onSubmit }) => {
    const [form] = Form.useForm<UpdateAccountFormValues>();
    const user = useCurrentUser();
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [roles, setRoles] = useState<RoleNameItem[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesRes = await accountsApis.getRoleNameList();
                setRoles(rolesRes);
            } catch (error) {
                typeof error === "string" ? toast.warn(error) : toast.error('Không thể tải danh sách vai trò.');
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (open && initialData) {
            form.setFieldsValue({
                email: initialData.email,
                roleList: initialData.roleList.map(role => role._id),
                isAdmin: initialData.isAdmin ?? false,
                password: '',
                confirmPassword: ''
            });
        }
    }, [open, initialData, form]);

    const handleFinish = (values: UpdateAccountFormValues) => {
        const payload: UpdateAccountDto = {
            email: values.email,
            roleList: values.roleList,
            isAdmin: values.isAdmin,
            updatedBy: user.email
        };

        if (values.password && values.password.trim() !== '') {
            payload.password = values.password;
        }

        onSubmit(payload);
    };

    const handleFinishFailed = () => {
        toast.error('Vui lòng điền đầy đủ thông tin hoặc sửa lỗi cho đúng!');
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
                title="Cập nhật tài khoản"
                open={open}
                onCancel={handleCancel}
                confirmLoading={loading}
                destroyOnClose
                footer={[
                    <Button key="back" onClick={handleCancel} disabled={loading}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                        Lưu
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    onFinishFailed={handleFinishFailed}
                >
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu mới (để trống nếu không thay đổi)"
                        rules={[{ min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!getFieldValue('password') || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        name="roleList"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò!' }]}
                    >
                        <Select mode="multiple" placeholder="Chọn vai trò" allowClear>
                            {roles.map(role => (
                                <Select.Option key={role._id} value={role._id}>
                                    {role.roleName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="isAdmin" label="Là Quản trị viên?" valuePropName="checked">
                        <Switch />
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

export default UpdateAccount;