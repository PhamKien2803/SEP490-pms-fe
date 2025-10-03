import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, Space, Typography, Row, Col, Card, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { rolesApis } from '../../services/apiServices';
import { usePagePermission } from '../../hooks/usePagePermission';
import { RoleListItem } from '../../types/role';
import DeleteModal from '../../modal/delete-modal/DeleteModal';

const RoleManagement: React.FC = () => {
    const navigate = useNavigate();
    const [allRoles, setAllRoles] = useState<RoleListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 5,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20'],
        position: ['bottomCenter'],
        showTotal: (total) => `Tổng số: ${total} bản ghi`,
    });
    const [searchQuery, setSearchQuery] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchAllRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await rolesApis.getRolesList({ page: 1, limit: 1000 });
            setAllRoles(response.data);
        } catch (error) {
            toast.error('Tải danh sách vai trò thất bại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllRoles();
    }, [fetchAllRoles]);

    const filteredRoles = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) {
            return allRoles;
        }
        return allRoles.filter(role =>
            role.roleName.toLowerCase().includes(keyword) ||
            role.roleCode.toLowerCase().includes(keyword)
        );
    }, [allRoles, searchQuery]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchQuery]);

    const handleTableChange = useCallback((newPagination: TablePaginationConfig) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    }, []);

    const handleOpenDeleteModal = useCallback((id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deletingId) return;

        setIsDeleting(true);
        try {
            await rolesApis.deleteRole(deletingId);
            toast.success('Xóa vai trò thành công!');
            setIsDeleteModalOpen(false);
            fetchAllRoles();
        } catch (error) {
            toast.error('Xóa vai trò thất bại.');
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    }, [deletingId, fetchAllRoles]);

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
                            <Button
                                type="text"
                                icon={<EditOutlined style={{ color: '#1890ff' }} />}
                                onClick={() => navigate(`/pms/roles/edit/${record._id}`)}
                            />
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleOpenDeleteModal(record._id)} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ], [navigate, canUpdate, canDelete, handleOpenDeleteModal]);

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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {canCreate && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/pms/roles/create')}>
                            Tạo mới
                        </Button>
                    )}
                </Space>
            </Col>
        </Row>
    ), [navigate, canCreate, searchQuery]);

    return (
        <div style={{ padding: '24px' }}>
            <Card title={cardHeader} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Table
                    columns={columns}
                    dataSource={filteredRoles}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ ...pagination, total: filteredRoles.length }}
                    onChange={handleTableChange}
                />
            </Card>
            <DeleteModal
                open={isDeleteModalOpen}
                loading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default RoleManagement;