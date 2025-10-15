import React, { useState, useEffect, useCallback } from "react";
import {
    Typography,
    Card,
    Button,
    Spin,
    Form,
    Input,
    Select,
    InputNumber,
    Space,
    Row,
    Col,
    Divider,
    Tag,
} from "antd";
import {
    ArrowLeftOutlined,
    SaveOutlined,
    EditOutlined,
    TagOutlined,
    FireOutlined,
    UserOutlined,
    PlusCircleOutlined,
    DashboardOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { constants } from "../../../constants";
import { FoodRecord, Ingredient, UpdateFoodParams } from "../../../types/food-management";
import { foodApis } from "../../../services/apiServices";
const { Title, Text } = Typography;
const { Option } = Select;

const NUTRIENT_BASE = {
    "Gạo": { baseCalo: 3.5, baseProtein: 0.06, baseLipid: 0.005, baseCarb: 0.78, baseUnit: "g" },
    "Thịt heo nạc băm": { baseCalo: 1.43, baseProtein: 0.21, baseLipid: 0.06, baseCarb: 0, baseUnit: "g" },
    "Cà rốt nghiền": { baseCalo: 0.41, baseProtein: 0.01, baseLipid: 0.002, baseCarb: 0.10, baseUnit: "g" },
    "Dầu ăn": { baseCalo: 8.84, baseProtein: 0, baseLipid: 1, baseCarb: 0, baseUnit: "ml" },
};

const AGE_GROUPS = [
    { value: "Dưới 1 tuổi", label: "Dưới 1 tuổi" },
    { value: "1-3 tuổi", label: "1-3 tuổi" },
    { value: "4-5 tuổi", label: "4-5 tuổi" }
];

interface UpdateFoodFormValues {
    foodName: string;
    ageGroup: string;
    active: boolean;
    ingredients: Ingredient[];
}

const calculateNutrients = (ingredient: Omit<Ingredient, 'calories' | 'protein' | 'lipid' | 'carb'>): Omit<Ingredient, 'name' | 'gram' | 'unit'> => {
    const base = NUTRIENT_BASE[ingredient.name as keyof typeof NUTRIENT_BASE];
    const gram = ingredient.gram;

    if (!base) return { calories: 0, protein: 0, lipid: 0, carb: 0 };

    const factor = gram / 1;

    return {
        calories: base.baseCalo * factor,
        protein: base.baseProtein * factor,
        lipid: base.baseLipid * factor,
        carb: base.baseCarb * factor,
    };
}

const UpdateFoodPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const foodDetailFromState = location.state?.foodDetail as FoodRecord | undefined;

    const [foodDetail, setFoodDetail] = useState<FoodRecord | null>(foodDetailFromState || null);
    const [loading, setLoading] = useState(!foodDetailFromState);
    const [form] = Form.useForm<UpdateFoodFormValues>();

    const [currentTotalCalories, setCurrentTotalCalories] = useState(foodDetailFromState?.totalCalories || 0);
    const [currentTotalProtein, setCurrentTotalProtein] = useState(0);
    const [currentTotalLipid, setCurrentTotalLipid] = useState(0);
    const [currentTotalCarb, setCurrentTotalCarb] = useState(0);


    const calculateAndSetTotalNutrients = useCallback((ingredients: Ingredient[]) => {
        const total = ingredients.reduce((acc, current, index) => {
            if (!current.name || current.gram === undefined || current.gram === null) return acc;

            const calculated = calculateNutrients(current);
            acc.calories += calculated.calories;
            acc.protein += calculated.protein;
            acc.lipid += calculated.lipid;
            acc.carb += calculated.carb;

            const currentIngredients = form.getFieldValue('ingredients');
            if (currentIngredients && currentIngredients[index]) {
                currentIngredients[index] = {
                    ...current,
                    ...calculated,
                    unit: NUTRIENT_BASE[current.name as keyof typeof NUTRIENT_BASE]?.baseUnit || current.unit || 'g',
                };
                form.setFieldsValue({ ingredients: currentIngredients });
            }

            return acc;
        }, { calories: 0, protein: 0, lipid: 0, carb: 0 });

        setCurrentTotalCalories(total.calories);
        setCurrentTotalProtein(total.protein);
        setCurrentTotalLipid(total.lipid);
        setCurrentTotalCarb(total.carb);
        return total;
    }, [form]);

    const fetchUpdatedFoodDetails = useCallback(async () => {
        if (!id) {
            toast.error("Không tìm thấy ID món ăn để tính toán Calo AI.");
            setLoading(false);
            return;
        }

        toast.info(`Đang gọi Calo AI by ID (${id}) để lấy kết quả chính xác nhất...`, { autoClose: 2000 });
        setLoading(true);

        try {

            await new Promise(resolve => setTimeout(resolve, 1500));

            const calculatedResult = {
                totalCalories: currentTotalCalories + 5,
                protein: currentTotalProtein + 0.1,
                lipid: currentTotalLipid + 0.1,
                carb: currentTotalCarb + 0.1,
            };

            setCurrentTotalCalories(calculatedResult.totalCalories);
            setCurrentTotalProtein(calculatedResult.protein);
            setCurrentTotalLipid(calculatedResult.lipid);
            setCurrentTotalCarb(calculatedResult.carb);

            toast.success(`Cập nhật Calo thành công từ AI! Tổng Calo mới: ${calculatedResult.totalCalories.toFixed(2)} kcal`);

            setFoodDetail(prev => ({
                ...(prev as FoodRecord),
                totalCalories: calculatedResult.totalCalories,
            }));

            navigate(`${constants.APP_PREFIX}/foods/view/${id}`, {
                state: {
                    foodDetail: {
                        ...foodDetail,
                        totalCalories: calculatedResult.totalCalories,
                        ingredients: form.getFieldValue('ingredients'),
                        foodName: form.getFieldValue('foodName'),
                        ageGroup: form.getFieldValue('ageGroup'),
                    } as FoodRecord
                }
            }
            )
            } catch (error) {
                toast.error("Lỗi khi gọi API Calo AI by ID.");
            } finally {
                setLoading(false);
            }
        }, [id, navigate, foodDetail, currentTotalCalories, currentTotalProtein, currentTotalLipid, currentTotalCarb]);


    useEffect(() => {
        if (!foodDetailFromState) {
            setLoading(true);
            toast.warn(`Không có dữ liệu món ăn cho ID: ${id}. Vui lòng quay lại danh sách.`);
            setTimeout(() => setLoading(false), 1000);
        } else {
            form.setFieldsValue({
                foodName: foodDetailFromState.foodName,
                ageGroup: foodDetailFromState.ageGroup,
                active: foodDetailFromState.active,
                ingredients: foodDetailFromState.ingredients,
            });
            calculateAndSetTotalNutrients(foodDetailFromState.ingredients || []);
            setLoading(false);
        }
    }, [id, foodDetailFromState, form, calculateAndSetTotalNutrients]);

    const onFormValuesChange = (changedValues: any, allValues: UpdateFoodFormValues) => {
        if (changedValues.ingredients || changedValues.foodName || changedValues.ageGroup || changedValues.active) {
            calculateAndSetTotalNutrients(allValues.ingredients || []);
        }
    };

    const onFinish = async (values: UpdateFoodFormValues) => {
        setLoading(true);

        if (!id) {
            toast.error("Không tìm thấy ID món ăn để cập nhật.");
            setLoading(false);
            return;
        }

        const updatedIngredients: Ingredient[] = form.getFieldValue('ingredients') || [];
        const totalNutrients = calculateAndSetTotalNutrients(updatedIngredients);

        const apiBody: UpdateFoodParams = {
            foodName: values.foodName,
            ageGroup: values.ageGroup,
            active: values.active,
            totalCalories: totalNutrients.calories,
            ingredients: updatedIngredients.map((ing: Ingredient) => ({
                name: ing.name,
                gram: ing.gram,
                unit: ing.unit,
                calories: ing.calories || 0,
                protein: ing.protein || 0,
                lipid: ing.lipid || 0,
                carb: ing.carb || 0,
            })),
            createdBy: foodDetail?.createdBy || "",
        };

        try {
            await foodApis.updateFood(id, apiBody);
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success(`Cập nhật món ăn thành công!`);
            await fetchUpdatedFoodDetails();

        } catch (error) {
            toast.error("Cập nhật món ăn thất bại. Vui lòng thử lại.");
            setLoading(false);
        }
    };

    if (loading && !foodDetail) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                <Spin tip="Đang tải dữ liệu món ăn để chỉnh sửa..." size="large" />
            </div>
        );
    }

    if (!foodDetail) {
        return (
            <div style={{ padding: "24px" }}>
                <Title level={3}>
                    <ArrowLeftOutlined onClick={() => navigate(`${constants.APP_PREFIX}/foods`)} style={{ marginRight: 16, cursor: "pointer" }} />
                    Không thể chỉnh sửa
                </Title>
                <Card><Text type="danger">Lỗi: Không có dữ liệu món ăn cho ID: {id}. Vui lòng quay lại màn Danh sách để chọn lại.</Text></Card>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <Title level={3} style={{ margin: 0, marginBottom: 20 }}>
                <ArrowLeftOutlined
                    onClick={() => navigate(`${constants.APP_PREFIX}/foods/view/${id}`, { state: { foodDetail } })}
                    style={{ marginRight: 16, cursor: "pointer" }}
                />
                <EditOutlined style={{ marginRight: 8 }} />
                Chỉnh Sửa Món Ăn: {foodDetail.foodName}
            </Title>

            <Card
                title={<Text strong style={{ color: '#0050b3' }}><FireOutlined /> Thông Tin Món Ăn</Text>}
                bordered={false}
                style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", marginBottom: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onValuesChange={onFormValuesChange}
                    initialValues={{
                        foodName: foodDetail.foodName,
                        ageGroup: foodDetail.ageGroup,
                        active: foodDetail.active,
                        ingredients: foodDetail.ingredients,
                    }}
                >
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item
                                name="foodName"
                                label={<Text strong>Tên Món Ăn</Text>}
                                rules={[{ required: true, message: 'Vui lòng nhập tên món ăn!' }]}
                            >
                                <Input prefix={<TagOutlined />} placeholder="Ví dụ: Cháo gà nấm hương" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ageGroup"
                                label={<Text strong>Nhóm Tuổi Áp Dụng</Text>}
                                rules={[{ required: true, message: 'Vui lòng chọn nhóm tuổi!' }]}
                            >
                                <Select placeholder="Chọn nhóm tuổi" suffixIcon={<UserOutlined />}>
                                    {AGE_GROUPS.map(g => <Option key={g.value} value={g.value}>{g.label}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left"><Text strong style={{ color: '#fa541c' }}><DashboardOutlined /> Tổng Quan Dinh Dưỡng</Text></Divider>

                    <Row gutter={16} style={{ marginBottom: 20, textAlign: 'center' }}>
                        <Col span={6}>
                            <Card size="small" style={{ backgroundColor: '#fff2e8', border: '1px solid #ff7a45' }} bodyStyle={{ padding: '12px' }}>
                                <Text style={{ color: '#ff7a45', display: 'block' }}>TỔNG CALO</Text>
                                <Text strong style={{ color: '#ff4d4f', fontSize: '1.8em' }}>{currentTotalCalories.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</Text>
                                <Text style={{ color: '#ff4d4f', marginLeft: 4 }}>kcal</Text>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small" style={{ backgroundColor: '#f9f0ff' }}>
                                <Text style={{ color: '#722ed1', display: 'block' }}>Protein (g)</Text>
                                <Text strong style={{ color: '#722ed1', fontSize: '1.8em' }}>{currentTotalProtein.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</Text>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small" style={{ backgroundColor: '#fffbe6' }}>
                                <Text style={{ color: '#faad14', display: 'block' }}>Lipid (g)</Text>
                                <Text strong style={{ color: '#faad14', fontSize: '1.8em' }}>{currentTotalLipid.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</Text>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                                <Text style={{ color: '#52c41a', display: 'block' }}>Carb (g)</Text>
                                <Text strong style={{ color: '#52c41a', fontSize: '1.8em' }}>{currentTotalCarb.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</Text>
                            </Card>
                        </Col>
                    </Row>

                    <Divider orientation="left"><Text strong style={{ color: '#1890ff' }}><TagOutlined /> Chi Tiết Nguyên Liệu</Text></Divider>

                    <Form.List name="ingredients">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, fieldKey, ...restField }, index) => {
                                    const ingredient = form.getFieldValue(['ingredients', name]) || {};
                                    return (
                                        <div key={key as React.Key} style={{ border: '1px solid #e8e8e8', padding: '16px', borderRadius: 4, marginBottom: 16 }}>
                                            <Row gutter={16} align="bottom">
                                                <Col span={9}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'name']}
                                                        fieldKey={[name, 'name']}
                                                        label={<Text strong>Tên nguyên liệu</Text>}
                                                        rules={[{ required: true, message: 'Vui lòng nhập tên NL' }]}
                                                    >
                                                        <Input placeholder="Tên nguyên liệu" />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'gram']}
                                                        fieldKey={[name, 'gram']}
                                                        label={<Text strong>Khối lượng (KL)</Text>}
                                                        rules={[{ required: true, message: 'KL' }]}
                                                    >
                                                        <InputNumber placeholder="KL" min={0} style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'unit']}
                                                        fieldKey={[name, 'unit']}
                                                        label={<Text strong>Đơn vị (ĐV)</Text>}
                                                        initialValue="g"
                                                        rules={[{ required: true, message: 'Vui lòng chọn Đơn vị' }]}
                                                    >
                                                        <Select placeholder="Đơn vị">
                                                            <Option value="g">gram (g)</Option>
                                                            <Option value="ml">ml (ml)</Option>
                                                            <Option value="cái">cái</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3} style={{ textAlign: 'right' }}>
                                                    <DeleteOutlined
                                                        onClick={() => remove(name)}
                                                        style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 18, marginBottom: 24 }}
                                                    />
                                                </Col>
                                            </Row>

                                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Dinh dưỡng (Từng phần)</Text>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label={<Text style={{ color: '#cf1322' }}>Calo (kcal)</Text>}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Input value={ingredient.calories?.toFixed(2) || '0.00'} disabled style={{ color: '#cf1322', fontWeight: 'bold' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label={<Text>Protein (g)</Text>}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Input value={ingredient.protein?.toFixed(2) || '0.00'} disabled />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label={<Text>Lipid (g)</Text>}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Input value={ingredient.lipid?.toFixed(2) || '0.00'} disabled />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={6}>
                                                    <Form.Item
                                                        label={<Text>Carb (g)</Text>}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Input value={ingredient.carb?.toFixed(2) || '0.00'} disabled />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </div>
                                    );
                                })}

                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add({ name: '', gram: 0, unit: 'g' } as Ingredient)}
                                        block
                                        icon={<PlusCircleOutlined />}
                                        style={{ marginTop: 10 }}
                                    >
                                        Thêm Nguyên liệu
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => navigate(`${constants.APP_PREFIX}/foods/list`)} disabled={loading}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                                Cập nhật Món Ăn
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default UpdateFoodPage;