import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Space,
  Tag,
  Spin,
  Descriptions,
  Table,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  RoomRecord,
  RoomState,
  RoomFacility,
} from "../../../types/room-management";
import { roomApis } from "../../../services/apiServices";
import { constants } from "../../../constants";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text } = Typography;
const { Item } = Descriptions;

const getStateTagColor = (state: RoomState) => {
  switch (state) {
    case "Hoàn thành":
      return "green";
    case "Chờ nhân sự xác nhận":
      return "blue";
    case "Chờ giáo viên duyệt":
    case "Chờ xử lý":
      return "gold";
    default:
      return "volcano";
  }
};

const RoomDetail: React.FC = () => {
  usePageTitle('Chi tiết phòng học - Cá Heo Xanh');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roomDetail, setRoomDetail] = useState<RoomRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoomDetail = useCallback(async (roomId: string) => {
    setLoading(true);
    try {
      const response: RoomRecord = await roomApis.getRoomById(roomId || "");
      setRoomDetail(response);
    } catch (error) {
      toast.error("Tải chi tiết phòng học thất bại.");
      setRoomDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchRoomDetail(id);
    }
  }, [id, fetchRoomDetail]);

  const facilityColumns = useMemo(
    () => [
      {
        title: "Tên Thiết Bị",
        dataIndex: "facilityName",
        key: "facilityName",
      },
      {
        title: "Loại",
        dataIndex: "facilityType",
        key: "facilityType",
        width: 150,
        render: (type: string) => <Tag color="blue">{type}</Tag>,
      },
      {
        title: "SL Tổng",
        dataIndex: "quantity",
        key: "quantity",
        align: "center" as const,
        width: 100,
      },
      {
        title: "Hỏng/Lỗi",
        dataIndex: "quantityDefect",
        key: "quantityDefect",
        align: "center" as const,
        width: 100,
        render: (count: number) => (
          <Text type={count > 0 ? "danger" : undefined}>{count}</Text>
        ),
      },
      {
        title: "Thiếu",
        dataIndex: "quantityMissing",
        key: "quantityMissing",
        align: "center" as const,
        width: 100,
        render: (count: number) => (
          <Text type={count > 0 ? "warning" : undefined}>{count}</Text>
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "notes",
        key: "notes",
        render: (notes: string) => (
          <Tooltip title={notes}>
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 300,
              }}
            >
              {notes || "Không có"}
            </div>
          </Tooltip>
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Spin tip="Đang tải chi tiết phòng học..." size="large" />
      </div>
    );
  }

  if (!roomDetail) {
    return (
      <div style={{ padding: "24px" }}>
        <Title level={3}>
          <ArrowLeftOutlined
            onClick={() => navigate(`${constants.APP_PREFIX}/rooms`)}
            style={{ marginRight: 16, cursor: "pointer" }}
          />
          Không tìm thấy Phòng Học
        </Title>
        <Card>
          <Text>Phòng học với ID: {id} không tồn tại hoặc đã bị xóa.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Title level={3} style={{ marginBottom: 20 }}>
        <ArrowLeftOutlined
          onClick={() => navigate(`${constants.APP_PREFIX}/rooms`)}
          style={{ marginRight: 16, cursor: "pointer", color: "#0050b3" }}
        />
        Chi Tiết Phòng Học: {roomDetail.roomName}
      </Title>

      {/* PHẦN 1: THÔNG TIN CƠ BẢN VÀ LỊCH SỬ */}
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="middle">
                <HomeOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                <Title level={4} style={{ margin: 0 }}>
                  Thông tin Phòng học
                </Title>
              </Space>
            </Col>
          </Row>
        }
        bordered={false}
        style={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          marginBottom: 30,
          borderRadius: 8,
        }}
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }} size="middle">
          <Item label={<Text strong>Tên Phòng</Text>} span={1}>
            {roomDetail.roomName}
          </Item>
          <Item label={<Text strong>Loại Phòng</Text>} span={1}>
            {roomDetail.roomType}
          </Item>
          <Item label={<Text strong>Sức Chứa Tối Đa</Text>} span={1}>
            <Space>
              <UsergroupAddOutlined style={{ color: "#faad14" }} />
              <Text strong style={{ color: "#faad14" }}>
                {roomDetail.capacity}
              </Text>
              <Text>học sinh</Text>
            </Space>
          </Item>
          <Item label={<Text strong>Trạng Thái</Text>} span={1}>
            <Tag
              color={getStateTagColor(roomDetail.state)}
              icon={<CheckCircleOutlined />}
              style={{ fontSize: 13, padding: "4px 8px" }}
            >
              {roomDetail.state}
            </Tag>
          </Item>
          <Item label={<Text strong>Trạng thái Active</Text>} span={2}>
            <Tag color={roomDetail.active ? "success" : "default"}>
              {roomDetail.active ? "Đang hoạt động" : "Ngừng hoạt động"}
            </Tag>
          </Item>

          {/* LỊCH SỬ */}
          <Item
            label={
              <Text strong>
                <UserOutlined /> Người Tạo
              </Text>
            }
            span={1}
          >
            {roomDetail.createdBy || "-"}
          </Item>
          <Item
            label={
              <Text strong>
                <ClockCircleOutlined /> Ngày Tạo
              </Text>
            }
            span={1}
          >
            {roomDetail.createdAt
              ? dayjs(roomDetail.createdAt).format("DD/MM/YYYY HH:mm")
              : "-"}
          </Item>
          <Item label={<Text strong>Người Cập Nhật</Text>} span={1}>
            {roomDetail.updatedBy || "-"}
          </Item>

          <Item
            label={
              <Text strong>
                <ReadOutlined /> Ghi Chú Chung
              </Text>
            }
            span={3}
          >
            <Text>{roomDetail.notes || "Không có ghi chú"}</Text>
          </Item>
        </Descriptions>
      </Card>

      {/* PHẦN 2: CHI TIẾT THIẾT BỊ */}
      <Card
        title={
          <Space size="middle">
            <ToolOutlined style={{ fontSize: 20, color: "#fa8c16" }} />
            <Title level={4} style={{ margin: 0 }}>
              Danh sách Thiết bị / Tài sản ({roomDetail.facilities?.length || 0}
              )
            </Title>
          </Space>
        }
        bordered={false}
        style={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          borderRadius: 8,
        }}
      >
        {roomDetail.facilities && roomDetail.facilities.length > 0 ? (
          <Table
            columns={facilityColumns}
            dataSource={roomDetail.facilities}
            rowKey={(record: RoomFacility, index) =>
              `${record.facilityName}-${index}`
            }
            pagination={false}
            size="middle"
            bordered
          />
        ) : (
          <Text
            style={{ display: "block", padding: "16px", textAlign: "center" }}
          >
            Phòng học này chưa được ghi nhận thiết bị nào.
          </Text>
        )}
      </Card>
    </div>
  );
};

export default RoomDetail;
