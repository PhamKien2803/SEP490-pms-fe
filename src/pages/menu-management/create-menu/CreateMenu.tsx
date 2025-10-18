import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tabs,
  InputNumber,
  Tooltip,
  Spin,
} from "antd";
import {
  SaveOutlined,
  RollbackOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  FireOutlined,
  UserOutlined,
  ForkOutlined,
  CarOutlined,
  TagOutlined,
  BulbOutlined,
  FormOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import "dayjs/locale/vi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { constants } from "../../../constants";
import { menuApis } from "../../../services/apiServices";
import {
  CreateMenuParams,
  FoodRecord,
  ListFoodParams,
  DayMenuCreate,
} from "../../../types/menu-management";

dayjs.extend(weekday);
dayjs.locale("vi");

const { Title } = Typography;
const { Option } = Select;

const capitalizeFirstLetter = (string: string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const AGE_GROUPS = [
  { value: "1", label: "Dưới 1 tuổi" },
  { value: "2", label: "1-3 tuổi" },
  { value: "3", label: "4-5 tuổi" },
];

const MEAL_TYPES = [
  { value: "sáng", label: "Bữa Sáng" },
  { value: "trưa", label: "Bữa Trưa" },
  { value: "xế", label: "Bữa Xế" },
];

const getDayName = (dayjsDate: Dayjs) => {
  return capitalizeFirstLetter(dayjsDate.format("dddd"));
};

interface MealEditorProps {
  dayIndex: number;
  dayjsDate: Dayjs;
  form: any;
  currentAgeGroupValue: string;
  currentAgeGroupLabel: string;
}

const MealEditor: React.FC<MealEditorProps> = ({
  dayIndex,
  dayjsDate,
  form,
  currentAgeGroupValue,
  currentAgeGroupLabel,
}) => {
  const mealFieldsName = ["days", dayIndex, "meals"];
  const [foodOptions, setFoodOptions] = useState<FoodRecord[]>([]);
  const [foodLoading, setFoodLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchFoodList = useCallback(
    async (search: string, ageGroupLabel: string) => {
      if (!ageGroupLabel) {
        setFoodOptions([]);
        return;
      }

      setFoodLoading(true);
      try {
        const params: ListFoodParams = {
          page: 1,
          limit: 20,
          ageGroup: ageGroupLabel,
        };
        if (search) {
          params.foodName = search;
        }

        const response = await menuApis.getListFood(params);
        setFoodOptions(response.data);
      } catch (error) {
        toast.error("Lỗi tải món ăn. Vui lòng thử lại.");
        setFoodOptions([]);
      } finally {
        setFoodLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchFoodList(searchText, currentAgeGroupLabel);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, currentAgeGroupLabel, fetchFoodList]);

  const handleFoodSelect = (
    foodId: string | undefined,
    foodFieldIndex: number,
    mealFieldIndex: number
  ) => {
    const selectedFood = foodOptions.find((food) => food._id === foodId);

    if (selectedFood) {
      const nutrientSums = selectedFood.ingredients.reduce(
        (acc, item) => {
          acc.weight += item.gram || 0;
          acc.calo += item.calories || 0;
          acc.protein += item.protein || 0;
          acc.lipid += item.lipid || 0;
          acc.carb += item.carb || 0;
          return acc;
        },
        { weight: 0, calo: 0, protein: 0, lipid: 0, carb: 0 }
      );

      const safeValue = (val: number) => Math.max(0, val);

      form.setFieldsValue({
        days: {
          [dayIndex]: {
            meals: {
              [mealFieldIndex]: {
                foods: {
                  [foodFieldIndex]: {
                    name: selectedFood.foodName,
                    weight: safeValue(nutrientSums.weight),
                    calo: safeValue(nutrientSums.calo),
                    protein: safeValue(nutrientSums.protein),
                    lipid: safeValue(nutrientSums.lipid),
                    carb: safeValue(nutrientSums.carb),
                  },
                },
              },
            },
          },
        },
      });
    } else {
      // Clear fields if no food is selected
      form.setFieldsValue({
        days: {
          [dayIndex]: {
            meals: {
              [mealFieldIndex]: {
                foods: {
                  [foodFieldIndex]: {
                    name: "",
                    weight: undefined,
                    calo: undefined,
                    protein: undefined,
                    lipid: undefined,
                    carb: undefined,
                  },
                },
              },
            },
          },
        },
      });
    }
  };

  const NutrientDisplay = ({
    name,
    unit,
    color,
    foodField,
    label,
    readOnly = true,
    span = 3,
  }: {
    name: string;
    icon: React.ReactNode;
    unit: string;
    color: string;
    foodField: any;
    label: string;
    readOnly?: boolean;
    span?: number;
  }) => (
    <Col span={span}>
      <Tooltip title={label}>
        <Form.Item
          key={`nutrient-item-${foodField.fieldKey as number}-${name}`}
          name={[foodField.name, name]}
          fieldKey={[foodField.fieldKey as number, name]}
          style={{ marginBottom: 0 }} // Ngăn nhảy dòng
          help={false} // Ngăn AntD dành không gian cho thông báo lỗi
          validateStatus={undefined} // Đảm bảo không hiển thị trạng thái lỗi
        >
          <InputNumber
            style={{
              width: "100%",
              color: readOnly ? color : "inherit",
              padding: readOnly ? "4px 7px" : undefined,
            }}
            readOnly={readOnly}
            controls={false}
            placeholder={readOnly ? "0" : "Nhập"}
            addonAfter={unit}
            // FORMATTER: Giới hạn 2 chữ số thập phân
            formatter={(value) => (value ? Number(value).toFixed(2) : "")}
            parser={(value) => (value ? Number(value.replace(/,/g, "")) : NaN)}
          />
        </Form.Item>
      </Tooltip>
      <Form.Item name={[foodField.name, name]} hidden initialValue={undefined}>
        <Input type="hidden" />
      </Form.Item>
    </Col>
  );

  const NutrientHeader = ({
    label,
    icon,
    color,
    unit,
    span = 3,
  }: {
    label: string;
    icon: React.ReactNode;
    color: string;
    unit: string;
    span?: number;
  }) => (
    <Col
      span={span}
      style={{ textAlign: "center", fontWeight: 600, color, fontSize: 13 }}
    >
      {icon} {label} ({unit})
    </Col>
  );

  return (
    <Card
      size="small"
      title={
        <Title level={5}>
          {getDayName(dayjsDate)} - {dayjsDate.format("DD/MM/YYYY")}
        </Title>
      }
      bodyStyle={{ padding: "12px 0 0 0" }}
    >
      <Form.Item
        name={["days", dayIndex, "date"]}
        hidden
        initialValue={dayjsDate.toISOString()}
      >
        <Input type="hidden" />
      </Form.Item>

      <Form.List name={mealFieldsName}>
        {(fields) => (
          <Space direction="vertical" style={{ width: "100%" }}>
            {fields.map((mealField) => {
              const mealIndex = mealField.name;
              const mealType = MEAL_TYPES[mealIndex]?.label || "Bữa ăn";

              const foodFieldsName = [mealField.name, "foods"];

              return (
                <Card
                  key={mealField.key}
                  type="inner"
                  title={
                    <Title level={5} style={{ margin: 0 }}>
                      <BulbOutlined /> {mealType}
                    </Title>
                  }
                  style={{
                    marginTop: 12,
                    backgroundColor: "#f6faff",
                    border: "1px solid #e6f7ff",
                  }}
                >
                  <Form.List name={foodFieldsName}>
                    {(foodFields, { add: addFood, remove: removeFood }) => (
                      <>
                        <Row
                          gutter={[8, 8]}
                          style={{
                            marginBottom: 8,
                            padding: "0 8px",
                            borderBottom: "1px solid #e8e8e8",
                          }}
                        >
                          <Col
                            span={5}
                            style={{ fontWeight: 600, fontSize: 13 }}
                          >
                            <TagOutlined /> Món ăn
                          </Col>
                          <NutrientHeader
                            label="KL"
                            icon={<ForkOutlined />}
                            unit="g"
                            color="#1890ff"
                            span={4}
                          />
                          <NutrientHeader
                            label="Calo"
                            icon={<FireOutlined />}
                            unit="kcal"
                            color="#faad14"
                            span={4}
                          />
                          <NutrientHeader
                            label="Protein"
                            icon={<UserOutlined />}
                            unit="g"
                            color="#52c41a"
                          />
                          <NutrientHeader
                            label="Lipid"
                            icon={<ForkOutlined />}
                            unit="g"
                            color="#1890ff"
                          />
                          <NutrientHeader
                            label="Carb"
                            icon={<CarOutlined />}
                            unit="g"
                            color="#722ed1"
                          />
                          <Col span={2} />
                        </Row>
                        {foodFields.map((foodField) => {
                          const foodIdFieldName = [
                            "days",
                            dayIndex,
                            "meals",
                            mealIndex,
                            "foods",
                            foodField.name,
                            "foodId",
                          ];

                          return (
                            <Row
                              key={foodField.key}
                              gutter={[8, 8]}
                              align="middle"
                              style={{
                                marginBottom: 12,
                                borderBottom: "1px dashed #f0f0f0",
                                padding: "0 8px 12px 8px",
                              }}
                            >
                              <Form.Item name={[foodField.name, "name"]} hidden>
                                <Input type="hidden" />
                              </Form.Item>

                              <Col span={5}>
                                <Form.Item
                                  {...foodField}
                                  name={[foodField.name, "foodId"]}
                                  fieldKey={[
                                    foodField.fieldKey as number,
                                    "foodId",
                                  ]}
                                  rules={[
                                    { required: true, message: "Chọn món ăn" },
                                  ]}
                                  style={{ marginBottom: 0 }} // Ngăn nhảy dòng
                                  help={false} // Ngăn AntD dành không gian cho thông báo lỗi
                                  validateStatus={
                                    form.getFieldError(foodIdFieldName).length >
                                    0
                                      ? "error"
                                      : undefined
                                  }
                                >
                                  <Select
                                    placeholder={
                                      currentAgeGroupLabel
                                        ? `Tìm món ăn cho ${currentAgeGroupLabel}`
                                        : "Vui lòng chọn Nhóm Tuổi trước"
                                    }
                                    showSearch
                                    optionFilterProp="children"
                                    onChange={(foodId) =>
                                      handleFoodSelect(
                                        foodId,
                                        foodField.name,
                                        mealIndex
                                      )
                                    }
                                    onSearch={setSearchText}
                                    allowClear
                                    filterOption={false}
                                    notFoundContent={
                                      foodLoading ? (
                                        <Spin size="small" />
                                      ) : (
                                        "Không tìm thấy món ăn"
                                      )
                                    }
                                    disabled={
                                      !currentAgeGroupValue || foodLoading
                                    }
                                  >
                                    {foodOptions.map((food) => (
                                      <Option key={food._id} value={food._id}>
                                        {food.foodName}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>

                              <NutrientDisplay
                                label="Khối lượng"
                                name="weight"
                                icon={<ForkOutlined />}
                                unit="g"
                                color="#1890ff"
                                foodField={foodField}
                                span={4}
                              />

                              <NutrientDisplay
                                label="Calo"
                                name="calo"
                                icon={<FireOutlined />}
                                unit="kcal"
                                color="#faad14"
                                foodField={foodField}
                                span={4} // <-- ĐÃ CHỈNH SỬA: Tăng span cho Calo
                              />
                              <NutrientDisplay
                                label="Protein"
                                name="protein"
                                icon={<UserOutlined />}
                                unit="g"
                                color="#52c41a"
                                foodField={foodField}
                              />
                              <NutrientDisplay
                                label="Lipid"
                                name="lipid"
                                icon={<ForkOutlined />}
                                unit="g"
                                color="#1890ff"
                                foodField={foodField}
                              />
                              <NutrientDisplay
                                label="Carb"
                                name="carb"
                                icon={<CarOutlined />}
                                unit="g"
                                color="#722ed1"
                                foodField={foodField}
                              />

                              <Col span={2} style={{ textAlign: "center" }}>
                                <Tooltip title="Xóa món ăn">
                                  <MinusCircleOutlined
                                    style={{
                                      color: "#ff4d4f",
                                      fontSize: 18,
                                      cursor: "pointer",
                                    }}
                                    onClick={() => removeFood(foodField.name)}
                                  />
                                </Tooltip>
                              </Col>
                            </Row>
                          );
                        })}
                        <Button
                          type="dashed"
                          onClick={() =>
                            addFood({
                              foodId: undefined,
                              name: "",
                              weight: undefined,
                              calo: undefined,
                              protein: undefined,
                              lipid: undefined,
                              carb: undefined,
                            })
                          }
                          block
                          icon={<PlusOutlined />}
                          disabled={!currentAgeGroupValue}
                          style={{ marginTop: 8 }}
                        >
                          Thêm món ăn vào {mealType}
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Card>
              );
            })}
          </Space>
        )}
      </Form.List>
    </Card>
  );
};

const CreateMenu: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentWeekDays, setCurrentWeekDays] = useState<Dayjs[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("0");

  const currentAgeGroupValue = Form.useWatch("ageGroup", form);

  const currentAgeGroupLabel = useMemo(() => {
    const group = AGE_GROUPS.find((g) => g.value === currentAgeGroupValue);
    return group ? group.label : "";
  }, [currentAgeGroupValue]);

  const handleWeekChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const start = dates[0].startOf("day");
      const end = dates[1].startOf("day");
      const daysArray: Dayjs[] = [];

      let currentDay = start;

      while (currentDay.isBefore(end) || currentDay.isSame(end)) {
        daysArray.push(currentDay);
        currentDay = currentDay.add(1, "day");
        if (daysArray.length >= 7) break;
      }

      setCurrentWeekDays(daysArray);

      const initialDaysStructure = daysArray.map((day) => ({
        date: day.toISOString(),
        meals: MEAL_TYPES.map((meal) => ({
          mealType: meal.value,
          foods: [
            {
              foodId: undefined,
              name: "",
              weight: undefined as any,
              calo: undefined,
              protein: undefined,
              lipid: undefined,
              carb: undefined,
            },
          ],
        })),
      }));

      form.setFieldValue("days", initialDaysStructure);
      setActiveTabKey("0");
    } else {
      setCurrentWeekDays([]);
      form.setFieldValue("days", []);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!values.dateRange) {
      toast.error("Vui lòng chọn khoảng thời gian áp dụng.");
      return;
    }

    setLoading(true);

    try {
      const [weekStartDayjs, weekEndDayjs] = values.dateRange;

      // Xử lý dữ liệu và lọc ra các món ăn/ngày hợp lệ
      const cleanedDays: DayMenuCreate[] = values.days
        .map((day: any) => {
          const dayMeals = day.meals.map((meal: any) => ({
            mealType: meal.mealType,
            foods: meal.foods
              .filter(
                (food: any) =>
                  // Chỉ lấy món ăn có foodId và khối lượng (weight) không bằng 0
                  food.foodId &&
                  food.foodId.trim() !== "" &&
                  food.weight !== 0 &&
                  food.weight !== undefined &&
                  food.weight !== null
              )
              .map((food: any) => food.foodId),
          }));

          return {
            date: day.date,
            meals: dayMeals,
          };
        })
        // Chỉ giữ lại những ngày có ít nhất 1 bữa ăn có món ăn
        .filter((day: DayMenuCreate) =>
          day.meals.some((meal: any) => meal.foods.length > 0)
        );

      if (cleanedDays.length === 0) {
        toast.warn("Thực đơn trống! Vui lòng thêm món ăn và Khối lượng.");
        setLoading(false);
        return;
      }

      const payload: CreateMenuParams = {
        weekStart: weekStartDayjs.startOf("day").toISOString(),
        weekEnd: weekEndDayjs.endOf("day").toISOString(),
        ageGroup: currentAgeGroupLabel,
        days: cleanedDays,
        notes: values?.notes || "",
      };

      await menuApis.createMenu(payload);
      toast.success("Tạo thực đơn tuần thành công!");
      navigate(`${constants.APP_PREFIX}/menus`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Tạo thực đơn thất bại. Vui lòng kiểm tra dữ liệu và thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dayTabs = useMemo(() => {
    if (currentWeekDays.length === 0) return [];

    return currentWeekDays.map((day, index) => ({
      label: getDayName(day),
      key: String(index),
      children: (
        <MealEditor
          dayIndex={index}
          dayjsDate={day}
          form={form}
          currentAgeGroupValue={currentAgeGroupValue}
          currentAgeGroupLabel={currentAgeGroupLabel}
          key={`day-editor-${index}`}
        />
      ),
    }));
  }, [currentWeekDays, form, currentAgeGroupValue, currentAgeGroupLabel]);

  return (
    <div style={{ padding: "16px 24px" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          ageGroup: AGE_GROUPS[0].value,
          notes: "",
          days: [],
        }}
      >
        <Card
          title={
            <Title level={3} style={{ margin: 0, padding: "10px 0" }}>
              <FormOutlined style={{ marginRight: 8 }} /> Tạo Thực đơn Tuần Mới
            </Title>
          }
          bordered={false}
          style={{
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            marginBottom: 24,
            borderRadius: 8,
          }}
        >
          <Row
            gutter={24}
            style={{
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: 16,
              marginBottom: 16,
            }}
          >
            <Col xs={24} md={6}>
              <Form.Item
                label={
                  <Space>
                    <CalendarOutlined /> **Tuần Áp Dụng**
                  </Space>
                }
                name="dateRange"
                rules={[
                  { required: true, message: "Vui lòng chọn khoảng thời gian" },
                ]}
                required
              >
                <DatePicker.RangePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  picker="week"
                  onChange={handleWeekChange}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item
                label={
                  <Space>
                    <UsergroupAddOutlined /> **Nhóm Tuổi**
                  </Space>
                }
                name="ageGroup"
                rules={[{ required: true, message: "Vui lòng chọn nhóm tuổi" }]}
                required
              >
                <Select placeholder="Chọn nhóm tuổi">
                  {AGE_GROUPS.map((group) => (
                    <Option key={group.value} value={group.value}>
                      {group.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={14}>
              <Form.Item label="Ghi chú" name="notes">
                <Input.TextArea
                  rows={1}
                  placeholder="Thêm ghi chú về thực đơn này (Ví dụ: Thực đơn mùa đông)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Title
                level={4}
                style={{
                  marginBottom: 16,
                  borderLeft: "3px solid #1890ff",
                  paddingLeft: 8,
                }}
              >
                Chi tiết Món ăn trong tuần
              </Title>
              {currentWeekDays.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px 0",
                    border: "1px dashed #d9d9d9",
                    borderRadius: 4,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <p style={{ color: "#8c8c8c", margin: 0 }}>
                    Vui lòng **chọn Tuần Áp Dụng** để bắt đầu nhập thực đơn chi
                    tiết cho 7 ngày.
                  </p>
                </div>
              ) : (
                <Tabs
                  activeKey={activeTabKey}
                  onChange={setActiveTabKey}
                  items={dayTabs}
                  tabPosition="top"
                />
              )}
            </Col>
          </Row>

          <Row
            justify="end"
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Space>
              <Button
                icon={<RollbackOutlined />}
                onClick={() => navigate(`${constants.APP_PREFIX}/menus`)}
                disabled={loading}
              >
                Hủy và Quay lại
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
                loading={loading}
                disabled={currentWeekDays.length === 0 || loading}
              >
                Lưu Thực đơn Tuần
              </Button>
            </Space>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default CreateMenu;
