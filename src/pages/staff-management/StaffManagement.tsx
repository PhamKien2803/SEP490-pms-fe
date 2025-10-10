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
import { staffApis } from "../../services/apiServices";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { usePagePermission } from "../../hooks/usePagePermission";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import {
  CreateStaffData,
  StaffRecord,
  UpdateStaffData,
} from "../../types/staff-management";
import ViewStaffDetails from "../../modal/staff/view-staff/ViewStaffDetail";
import UpdateStaff from "../../modal/staff/update-staff/UpdateStaff";
import CreateStaff from "../../modal/staff/create-staff/CreateStaff";

const StaffManagement: React.FC = () => {
  const [dataStaff, setDataStaffs] = useState<StaffRecord[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStaff, setViewingStaff] = useState<StaffRecord | null>(null);
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchListStaff = useCallback(
    async (params: { page: number; limit: number }) => {
      setLoading(true);
      try {
        const response = await staffApis.getListStaff(params);
        setDataStaffs(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.page.totalCount,
          current: response.page.page,
          pageSize: response.page.limit,
        }));
      } catch (error) {
        toast.error("Tải dữ liệu nhân viên thất bại.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchListStaff({
      page: pagination.current!,
      limit: pagination.pageSize!,
    });
  }, [fetchListStaff, pagination.current, pagination.pageSize]);

  const filteredStaff = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return dataStaff;
    return dataStaff.filter(
      (item) =>
        item.fullName.toLowerCase().includes(keyword) ||
        item.staffCode.toLowerCase().includes(keyword)
    );
  }, [dataStaff, searchKeyword]);

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

  const handleCreateStaff = async (values: CreateStaffData) => {
    if (!user) {
      toast.error(
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...values, createdBy: user.email };
      await staffApis.createStaff(payload);
      toast.success("Tạo nhân viên thành công!");
      setIsModalOpen(false);
      if (pagination.current !== 1) {
        setPagination((prev) => ({ ...prev, current: 1 }));
      } else {
        fetchListStaff({ page: 1, limit: pagination.pageSize! });
      }
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Tạo nhân viên thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUpdateModal = (record: StaffRecord) => {
    setEditingStaff(record);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStaff = async (values: UpdateStaffData) => {
    if (!editingStaff || !user) {
      toast.error("Thiếu thông tin cần thiết để cập nhật.");
      return;
    }
    setIsUpdating(true);
    try {
      const payload = { ...values, updatedBy: user.email };
      await staffApis.updateStaff(editingStaff._id, payload);
      toast.success("Cập nhật nhân viên thành công!");
      setIsUpdateModalOpen(false);
      fetchListStaff({
        page: pagination.current!,
        limit: pagination.pageSize!,
      });
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Cập nhật nhân viên thất bại."
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
      await staffApis.deleteStaff(deletingId);
      toast.success("Xóa nhân viên thành công!");
      setIsDeleteModalOpen(false);
      if (dataStaff.length === 1 && pagination.current! > 1) {
        setPagination((prev) => ({ ...prev, current: prev.current! - 1 }));
      } else {
        fetchListStaff({
          page: pagination.current!,
          limit: pagination.pageSize!,
        });
      }
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Xóa học sinh thất bại.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleOpenViewModal = (record: StaffRecord) => {
    setViewingStaff(record);
    setIsViewModalOpen(true);
  };

  const columns: ColumnsType<StaffRecord> = useMemo(
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
        title: "Mã nhân viên",
        dataIndex: "staffCode",
        key: "staffCode",
        width: 120, // Đặt width cụ thể
        className: 'ant-table-header-nowrap',
      },
      {
        title: "Họ và tên",
        dataIndex: "fullName",
        key: "fullName",
        width: 180,
        fixed: "left",
        className: 'ant-table-header-nowrap',
      },
      {
        title: "Ngày sinh",
        dataIndex: "dob",
        key: "dob",
        width: 100,
        className: 'ant-table-header-nowrap',
        render: (dob: string) => dayjs(dob).format("DD/MM/YYYY"),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 200,
        render: (email: string) => (
          <Tooltip title={email}>
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 180,
              }}
            >
              {email}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Số điện thoại",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        width: 120, // Đặt width cụ thể
        className: 'ant-table-header-nowrap',
        render: (phoneNumber: string) => phoneNumber,
      },
      {
        title: "Hành động",
        key: "action",
        align: "center",
        width: 100, // Giảm width
        fixed: "right",
        className: 'ant-table-header-nowrap',
        render: (_: unknown, record: StaffRecord) => (
          <Space size="middle">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                onClick={() => handleOpenViewModal(record)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa hồ sơ">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: "#1890ff" }} />}
                onClick={() => handleOpenUpdateModal(record)}
                disabled={!canUpdate}
              />
            </Tooltip>
            <Tooltip title="Xóa hồ sơ">
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
    ],
    [canUpdate, canDelete, handleOpenUpdateModal, handleOpenDeleteModal, handleOpenViewModal]
  );

  const cardHeader = useMemo(
    () => (
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Quản lý nhân viên
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="Mã NV hoặc Họ tên..."
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

  const initialUpdateData: StaffRecord | null = editingStaff
    ? {
      _id: editingStaff?._id,
      staffCode: editingStaff?.staffCode,
      fullName: editingStaff.fullName,
      dob: editingStaff.dob ? dayjs(editingStaff.dob) : null,
      IDCard: editingStaff.IDCard,
      email: editingStaff.email,
      phoneNumber: editingStaff.phoneNumber,
      isTeacher: editingStaff.isTeacher,
      gender: editingStaff.gender,
      address: editingStaff.address,
      nation: editingStaff.nation,
      religion: editingStaff.religion,
      active: editingStaff.active,
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
          dataSource={filteredStaff}
          loading={loading}
          rowKey="_id"
          pagination={searchKeyword.trim() ? false : pagination}
          onChange={handleTableChange}
        // scroll={{ x: 1300, y: 500 }}
        />
      </Card>

      <CreateStaff
        open={isModalOpen}
        loading={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStaff}
      />

      <UpdateStaff
        open={isUpdateModalOpen}
        loading={isUpdating}
        initialData={initialUpdateData}
        onClose={() => setIsUpdateModalOpen(false)}
        onSubmit={handleUpdateStaff}
      />

      <ModalConfirm
        open={isDeleteModalOpen}
        loading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác."
      />
      <ViewStaffDetails
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        staffData={viewingStaff}
      />
    </div>
  );
};

export default StaffManagement;
