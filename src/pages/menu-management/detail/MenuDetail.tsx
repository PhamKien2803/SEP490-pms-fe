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
  AppstoreOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { MenuRecord } from "../../../types/menu-management";
import { constants } from "../../../constants";
import { menuApis } from "../../../services/apiServices";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AGE_GROUPS = [
  { value: "1", label: "1 - 2 Tuổi" },
  { value: "2", label: "2 - 3 Tuổi" },
];

const MenuDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menuDetail, setMenuDetail] = useState<MenuRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMenuDetail = useCallback(async (menuId: string) => {
    setLoading(true);
    try {
      const response = await menuApis.getMenuById(menuId || "");
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

  const foodColumns: any = [
    { title: "Tên món ăn", dataIndex: "name", key: "name", width: 180 },
    {
      title: "KL (g)",
      dataIndex: "weight",
      key: "weight",
      width: 80,
      align: "center",
      render: (text: number) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Calo (kcal)",
      dataIndex: "calo",
      key: "calo",
      width: 90,
      align: "right",
    },
    {
      title: "Protein (g)",
      dataIndex: "protein",
      key: "protein",
      width: 80,
      align: "right",
    },
    {
      title: "Lipid (g)",
      dataIndex: "lipid",
      key: "lipid",
      width: 80,
      align: "right",
    },
    {
      title: "Carb (g)",
      dataIndex: "carb",
      key: "carb",
      width: 80,
      align: "right",
    },
  ];

  const renderDayMenuDetail = (dayMenu: MenuRecord["days"][0]) => {
    const headerTitle = `${dayjs(dayMenu.date).format("dddd")} - ${dayjs(
      dayMenu.date
    ).format("DD/MM/YYYY")}`;

    const renderMealDetail = (meal: MenuRecord["days"][0]["meals"][0]) => (
      <Card
        size="small"
        title={<Text strong>{meal.mealType.toUpperCase()}</Text>}
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={foodColumns}
          dataSource={meal.foods}
          rowKey={(item, index) => `${meal.mealType}-${item.name}-${index}`}
          pagination={false}
          size="small"
          footer={() => (
            <Row justify="space-between" style={{ padding: "4px 0" }}>
              <Col>
                <Text strong>TỔNG BỮA:</Text>
              </Col>
              <Col>
                <Space size="large">
                  <Text>
                    Calo:{" "}
                    <Text strong type="danger">
                      {meal.totalCalo}
                    </Text>
                  </Text>
                  <Text>
                    Protein: <Text strong>{meal.totalProtein}</Text>
                  </Text>
                  <Text>
                    Lipid: <Text strong>{meal.totalLipid}</Text>
                  </Text>
                  <Text>
                    Carb: <Text strong>{meal.totalCarb}</Text>
                  </Text>
                </Space>
              </Col>
            </Row>
          )}
        />
      </Card>
    );

    return (
      <Panel
        header={
          <Title level={5} style={{ margin: 0 }}>
            {headerTitle}
          </Title>
        }
        key={dayMenu.date}
        extra={
          <Text>
            Tổng Calo Ngày:{" "}
            <Text strong type="success">
              {dayMenu.totalCalo}
            </Text>{" "}
            kcal
          </Text>
        }
      >
        <Row gutter={[16, 16]}>
          {dayMenu.meals.map((meal, index) => (
            <Col span={24} key={index}>
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
          height: "100%",
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

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>
        <ArrowLeftOutlined
          onClick={() => navigate(`${constants.APP_PREFIX}/menus`)}
          style={{ marginRight: 16, cursor: "pointer" }}
        />
        Chi Tiết Thực Đơn Tuần
      </Title>
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="large">
                <AppstoreOutlined />
                <Text strong>
                  Tuần: {dayjs(menuDetail.weekStart).format("DD/MM/YYYY")} -{" "}
                  {dayjs(menuDetail.weekEnd).format("DD/MM/YYYY")}
                </Text>
                <Tag color="processing">Nhóm tuổi: {ageGroupLabel}</Tag>
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
        style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", marginBottom: 20 }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Text italic>
              Ghi chú:{" "}
              <Text strong>{menuDetail.notes || "Không có ghi chú"}</Text>
            </Text>
          </Col>
          <Col span={24}>
            <Space size="large" style={{ fontWeight: "bold" }}>
              <Text>
                TỔNG CALO TUẦN:{" "}
                <Text strong type="danger">
                  {menuDetail.totalCalo}
                </Text>{" "}
                kcal
              </Text>
              <Text>
                Protein: <Text strong>{menuDetail.totalProtein}</Text> g
              </Text>
              <Text>
                Lipid: <Text strong>{menuDetail.totalLipid}</Text> g
              </Text>
              <Text>
                Carb: <Text strong>{menuDetail.totalCarb}</Text> g
              </Text>
            </Space>
          </Col>
        </Row>

        <Title level={4}>Thực Đơn Chi Tiết Từng Ngày</Title>
        <Collapse accordion expandIconPosition="right" defaultActiveKey={["0"]}>
          {menuDetail.days.map(renderDayMenuDetail)}
        </Collapse>
      </Card>
    </div>
  );
};

export default MenuDetailPage;
