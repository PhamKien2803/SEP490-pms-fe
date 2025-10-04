import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, Space, Typography, Row, Col, Tooltip, Avatar, Tag } from 'antd';
import { SearchOutlined, UserOutlined, CrownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { toast } from 'react-toastify';
import { accountsApis } from '../../services/apiServices';
import { AccountListItem, UpdateAccountDto } from '../../types/account';
import UpdateAccount from '../../modal/update-account/UpdateAccount';
import DeleteModal from '../../modal/delete-modal/DeleteModal';

const AccountManagement: React.FC = () => {
    const [allAccounts, setAllAccounts] = useState<AccountListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
    });
    const [searchQuery, setSearchQuery] = useState('');

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingAccount, setEditingAccount] = useState<AccountListItem | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchAllAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await accountsApis.getAccountList({ page: 1, limit: 1000 });
            setAllAccounts(response.data);
        } catch (error) {
            toast.error('Tải danh sách tài khoản thất bại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllAccounts();
    }, [fetchAllAccounts]);

    const filteredAccounts = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) {
            return allAccounts;
        }
        return allAccounts.filter(acc => {
            const name = acc.staff?.fullName || '';
            return acc.email.toLowerCase().includes(keyword) ||
                name.toLowerCase().includes(keyword);
        });
    }, [allAccounts, searchQuery]);

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

    const handleOpenUpdateModal = (record: AccountListItem) => {
        setEditingAccount(record);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateAccount = async (values: UpdateAccountDto) => {
        if (!editingAccount) return;
        setIsUpdating(true);
        try {
            await accountsApis.updateAccount(editingAccount._id, values);
            toast.success('Cập nhật tài khoản thành công!');
            setIsUpdateModalOpen(false);
            fetchAllAccounts();
        } catch (error) {
            toast.error('Cập nhật tài khoản thất bại.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenDeleteModal = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await accountsApis.deleteAccount(deletingId);
            toast.success('Xóa tài khoản thành công!');
            setIsDeleteModalOpen(false);
            fetchAllAccounts();
        } catch (error) {
            toast.error('Xóa tài khoản thất bại.');
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const columns: ColumnsType<AccountListItem> = useMemo(() => [
        {
            title: 'Tài khoản',
            dataIndex: 'email',
            key: 'email',
            render: (_, record) => {
                const name = record.staff?.fullName || 'Chưa liên kết';
                return (
                    <Space>
                        <Avatar icon={<UserOutlined />} />
                        <div>
                            <Typography.Link style={{ fontWeight: 500 }}>{name}</Typography.Link>
                            <Typography.Text type="secondary" style={{ display: 'block' }}>{record.email}</Typography.Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Vai trò',
            key: 'roleList',
            dataIndex: 'roleList',
            render: (_, record) => (
                <>
                    {record.isAdmin && <Tag icon={<CrownOutlined />} color="gold">Admin</Tag>}
                    {record.roleList.map((role) => <Tag color="blue" key={role._id}>{role.roleName}</Tag>)}
                </>
            ),
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
        },
        {
            title: 'Người cập nhật',
            dataIndex: 'updatedBy',
            key: 'updatedBy',
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => handleOpenUpdateModal(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button type="text" shape="circle" danger icon={<DeleteOutlined />} onClick={() => handleOpenDeleteModal(record._id)} />
                    </Tooltip>
                </Space>
            ),
        },
    ], [handleOpenUpdateModal, handleOpenDeleteModal]);

    return (
        <div style={{ padding: 24, background: '#fff' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Typography.Title level={3} style={{ margin: 0 }}>Quản lý tài khoản</Typography.Title>
                </Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Tìm kiếm theo email, tên..."
                            prefix={<SearchOutlined />}
                            style={{ width: 250 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                        />
                    </Space>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredAccounts}
                rowKey="_id"
                loading={loading}
                pagination={{ ...pagination, total: filteredAccounts.length }}
                onChange={handleTableChange}
                bordered
            />

            <UpdateAccount
                open={isUpdateModalOpen}
                loading={isUpdating}
                initialData={editingAccount}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateAccount}
            />

            <DeleteModal
                open={isDeleteModalOpen}
                loading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default AccountManagement;