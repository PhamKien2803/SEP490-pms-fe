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
  Tag
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { roomApis } from "../../services/apiServices";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { usePagePermission } from "../../hooks/usePagePermission";
import { toast } from "react-toastify";
import { RoomRecord, RoomState } from "../../types/room-management";
import { constants } from "../../constants";
import { useNavigate } from "react-router-dom";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

const { Title } = Typography;

const getStateTagColor = (state: RoomState) => {
  switch (state) {
    case "Hoàn thành": return "green";
    case "Chờ nhân sự xác nhận": return "blue";
    case "Chờ giáo viên duyệt": return "volcano";
    case "Chờ xử lý": return "gold";
    case "Dự thảo": return "default";
    default: return "default";
  }
};

const RoomManagement: React.FC = () => {
  usePageTitle("Quản lý phòng học - Cá Heo Xanh");
  const navigate = useNavigate();
  const user = useCurrentUser();
  const teacherId = user.staff;
  const { canCreate, canUpdate, canDelete } = usePagePermission();

  const [dataRooms, setDataRooms] = useState<RoomRecord[]>([]);
  const [teacherRoom, setTeacherRoom] = useState<RoomRecord | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20"],
    position: ["bottomCenter"],
    showTotal: (total) => `Tổng số: ${total} bản ghi`
  });

  const fetchListRooms = useCallback(async (params: { page: number; limit: number }) => {
    setLoading(true);
    try {
      const response = await roomApis.getListRoom(params);
      setDataRooms(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.page.totalCount,
        current: response.page.page,
        pageSize: response.page.limit
      }));
    } catch {
      toast.error("Không thể tải danh sách phòng học.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isTeacher && teacherId) {
      const fetchRoomByTeacher = async () => {
        try {
          setLoading(true);
          const room = await roomApis.getRoomByTeacherId(teacherId);
          setTeacherRoom(room);
        } catch {
          toast.error("Không thể tải phòng học của giáo viên.");
        } finally {
          setLoading(false);
        }
      };
      fetchRoomByTeacher();
    } else {
      fetchListRooms({ page: pagination.current!, limit: pagination.pageSize! });
    }
  }, [user?.isTeacher, teacherId, fetchListRooms, pagination.current, pagination.pageSize]);

  const filteredRooms = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return dataRooms;
    return dataRooms.filter(item =>
      item.roomName.toLowerCase().includes(keyword) ||
      item.roomType.toLowerCase().includes(keyword)
    );
  }, [dataRooms, searchKeyword]);

  const handleTableChange = useCallback((newPagination: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  }, []);

  const handleOpenDeleteModal = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await roomApis.deleteRoom(deletingId);
      toast.success("Xóa phòng học thành công");
      setIsDeleteModalOpen(false);
      if (dataRooms.length === 1 && pagination.current! > 1) {
        setPagination(prev => ({ ...prev, current: prev.current! - 1 }));
      } else {
        fetchListRooms({ page: pagination.current!, limit: pagination.pageSize! });
      }
    } catch {
      toast.error("Xóa phòng học thất bại.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const columns: ColumnsType<RoomRecord> = useMemo(() => [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_: any, __: any, index: number) => {
        const page = pagination.current ?? 1;
        const pageSize = pagination.pageSize ?? 5;
        return (page - 1) * pageSize + index + 1;
      }
    },
    {
      title: "Tên Phòng",
      dataIndex: "roomName",
      key: "roomName",
      width: 150
    },
    {
      title: "Loại phòng",
      dataIndex: "roomType",
      key: "roomType",
      width: 150
    },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
      width: 80,
      align: "center"
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      key: "state",
      width: 150,
      render: (state: RoomState) => (
        <Tag color={getStateTagColor(state)}>{state}</Tag>
      )
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 200,
      render: (notes: string) => (
        <Tooltip title={notes}>
          <div style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{notes || "-"}</div>
        </Tooltip>
      )
    },
    {
      title: "Hành động",
      key: "action",
      width: 110,
      fixed: "right",
      render: (_: any, record: RoomRecord) => {
        const isHR = !user?.isTeacher || user?.isAdmin;
        const isGV = user?.isTeacher || user?.isAdmin;
        const isHRUpdate = isHR && ["Dự thảo", "Chờ nhân sự xác nhận"].includes(record.state);
        const isGVUpdate = isGV && record.state === "Chờ giáo viên duyệt";
        const isAdminUpdate = !user?.isAdmin && record.state === "Chờ xử lý";
        const isPermissionUpdate = canUpdate && (isHRUpdate || isGVUpdate || isAdminUpdate || record.state === "Hoàn thành");

        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button type="text" icon={<EyeOutlined style={{ color: "#52c41a" }} />} onClick={() => navigate(`${constants.APP_PREFIX}/rooms/view/${record._id}`)} />
            </Tooltip>
            {isPermissionUpdate && (
              <Tooltip title="Chỉnh sửa">
                <Button type="text" icon={<EditOutlined style={{ color: "#1890ff" }} />} onClick={() => navigate(`${constants.APP_PREFIX}/rooms/edit/${record._id}`)} />
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleOpenDeleteModal(record._id)} />
              </Tooltip>
            )}
          </Space>
        );
      }
    }
  ], [canUpdate, canDelete, navigate, user, pagination]);

  const cardHeader = useMemo(() => (
    <Row justify="space-between" align="middle">
      <Col>
        <Title level={3} style={{ margin: 0 }}>Quản lý Phòng học</Title>
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
            <Button icon={<ReloadOutlined />} onClick={() => fetchListRooms({ page: pagination.current!, limit: pagination.pageSize! })} loading={loading} />
          </Tooltip>
          {canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/rooms/create`)}>
              Tạo mới
            </Button>
          )}
        </Space>
      </Col>
    </Row>
  ), [searchKeyword, canCreate, navigate, loading, pagination, fetchListRooms]);

  return (
    <div style={{ padding: 22 }}>
      <Card title={cardHeader} bordered={false} style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
        <Table
          columns={columns}
          dataSource={user?.isTeacher ? (teacherRoom ? [teacherRoom] : []) : filteredRooms}
          loading={loading}
          rowKey="_id"
          pagination={
            user?.isTeacher || searchKeyword.trim()
              ? false
              : (pagination as TablePaginationConfig)
          }
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
