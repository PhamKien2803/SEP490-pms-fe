import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  Empty,
  Select,
  Tag,
  Table,
  DatePicker,
  Alert,
  Descriptions,
} from "antd";
import {
  CalendarOutlined,
  ForkOutlined,
  ClockCircleOutlined,
  FireOutlined,
  UserOutlined,
  RestOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.locale("vi");
dayjs.extend(localizedFormat);

import { parentDashboardApis } from "../../../services/apiServices";
import {
  DayMenu,
  Ingredient,
  Meal,
  MenuParams,
  MenuResponse,
  Student,
} from "../../../types/parent";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

const { Title, Text } = Typography;
const { Option } = Select;

const getTodayDateDayjs = () => dayjs();

const formatDayDisplay = (dateString: string) => {
  const date = dayjs(dateString);
  return date.format("DD/MM/YYYY") + " (" + date.format("dddd") + ")";
};

interface NutritionSummaryProps {
  calo: number;
  protein: number;
  lipid: number;
  carb: number;
  isTotal?: boolean;
}
const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  calo,
  protein,
  lipid,
  carb,
  isTotal = false,
}) => (
  <Row gutter={[12, 12]} wrap={true} justify="start">
    <Col xs={12} md={6} style={{ minWidth: 150 }}>
      <Tag
        icon={<FireOutlined />}
        color={isTotal ? "#faad14" : "#ffc069"}
        style={{
          padding: "6px 10px",
          fontSize: 14,
          width: "100%",
          textAlign: "center",
        }}
      >
        Calo: {calo.toFixed(0)} kcal
      </Tag>
    </Col>
    <Col xs={12} md={6} style={{ minWidth: 150 }}>
      <Tag
        color={isTotal ? "#52c41a" : "#95de64"}
        style={{
          padding: "6px 10px",
          fontSize: 14,
          width: "100%",
          textAlign: "center",
        }}
      >
        Protein: {protein.toFixed(1)} g
      </Tag>
    </Col>
    <Col xs={12} md={6} style={{ minWidth: 150 }}>
      <Tag
        color={isTotal ? "#1890ff" : "#69c0ff"}
        style={{
          padding: "6px 10px",
          fontSize: 14,
          width: "100%",
          textAlign: "center",
        }}
      >
        Lipid: {lipid.toFixed(1)} g
      </Tag>
    </Col>
    <Col xs={12} md={6} style={{ minWidth: 150 }}>
      <Tag
        color={isTotal ? "#722ed1" : "#b37feb"}
        style={{
          padding: "6px 10px",
          fontSize: 14,
          width: "100%",
          textAlign: "center",
        }}
      >
        Carb: {carb.toFixed(1)} g
      </Tag>
    </Col>
  </Row>
);

const renderIngredientTable = (ingredients: Ingredient[]) => {
  const columns = [
    {
      title: "Nguyên liệu",
      dataIndex: "name",
      key: "name",
      width: 150,
      fixed: "left" as const,
    },
    {
      title: "Lượng (g/ml)",
      dataIndex: "gram",
      key: "gram",
      width: 100,
      render: (text: number, record: Ingredient) =>
        `${text.toFixed(0)} ${record.unit}`,
      align: "right" as const,
    },
    {
      title: "Calo (kcal)",
      dataIndex: "calories",
      key: "calories",
      width: 100,
      render: (text: number) => text.toFixed(0),
      align: "right" as const,
    },
  ];

  return (
    <div
      style={{
        marginTop: 10,
        padding: 8,
        backgroundColor: "#fffbe6",
        borderRadius: 4,
        overflowX: "auto",
      }}
    >
      <Text
        strong
        style={{ color: "#faad14", display: "block", marginBottom: 5 }}
      >
        <SolutionOutlined /> Chi tiết Nguyên liệu:
      </Text>
      <Table
        dataSource={ingredients.map((ing, index) => ({ ...ing, key: index }))}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 400 }}
      />
    </div>
  );
};

const Menu: React.FC = () => {
  const user = useCurrentUser();
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [listChild, setListChild] = useState<Student[]>([]);

  const [selectedDateDayjs, setSelectedDateDayjs] = useState<Dayjs | null>(
    getTodayDateDayjs
  );
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const selectedDateString = selectedDateDayjs
    ? selectedDateDayjs.format("YYYY-MM-DD")
    : "";

  const params: MenuParams = useMemo(
    () => ({
      studentId: selectedStudentId || "",
      date: selectedDateString,
    }),
    [selectedStudentId, selectedDateString]
  );

  useEffect(() => {
    getDataListChild();
  }, [user?.parent]);

  const getDataListChild = async () => {
    if (!user?.parent) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await parentDashboardApis.getListChild(user.parent);
      const students = response?.students || [];
      setListChild(students);

      if (students.length > 0) {
        setSelectedStudentId(students[0]._id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách con:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      if (!params.studentId || !params.date) {
        setMenuData(null);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setMenuData(null);

      try {
        const data: MenuResponse = await parentDashboardApis.getDataMenu(
          params
        );
        setMenuData(data);
      } catch (error) {
        setIsError(true);
        console.error("Lỗi khi fetch menu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [params.studentId, params.date]);

  const currentDayMenu: DayMenu | undefined = menuData?.days?.[0];
  const selectedStudent = listChild.find(
    (g) => g._id === selectedStudentId
  )?.fullName;

  const renderMealCard = (meal: Meal) => {
    return (
      <Card
        key={meal.mealType}
        title={
          <Text
            strong
            style={{
              color: "#08979c",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
            }}
          >
            {" "}
            <ClockCircleOutlined style={{ marginRight: 8, color: "#faad14" }} />
            Bữa {meal?.mealType}
          </Text>
        }
        size="default"
        style={{
          height: "100%",
          borderLeft: "4px solid #08979c",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          marginBottom: 20,
        }}
        headStyle={{ padding: "16px 20px", backgroundColor: "#e6fffa" }}
        bodyStyle={{ padding: "20px" }}
      >
        <Text
          strong
          style={{ display: "block", marginBottom: 8, fontSize: 15 }}
        >
          Tóm tắt Dinh dưỡng Bữa ăn:
        </Text>
        <NutritionSummary
          calo={meal.totalCalo}
          protein={meal.totalProtein}
          lipid={meal.totalLipid}
          carb={meal.totalCarb}
        />
        <Divider style={{ margin: "20px 0 12px 0" }} />
        <Text
          strong
          style={{ display: "block", marginBottom: 12, fontSize: 15 }}
        >
          <ForkOutlined style={{ marginRight: 5 }} /> Danh sách Món ăn:
        </Text>
        {meal.foods.length > 0 ? (
          meal.foods.map((foodWrapper, index) => (
            <Card
              key={foodWrapper.food._id || index}
              size="small"
              type="inner"
              title={
                <Text strong style={{ color: "#2f54eb", fontSize: 16 }}>
                  <ForkOutlined style={{ marginRight: 5 }} />
                  {foodWrapper.food.foodName}
                </Text>
              }
              style={{ marginBottom: 15, borderLeft: "3px solid #adc6ff" }}
              extra={
                <Tag color="volcano" style={{ fontSize: 13 }}>
                  {foodWrapper.food.totalCalories.toFixed(0)} kcal
                </Tag>
              }
            >
              {renderIngredientTable(foodWrapper.food.ingredients)}
            </Card>
          ))
        ) : (
          <Text italic type="secondary" style={{ fontSize: 14 }}>
            <RestOutlined style={{ marginRight: 5 }} /> Không có món ăn chính
            thức.
          </Text>
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: "24px", margin: "0 auto" }}>
      <Title
        level={2}
        style={{
          color: "#1890ff",
          borderBottom: "2px solid #1890ff",
          paddingBottom: 8,
          fontSize: 32,
        }}
      >
        <ForkOutlined style={{ marginRight: 10 }} />
        Menu Dinh Dưỡng Hàng Ngày
      </Title>
      <Divider style={{ margin: "20px 0" }} />

      <Card
        bordered={false}
        title={
          <Text strong style={{ color: "#1890ff", fontSize: 18 }}>
            <CalendarOutlined /> Chọn Ngày và Nhóm tuổi
          </Text>
        }
        style={{
          marginBottom: 28,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#F0F8FF",
        }}
      >
        <Row gutter={24} align="middle">
          <Col xs={24} md={12}>
            <Text
              strong
              style={{
                display: "block",
                marginBottom: 6,
                color: "#595959",
                fontSize: 15,
              }}
            >
              Chọn Nhóm tuổi/Lớp học:
            </Text>
            <Select
              value={selectedStudentId}
              style={{ width: "100%" }}
              onChange={(value) => setSelectedStudentId(value)}
              placeholder="Chọn con của bạn"
              size="large"
            >
              {listChild.map((student) => (
                <Option key={student._id} value={student._id}>
                  {student?.fullName} ({student?.studentCode})
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <Text
              strong
              style={{
                display: "block",
                marginBottom: 6,
                color: "#595959",
                fontSize: 15,
              }}
            >
              Chọn Ngày xem Menu:
            </Text>
            <DatePicker
              value={selectedDateDayjs}
              onChange={(date) => setSelectedDateDayjs(date)}
              style={{ width: "100%" }}
              size="large"
              format="DD/MM/YYYY"
              disabled={isLoading}
            />
          </Col>
        </Row>
      </Card>

      <Spin spinning={isLoading} tip="Đang tải Menu dinh dưỡng...">
        {isError && !currentDayMenu && (
          <Alert
            message="Lỗi tải dữ liệu Menu"
            description="Không thể tải thông tin Menu. Vui lòng kiểm tra lại kết nối hoặc thử lại."
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {!currentDayMenu && !isError && !isLoading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Empty
              description={
                <Title level={4} style={{ fontSize: 22 }}>
                  Chưa có Menu chính thức cho {selectedStudent} vào ngày{" "}
                  {selectedDateDayjs
                    ? selectedDateDayjs.format("DD/MM/YYYY")
                    : "đã chọn"}
                  .
                </Title>
              }
            />
          </div>
        )}

        {currentDayMenu && (
          <>
            <Card
              title={
                <Title
                  level={4}
                  style={{ margin: 0, color: "#08979c", fontSize: 24 }}
                >
                  <ForkOutlined /> Tóm Tắt Dinh Dưỡng Ngày
                </Title>
              }
              bordered={false}
              style={{
                marginBottom: 28,
                backgroundColor: "#e6f7ff",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Descriptions
                column={{ xs: 1, sm: 2, md: 3 }}
                bordered
                size="middle"
              >
                <Descriptions.Item
                  label={
                    <Text strong style={{ fontSize: 15 }}>
                      <CalendarOutlined /> Ngày
                    </Text>
                  }
                >
                  <Text strong style={{ color: "#fa8c16", fontSize: 15 }}>
                    {formatDayDisplay(currentDayMenu.date)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong style={{ fontSize: 15 }}>
                      <UserOutlined /> Con
                    </Text>
                  }
                >
                  <Text style={{ fontSize: 15 }}>{selectedStudent}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong style={{ fontSize: 15 }}>
                      <FireOutlined /> Tổng Calo Ngày
                    </Text>
                  }
                >
                  <Tag
                    color="volcano"
                    style={{ fontSize: 15, padding: "4px 8px" }}
                  >
                    {currentDayMenu.totalCalo.toFixed(0)} kcal
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong style={{ fontSize: 15 }}>
                      <SolutionOutlined /> Tổng Protein
                    </Text>
                  }
                >
                  <Tag
                    color="success"
                    style={{ fontSize: 15, padding: "4px 8px" }}
                  >
                    {currentDayMenu.totalProtein.toFixed(1)} g
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong style={{ fontSize: 15 }}>
                      Tổng Lipid
                    </Text>
                  }
                >
                  <Tag
                    color="blue"
                    style={{ fontSize: 15, padding: "4px 8px" }}
                  >
                    {currentDayMenu.totalLipid.toFixed(1)} g
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong style={{ fontSize: 15 }}>
                      Tổng Carb
                    </Text>
                  }
                >
                  <Tag
                    color="purple"
                    style={{ fontSize: 15, padding: "4px 8px" }}
                  >
                    {currentDayMenu.totalCarb.toFixed(1)} g
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              {menuData?.notes && (
                <Alert
                  message={
                    <Text strong style={{ fontSize: 15 }}>
                      <ClockCircleOutlined /> Ghi chú chung về tuần/ngày
                    </Text>
                  }
                  description={
                    <Text style={{ fontSize: 14 }}>{menuData.notes}</Text>
                  }
                  type="info"
                  showIcon={false}
                  style={{ marginTop: 20, borderLeft: "4px solid #faad14" }}
                />
              )}
            </Card>

            <Title level={3} style={{ margin: "24px 0 18px 0", fontSize: 28 }}>
              <ClockCircleOutlined /> Chi Tiết Các Bữa Ăn Trong Ngày
            </Title>
            <Row gutter={[24, 24]}>
              {currentDayMenu.meals
                .sort((a, b) => a.mealType.localeCompare(b.mealType))
                .map((meal) => (
                  <Col xs={24} md={12} lg={12} key={meal.mealType}>
                    {renderMealCard(meal)}
                  </Col>
                ))}
            </Row>
          </>
        )}
      </Spin>
    </div>
  );
};

export default Menu;
