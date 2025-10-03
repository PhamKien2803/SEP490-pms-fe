import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, Card, Select, Tooltip, Spin, Flex, Modal, Row, Col } from 'antd';
import { ArrowLeftOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { rolesApis } from '../../services/apiServices';
import { UpdateRoleDto, RoleDetails, RoleFunctionItem, RoleModuleItem } from '../../types/role';

const hardcodedActions = [
    { label: 'Xem', value: 'view' },
    { label: 'Tạo', value: 'create' },
    { label: 'Sửa', value: 'update' },
    { label: 'Xóa', value: 'delete' },
    { label: 'Duyệt đơn', value: 'approve' },
    { label: 'Xuất file', value: 'export' },
    { label: 'Nhập file', value: 'import' },
];

const EditRole: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const user = useCurrentUser();

    const [pageLoading, setPageLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [roleData, setRoleData] = useState<RoleDetails | null>(null);
    const [functions, setFunctions] = useState<RoleFunctionItem[]>([]);
    const [modules, setModules] = useState<RoleModuleItem[]>([]);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const permissions = Form.useWatch<{ function?: string }[]>('permissions', form);

    useEffect(() => {
        if (!id) {
            toast.error('URL không hợp lệ, thiếu ID của vai trò.');
            navigate('/pms/roles');
            return;
        }

        const fetchData = async () => {
            setPageLoading(true);
            try {
                const [roleRes, functionsRes, modulesRes] = await Promise.all([
                    rolesApis.getRoleById(id),
                    rolesApis.getListFunction(),
                    rolesApis.getListModule(),
                ]);

                setRoleData(roleRes);
                setFunctions(functionsRes);
                setModules(modulesRes);

                const flattenedPermissions = roleRes.permissionList.flatMap(module =>
                    module.functionList.map(func => ({
                        function: func.functionId,
                        module: module.moduleId,
                        actions: func.action.filter(a => a.allowed).map(a => a.name),
                    }))
                );

                form.setFieldsValue({
                    roleName: roleRes.roleName,
                    permissions: flattenedPermissions,
                });

            } catch (error) {
                toast.error('Không thể tải dữ liệu của vai trò.');
                navigate('/pms/roles');
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
    }, [id, form, navigate]);

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
        if (!id) return;
        setSubmitting(true);

        const permissionsMap = new Map<string, { moduleId: string; functionList: any[] }>();
        if (values.permissions) {
            values.permissions.forEach((perm: any) => {
                if (!perm || !perm.module || !perm.function || !perm.actions) return;
                const { module: moduleId, function: functionId, actions } = perm;
                const formattedActions = hardcodedActions.map(action => ({
                    name: action.value,
                    allowed: actions.includes(action.value),
                }));
                const functionPermission = { functionId, action: formattedActions };
                if (permissionsMap.has(moduleId)) {
                    permissionsMap.get(moduleId)?.functionList.push(functionPermission);
                } else {
                    permissionsMap.set(moduleId, { moduleId, functionList: [functionPermission] });
                }
            });
        }

        const payload: UpdateRoleDto = {
            roleName: values.roleName,
            permissionList: Array.from(permissionsMap.values()),
            updatedBy: user.email,
        };

        try {
            await rolesApis.updateRole(id, payload);
            toast.success('Cập nhật vai trò thành công!');
            navigate('/pms/roles');
        } catch (error) {
            toast.error('Cập nhật vai trò thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (pageLoading) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 150px)' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card bordered={false}>
                <Space align="center" style={{ marginBottom: '24px' }}>
                    <Tooltip title="Quay lại">
                        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={handleCancel} />
                    </Tooltip>
                    <Typography.Title level={2} style={{ margin: 0 }}>
                        Cập nhật vai trò: {roleData?.roleName}
                    </Typography.Title>
                </Space>

                <Form form={form} name="edit_role" onFinish={onFinish} autoComplete="off" layout="horizontal">
                    <Form.Item label="Mã vai trò">
                        <Input value={roleData?.roleCode} disabled />
                    </Form.Item>
                    <Form.Item name="roleName" label="Tên vai trò" rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]} style={{ maxWidth: '400px' }}>
                        <Input placeholder="Nhập tên vai trò" />
                    </Form.Item>

                    <Row gutter={[16, 0]} style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px' }}>
                        <Col style={{ width: 224 }}>
                            <Typography.Text>Tên chức năng</Typography.Text>
                        </Col>
                        <Col style={{ width: 224 }}>
                            <Typography.Text>Tên phân hệ</Typography.Text>
                        </Col>
                        <Col style={{ width: 324 }}>
                            <Typography.Text>Hành động</Typography.Text>
                        </Col>
                    </Row>

                    <Form.List name="permissions">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => {
                                    const selectedFunctions = (permissions || []).map((p: { function?: string }) => p?.function).filter(Boolean);
                                    const availableFunctions = functionOptions.filter(
                                        opt => !selectedFunctions.includes(opt.value) || opt.value === permissions?.[name]?.function
                                    );
                                    return (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" wrap={false}>
                                            <Form.Item {...restField} name={[name, 'function']} rules={[{ required: true, message: 'Vui lòng chọn!' }]} style={{ minWidth: 200, margin: 0 }}>
                                                <Select options={availableFunctions} placeholder="Chọn chức năng" />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'module']} rules={[{ required: true, message: 'Vui lòng chọn!' }]} style={{ minWidth: 200, margin: 0 }}>
                                                <Select options={moduleOptions} placeholder="Chọn phân hệ" />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'actions']} rules={[{ required: true, message: 'Vui lòng chọn!' }]} style={{ minWidth: 300, margin: 0 }}>
                                                <Select mode="multiple" allowClear options={hardcodedActions} placeholder="Chọn các hành động" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                        </Space>
                                    );
                                })}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ maxWidth: '772px', marginTop: '16px' }}>
                                        Thêm quyền
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item style={{ marginTop: '32px' }}>
                        <Space>
                            <Button htmlType="button" onClick={handleCancel} disabled={submitting}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Lưu thay đổi
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

export default EditRole;