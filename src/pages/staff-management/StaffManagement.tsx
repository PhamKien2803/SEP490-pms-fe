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
import { usePageTitle } from "../../hooks/usePageTitle";

const StaffManagement: React.FC = () => {
  usePageTitle('Quản lý nhân viên - Cá Heo Xanh');
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

  const fetchListStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await staffApis.getListStaff({ page: 1, limit: 1000 });
      setDataStaffs(response.data);
    } catch (error) {
      typeof error === "string"
        ? toast.info(error)
        : toast.error("Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchListStaff();
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

  const handleCreateStaff = useCallback(async (values: CreateStaffData) => {
    if (!user) {
      toast.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
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
        fetchListStaff();
      }
    } catch (error) {
      toast.info(typeof error === "string" ? error : "Tạo nhân viên thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }, [user, fetchListStaff, pagination.current, pagination.pageSize]);

  const handleOpenUpdateModal = useCallback((record: StaffRecord) => {
    setEditingStaff(record);
    setIsUpdateModalOpen(true);
  }, []);

  const handleUpdateStaff = useCallback(async (values: UpdateStaffData) => {
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
      fetchListStaff();
    } catch (error) {
      toast.info(typeof error === "string" ? error : "Cập nhật nhân viên thất bại.");
    } finally {
      setIsUpdating(false);
    }
  }, [editingStaff, user, fetchListStaff, pagination.current, pagination.pageSize]);

  const handleOpenDeleteModal = useCallback((id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await staffApis.deleteStaff(deletingId);
      toast.success("Xóa nhân viên thành công!");

      setDataStaffs(prev => {
        const newData = prev.filter(item => item._id !== deletingId);

        const totalAfterDelete = newData.length;
        const pageSize = pagination.pageSize ?? 5;
        const maxPage = Math.ceil(totalAfterDelete / pageSize);

        setPagination(prevPag => ({
          ...prevPag,
          current: Math.min(prevPag.current ?? 1, maxPage || 1),
          total: totalAfterDelete,
        }));

        return newData;
      });

      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.info(typeof error === "string" ? error : "Xóa nhân viên thất bại.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }, [deletingId, pagination.pageSize]);


  const handleOpenViewModal = useCallback((record: StaffRecord) => {
    setViewingStaff(record);
    setIsViewModalOpen(true);
  }, []);

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
        width: 120,
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
        width: 120,
        className: 'ant-table-header-nowrap',
        render: (phoneNumber: string) => phoneNumber,
      },
      {
        title: "Hành động",
        key: "action",
        align: "center",
        width: 100,
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
    [canUpdate, canDelete, handleOpenUpdateModal, handleOpenDeleteModal, handleOpenViewModal, pagination.current, pagination.pageSize]
  );

  const handleReload = useCallback(() => {
    fetchListStaff();
  }, [fetchListStaff, pagination.current, pagination.pageSize]);

  const cardHeader = (
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
          <Tooltip title="Làm mới danh sách">
            <Button
              style={{ marginRight: 5 }}
              icon={<ReloadOutlined />}
              onClick={handleReload}
              loading={loading}
            />
          </Tooltip>
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
  );

  const initialUpdateData = useMemo(() => {
    if (!editingStaff) return null;
    return {
      _id: editingStaff._id,
      staffCode: editingStaff.staffCode,
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
    };
  }, [editingStaff]);

  const handleCloseCreateModal = useCallback(() => setIsModalOpen(false), []);
  const handleCloseUpdateModal = useCallback(() => setIsUpdateModalOpen(false), []);
  const handleCloseDeleteModal = useCallback(() => setIsDeleteModalOpen(false), []);
  const handleCloseViewModal = useCallback(() => setIsViewModalOpen(false), []);

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
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateStaff}
      />

      <UpdateStaff
        open={isUpdateModalOpen}
        loading={isUpdating}
        initialData={initialUpdateData}
        onClose={handleCloseUpdateModal}
        onSubmit={handleUpdateStaff}
      />

      <ModalConfirm
        open={isDeleteModalOpen}
        loading={isDeleting}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác."
      />
      <ViewStaffDetails
        open={isViewModalOpen}
        onClose={handleCloseViewModal}
        staffData={viewingStaff}
      />
    </div>
  );
};

export default StaffManagement;