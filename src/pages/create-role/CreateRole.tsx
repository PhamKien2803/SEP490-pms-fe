import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, Card, Select, Tooltip, Modal } from 'antd';
import { ArrowLeftOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { rolesApis } from '../../services/apiServices';
import { CreateRoleDto } from '../../types/role';
import { RoleFunctionItem, RoleModuleItem } from '../../types/role';

const hardcodedActions = [
    { label: 'Xem', value: 'view' },
    { label: 'Tạo', value: 'create' },
    { label: 'Sửa', value: 'update' },
    { label: 'Xóa', value: 'delete' },
];

const CreateRole: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const user = useCurrentUser();
    const [loading, setLoading] = useState(false);
    const [functions, setFunctions] = useState<RoleFunctionItem[]>([]);
    const [modules, setModules] = useState<RoleModuleItem[]>([]);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const permissions = Form.useWatch('permissions', form);

    useEffect(() => {
        const fetchDataForDropdowns = async () => {
            try {
                const [functionsRes, modulesRes] = await Promise.all([
                    rolesApis.getListFunction(),
                    rolesApis.getListModule(),
                ]);
                setFunctions(functionsRes);
                setModules(modulesRes);
            } catch (error) {
                toast.error('Không thể tải dữ liệu cho các lựa chọn.');
            }
        };
        fetchDataForDropdowns();
    }, []);

    const functionOptions = functions.map(f => ({ label: f.functionName, value: f._id }));
    const moduleOptions = modules.map(m => ({ label: m.moduleName, value: m._id }));

    const handleCancel = () => {
        if (form.isFieldsTouched()) {
            setIsConfirmVisible(true);
        } else {
            navigate(-1);
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);

        const permissionsMap = new Map<string, { moduleId: string; functionList: any[] }>();
        if (values.permissions) {
            values.permissions.forEach((perm: any) => {
                if (!perm || !perm.module || !perm.function || !perm.actions) return;

                const { module: moduleId, function: functionId, actions } = perm;

                const formattedActions = hardcodedActions.map(action => ({
                    name: action.value,
                    allowed: actions.includes(action.value),
                }));

                const functionPermission = {
                    functionId,
                    action: formattedActions,
                };

                if (permissionsMap.has(moduleId)) {
                    permissionsMap.get(moduleId)?.functionList.push(functionPermission);
                } else {
                    permissionsMap.set(moduleId, {
                        moduleId: moduleId,
                        functionList: [functionPermission],
                    });
                }
            });
        }

        const payload: CreateRoleDto = {
            roleName: values.roleName,
            permissionList: Array.from(permissionsMap.values()),
            createdBy: user.email,
        };

        try {
            await rolesApis.createRole(payload);
            toast.success('Tạo vai trò thành công!');
            navigate('/pms/roles');
        } catch (error) {
            toast.error('Tạo vai trò thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card bordered={false}>
                <Space align="center" style={{ marginBottom: '24px' }}>
                    <Tooltip title="Quay lại">
                        <Button
                            shape="circle"
                            icon={<ArrowLeftOutlined />}
                            onClick={handleCancel}
                        />
                    </Tooltip>
                    <Typography.Title level={2} style={{ margin: 0 }}>
                        Tạo vai trò và phân quyền
                    </Typography.Title>
                </Space>

                <Form
                    form={form}
                    name="create_role"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item
                        name="roleName"
                        label="Tên vai trò"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
                        style={{ maxWidth: '400px' }}
                    >
                        <Input placeholder="Nhập tên vai trò" />
                    </Form.Item>

                    <Form.List name="permissions">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => {
                                    const selectedFunctions = (permissions || []).map((p: { function: string }) => p?.function).filter(Boolean);
                                    const availableFunctions = functionOptions.filter(
                                        opt => !selectedFunctions.includes(opt.value) || opt.value === permissions?.[name]?.function
                                    );

                                    return (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" wrap>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'function']}
                                                rules={[{ required: true, message: 'Vui lòng chọn chức năng!' }]}
                                                style={{ minWidth: '200px' }}
                                            >
                                                <Select
                                                    options={availableFunctions}
                                                    placeholder="Chọn chức năng"
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'module']}
                                                rules={[{ required: true, message: 'Vui lòng chọn phân hệ!' }]}
                                                style={{ minWidth: '200px' }}
                                            >
                                                <Select options={moduleOptions} placeholder="Chọn phân hệ" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'actions']}
                                                rules={[{ required: true, message: 'Vui lòng chọn quyền!' }]}
                                                style={{ minWidth: '300px' }}
                                            >
                                                <Select mode="multiple" allowClear options={hardcodedActions} placeholder="Chọn các hành động" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                        </Space>
                                    );
                                })}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ maxWidth: '800px' }}>
                                        Thêm quyền
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item style={{ marginTop: '32px' }}>
                        <Space>
                            <Button htmlType="button" onClick={handleCancel} disabled={loading}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Lưu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Modal
                title="Bạn có chắc muốn hủy?"
                open={isConfirmVisible}
                onOk={() => {
                    setIsConfirmVisible(false);
                    navigate(-1);
                }}
                onCancel={() => setIsConfirmVisible(false)}
                okText="Đồng ý"
                cancelText="Không"
            >
                <p>Các thay đổi sẽ không được lưu lại.</p>
            </Modal>
        </div>
    );
};

export default CreateRole;