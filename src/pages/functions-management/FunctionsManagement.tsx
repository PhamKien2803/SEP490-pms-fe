/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, Space, Typography, Row, Col, Card, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { CreateFunctionDto, Functions, UpdateFunctionDto } from '../../types/auth';
import { functionsApis } from '../../services/apiServices';
import CreateFunction from '../../modal/create-functions/CreateFunction';
import UpdateFunction from '../../modal/update-functions/UpdateFunction';
import DeleteModal from '../../modal/delete-modal/DeleteModal';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePagePermission } from '../../hooks/usePagePermission';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../redux/hooks';
import { forceRefetchUser } from '../../redux/authSlice';
import { usePageTitle } from '../../hooks/usePageTitle';
const FunctionsManagement: React.FC = () => {
    usePageTitle('Quản lý chức năng - Cá Heo Xanh');
    const [functions, setFunctions] = useState<Functions[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const user = useCurrentUser();
    const dispatch = useAppDispatch();

    const { canCreate, canUpdate, canDelete } = usePagePermission();

    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 5,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20'],
        position: ['bottomCenter'],
        showTotal: (total, range) => `${range[0]}–${range[1]} của ${total} bản ghi`,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingFunction, setEditingFunction] = useState<Functions | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchFunctions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await functionsApis.getFunctions({ page: 1, limit: 1000 });
            setFunctions(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.page.totalCount || response.data.length,
            }));
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error('Hiện chưa có chức năng nào. Vui lòng tạo mới!');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchFunctions();
    }, [fetchFunctions, pagination.current, pagination.pageSize]);

    const filteredFunctions = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return functions;
        return functions.filter(item =>
            item.functionName.toLowerCase().includes(keyword) ||
            item.functionCode.toLowerCase().includes(keyword)
        );
    }, [functions, searchKeyword]);

    const handleTableChange = useCallback((newPagination: TablePaginationConfig) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    }, []);

    const handleCreateFunction = async (values: CreateFunctionDto) => {
        if (!user) {
            toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { ...values, createdBy: user.email };
            await functionsApis.createFunction(payload);
            toast.success('Tạo chức năng thành công!');
            dispatch(forceRefetchUser());
            setIsModalOpen(false);
            if (pagination.current !== 1) {
                setPagination(prev => ({ ...prev, current: 1 }));
            } else {
                fetchFunctions();
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Tạo chức năng thất bại. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenUpdateModal = (record: Functions) => {
        setEditingFunction(record);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateFunction = async (values: UpdateFunctionDto) => {
        if (!editingFunction || !user) {
            toast.warning('Thiếu thông tin cần thiết để cập nhật.');
            return;
        }
        setIsUpdating(true);
        try {
            const payload = { ...values, updatedBy: user.email };
            await functionsApis.updateFunction(editingFunction._id, payload);
            toast.success('Cập nhật chức năng thành công!');
            dispatch(forceRefetchUser());
            setIsUpdateModalOpen(false);
            fetchFunctions();
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Cập nhật chức năng thất bại. Vui lòng thử lại!');
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
            await functionsApis.deleteFunction(deletingId);
            toast.success('Xóa chức năng thành công!');
            dispatch(forceRefetchUser());
            setFunctions(prev => {
                const newList = prev.filter(item => item._id !== deletingId);
                const total = newList.length;
                const pageSize = pagination.pageSize ?? 10;
                const maxPage = Math.ceil(total / pageSize);

                setPagination(prev => ({
                    ...prev,
                    current: Math.min(prev.current ?? 1, maxPage || 1),
                    total: total,
                }));

                return newList;
            });
            setIsDeleteModalOpen(false);
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error('Xóa chức năng thất bại. Vui lòng thử lại!');
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };


    const columns: ColumnsType<Functions> = useMemo(() => [
        { title: 'Mã chức năng', dataIndex: 'functionCode', key: 'functionCode', width: '20%' },
        { title: 'Tên chức năng', dataIndex: 'functionName', key: 'functionName' },
        { title: 'Người tạo', dataIndex: 'createdBy', key: 'createdBy' },
        { title: 'Người cập nhật', dataIndex: 'updatedBy', key: 'updatedBy' },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: '25%',
            render: (_: unknown, record: Functions) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleOpenUpdateModal(record)}
                            disabled={!canUpdate}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa chức năng">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleOpenDeleteModal(record._id)}
                            disabled={!canDelete}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ], [canUpdate, canDelete]);

    const cardHeader = useMemo(() => (
        <Row justify="space-between" align="middle">
            <Col>
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Quản lý chức năng
                </Typography.Title>
            </Col>
            <Col>
                <Space>
                    <Tooltip title="Làm mới danh sách">
                        <Button icon={<ReloadOutlined />}
                            onClick={() => fetchFunctions()}
                            loading={loading}>Làm mới danh sách</Button>
                    </Tooltip>
                    <Input.Search
                        placeholder="Tìm kiếm chức năng..."
                        style={{ width: 250 }}
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        allowClear
                    />
                    {canCreate && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                            Tạo mới
                        </Button>
                    )}
                </Space>
            </Col>
        </Row>
    ), [searchKeyword, canCreate]);

    const initialUpdateData = editingFunction ? {
        functionName: editingFunction.functionName,
        urlSuffix: editingFunction.urlFunction.replace('/pms', ''),
    } : null;

    return (
        <div style={{ padding: '22px' }}>
            <Card title={cardHeader} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Table
                    columns={columns}
                    dataSource={filteredFunctions}
                    loading={loading}
                    rowKey="_id"
                    pagination={searchKeyword.trim() ? false : pagination}
                    onChange={handleTableChange}
                />
            </Card>

            <CreateFunction
                open={isModalOpen}
                loading={isSubmitting}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateFunction}
            />

            <UpdateFunction
                open={isUpdateModalOpen}
                loading={isUpdating}
                initialData={initialUpdateData}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateFunction}
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

export default FunctionsManagement;