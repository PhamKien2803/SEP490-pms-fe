import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Space,
  DatePicker,
  Select,
  Empty,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  AppstoreOutlined,
  EyeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import "dayjs/locale/vi";
import { toast } from "react-toastify";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import { constants } from "../../constants";
import { menuApis } from "../../services/apiServices";
import {
  MenuListParams,
  MenuListResponse,
  MenuRecord,
} from "../../types/menu-management";

dayjs.extend(weekOfYear);
dayjs.locale("vi");

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const usePagePermission = () => ({
  canCreate: true,
  canUpdate: true,
  canDelete: true,
});

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

const AGE_GROUPS = [
  { value: "2", label: "1-3 tuổi" },
  { value: "3", label: "4-5 tuổi" },
];

const MenuManagement: React.FC = () => {
  const navigate = useNavigate();

  const defaultDateRange = useMemo<[Dayjs, Dayjs]>(() => {
    const now = dayjs();
    const oneYearAgo = now.subtract(1, "year");
    const oneYearFuture = now.add(1, "year");
    return [oneYearAgo, oneYearFuture];
  }, []);

  const [menuList, setMenuList] = useState<MenuRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
  });

  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("1");
  const [selectedDateRange, setSelectedDateRange] = useState<
    [Dayjs, Dayjs] | null
  >(defaultDateRange);

  const [loading, setLoading] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { canCreate, canUpdate, canDelete } = usePagePermission();

  const fetchMenuList = useCallback(
    async (
      page: number,
      limit: number,
      ageGroup: string,
      dateRange: [Dayjs, Dayjs] | null
    ) => {
      setLoading(true);
      const fromDate = dateRange ? dateRange[0].format("YYYY-MM-DD") : "";
      const toDate = dateRange ? dateRange[1].format("YYYY-MM-DD") : "";

      const group = AGE_GROUPS.find((g) => g.value === ageGroup);
      const ageGroupParam = group ? group?.label : "";

      const params: MenuListParams = {
        page,
        limit,
        ageGroup: ageGroupParam,
        weekStart: fromDate || null,
        weekEnd: toDate || null,
        active: true,
      };

      try {
        const response: MenuListResponse = await menuApis.getListMenu(params);

        const mappedData =
          response?.data?.map((item) => ({
            ...item,
            ageGroup: String(item.ageGroup),
          })) || [];

        setMenuList(mappedData);

        setPagination((prev) => ({
          page: response?.page?.page || prev.page,
          limit: response?.page?.limit || prev.limit,
          total: response?.page?.totalCount || 0,
        }));
      } catch (error) {
        toast.error("Tải danh sách thực đơn thất bại. Vui lòng thử lại.");
        setMenuList([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMenuList(
      pagination.page,
      pagination.limit,
      selectedAgeGroup,
      selectedDateRange
    );
  }, [
    fetchMenuList,
    selectedAgeGroup,
    selectedDateRange,
    pagination.page,
    pagination.limit,
  ]);

  const handleTableChange = (newPagination: any) => {
    setPagination((prev) => ({
      ...prev,
      page: newPagination.current,
      limit: newPagination.pageSize,
    }));
  };

  const handleAgeGroupChange = (value: string) => {
    setSelectedAgeGroup(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    setSelectedDateRange(dates as [Dayjs, Dayjs] | null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteMenu = (menuId: string) => {
    setDeletingId(menuId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await menuApis.deleteMenu(deletingId);
      toast.success("Xóa thực đơn thành công!");
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      fetchMenuList(
        pagination.page,
        pagination.limit,
        selectedAgeGroup,
        selectedDateRange
      );
    } catch (error) {
      toast.error("Xóa thực đơn thất bại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStatusTag = useCallback((state: string) => {
    let color = "processing";
    if (state === "Đã duyệt") color = "success";
    if (state === "Chờ xử lý") color = "processing";
    if (state === "Từ chối") color = "error";
    return <Tag color={color}>{state.toUpperCase()}</Tag>;
  }, []);

  const columns: ColumnsType<MenuRecord> = [
    {
      title: "Ngày Bắt Đầu",
      dataIndex: "weekStart",
      key: "weekStart",
      width: 140,
      render: (date) => <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>,
    },
    {
      title: "Ngày Kết Thúc",
      dataIndex: "weekEnd",
      key: "weekEnd",
      width: 140,
      render: (date) => <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>,
    },
    {
      title: "Nhóm Tuổi",
      dataIndex: "ageGroup",
      key: "ageGroup",
      width: 140,
      align: "center",
      render: (ageGroup) => {
        const ageGroupString = String(ageGroup);
        const group = AGE_GROUPS.find((g) => g.value === ageGroupString);
        return (
          <Tooltip title={`Thực đơn cho ${group?.label || ageGroupString}`}>
            <Tag color="blue" style={{ minWidth: 80, textAlign: "center" }}>
              {group?.label || ageGroupString}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Tổng Calo (kcal/tuần)",
      dataIndex: "totalCalo",
      key: "totalCalo",
      width: 160,
      align: "center",
      render: (calo) => (
        <Text strong type="danger">
          {Number(calo)?.toLocaleString("vi-VN") || 0}
        </Text>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      align: "center",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      key: "state",
      align: "center",
      render: renderStatusTag,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem Chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#52c41a" }} />}
              size="small"
              onClick={() =>
                navigate(`${constants.APP_PREFIX}/menus/view/${record._id}`)
              }
            />
          </Tooltip>
          {canUpdate && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: "#1890ff" }} />}
                size="small"
                onClick={() =>
                  navigate(`${constants.APP_PREFIX}/menus/edit/${record._id}`)
                }
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Xóa thực đơn">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDeleteMenu(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const cardHeader = useMemo(
    () => (
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Title level={3} style={{ margin: 0, paddingTop: 15 }}>
            <AppstoreOutlined style={{ marginRight: 8 }} /> Quản lý Thực đơn
            Tuần
          </Title>
        </Col>

        <Col xs={24} style={{ marginBottom: 15 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Space wrap size="middle" style={{ marginTop: 16 }}>
                <Text strong>
                  <FilterOutlined style={{ marginRight: 4 }} /> Lọc:
                </Text>

                <Select
                  placeholder="Chọn Nhóm tuổi"
                  style={{ width: 150 }}
                  value={selectedAgeGroup}
                  onChange={handleAgeGroupChange}
                  disabled={loading}
                >
                  {AGE_GROUPS.map((group) => (
                    <Option key={group.value} value={group.value}>
                      {group.label}
                    </Option>
                  ))}
                </Select>

                <RangePicker
                  format="DD/MM/YYYY"
                  allowClear={true}
                  value={selectedDateRange}
                  onChange={handleDateRangeChange}
                  style={{ width: 250 }}
                />
              </Space>
            </Col>

            <Col style={{ marginTop: 16 }}>
              <Space wrap size="middle">
                {canCreate && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      navigate(`${constants.APP_PREFIX}/menus/create`)
                    }
                    loading={loading}
                    disabled={loading}
                  >
                    Tạo mới
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
    ),
    [selectedAgeGroup, selectedDateRange, canCreate, loading, navigate]
  );

  return (
    <div style={{ padding: "16px 24px" }}>
      <Card
        title={cardHeader}
        bordered={false}
        size="small"
        style={{ boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)", borderRadius: 8 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={menuList}
          rowKey="_id"
          loading={loading}
          onChange={handleTableChange}
          size="small"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            pageSizeOptions: ["10", "20", "50"],
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
          locale={{
            emptyText: (
              <Empty
                description={`Không tìm thấy thực đơn nào phù hợp với bộ lọc hiện tại.`}
              />
            ),
          }}
          style={{ padding: "16px" }}
        />
      </Card>

      <ModalConfirm
        open={isDeleteModalOpen}
        loading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa thực đơn này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default MenuManagement;
