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
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { roomApis } from "../../services/apiServices"; 
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { usePagePermission } from "../../hooks/usePagePermission";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
} from "../../types/staff-management";
import { CreateRoomData, RoomRecord, UpdateRoomData } from "../../types/room-management";

const RoomManagement: React.FC = () => {
    const [dataRooms, setDataRooms] = useState<RoomRecord[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingRoom, setViewingRoom] = useState<RoomRecord | null>(null); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomRecord | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const user = useCurrentUser();
    const { canCreate, canUpdate, canDelete } = usePagePermission();

    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 5,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
        position: ["bottomCenter"],
        showTotal: (total) => `Tổng số: ${total} bản ghi`,
    });

    const fetchListRooms = useCallback(
        async (params: { page: number; limit: number }) => {
            setLoading(true);
            try {
                const response = await roomApis.getListRoom(params);
                setDataRooms(response.data);
                setPagination((prev) => ({
                    ...prev,
                    total: response.page.totalCount,
                    current: response.page.page,
                    pageSize: response.page.limit,
                }));
            } catch (error) {
                typeof error === "string" ? toast.warn(error) : toast.error('Không thể tải danh sách phòng học.');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchListRooms({
            page: pagination.current!,
            limit: pagination.pageSize!,
        });
    }, [fetchListRooms, pagination.current, pagination.pageSize]);

    const filteredRooms = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return dataRooms;
        return dataRooms.filter(
            (item) =>
                item.roomName.toLowerCase().includes(keyword) ||
                item.roomType.toLowerCase().includes(keyword) 
        );
    }, [dataRooms, searchKeyword]); 
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

    const handleCreateRoom = async (values: CreateRoomData) => {
        if (!user) {
            toast.error(
                "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại." 
            );
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { ...values, createdBy: user.email };
            await roomApis.createRoom(payload);
            toast.success("Tạo phòng học thành công!");
            setIsModalOpen(false);
            if (pagination.current !== 1) {
                setPagination((prev) => ({ ...prev, current: 1 }));
            } else {
                fetchListRooms({ page: 1, limit: pagination.pageSize! });
            }
        } catch (error) {
            toast.error(
                typeof error === "string" ? error : "Tạo phòng học thất bại."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenUpdateModal = (record: RoomRecord) => {
        setEditingRoom(record); 
        setIsUpdateModalOpen(true);
    };

    const handleUpdateRoom = async (values: UpdateRoomData) => {
        if (!editingRoom || !user) { 
            toast.error("Thiếu thông tin cần thiết để cập nhật.");
            return;
        }
        setIsUpdating(true);
        try {
            const payload = { ...values, updatedBy: user.email };
            await roomApis.updateRoom(editingRoom._id, payload);
            toast.success("Cập nhật phòng học thành công!");
            setIsUpdateModalOpen(false);
            fetchListRooms({ 
                page: pagination.current!,
                limit: pagination.pageSize!,
            });
        } catch (error) {
            toast.error(
                typeof error === "string" ? error : "Cập nhật phòng học thất bại."
            );
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
            await roomApis.deleteRoom(deletingId);
            toast.success("Xóa phòng học thành công!");
            setIsDeleteModalOpen(false);
            if (dataRooms.length === 1 && pagination.current! > 1) {
                setPagination((prev) => ({ ...prev, current: prev.current! - 1 }));
            } else {
                fetchListRooms({ 
                    page: pagination.current!,
                    limit: pagination.pageSize!,
                });
            }
        } catch (error) {
            toast.error(typeof error === "string" ? error : "Xóa phòng học thất bại.");
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const handleOpenViewModal = (record: RoomRecord) => {
        setViewingRoom(record); 
        setIsViewModalOpen(true);
    };

    const columns: ColumnsType<RoomRecord> = useMemo(
        () => [
            {
                title: "STT",
                key: "stt",
                width: 50,
                align: "center",
                className: 'ant-table-header-nowrap',
                render: (_, __, index) => {
                    const page = pagination.current ?? 1;
                    const pageSize = pagination.pageSize ?? 5;
                    return (page - 1) * pageSize + index + 1;
                },
            },
            {
                title: "Tên Phòng",
                dataIndex: "roomName",
                key: "roomName",
                width: 120, 
                className: 'ant-table-header-nowrap',
            },
            {
                title: "Loại phòng",
                dataIndex: "roomType",
                key: "roomType",
                width: 120,
                className: 'ant-table-header-nowrap',
            },
            {
                title: "Sức chứa",
                dataIndex: "capacity",
                key: "capacity",
                width: 100,
                align: 'center',
                className: 'ant-table-header-nowrap',
            },
            {
                title: "Ghi chú",
                dataIndex: "notes",
                key: "notes",
                width: 250,
                render: (notes: string) => (
                    <Tooltip title={notes}>
                        <div
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 130,
                            }}
                        >
                            {notes || '-'}
                        </div>
                    </Tooltip>
                ),
            },
            {
                title: "Ngày tạo",
                dataIndex: "createdAt",
                key: "createdAt",
                width: 120, 
                className: 'ant-table-header-nowrap',
                render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
            },
            {
                title: "Hành động",
                key: "action",
                align: "center",
                width: 100, 
                className: 'ant-table-header-nowrap',
                render: (_: unknown, record: RoomRecord) => ( 
                    <Space size="middle">
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="text"
                                icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                                onClick={() => handleOpenViewModal(record)}
                            />
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa hồ sơ">
                            {canUpdate && (
                                <Button
                                    type="text"
                                    icon={<EditOutlined style={{ color: "#1890ff" }} />}
                                    onClick={() => handleOpenUpdateModal(record)}
                                />
                            )}
                        </Tooltip>
                        <Tooltip title="Xóa hồ sơ">
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
        [canUpdate, canDelete, handleOpenUpdateModal, handleOpenDeleteModal, handleOpenViewModal]
    );

    const cardHeader = useMemo(
        () => (
            <Row justify="space-between" align="middle">
                <Col>
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        Quản lý Phòng học
                    </Typography.Title>
                </Col>
                <Col>
                    <Space>
                        <Input.Search
                            placeholder="Tên phòng, Loại phòng..."
                            style={{ width: 250 }}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            allowClear
                        />
                        {canCreate && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Tạo mới
                            </Button>
                        )}
                    </Space>
                </Col>
            </Row>
        ),
        [searchKeyword, canCreate]
    );

    const initialUpdateData: RoomRecord | null = editingRoom ? {
        ...editingRoom,
    } : null;

    return (
        <div style={{ padding: "22px" }}>
            <Card
                title={cardHeader}
                bordered={false}
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredRooms} 
                    loading={loading}
                    rowKey="_id"
                    pagination={searchKeyword.trim() ? false : pagination}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }} 
                />
            </Card>

            {/* <CreateRoom // SỬA: CreateStaff -> CreateRoom
                open={isModalOpen}
                loading={isSubmitting}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateRoom} // SỬA: handleCreateStaff -> handleCreateRoom
            />

            <UpdateRoom // SỬA: UpdateStaff -> UpdateRoom
                open={isUpdateModalOpen}
                loading={isUpdating}
                initialData={initialUpdateData}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdateRoom} // SỬA: handleUpdateStaff -> handleUpdateRoom
            />

            <ModalConfirm
                open={isDeleteModalOpen}
                loading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Bạn có chắc chắn muốn xóa phòng học này không? Hành động này không thể hoàn tác." // SỬA: Tiêu đề
            />
            <ViewRoomDetails // SỬA: ViewStaffDetails -> ViewRoomDetails
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                roomData={viewingRoom} 
            /> */}
        </div>
    );
};

export default RoomManagement;