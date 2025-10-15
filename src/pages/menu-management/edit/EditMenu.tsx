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
  Skeleton,
  Popconfirm,
  Modal,
} from "antd";
import {
  SaveOutlined,
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
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import "dayjs/locale/vi";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { constants } from "../../../constants";
import { menuApis } from "../../../services/apiServices";
import {
  CreateMenuParams,
  FoodRecord,
  ListFoodParams,
  DayMenuCreate,
  MenuDetail,
} from "../../../types/menu-management";
import TextArea from "antd/es/input/TextArea";

interface Ingredient {
  ingredientName: string;
  gram: number;
  calories: number;
  protein: number;
  lipid: number;
  carb: number;
}

export interface Food {
  _id: string;
  foodName: string;
  ageGroup: string;
  totalCalories: number;
  ingredients: Ingredient[];
}

export interface MealDetail {
  mealType: "sáng" | "trưa" | "xế" | string;
  foods: {
    food: Food;
    weight?: number;
    calo?: number;
    protein?: number;
    lipid?: number;
    carb?: number;
  }[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
}

export interface DayDetail {
  date: string;
  meals: MealDetail[];
}

dayjs.extend(weekday);
dayjs.locale("vi");

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
  isEdit: boolean;
}

interface NutrientDisplayProps {
  name: string;
  icon?: React.ReactNode;
  unit: string;
  color: string;
  foodField: any;
  label: string;
  readOnly?: boolean;
  span?: number;
  onWeightChange?: (value: any) => void;
}

const safeValue = (val: number | undefined | null) => Math.max(0, val || 0);

const calculateNutrientsFromIngredients = (
  ingredients: Ingredient[] | FoodRecord["ingredients"]
) => {
  return (
    (ingredients as Ingredient[])?.reduce(
      (acc, item) => {
        acc.weight += item.gram || 0;
        acc.calo += item.calories || 0;
        acc.protein += item.protein || 0;
        acc.lipid += item.lipid || 0;
        acc.carb += item.carb || 0;
        return acc;
      },
      { weight: 0, calo: 0, protein: 0, lipid: 0, carb: 0 }
    ) || { weight: 0, calo: 0, protein: 0, lipid: 0, carb: 0 }
  );
};

const MealEditor: React.FC<MealEditorProps> = ({
  dayIndex,
  dayjsDate,
  form,
  currentAgeGroupValue,
  currentAgeGroupLabel,
  isEdit,
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
        setFoodOptions(response?.data || []);
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

    const foodPath = [
      "days",
      dayIndex,
      "meals",
      mealFieldIndex,
      "foods",
      foodFieldIndex,
    ];

    if (selectedFood) {
      const nutrientValues = calculateNutrientsFromIngredients(
        selectedFood.ingredients
      );

      form.setFieldsValue({
        [foodPath[0]]: {
          [foodPath[1]]: {
            [foodPath[2]]: {
              [foodPath[3]]: {
                [foodPath[4]]: {
                  [foodPath[5]]: {
                    foodId: selectedFood._id,
                    name: selectedFood.foodName,
                    weight: safeValue(nutrientValues.weight),
                    calo: safeValue(nutrientValues.calo),
                    protein: safeValue(nutrientValues.protein),
                    lipid: safeValue(nutrientValues.lipid),
                    carb: safeValue(nutrientValues.carb),
                  },
                },
              },
            },
          },
        },
      });
    } else {
      form.setFieldsValue({
        [foodPath[0]]: {
          [foodPath[1]]: {
            [foodPath[2]]: {
              [foodPath[3]]: {
                [foodPath[4]]: {
                  [foodPath[5]]: {
                    foodId: undefined,
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

  const handleWeightChange = useCallback(
    (
      newWeight: number | string | undefined,
      foodFieldIndex: number,
      mealFieldIndex: number
    ) => {
      const currentFoods = form.getFieldValue([
        "days",
        dayIndex,
        "meals",
        mealFieldIndex,
        "foods",
      ]);
      const currentFood = currentFoods?.[foodFieldIndex];
      const foodId = currentFood?.foodId;

      const parsedNewWeight = Number(newWeight) || 0;

      if (!foodId || parsedNewWeight <= 0) {
        form.setFieldsValue({
          days: {
            [dayIndex]: {
              meals: {
                [mealFieldIndex]: {
                  foods: {
                    [foodFieldIndex]: {
                      weight: parsedNewWeight > 0 ? parsedNewWeight : undefined,
                      calo: 0,
                      protein: 0,
                      lipid: 0,
                      carb: 0,
                    },
                  },
                },
              },
            },
          },
        });
        return;
      }

      const selectedFood = foodOptions.find((food) => food._id === foodId);

      if (!selectedFood) return;

      const originalNutrientValues = calculateNutrientsFromIngredients(
        selectedFood.ingredients as any
      );

      const originalWeight = originalNutrientValues.weight || 1;
      const ratio = originalWeight > 0 ? parsedNewWeight / originalWeight : 0;

      const newCalo = safeValue(originalNutrientValues.calo * ratio);
      const newProtein = safeValue(originalNutrientValues.protein * ratio);
      const newLipid = safeValue(originalNutrientValues.lipid * ratio);
      const newCarb = safeValue(originalNutrientValues.carb * ratio);

      const foodPath = [
        "days",
        dayIndex,
        "meals",
        mealFieldIndex,
        "foods",
        foodFieldIndex,
      ];

      form.setFieldsValue({
        [foodPath[0]]: {
          [foodPath[1]]: {
            [foodPath[2]]: {
              [foodPath[3]]: {
                [foodPath[4]]: {
                  [foodPath[5]]: {
                    weight: parsedNewWeight,
                    calo: newCalo,
                    protein: newProtein,
                    lipid: newLipid,
                    carb: newCarb,
                  },
                },
              },
            },
          },
        },
      });
    },
    [dayIndex, form, foodOptions]
  );

  const NutrientDisplay: React.FC<NutrientDisplayProps> = ({
    name,
    unit,
    color,
    foodField,
    label,
    span = 3,
    onWeightChange,
  }) => (
    <Col span={span}>
      <Tooltip title={label}>
        <Form.Item
          key={`nutrient-item-${foodField.fieldKey as number}-${name}`}
          name={[foodField.name, name]}
          fieldKey={[foodField.fieldKey as number, name]}
          style={{ marginBottom: 0 }}
          help={false}
          validateStatus={undefined}
        >
          <InputNumber
            style={{
              width: "100%",
              color: name !== "weight" ? color : "inherit",
              padding: name !== "weight" ? "4px 7px" : undefined,
            }}
            readOnly={name !== "weight"}
            controls={false}
            placeholder={name !== "weight" ? "0" : "Nhập"}
            addonAfter={unit}
            formatter={(value) => (value ? Number(value)?.toFixed(2) : "")}
            parser={(value) => (value ? Number(value?.replace(/,/g, "")) : NaN)}
            onChange={name === "weight" ? onWeightChange : (undefined as any)}
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
                                  style={{ marginBottom: 0 }}
                                  help={false}
                                  validateStatus={
                                    form.getFieldError(foodIdFieldName)
                                      ?.length > 0
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
                                      !currentAgeGroupValue ||
                                      foodLoading ||
                                      !isEdit
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
                                readOnly={false}
                                onWeightChange={(value) =>
                                  handleWeightChange(
                                    value,
                                    foodField.name,
                                    mealIndex
                                  )
                                }
                              />

                              <NutrientDisplay
                                label="Calo"
                                name="calo"
                                icon={<FireOutlined />}
                                unit="kcal"
                                color="#faad14"
                                foodField={foodField}
                                span={4}
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
                                {isEdit && (
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
                                )}
                              </Col>
                            </Row>
                          );
                        })}
                        {isEdit && (
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
                        )}
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

const EditMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentWeekDays, setCurrentWeekDays] = useState<Dayjs[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("0");
  const [menuStatus, setMenuStatus] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);
  const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const currentAgeGroupValue = Form.useWatch("ageGroup", form);

  const currentAgeGroupLabel = useMemo(() => {
    const group = AGE_GROUPS.find((g) => g.value === currentAgeGroupValue);
    return group ? group.label : "";
  }, [currentAgeGroupValue]);

  const safeValue = (val: any) => Math.max(0, val || 0);

  const hydrateFormData = (menu: MenuDetail) => {
    const startDayjs = dayjs(menu.weekStart);
    const endDayjs = dayjs(menu.weekEnd);

    setMenuStatus(menu.state || "");

    const daysArray: Dayjs[] = [];
    let currentDay = startDayjs.startOf("day");
    while (
      currentDay.isBefore(endDayjs.endOf("day")) ||
      currentDay.isSame(endDayjs.endOf("day"), "day")
    ) {
      daysArray.push(currentDay);
      currentDay = currentDay.add(1, "day");
      if (daysArray.length >= 7) break;
    }
    setCurrentWeekDays(daysArray);

    const formDays = daysArray.map((dayjsDate) => {
      const menuDay: any = menu.days?.find((d: any) =>
        dayjs(d.date).isSame(dayjsDate, "day")
      );

      const meals = MEAL_TYPES.map((mealType) => {
        const existingMeal: MealDetail | undefined = menuDay?.meals?.find(
          (m: MealDetail) => m.mealType === mealType.value
        );

        const mealFoods = existingMeal?.foods?.length
          ? existingMeal.foods.map((item) => {
              const food = item.food;
              const itemData: any = item;

              let foodWeight = itemData.weight;
              let foodCalo = itemData.calo;
              let foodProtein = itemData.protein;
              let foodLipid = itemData.lipid;
              let foodCarb = itemData.carb;

              if (food && !foodWeight && food.ingredients) {
                const nutrients = calculateNutrientsFromIngredients(
                  food.ingredients as Ingredient[]
                );
                foodWeight = nutrients.weight;
                foodCalo = nutrients.calo;
                foodProtein = nutrients.protein;
                foodLipid = nutrients.lipid;
                foodCarb = nutrients.carb;
              }

              return {
                foodId: food?._id,
                name: food?.foodName,
                weight: safeValue(foodWeight),
                calo: safeValue(foodCalo),
                protein: safeValue(foodProtein),
                lipid: safeValue(foodLipid),
                carb: safeValue(foodCarb),
              };
            })
          : [];

        return {
          mealType: mealType.value,
          foods: mealFoods,
        };
      });

      return {
        date: dayjsDate.toISOString(),
        meals: meals,
      };
    });

    const ageGroup =
      AGE_GROUPS.find((g) => g.label === menu.ageGroup)?.value ||
      AGE_GROUPS[0].value;

    form.setFieldsValue({
      dateRange: [startDayjs, endDayjs],
      ageGroup: ageGroup,
      notes: menu.notes,
      days: formDays,
    });

    setActiveTabKey("0");
  };

  useEffect(() => {
    if (!id) {
      toast.error("Không tìm thấy ID thực đơn.");
      navigate(`${constants.APP_PREFIX}/menus`);
      return;
    }

    const fetchMenu = async () => {
      setInitialLoading(true);
      try {
        const response: MenuDetail = await menuApis.getMenuById(id);
        hydrateFormData(response);
      } catch (error) {
        toast.error("Lỗi tải thông tin thực đơn. Vui lòng thử lại.");
        navigate(`${constants.APP_PREFIX}/menus`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchMenu();
  }, [id, navigate, form]);

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
      setActiveTabKey("0");
    } else {
      setCurrentWeekDays([]);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!id) {
      toast.error("Thiếu ID thực đơn để cập nhật.");
      return;
    }
    if (!values.dateRange) {
      toast.error("Vui lòng chọn khoảng thời gian áp dụng.");
      return;
    }

    setLoading(true);

    try {
      const [weekStartDayjs, weekEndDayjs] = values.dateRange;

      const cleanedDays: DayMenuCreate[] = values.days
        .map((day: any) => {
          const dayMeals = day.meals
            .map((meal: any) => {
              const validFoods = meal.foods
                .filter(
                  (food: any) =>
                    food.foodId &&
                    food.foodId.trim() !== "" &&
                    food.weight !== 0 &&
                    food.weight !== undefined &&
                    food.weight !== null
                )
                .map((food: any) => food.foodId);

              return {
                mealType: meal.mealType,
                foods: validFoods,
              };
            })
            .filter((meal: any) => meal.foods.length > 0);

          return {
            date: day.date,
            meals: dayMeals,
          };
        })
        .filter((day: DayMenuCreate) => day.meals.length > 0);

      if (cleanedDays.length === 0) {
        toast.warn("Thực đơn trống! Vui lòng thêm món ăn và Khối lượng.");
        setLoading(false);
        return;
      }

      const payload: CreateMenuParams = {
        weekStart: weekStartDayjs.startOf("day").toISOString(),
        weekEnd: weekEndDayjs.endOf("day").toISOString(),
        ageGroup: currentAgeGroupLabel,
        days: cleanedDays as any,
        notes: values?.notes || "",
      };

      await menuApis.editMenu(id, payload);
      toast.success("Cập nhật thực đơn tuần thành công!");
      navigate(`${constants.APP_PREFIX}/menus`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Cập nhật thực đơn thất bại. Vui lòng kiểm tra dữ liệu và thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) {
      toast.error("Thiếu ID thực đơn để duyệt.");
      return;
    }
    setLoading(true);
    try {
      await menuApis.approveMenu(id);
      toast.success("Đã duyệt thực đơn thành công!");
      navigate(`${constants.APP_PREFIX}/menus`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Duyệt thực đơn thất bại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dayTabs = useMemo(() => {
    if (currentWeekDays.length === 0 || initialLoading) return [];

    return currentWeekDays.map((day, index) => ({
      label: getDayName(day),
      key: String(index),
      children: (
        <MealEditor
          isEdit={isEditing}
          dayIndex={index}
          dayjsDate={day}
          form={form}
          currentAgeGroupValue={currentAgeGroupValue}
          currentAgeGroupLabel={currentAgeGroupLabel}
          key={`day-editor-${index}`}
        />
      ),
    }));
  }, [
    currentWeekDays,
    form,
    currentAgeGroupValue,
    currentAgeGroupLabel,
    initialLoading,
    isEditing,
  ]);

  const isPending = menuStatus === "Chờ xử lý";

  if (initialLoading) {
    return (
      <div style={{ padding: "16px 24px" }}>
        <Card
          title={
            <Title level={3} style={{ margin: 0, padding: "10px 0" }}>
              <EditOutlined style={{ marginRight: 8 }} /> **Đang tải Thực
              đơn...**
            </Title>
          }
          bordered={false}
          style={{
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            borderRadius: 8,
          }}
        >
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      toast.warn("Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      setLoading(true);
      await menuApis.rejectMenu(id, { reason: rejectReason?.trim() });
      toast.success("Từ chối tạo menu thành công");
      navigate(`${constants.APP_PREFIX}/menus`);
    } catch (error) {
      toast.error("Lỗi reject menu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

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
              <EditOutlined style={{ marginRight: 8 }} /> **Cập nhật Thực đơn
              Tuần**
              {isPending && (
                <span
                  style={{ fontSize: 14, marginLeft: 16, color: "#faad14" }}
                >
                  (Trạng thái: Đang xử lý)
                </span>
              )}
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
                <RangePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  picker="week"
                  onChange={handleWeekChange}
                  disabled={!isEditing}
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
                <Select placeholder="Chọn nhóm tuổi" disabled={!isEditing}>
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
                  disabled={!isEditing}
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
              {isEditing ? (
                <Space size="middle">
                  <Button onClick={() => setIsCancelConfirmVisible(true)}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={() => form.submit()}
                  >
                    Lưu thay đổi
                  </Button>
                </Space>
              ) : (
                <Space size="middle">
                  {isPending && (
                    <>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => setIsRejectModalVisible(true)}
                      >
                        Từ chối
                      </Button>
                      <Popconfirm
                        title="Xác nhận duyệt đơn?"
                        description="Hành động này sẽ duyệt đơn đăng ký. Bạn chắc chắn chứ?"
                        onConfirm={handleApprove}
                        okText="Đồng ý"
                        cancelText="Không"
                      >
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          loading={loading}
                        >
                          Duyệt thực đơn
                        </Button>
                      </Popconfirm>
                    </>
                  )}

                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                </Space>
              )}
            </Space>
          </Row>
        </Card>
      </Form>
      <Modal
        title="Xác nhận từ chối thực đơn"
        open={isRejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setIsRejectModalVisible(false);
          setRejectReason("");
        }}
        confirmLoading={loading}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
      >
        <p>Vui lòng nhập lý do từ chối.</p>
        <TextArea
          rows={4}
          placeholder="Nhập lý do..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
      <Modal
        title="Bạn có chắc muốn hủy?"
        open={isCancelConfirmVisible}
        onOk={() => {
          setIsEditing(false);
          setIsCancelConfirmVisible(false);
        }}
        onCancel={() => setIsCancelConfirmVisible(false)}
        okText="Đồng ý"
        cancelText="Không"
        zIndex={1001}
      >
        <p>Các thay đổi chưa được lưu sẽ bị mất.</p>
      </Modal>
      <Modal
        title="Bạn có chắc muốn quay lại?"
        open={isBackConfirmVisible}
        onOk={() => navigate(-1)}
        onCancel={() => setIsBackConfirmVisible(false)}
        okText="Đồng ý"
        cancelText="Không"
        zIndex={1001}
      >
        <p>Các thay đổi chưa được lưu sẽ bị mất.</p>
      </Modal>
    </div>
  );
};

export default EditMenu;
