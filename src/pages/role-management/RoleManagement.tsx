import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, Space, Typography, Row, Col, Card, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { rolesApis } from '../../services/apiServices';
import { usePagePermission } from '../../hooks/usePagePermission';
import { RoleListItem } from '../../types/role';

const RoleManagement: React.FC = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<RoleListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 5,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20'],
        position: ['bottomCenter'],
        showTotal: (total) => `Tổng số: ${total} bản ghi`,
    });

    const fetchRoles = useCallback(async (params: { page: number; limit: number; query?: string }) => {
        setLoading(true);
        try {
            const response = await rolesApis.getRolesList(params);
            setRoles(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.page.totalCount,
                current: response.page.page,
                pageSize: response.page.limit,
            }));
        } catch (error) {
            toast.error('Tải danh sách vai trò thất bại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles({ page: pagination.current!, limit: pagination.pageSize! });
    }, [pagination.current, pagination.pageSize, fetchRoles]);

    const handleTableChange = useCallback((newPagination: TablePaginationConfig) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    }, []);

    const columns: ColumnsType<RoleListItem> = useMemo(() => [
        {
            title: 'Mã vai trò',
            dataIndex: 'roleCode',
            key: 'roleCode',
            width: '20%',
        },
        {
            title: 'Tên vai trò',
            dataIndex: 'roleName',
            key: 'roleName',
            width: '25%',
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: '15%',
        },
        {
            title: 'Người cập nhật',
            dataIndex: 'updatedBy',
            key: 'updatedBy',
            width: '15%',
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: '25%',
            render: (_: unknown, record: RoleListItem) => (
                <Space size="middle">
                    {canUpdate && (
                        <Tooltip title="Cập nhật">
                            <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => navigate(`/pms/roles/edit/${record._id}`)} />
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ], [navigate, canUpdate, canDelete]);

    const cardHeader = useMemo(() => (
        <Row justify="space-between" align="middle">
            <Col>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Quản lý vai trò
                </Typography.Title>
            </Col>
            <Col>
                <Space>
                    <Input
                        placeholder="Tìm kiếm vai trò..."
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                    {canCreate && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/pms/roles/create')}>
                            Tạo mới
                        </Button>
                    )}
                </Space>
            </Col>
        </Row>
    ), [navigate, canCreate]);

    return (
        <div style={{ padding: '24px' }}>
            <Card title={cardHeader} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Table
                    columns={columns}
                    dataSource={roles}
                    loading={loading}
                    rowKey="_id"
                    pagination={pagination}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};

export default RoleManagement;