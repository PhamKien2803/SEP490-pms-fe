/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { CreateParentDto, Parent, UpdateParentDto } from "../../types/auth";
import { parentsApis } from "../../services/apiServices";
import CreateParent from "../../modal/create-parent/CreateParent";
import UpdateParent from "../../modal/update-parents/UpdateParent";
import DeleteModal from "../../modal/delete-modal/DeleteModal";
import ViewParentDetails from "../../modal/view-parent/ViewParentDetail";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { toast } from "react-toastify";
import { usePagePermission } from '../../hooks/usePagePermission';
import { usePageTitle } from "../../hooks/usePageTitle";

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
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingParent, setEditingParent] = useState<Parent | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingParent, setViewingParent] = useState<Parent | null>(null);

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
                // typeof error === "string" ? toast.warn(error) : toast.error('Không thể tải danh sách phụ huynh.');
                toast.info('Hiện tại không có phụ huynh nào trong hệ thống.');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchParents({ page: pagination.current!, limit: pagination.pageSize! });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize]);

    // Search filter
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

    // Table pagination
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

    // Create
    const handleCreateParent = async (values: CreateParentDto) => {
        if (!user) {
            toast.error(
                "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
            );
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { ...values, createdBy: user.email };
            console.log("🚀 ~ handleCreateParent ~ payload:", payload)
            await parentsApis.createParents(payload);
            toast.success("Tạo phụ huynh thành công!");
            setIsModalOpen(false);
            if (pagination.current !== 1) {
                setPagination((prev) => ({ ...prev, current: 1 }));
            } else {
                fetchParents({ page: 1, limit: pagination.pageSize! });
            }
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Tạo phụ huynh thất bại. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update
    const handleOpenUpdateModal = (record: Parent) => {
        setEditingParent(record);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateParent = async (values: UpdateParentDto) => {
        if (!editingParent || !user) {
            toast.error("Thiếu thông tin cần thiết để cập nhật.");
            return;
        }
        setIsUpdating(true);
        try {
            const payload = { ...values, updatedBy: user.email };
            await parentsApis.updateParents(editingParent._id, payload);
            toast.success("Cập nhật phụ huynh thành công!");
            setIsUpdateModalOpen(false);
            fetchParents({
                page: pagination.current!,
                limit: pagination.pageSize!,
            });
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Cập nhật phụ huynh thất bại. Vui lòng thử lại!');
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete
    const handleOpenDeleteModal = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
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
            typeof error === "string" ? toast.warn(error) : toast.error('Xóa phụ huynh thất bại. Vui lòng thử lại!');
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const handleOpenViewModal = (record: Parent) => {
        setViewingParent(record);
        setIsViewModalOpen(true);
    };

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
                                onClick={() => handleOpenViewModal(record)}
                            />
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                            {canUpdate && (
                                <Button
                                    type="text"
                                    icon={<EditOutlined style={{ color: "#1890ff" }} />}
                                    onClick={() => handleOpenUpdateModal(record)}
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
        ], [canUpdate, canDelete]
    );

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
                            <Button icon={<ReloadOutlined />}
                                onClick={() => fetchParents({ page: pagination.current!, limit: pagination.pageSize! })}
                                loading={loading}></Button>
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
        [searchKeyword, canCreate]
    );

    const initialUpdateData = editingParent
        ? {
            _id: editingParent._id,
            parentCode: editingParent.parentCode,
            fullName: editingParent.fullName,
            dob: editingParent.dob,
            phoneNumber: editingParent.phoneNumber,
            email: editingParent.email,
            IDCard: editingParent.IDCard,
            gender: editingParent.gender,
            address: editingParent.address,
            nation: editingParent.nation,
            religion: editingParent.religion,
            students: editingParent.students,
            updatedBy: user ? user.email : "",
            createdBy: editingParent.createdBy,
            createdAt: editingParent.createdAt,
            updatedAt: editingParent.updatedAt,
        }
        : null;

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
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateParent}
            />

            <UpdateParent
                open={isUpdateModalOpen}
                loading={isUpdating}
                initialData={initialUpdateData}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateParent}
            />

            <DeleteModal
                open={isDeleteModalOpen}
                loading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />

            <ViewParentDetails
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                parentData={viewingParent}
            />
        </div>
    );
};

export default ParentManagement;