/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Card,
    Tooltip,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { CreateParentDto, Parent } from "../../types/auth";
import { parentsApis } from "../../services/apiServices";
import CreateParent from "../../modal/create-parent/CreateParent";
import DeleteModal from "../../modal/delete-modal/DeleteModal";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { toast } from "react-toastify";
import { usePagePermission } from '../../hooks/usePagePermission';
import { usePageTitle } from "../../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { constants } from "../../constants";

const ParentManagement: React.FC = () => {
    usePageTitle('Quản lý phụ huynh - Cá Heo Xanh');
    const [parents, setParents] = useState<Parent[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const user = useCurrentUser();
    const { canCreate, canUpdate, canDelete } = usePagePermission();

    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 5,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
        position: ["bottomCenter"],
        showTotal: (total) => `Tổng số: ${total} phụ huynh`,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const navigate = useNavigate();
    const fetchParents = useCallback(
        async (params: { page: number; limit: number }) => {
            setLoading(true);
            try {
                const response = await parentsApis.getParents(params);
                setParents(response.data);
                setPagination((prev) => ({
                    ...prev,
                    total: response.page.totalCount,
                    current: response.page.page,
                    pageSize: response.page.limit,
                }));
            } catch (error) {
                setParents([]);
                typeof error === "string" ? toast.info(error) : toast.info('Hiện tại không có phụ huynh nào trong hệ thống.');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchParents({ page: pagination.current!, limit: pagination.pageSize! });
    }, [fetchParents, pagination.current, pagination.pageSize]);

    const filteredParents = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return parents;
        return parents.filter(
            (item) =>
                item.fullName?.toLowerCase().includes(keyword) ||
                item.phoneNumber?.includes(keyword) ||
                item.email?.toLowerCase().includes(keyword) ||
                item.IDCard?.includes(keyword)
        );
    }, [parents, searchKeyword]);

    const handleTableChange = useCallback(
        (newPagination: TablePaginationConfig) => {
            setPagination((prev) => ({
                ...prev,
                current: newPagination.current,
                pageSize: newPagination.pageSize,
            }));
        },
        []
    );

    const handleCreateParent = useCallback(async (values: CreateParentDto) => {
        if (!user) {
            toast.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { ...values, createdBy: user.email };
            await parentsApis.createParents(payload);
            toast.success("Tạo phụ huynh thành công!");
            setIsModalOpen(false);
            if (pagination.current !== 1) {
                setPagination((prev) => ({ ...prev, current: 1 }));
            } else {
                fetchParents({ page: 1, limit: pagination.pageSize! });
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Tạo phụ huynh thất bại. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    }, [user, fetchParents, pagination.current, pagination.pageSize]);




    const handleOpenDeleteModal = useCallback((id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await parentsApis.deleteParents(deletingId);
            toast.success("Xóa phụ huynh thành công!");
            setIsDeleteModalOpen(false);

            if (parents.length === 1 && pagination.current! > 1) {
                setPagination((prev) => ({ ...prev, current: prev.current! - 1 }));
            } else {
                fetchParents({
                    page: pagination.current!,
                    limit: pagination.pageSize!,
                });
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error('Xóa phụ huynh thất bại. Vui lòng thử lại!');
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    }, [deletingId, parents.length, pagination.current, pagination.pageSize, fetchParents]);


    // Tối ưu: Sửa mảng phụ thuộc cho useMemo
    const columns: ColumnsType<Parent> = useMemo(
        () => [
            {
                title: "STT",
                key: "stt",
                width: 80,
                align: "center",
                render: (_, __, index) => {
                    const page = pagination.current ?? 1;
                    const pageSize = pagination.pageSize ?? 5;
                    return (page - 1) * pageSize + index + 1;
                },
            },
            {
                title: "Mã phụ huynh",
                dataIndex: "parentCode",
                key: "parentCode",
            },
            {
                title: "Tên phụ huynh",
                dataIndex: "fullName",
                key: "fullName",
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
            },
            {
                title: "Số điện thoại",
                dataIndex: "phoneNumber",
                key: "phoneNumber",
            },
            {
                title: "Hành động",
                key: "action",
                align: "center",
                width: 150,
                render: (_: unknown, record: Parent) => (
                    <Space size="middle">
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="text"
                                icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                                onClick={() => navigate(`${constants.APP_PREFIX}/parents/view/${record._id}`)}
                            />
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                            {canUpdate && (
                                <Button
                                    type="text"
                                    icon={<EditOutlined style={{ color: "#1890ff" }} />}
                                    onClick={() => navigate(`${constants.APP_PREFIX}/parents/edit/${record._id}`)}
                                />
                            )}
                        </Tooltip>
                        <Tooltip title="Xóa phụ huynh">
                            {canDelete && (
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleOpenDeleteModal(record._id)}
                                />
                            )}
                        </Tooltip>
                    </Space>
                ),
            },
        ],
        [canUpdate, canDelete, pagination.current, pagination.pageSize, handleOpenDeleteModal]
    );

    const handleReload = useCallback(() => {
        fetchParents({ page: pagination.current!, limit: pagination.pageSize! });
    }, [fetchParents, pagination.current, pagination.pageSize]);
    const cardHeader = useMemo(
        () => (
            <Row justify="space-between" align="middle">
                <Col>
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        Quản lý phụ huynh
                    </Typography.Title>
                </Col>
                <Col>
                    <Space>
                        <Tooltip title="Làm mới danh sách">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleReload}
                                loading={loading}
                            />
                        </Tooltip>
                        <Input.Search
                            placeholder="Tìm kiếm phụ huynh..."
                            style={{ width: 300 }}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            allowClear
                        />
                        {canCreate && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} >
                                Tạo mới
                            </Button>
                        )}
                    </Space>
                </Col>
            </Row>
        ),
        [searchKeyword, canCreate, loading, handleReload]
    );



    const handleCloseCreateModal = useCallback(() => setIsModalOpen(false), []);
    const handleCloseDeleteModal = useCallback(() => setIsDeleteModalOpen(false), []);

    return (
        <div style={{ padding: "22px" }}>
            <Card
                title={cardHeader}
                bordered={false}
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredParents}
                    loading={loading}
                    rowKey="_id"
                    pagination={searchKeyword.trim() ? false : pagination}
                    onChange={handleTableChange}
                    scroll={{ x: "max-content" }}
                />
            </Card>

            <CreateParent
                open={isModalOpen}
                loading={isSubmitting}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateParent}
            />

            <DeleteModal
                open={isDeleteModalOpen}
                loading={isDeleting}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
            />

        </div>
    );
};

export default ParentManagement;