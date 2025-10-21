import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, Card, Select, Tooltip, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { CreateRoleDto, RoleFunctionItem, RoleModuleItem } from '../../../types/role';
import { rolesApis } from '../../../services/apiServices';
import { constants } from '../../../constants';
import { hardcodedActions } from '../../../components/hard-code-action';


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
                typeof error === "string" ? toast.warn(error) : toast.error('Không thể tải dữ liệu cho các dropdown.');
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
        if (!values.permissions || values.permissions.length === 0) {
            toast.warning('Vui lòng thêm ít nhất một quyền cho vai trò!');
            return;
        }

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
            navigate(`${constants.APP_PREFIX}/roles`);
            window.location.reload();
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Tạo vai trò thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = () => {
        toast.warning('Vui lòng điền đầy đủ các thông tin bắt buộc!');
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
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    layout="horizontal"
                >
                    <Form.Item
                        name="roleName"
                        label="Tên vai trò"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
                        style={{ maxWidth: '400px' }}
                    >
                        <Input placeholder="Nhập tên vai trò" />
                    </Form.Item>

                    <Typography.Title level={4} style={{ marginTop: '16px', marginBottom: '16px' }}>
                        Danh sách quyền
                    </Typography.Title>

                    <Form.List name="permissions">
                        {(fields, { add, remove }) => {
                            const tableColumns: ColumnsType<any> = [
                                {
                                    title: 'Tên chức năng',
                                    key: 'function',
                                    render: (_text, field) => {
                                        const selectedFunctions = (permissions || []).map((p: { function: string }) => p?.function).filter(Boolean);
                                        const availableFunctions = functionOptions.filter(
                                            opt => !selectedFunctions.includes(opt.value) || opt.value === permissions?.[field.name]?.function
                                        );
                                        return (
                                            <Form.Item name={[field.name, 'function']} rules={[{ required: true, message: 'Vui lòng chọn!' }]} style={{ margin: 0 }}>
                                                <Select options={availableFunctions} placeholder="Chọn chức năng" />
                                            </Form.Item>
                                        );
                                    },
                                },
                                {
                                    title: 'Tên phân hệ',
                                    key: 'module',
                                    render: (_text, field) => (
                                        <Form.Item name={[field.name, 'module']} rules={[{ required: true, message: 'Vui lòng chọn!' }]} style={{ margin: 0 }}>
                                            <Select options={moduleOptions} placeholder="Chọn phân hệ" />
                                        </Form.Item>
                                    ),
                                },
                                {
                                    title: 'Hành động',
                                    key: 'actions',
                                    width: '40%',
                                    render: (_text, field) => (
                                        <Form.Item name={[field.name, 'actions']} rules={[{ required: true, message: 'Vui lòng chọn!' }]} style={{ margin: 0 }}>
                                            <Select mode="multiple" allowClear options={hardcodedActions} placeholder="Chọn các hành động" />
                                        </Form.Item>
                                    ),
                                },
                                {
                                    title: '',
                                    key: 'delete',
                                    width: '5%',
                                    render: (_text, field) => (
                                        <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: 'red' }} />
                                    ),
                                },
                            ];

                            return (
                                <>
                                    <Table
                                        columns={tableColumns}
                                        dataSource={fields}
                                        pagination={false}
                                        rowKey="key"
                                        bordered
                                    />
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: '16px' }}>
                                        Thêm quyền
                                    </Button>
                                </>
                            );
                        }}
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