import React, { useState, useMemo } from "react";
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
} from "antd";
import {
    SaveOutlined,
    RollbackOutlined,
    PlusOutlined,
    MinusCircleOutlined,
    CalendarOutlined,
    UsergroupAddOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import "dayjs/locale/vi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { constants } from "../../../constants";
import { menuApis } from "../../../services/apiServices";
import { CreateMenuParams } from "../../../types/menu-management";

dayjs.extend(weekday);
dayjs.locale("vi");

const { Title } = Typography;
const { Option } = Select;

const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const AGE_GROUPS = [
    { value: 1, label: "1 Tuổi" },
    { value: 2, label: "2 Tuổi" },
    { value: 3, label: "3 Tuổi" },
    { value: 4, label: "4 Tuổi" },
    { value: 5, label: "5 Tuổi" },
];

const MEAL_TYPES = [
    { value: "sáng", label: "Bữa Sáng" },
    { value: "trưa", label: "Bữa Trưa" },
    { value: "xế", label: "Bữa Xế" },
];

const getDayName = (dayjsDate: Dayjs) => {
    return capitalizeFirstLetter(dayjsDate.format("dddd"));
};

const CreateMenu: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentWeekDays, setCurrentWeekDays] = useState<Dayjs[]>([]);
    const [activeTabKey, setActiveTabKey] = useState<string>("0");

    const handleWeekChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            const start = dates[0].startOf('day');
            const end = dates[1].startOf('day');
            const daysArray: Dayjs[] = [];

            let currentDay = start;
            
            while (currentDay.isBefore(end) || currentDay.isSame(end)) {
                daysArray.push(currentDay);
                currentDay = currentDay.add(1, 'day');
                if (daysArray.length >= 7) break;
            }
            
            setCurrentWeekDays(daysArray);

            const initialDaysStructure = daysArray.map((day) => ({
                date: day.toISOString(), 
                meals: MEAL_TYPES.map(meal => ({
                    mealType: meal.value,
                    foods: [{ name: "", weight: undefined as any }] 
                }))
            }));
            
            form.setFieldValue('days', initialDaysStructure);
            setActiveTabKey("0"); 
            
        } else {
            setCurrentWeekDays([]);
            form.setFieldValue('days', []);
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

            const cleanedDays = values.days.map((day: any) => ({
                date: day.date,
                meals: day.meals.map((meal: any) => ({
                    mealType: meal.mealType,
                    foods: meal.foods.filter((food: any) => 
                        food.name && 
                        food.name.trim() !== "" && 
                        food.weight !== undefined && 
                        food.weight !== null && 
                        food.weight > 0
                    )
                })),
            })).filter((day: any) => 
                day.meals.some((meal: any) => meal.foods.length > 0)
            ); 

            if (cleanedDays.length === 0) {
                toast.warn("Thực đơn trống! Vui lòng thêm món ăn có đủ Tên và Khối lượng.");
                setLoading(false);
                return;
            }
            
            const payload: CreateMenuParams  = {
                weekStart: weekStartDayjs.startOf('day').toISOString(),
                weekEnd: weekEndDayjs.endOf('day').toISOString(),
                ageGroup: values.ageGroup,
                days: cleanedDays,
                notes: values.notes,
                totalCalo: 0,
                totalProtein: 0,
                totalLipid: 0,
                totalCarb: 0,
            };
            
            await menuApis.createMenu(payload); 
            toast.success("Tạo thực đơn tuần thành công!");
            navigate(`${constants.APP_PREFIX}/menus`);

        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Tạo thực đơn thất bại. Vui lòng kiểm tra dữ liệu và thử lại.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    interface MealEditorProps {
        dayIndex: number;
        dayjsDate: Dayjs;
        form: any;
    }

    const MealEditor: React.FC<MealEditorProps> = ({ dayIndex, dayjsDate, form }) => {
        const mealFieldsName = ['days', dayIndex, 'meals'];

        return (
            <Card size="small" title={<Title level={5}>{dayjsDate.format("DD/MM/YYYY")}</Title>}>
                <Form.Item
                    name={['days', dayIndex, 'date']}
                    hidden
                    initialValue={dayjsDate.toISOString()}
                >
                    <Input type="hidden" />
                </Form.Item>
                
                <Form.List 
                    name={mealFieldsName}
                >
                    {(fields) => (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {fields.map((mealField) => {
                                const mealIndex = mealField.name; 
                                const mealType = MEAL_TYPES[mealIndex]?.label || "Bữa ăn";

                                const foodFieldsName = [mealField.name, 'foods'];

                                return (
                                    <Card
                                        key={mealField.key}
                                        type="inner"
                                        title={mealType}
                                        style={{ marginTop: 16, backgroundColor: '#f9f9f9' }}
                                    >
                                        <Form.List name={foodFieldsName}>
                                            {(foodFields, { add: addFood, remove: removeFood }) => (
                                                <>
                                                    {foodFields.map((foodField) => (
                                                        <Space key={foodField.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" size="small">
                                                            <Form.Item
                                                                {...foodField}
                                                                name={[foodField.name, 'name']}
                                                                fieldKey={[foodField.fieldKey as number, 'name']} 
                                                                rules={[{ required: true, message: 'Nhập tên món' }]}
                                                                style={{ flexGrow: 3 }}
                                                            >
                                                                <Input placeholder="Tên món ăn (Ví dụ: Cháo thịt bằm)" />
                                                            </Form.Item>
                                                            <Form.Item
                                                                {...foodField}
                                                                name={[foodField.name, 'weight']}
                                                                fieldKey={[foodField.fieldKey as number, 'weight']}
                                                                rules={[
                                                                    { required: true, message: 'KL?' },
                                                                    { type: 'number', min: 1, message: 'KL > 0' }
                                                                ]}
                                                                style={{ flexGrow: 1, minWidth: 100 }}
                                                                getValueFromEvent={(e) => {
                                                                    if (typeof e === 'number') return e;
                                                                    return parseFloat(e.target.value);
                                                                }}
                                                            >
                                                                <InputNumber 
                                                                    placeholder="KL (gram)" 
                                                                    min={1} 
                                                                    style={{ width: '100%' }}
                                                                    parser={(value: string | undefined) => value ? parseFloat(value.replace(/[^0-9]/g, '')) : undefined as any}
                                                                />
                                                            </Form.Item>
                                                            <Tooltip title="Xóa món ăn">
                                                                <MinusCircleOutlined style={{ color: '#ff4d4f' }} onClick={() => removeFood(foodField.name)} />
                                                            </Tooltip>
                                                        </Space>
                                                    ))}
                                                    <Button
                                                        type="dashed"
                                                        onClick={() => addFood({ name: "", weight: undefined })} 
                                                        block
                                                        icon={<PlusOutlined />}
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
                    key={`day-editor-${index}`}
                />
            ),
        }));
    }, [currentWeekDays, form]);
    
    return (
        <div style={{ padding: "16px 24px" }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    ageGroup: AGE_GROUPS[0].value,
                    notes: "",
                    days: []
                }}
            >
                <Card
                    title={
                        <Title level={3} style={{ margin: 0, padding: '10px 0' }}>
                            <AppstoreOutlined style={{ marginRight: 8 }} /> Tạo Thực đơn Tuần Mới
                        </Title>
                    }
                    bordered={false}
                    style={{ boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)", marginBottom: 24, borderRadius: 8 }}
                >
                    <Row gutter={24} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16, marginBottom: 16 }}>
                        <Col xs={24} md={6}>
                            <Form.Item
                                label={
                                    <Space>
                                        <CalendarOutlined /> **Tuần Áp Dụng**
                                    </Space>
                                }
                                name="dateRange"
                                rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian" }]}
                                required
                            >
                                <DatePicker.RangePicker
                                    format="DD/MM/YYYY"
                                    style={{ width: "100%" }}
                                    picker="week" 
                                    onChange={handleWeekChange}
                                    disabledDate={(current) => current && current < dayjs().startOf('day')} 
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
                                <Input.TextArea rows={1} placeholder="Thêm ghi chú về thực đơn này (Ví dụ: Thực đơn mùa đông)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={24}>
                            <Title level={4} style={{ marginBottom: 16 }}>
                                Chi tiết Món ăn trong tuần
                            </Title>
                            {currentWeekDays.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px 0', border: '1px dashed #d9d9d9', borderRadius: 4, backgroundColor: '#fafafa' }}>
                                    <p style={{ color: '#8c8c8c', margin: 0 }}>Vui lòng **chọn Tuần Áp Dụng** để bắt đầu nhập thực đơn chi tiết cho 7 ngày.</p>
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

                    <Row justify="end" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                        <Space>
                            <Button icon={<RollbackOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/menus`)} disabled={loading}>
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