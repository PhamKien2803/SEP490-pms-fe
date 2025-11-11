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
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { roomApis } from "../../services/apiServices";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { usePagePermission } from "../../hooks/usePagePermission";
import { toast } from "react-toastify";
import { RoomRecord, RoomState } from "../../types/room-management";
import { constants } from "../../constants";
import { useNavigate } from "react-router-dom";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import { usePageTitle } from "../../hooks/usePageTitle";

const { Title } = Typography;

const getStateTagColor = (state: RoomState) => {
  switch (state) {
    case "Hoàn thành":
      return "green";
    case "Chờ nhân sự xác nhận":
      return "blue";
    case "Chờ giáo viên duyệt":
      return "volcano";
    case "Chờ xử lý":
      return "gold";
    case "Dự thảo":
      return "default";
    default:
      return "default";
  }
};

const RoomManagement: React.FC = () => {
  usePageTitle('Quản lý phòng học - Cá Heo Xanh');
  const navigate = useNavigate();
  const [dataRooms, setDataRooms] = useState<RoomRecord[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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
        typeof error === "string"
          ? toast.info(error)
          : toast.error("Không thể tải danh sách phòng học.");
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
      toast.error(
        typeof error === "string" ? error : "Xóa phòng học thất bại."
      );
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const columns: ColumnsType<RoomRecord> = useMemo(
    () => [
      {
        title: "STT",
        key: "stt",
        width: 60,
        align: "center",
        className: "ant-table-header-nowrap",
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
        width: 150,
        className: "ant-table-header-nowrap",
      },
      {
        title: "Loại phòng",
        dataIndex: "roomType",
        key: "roomType",
        width: 150,
        className: "ant-table-header-nowrap",
      },
      {
        title: "Sức chứa",
        dataIndex: "capacity",
        key: "capacity",
        width: 80,
        align: "center",
        className: "ant-table-header-nowrap",
      },
      {
        title: "Trạng thái",
        dataIndex: "state",
        key: "state",
        width: 150,
        className: "ant-table-header-nowrap",
        render: (state: RoomState) => (
          <Tag color={getStateTagColor(state)} style={{ whiteSpace: "nowrap" }}>
            {state}
          </Tag>
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "notes",
        key: "notes",
        width: 200,
        render: (notes: string) => (
          <Tooltip title={notes}>
            <div
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                maxWidth: "100%",
              }}
            >
              {notes || "-"}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Hành động",
        key: "action",
        align: "left",
        width: 110,
        fixed: "right",
        className: "ant-table-header-nowrap",
        render: (_: unknown, record: RoomRecord) => {
          const isHRStaff = !user?.isTeacher || user?.isAdmin;
          const isTeacher = user?.isTeacher || user?.isAdmin;
          const isHRStaffUpdate =
            isHRStaff &&
            (record?.state === "Dự thảo" ||
              record?.state === "Chờ nhân sự xác nhận");
          const isTeacherUpdate =
            isTeacher && record?.state === "Chờ giáo viên duyệt";

          const isAdminUpdate = !user?.isAdmin && record?.state === "Chờ xử lý";

          const isPermissionUpdate =
            canUpdate &&
            (isTeacherUpdate ||
              isHRStaffUpdate ||
              isAdminUpdate ||
              record?.state === "Hoàn thành");
          return (
            <Space size="small">
              <Tooltip title="Xem chi tiết">
                <Button
                  type="text"
                  icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                  onClick={() =>
                    navigate(`${constants.APP_PREFIX}/rooms/view/${record._id}`)
                  }
                />
              </Tooltip>
              <Tooltip title="Chỉnh sửa hồ sơ">
                {isPermissionUpdate && (
                  <Button
                    type="text"
                    icon={<EditOutlined style={{ color: "#1890ff" }} />}
                    onClick={() =>
                      navigate(
                        `${constants.APP_PREFIX}/rooms/edit/${record._id}`
                      )
                    }
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
          );
        },
      },
    ],
    [
      canUpdate,
      canDelete,
      handleOpenDeleteModal,
      navigate,
      pagination.current,
      pagination.pageSize,
    ]
  );

  const cardHeader = useMemo(
    () => (
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Phòng học
          </Title>
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
            <Tooltip title="Làm mới danh sách">
              <Button
                style={{ marginRight: 5 }}
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchListRooms({
                    page: pagination.current!,
                    limit: pagination.pageSize!,
                  })
                }
                loading={loading}
              >
              </Button>
            </Tooltip>
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`${constants.APP_PREFIX}/rooms/create`)}
              >
                Tạo mới
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    ),
    [searchKeyword, canCreate, navigate]
  );

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
          scroll={{ x: "max-content" }}
        />
      </Card>

      <ModalConfirm
        open={isDeleteModalOpen}
        loading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa phòng học này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default RoomManagement;
