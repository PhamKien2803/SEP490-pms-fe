import React, { useState, useCallback, useEffect } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Form,
  Input,
  Select,
  Space,
  InputNumber,
  Tooltip,
  Alert,
  Divider,
  Flex,
  Spin,
} from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  CalculatorOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { constants } from "../../../constants";
import { foodApis } from "../../../services/apiServices";
import {
  CreateFoodParams,
  FoodRecord,
  IngredientParam,
  AICalculateResponse,
} from "../../../types/food-management";

const { Title } = Typography;
const { Option } = Select;

const AGE_GROUPS = [
  { value: "2", label: "1-3 tuổi" },
  { value: "3", label: "4-5 tuổi" },
];

const formatNutrient = (value: number | undefined) =>
  value !== undefined && value !== null
    ? Number(value)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "";

const CreateFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const [createdFood, setCreatedFood] = useState<FoodRecord | null>(null);

  const hasFoodId = !!createdFood?._id;
  const hasCalculatedCalories = createdFood && createdFood.totalCalories > 0;

  const updateTotalNutrients = useCallback(
    (food: FoodRecord) => {
      const totalCalories = food.ingredients.reduce(
        (sum, ing) => sum + (ing.calories || 0),
        0
      );
      const totalProtein = food.ingredients.reduce(
        (sum, ing) => sum + (ing.protein || 0),
        0
      );
      const totalLipid = food.ingredients.reduce(
        (sum, ing) => sum + (ing.lipid || 0),
        0
      );
      const totalCarb = food.ingredients.reduce(
        (sum, ing) => sum + (ing.carb || 0),
        0
      );

      form.setFieldsValue({
        ...food,
        totalCalories: totalCalories || 0,
        totalProtein: totalProtein,
        totalLipid: totalLipid,
        totalCarb: totalCarb,
        ingredients: food.ingredients.map((ing) => ({
          name: ing.name,
          gram: ing.gram,
          unit: ing.unit,
          calories: ing.calories || 0,
          protein: ing.protein || 0,
          lipid: ing.lipid || 0,
          carb: ing.carb || 0,
        })),
      });
    },
    [form]
  );

  useEffect(() => {
    if (createdFood) {
      updateTotalNutrients(createdFood);
    }
  }, [createdFood, updateTotalNutrients]);

  const handleCalculateAI = useCallback(async () => {
    const foodId = createdFood?._id;
    if (!foodId) {
      toast.error("Thiếu ID món ăn. Vui lòng Tạo món ăn trước.");
      return null;
    }

    setIsAILoading(true);
    try {
      const response: AICalculateResponse =
        await foodApis.calculateFoodNutrients(foodId);

      if (!response.ai_output || response.ai_output.length === 0) {
        throw new Error("API không trả về dữ liệu dinh dưỡng.");
      }

      const updatedFood: FoodRecord = response.ai_output[0];

      setCreatedFood(updatedFood);

      toast.success(response.message || `Tính Calo AI thành công!`);
      return updatedFood;
    } catch (error: any) {
      console.error("Lỗi Tính Calo AI:", error);
      const errorMessage =
        error ||
        "Tính Calo AI thất bại. Vui lòng kiểm tra API hoặc tên nguyên liệu.";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsAILoading(false);
    }
  }, [createdFood?._id]);

  const handleCreateFood = async (values: any) => {
    if (hasFoodId) {
      if (hasCalculatedCalories) {
        toast.warn(
          "Món ăn đã được tạo và tính Calo. Vui lòng nhấn 'Hoàn tất'."
        );
      } else {
        toast.warn("Món ăn đã được tạo. Vui lòng nhấn 'Tính Calo AI'.");
      }
      return;
    }

    setLoading(true);

    const cleanedIngredients: IngredientParam[] = values.ingredients
      .filter(
        (item: any) =>
          item.name &&
          item.name.trim() !== "" &&
          item.gram !== undefined &&
          item.gram !== null &&
          item.gram > 0 &&
          item.unit &&
          item.unit.trim() !== ""
      )
      .map((item: any) => ({
        name: item.name,
        gram: item.gram,
        unit: item.unit,
      })) as IngredientParam[];

    if (cleanedIngredients.length === 0) {
      toast.warn("Vui lòng thêm ít nhất một nguyên liệu hợp lệ.");
      setLoading(false);
      return;
    }

    const payload: CreateFoodParams = {
      foodName: values.foodName,
      ageGroup: values.ageGroup,
      totalCalories: 0,
      totalProtein: 0,
      totalLipid: 0,
      totalCarb: 0,
      ingredients: cleanedIngredients,
      createdBy: "Current_User",
      active: true,
    };

    try {
      const responseFood: FoodRecord = await foodApis.createFood(payload);

      setCreatedFood(responseFood);

      toast.success(
        `Tạo món ăn "${responseFood.foodName}" thành công! Bây giờ hãy Tính Calo AI.`
      );
    } catch (error: any) {
      console.error("Lỗi Tạo món ăn:", error);
      const errorMessage =
        error || "Tạo món ăn thất bại. Vui lòng kiểm tra dữ liệu và thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate(`${constants.APP_PREFIX}/foods`);
  };

  const NutrientDisplay = ({
    label,
    name,
    unit = "g",
  }: {
    label: string;
    name: string;
    unit?: string;
  }) => (
    <Form.Item label={label} name={name} style={{ marginBottom: 8 }}>
      <InputNumber
        disabled
        placeholder="Chưa tính"
        style={{
          width: "100%",
          color: name === "totalCalories" ? "#cf1322" : "#096dd9",
          fontWeight: "bold",
        }}
        formatter={(value) =>
          value ? `${formatNutrient(Number(value))} ${unit}` : "Chưa tính"
        }
        parser={(value) =>
          value ? value.replace(/[^\d.,-]/g, "").replace(/,/g, "") : ""
        }
      />
    </Form.Item>
  );

  if (loading || isAILoading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ minHeight: "calc(100vh - 150px)" }}
      >
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <div style={{ padding: "16px 24px" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateFood}
        initialValues={{
          ageGroup: AGE_GROUPS[0].label,
          active: true,
          totalCalories: 0,
          totalProtein: 0,
          totalLipid: 0,
          totalCarb: 0,
          ingredients: [
            {
              name: "",
              gram: undefined,
              unit: "g",
              calories: 0,
              protein: 0,
              lipid: 0,
              carb: 0,
            },
          ],
        }}
      >
        <Card
          title={
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 20 }}
            >
              <Col>
                <Title level={3} style={{ margin: 0, paddingTop: "15px" }}>
                  <ArrowLeftOutlined
                    onClick={() => navigate(`${constants.APP_PREFIX}/foods`)}
                    style={{ marginRight: 16, cursor: "pointer" }}
                  />
                  Tạo món ăn mới
                </Title>
              </Col>
            </Row>
          }
          bordered={false}
          style={{
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            marginBottom: 24,
            borderRadius: 8,
          }}
          actions={[
            <Space
              style={{
                width: "100%",
                justifyContent: "space-between",
                padding: "0 24px",
              }}
            >
              <Space>
                {hasFoodId && !hasCalculatedCalories && (
                  <Button
                    icon={<CalculatorOutlined />}
                    type="default"
                    onClick={handleCalculateAI}
                    loading={isAILoading}
                    disabled={loading}
                  >
                    {isAILoading ? "Đang tính..." : "Tính Calo AI"}
                  </Button>
                )}

                {hasFoodId && hasCalculatedCalories && (
                  <Button
                    icon={<CheckCircleOutlined />}
                    type="primary"
                    onClick={handleComplete}
                    disabled={loading || isAILoading}
                  >
                    Hoàn tất
                  </Button>
                )}

                {!hasFoodId && (
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={loading}
                    disabled={isAILoading}
                  >
                    Tạo Món ăn
                  </Button>
                )}
              </Space>
            </Space>,
          ]}
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Title
                level={4}
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  paddingBottom: 8,
                  marginBottom: 16,
                }}
              >
                Thông tin cơ bản
              </Title>
              <Form.Item
                label="Tên Món Ăn"
                name="foodName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên món ăn" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: Canh Bí Đỏ Trứng"
                  disabled={isAILoading || hasFoodId}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <UsergroupAddOutlined /> Nhóm Tuổi
                  </Space>
                }
                name="ageGroup"
                rules={[{ required: true, message: "Vui lòng chọn nhóm tuổi" }]}
              >
                <Select
                  placeholder="Chọn nhóm tuổi"
                  disabled={isAILoading || hasFoodId}
                >
                  {AGE_GROUPS.map((group) => (
                    <Option key={group.value} value={group.label}>
                      {group.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Title level={5} style={{ marginTop: 20 }}>
                <CalculatorOutlined style={{ marginRight: 8 }} /> Giá trị Dinh
                dưỡng tổng
              </Title>

              <NutrientDisplay
                label="Tổng Calo (kcal)"
                name="totalCalories"
                unit="kcal"
              />

              <Row gutter={16}>
                <Col span={8}>
                  <NutrientDisplay label="Protein (g)" name="totalProtein" />
                </Col>
                <Col span={8}>
                  <NutrientDisplay label="Lipid (g)" name="totalLipid" />
                </Col>
                <Col span={8}>
                  <NutrientDisplay label="Carb (g)" name="totalCarb" />
                </Col>
              </Row>

              {!hasFoodId && (
                <Alert
                  message="Lưu ý"
                  description="Vui lòng nhấn 'Tạo Món ăn' trước, sau đó mới có thể 'Tính Calo AI'."
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Col>

            <Col xs={24} md={16}>
              <Title
                level={4}
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  paddingBottom: 8,
                  marginBottom: 16,
                }}
              >
                Chi tiết Nguyên liệu
              </Title>
              <Form.List name="ingredients">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Card
                        key={field.key}
                        size="small"
                        style={{
                          marginBottom: 16,
                          borderLeft: `5px solid ${
                            hasCalculatedCalories ? "#1890ff" : "#d9d9d9"
                          }`,
                        }}
                        extra={
                          <Tooltip title="Xóa nguyên liệu">
                            <MinusCircleOutlined
                              style={{ color: "#ff4d4f" }}
                              onClick={() => remove(field.name)}
                              disabled={Boolean(
                                fields.length === 1 ||
                                  isAILoading ||
                                  hasCalculatedCalories
                              )}
                            />
                          </Tooltip>
                        }
                      >
                        <Row gutter={16} align="middle">
                          <Col span={10}>
                            <Form.Item
                              {...field}
                              label="Tên nguyên liệu"
                              name={[field.name, "name"]}
                              rules={[{ required: true, message: "Tên" }]}
                            >
                              <Input placeholder="Tên nguyên liệu" />
                            </Form.Item>
                          </Col>
                          <Col span={7}>
                            <Form.Item
                              {...field}
                              label="Khối lượng (KL)"
                              name={[field.name, "gram"]}
                              rules={[
                                { required: true, message: "KL?" },
                                { type: "number", min: 1, message: "KL > 0" },
                              ]}
                              getValueFromEvent={(e) =>
                                typeof e === "number"
                                  ? e
                                  : parseFloat(e.target.value)
                              }
                            >
                              <InputNumber
                                min={1}
                                placeholder="KL"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={7}>
                            <Form.Item
                              {...field}
                              label="Đơn vị (ĐV)"
                              name={[field.name, "unit"]}
                              initialValue="g"
                              rules={[{ required: true, message: "ĐV?" }]}
                            >
                              <Select placeholder="Đơn vị">
                                <Option value="g">gram (g)</Option>
                                <Option value="ml">ml (ml)</Option>
                                <Option value="cái">cái</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider
                          orientation="left"
                          style={{
                            margin: "8px 0",
                            borderColor: "#f0f0f0",
                            color: "#8c8c8c",
                          }}
                        >
                          Dinh dưỡng (Từng phần)
                        </Divider>
                        <Row gutter={16}>
                          <Col span={6}>
                            <Form.Item
                              {...field}
                              label={
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    color: "#cf1322",
                                  }}
                                >
                                  Calo (kcal)
                                </span>
                              }
                              name={[field.name, "calories"]}
                            >
                              <InputNumber
                                readOnly
                                placeholder="0.00"
                                style={{
                                  width: "100%",
                                  color: "#cf1322",
                                  fontWeight: "bold",
                                }}
                                formatter={(value) =>
                                  value
                                    ? `${formatNutrient(Number(value))}`
                                    : "0.00"
                                }
                                parser={(value) =>
                                  value
                                    ? value
                                        .replace(/[^\d.,-]/g, "")
                                        .replace(/,/g, "")
                                    : ""
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...field}
                              label="Protein (g)"
                              name={[field.name, "protein"]}
                            >
                              <InputNumber
                                placeholder="0.00"
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                  value
                                    ? `${formatNutrient(Number(value))}`
                                    : "0.00"
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...field}
                              label="Lipid (g)"
                              name={[field.name, "lipid"]}
                            >
                              <InputNumber
                                readOnly
                                placeholder="0.00"
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                  value
                                    ? `${formatNutrient(Number(value))}`
                                    : "0.00"
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...field}
                              label="Carb (g)"
                              name={[field.name, "carb"]}
                            >
                              <InputNumber
                                placeholder="0.00"
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                  value
                                    ? `${formatNutrient(Number(value))}`
                                    : "0.00"
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() =>
                          add({
                            name: "",
                            gram: undefined,
                            unit: "g",
                            calories: 0,
                            protein: 0,
                            lipid: 0,
                            carb: 0,
                          })
                        }
                        block
                        icon={<PlusOutlined />}
                        disabled={Boolean(isAILoading || hasCalculatedCalories)}
                      >
                        Thêm Nguyên liệu
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default CreateFoodPage;
