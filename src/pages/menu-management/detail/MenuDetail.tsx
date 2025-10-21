import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Space,
  Collapse,
  Table,
  Tag,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import { toast } from "react-toastify";
import {
  MenuDetail,
  DayDetail,
  MealDetail,
  Food,
} from "../../../types/menu-management";
import { constants } from "../../../constants";
import { menuApis } from "../../../services/apiServices";

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekdays: [
    "Chủ nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ],
});

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AGE_GROUPS = [
  { value: "2", label: "1-3 tuổi" },
  { value: "3", label: "4-5 tuổi" },
];

interface MealFoodItem {
  food: Food & {
    totalProtein?: number;
    totalLipid?: number;
    totalCarb?: number;
  };
  weight: number;
  calo?: number;
  protein?: number;
  lipid?: number;
  carb?: number;
}

const calculateIngredientSum = (
  record: MealFoodItem | undefined,
  key: string
): number => {
  if (!record || !record.food || !record.food.ingredients) {
    return 0;
  }

  const total = record.food.ingredients.reduce((sum, item: any) => {
    const value = (item[key] as any) || 0;
    return sum + value;
  }, 0);

  return total;
};

const foodColumns: any = [
  {
    title: "Tên món ăn",
    dataIndex: ["food", "foodName"],
    key: "foodName",
    width: 250,
    render: (_: string, record: MealFoodItem) => (
      <Text strong>{record.food.foodName}</Text>
    ),
  },
  {
    title: "Khối lượng",
    dataIndex: "weight",
    key: "weight",
    width: 100,
    render: (_: number, record: MealFoodItem) => (
      <Text type="secondary">
        {Number(calculateIngredientSum(record, "gram") || 0)?.toLocaleString(
          "vi-VN"
        )}{" "}
        g
      </Text>
    ),
    align: "right" as const,
  },
  {
    title: "Calo (kcal)",
    dataIndex: "calo",
    key: "calo",
    width: 100,
    render: (_: number, record: MealFoodItem) => {
      return (
        <Text style={{ color: "#faad14" }}>
          {Number(
            calculateIngredientSum(record, "calories") || 0
          )?.toLocaleString("vi-VN", {
            maximumFractionDigits: 1,
          })}
        </Text>
      );
    },
    align: "right" as const,
  },
  {
    title: "Protein (g)",
    dataIndex: "protein",
    key: "protein",
    width: 100,
    render: (_: number, record: MealFoodItem) => {
      return (
        <Text>
          {Number(
            calculateIngredientSum(record, "protein") || 0
          )?.toLocaleString("vi-VN", {
            maximumFractionDigits: 1,
          })}
        </Text>
      );
    },
    align: "right" as const,
  },
  {
    title: "Lipid (g)",
    dataIndex: "lipid",
    key: "lipid",
    width: 100,
    render: (_: number, record: MealFoodItem) => {
      return (
        <Text>
          {Number(calculateIngredientSum(record, "lipid") || 0)?.toLocaleString(
            "vi-VN",
            {
              maximumFractionDigits: 1,
            }
          )}
        </Text>
      );
    },
    align: "right" as const,
  },
  {
    title: "Carb (g)",
    dataIndex: "carb",
    key: "carb",
    width: 100,
    render: (_: number, record: MealFoodItem) => {
      return (
        <Text>
          {Number(calculateIngredientSum(record, "card") || 0)?.toLocaleString(
            "vi-VN",
            {
              maximumFractionDigits: 1,
            }
          )}
        </Text>
      );
    },
    align: "right" as const,
  },
];

const MenuDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menuDetail, setMenuDetail] = useState<MenuDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMenuDetail = useCallback(async (menuId: string) => {
    setLoading(true);
    try {
      const response: MenuDetail = await menuApis.getMenuById(menuId || "");
      setMenuDetail(response);
    } catch (error) {
      toast.error("Tải chi tiết thực đơn thất bại.");
      setMenuDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchMenuDetail(id);
    }
  }, [id, fetchMenuDetail]);

  const renderMealDetail = (meal: MealDetail) => {
    if (!meal?.foods || meal.foods.length === 0) {
      return null;
    }

    return (
      <Card
        size="small"
        title={
          <Text strong style={{ color: "#1890ff" }}>
            {meal.mealType?.toUpperCase()}
          </Text>
        }
        style={{ marginBottom: 16, borderLeft: "4px solid #1890ff" }}
        key={meal.mealType}
      >
        <Table
          columns={foodColumns}
          dataSource={meal.foods}
          rowKey={(item, index) =>
            `${meal.mealType}-${item.food?._id}-${index}`
          }
          pagination={false}
          size="middle"
          bordered
          footer={() => (
            <Row justify="space-between" style={{ padding: "4px 0" }}>
              <Col>
                <Text strong style={{ fontSize: "15px" }}>
                  TỔNG BỮA {meal.mealType?.toUpperCase()}:
                </Text>
              </Col>
              <Col>
                <Space size="large">
                  <Text>
                    Calo:{" "}
                    <Text strong style={{ color: "#faad14" }}>
                      {Number(meal?.totalCalo || 0)?.toLocaleString("vi-VN")}{" "}
                      kcal
                    </Text>
                  </Text>
                  <Text>
                    Protein:{" "}
                    <Text strong>
                      {Number(meal?.totalProtein || 0)?.toLocaleString("vi-VN")}{" "}
                      g
                    </Text>
                  </Text>
                  <Text>
                    Lipid:{" "}
                    <Text strong>
                      {Number(meal?.totalLipid || 0)?.toLocaleString("vi-VN")} g
                    </Text>
                  </Text>
                  <Text>
                    Carb:{" "}
                    <Text strong>
                      {Number(meal?.totalCarb || 0)?.toLocaleString("vi-VN")} g
                    </Text>
                  </Text>
                </Space>
              </Col>
            </Row>
          )}
        />
      </Card>
    );
  };

  const renderDayMenuDetail = (dayMenu: DayDetail) => {
    const validMeals = dayMenu.meals?.filter((meal) => meal.foods?.length > 0);

    if (!validMeals || validMeals.length === 0) {
      return null;
    }

    const headerTitle = `${dayjs(dayMenu.date).format("dddd")} - ${dayjs(
      dayMenu.date
    ).format("DD/MM/YYYY")}`;

    const totalDayCalo =
      dayMenu?.meals?.reduce((sum, meal) => sum + (meal.totalCalo || 0), 0) ||
      0;

    return (
      <Panel
        header={
          <Title level={5} style={{ margin: 0, color: "#333" }}>
            {headerTitle}
          </Title>
        }
        key={dayMenu.date}
        extra={
          <Space>
            <Text strong>Tổng Calo Ngày:</Text>
            <Tag
              color="success"
              style={{ fontSize: "13px", padding: "4px 8px" }}
            >
              {Number(totalDayCalo)?.toLocaleString("vi-VN")} kcal
            </Tag>
          </Space>
        }
        style={{ backgroundColor: "#fafafa", borderLeft: "3px solid #52c41a" }}
      >
        <Row gutter={[16, 16]}>
          {validMeals.map((meal) => (
            <Col span={24} key={meal.mealType}>
              {renderMealDetail(meal)}
            </Col>
          ))}
        </Row>
      </Panel>
    );
  };

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
        <Spin tip="Đang tải chi tiết thực đơn..." size="large" />
      </div>
    );
  }

  if (!menuDetail) {
    return (
      <div style={{ padding: "24px" }}>
        <Title level={3}>
          <ArrowLeftOutlined
            onClick={() => navigate(`${constants.APP_PREFIX}/menus`)}
            style={{ marginRight: 16, cursor: "pointer" }}
          />
          Không tìm thấy Thực Đơn
        </Title>
        <Card>
          <Text>Thực đơn với ID: {id} không tồn tại hoặc đã bị xóa.</Text>
        </Card>
      </div>
    );
  }

  const ageGroupLabel =
    AGE_GROUPS.find((g) => g.value === menuDetail.ageGroup)?.label ||
    menuDetail.ageGroup;

  const validDays = menuDetail.days?.filter(
    (day) => day.meals?.filter((meal) => meal.foods?.length > 0).length > 0
  );

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
          onClick={() => navigate(`${constants.APP_PREFIX}/menus`)}
          style={{ marginRight: 16, cursor: "pointer", color: "#0050b3" }}
        />
        Chi Tiết Thực Đơn Tuần
      </Title>

      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="large">
                <CalendarOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                <Text strong style={{ fontSize: 16 }}>
                  Tuần: {dayjs(menuDetail.weekStart).format("DD/MM/YYYY")} -{" "}
                  {dayjs(menuDetail.weekEnd).format("DD/MM/YYYY")}
                </Text>
                <Tag color="blue" style={{ fontSize: 13, padding: "4px 8px" }}>
                  Nhóm tuổi: {ageGroupLabel}
                </Tag>
              </Space>
            </Col>
            <Col>
              <Button
                icon={<EditOutlined />}
                type="primary"
                onClick={() =>
                  navigate(`/menu-management/edit/${menuDetail._id}`)
                }
              >
                Sửa Thực Đơn
              </Button>
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
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Title level={5} style={{ marginTop: 0, color: "#333" }}>
              Tổng Dinh Dưỡng Cả Tuần:
            </Title>
            <Space size="large" style={{ fontWeight: "bold" }}>
              <Text>
                CALO:{" "}
                <Text strong style={{ color: "#faad14", fontSize: "15px" }}>
                  {Number(menuDetail?.totalCalo || 0)?.toLocaleString("vi-VN")}
                </Text>{" "}
                kcal
              </Text>
              <Text>
                PROTEIN:{" "}
                <Text strong>
                  {Number(menuDetail?.totalProtein || 0)?.toLocaleString(
                    "vi-VN"
                  )}{" "}
                  g
                </Text>
              </Text>
              <Text>
                LIPID:{" "}
                <Text strong>
                  {Number(menuDetail?.totalLipid || 0)?.toLocaleString("vi-VN")}{" "}
                  g
                </Text>
              </Text>
              <Text>
                CARB:{" "}
                <Text strong>
                  {Number(menuDetail?.totalCarb || 0)?.toLocaleString("vi-VN")}{" "}
                  g
                </Text>
              </Text>
            </Space>
          </Col>
          <Col
            span={24}
            style={{ borderTop: "1px solid #eee", paddingTop: 16 }}
          >
            <Space>
              <ReadOutlined style={{ color: "#595959" }} />
              <Text italic type="secondary">
                Ghi chú:{" "}
                <Text strong style={{ color: "#333" }}>
                  {menuDetail.notes || "Không có ghi chú"}
                </Text>
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <Title level={4} style={{ marginBottom: 15, color: "#333" }}>
        Chi Tiết Thực Đơn Theo Ngày
      </Title>
      {validDays && validDays.length > 0 ? (
        <Collapse
          accordion
          expandIconPosition="right"
          defaultActiveKey={validDays[0].date}
          style={{ borderRadius: 8 }}
        >
          {validDays.map(renderDayMenuDetail)}
        </Collapse>
      ) : (
        <Card style={{ borderRadius: 8, textAlign: "center" }}>
          <Text type="warning">
            Thực đơn tuần này chưa có món ăn nào được lên kế hoạch.
          </Text>
        </Card>
      )}
    </div>
  );
};

export default MenuDetailPage;
