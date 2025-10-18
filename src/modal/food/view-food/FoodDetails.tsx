// src/pages/FoodDetailPage.tsx

import React, { useMemo, useEffect, useState } from "react";
import {
    Typography,
    Row,
    Col,
    Card,
    Space,
    Table,
    Tag,
    Spin,
    Alert,
    Divider,
} from "antd";
import {
    ArrowLeftOutlined,
    FireOutlined,
    UserOutlined,
    CheckCircleOutlined,
    StopOutlined,
    TagOutlined,
    DashboardOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { constants } from "../../../constants";
import { FoodRecord, Ingredient } from "../../../types/food-management";

const { Title, Text } = Typography;

interface DetailItemProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    color?: string;
    bgColor?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, color, bgColor = '#f0f5ff' }) => (
    <Card 
        size="small" 
        style={{ 
            backgroundColor: bgColor, 
            borderColor: color, 
            borderLeft: `5px solid ${color}`,
            transition: 'all 0.3s'
        }}
        bodyStyle={{ padding: '8px 12px' }}
    >
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text style={{ fontSize: '0.8em', color: '#595959' }}>{label}</Text>
            <Space size={6} style={{ color: color || '#000' }}>
                {React.cloneElement(icon as React.ReactElement)}
                <Text strong style={{ color: color || '#000' }}>{value}</Text>
            </Space>
        </Space>
    </Card>
);

const FoodDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation(); 

    const foodDetailFromState = location.state?.foodDetail as FoodRecord | undefined;
    console.log("foodDetailFromState",foodDetailFromState)
    
    const [foodDetail, setFoodDetail] = useState<FoodRecord | null>(foodDetailFromState || null);
    const [loading, setLoading] = useState(!foodDetailFromState);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (!foodDetail && id) {
            setShowWarning(true);
            setLoading(true);
            
            setTimeout(() => {
                setLoading(false);
                setFoodDetail(null); 
            }, 500);

        } else if (foodDetailFromState) {
            setLoading(false);
        }
    }, [id, foodDetail, foodDetailFromState]); 

    const totalNutrients = useMemo(() => {
        if (!foodDetail || !foodDetail.ingredients) return { calories: 0, protein: 0, lipid: 0, carb: 0 };
        return foodDetail.ingredients.reduce((acc, current) => {
            acc.calories += current.calories;
            acc.protein += current.protein;
            acc.lipid += current.lipid;
            acc.carb += current.carb;
            return acc;
        }, { calories: 0, protein: 0, lipid: 0, carb: 0 });
    }, [foodDetail]);
    
    const ingredientColumns = useMemo(() => ([
        { 
            title: "Tên Nguyên liệu", 
            dataIndex: "name", 
            key: "name", 
            width: 150,
            render: (text: string) => <Text strong>{text}</Text> 
        },
        {
            title: "Khối lượng",
            dataIndex: "gram",
            key: "gram",
            width: 100,
            align: "center" as const,
            render: (text: number, record: Ingredient) => (
                <Tag color="#1890ff" style={{ minWidth: 60, textAlign: 'center' }}>
                    {text} {record.unit}
                </Tag>
            ),
        },
        {
            title: "Calo (kcal)",
            dataIndex: "calories",
            key: "calories",
            width: 100,
            align: "right" as const,
            render: (text: number) => <Text strong style={{ color: '#fa541c' }}>{text?.toFixed(2)}</Text>,
        },
        {
            title: "Protein (g)",
            dataIndex: "protein",
            key: "protein",
            width: 90,
            align: "right" as const,
            render: (text: number) => <Text strong style={{ color: '#722ed1' }}>{text?.toFixed(2)}</Text>,
        },
        {
            title: "Lipid (g)",
            dataIndex: "lipid",
            key: "lipid",
            width: 90,
            align: "right" as const,
            render: (text: number) => <Text strong style={{ color: '#fadb14' }}>{text?.toFixed(2)}</Text>,
        },
        {
            title: "Carb (g)",
            dataIndex: "carb",
            key: "carb",
            width: 90,
            align: "right" as const,
            render: (text: number) => <Text strong style={{ color: '#52c41a' }}>{text?.toFixed(2)}</Text>,
        },
    ]), []);
    
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
                <Spin tip="Đang kiểm tra dữ liệu món ăn..." size="large" />
            </div>
        );
    }

    if (!foodDetail) {
        return (
            <div style={{ padding: "24px" }}>
                <Title level={3}>
                    <ArrowLeftOutlined
                        onClick={() => navigate(`${constants.APP_PREFIX}/foods`)}
                        style={{ marginRight: 16, cursor: "pointer" }}
                    />
                    Không tìm thấy Món Ăn
                </Title>
                <Card>
                    <Text>Món ăn với ID: {id} không tồn tại hoặc dữ liệu bị mất do làm mới trang. Vui lòng quay lại màn Danh sách.</Text>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        <ArrowLeftOutlined
                            onClick={() => navigate(`${constants.APP_PREFIX}/foods`)}
                            style={{ marginRight: 16, cursor: "pointer" }}
                        />
                        Chi Tiết Món Ăn: {foodDetail.foodName}
                    </Title>
                </Col>
            </Row>

            {showWarning && (
                <Alert
                    message="Lưu ý về Dữ liệu"
                    description="Dữ liệu này được truyền từ trang Danh sách. Nếu bạn làm mới trang, thông tin chi tiết sẽ bị mất và cần quay lại trang Danh sách."
                    type="warning"
                    showIcon
                    closable
                    style={{ marginBottom: 20 }}
                />
            )}

            {/* THÔNG TIN CHUNG */}
            <Card
                title={<Text strong style={{ color: '#1890ff' }}><FireOutlined /> Thông Tin Chung</Text>}
                bordered={false}
                style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", marginBottom: 20 }}
                bodyStyle={{ padding: '16px' }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <DetailItem
                            icon={<TagOutlined />}
                            label="Nhóm tuổi"
                            value={foodDetail.ageGroup}
                            color="#fa8c16"
                            bgColor="#fff7e6"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <DetailItem
                            icon={<UserOutlined />}
                            label="Người tạo"
                            value={foodDetail.createdBy}
                            color="#722ed1"
                            bgColor="#f9f0ff"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <DetailItem
                            icon={<CalendarOutlined />}
                            label="Ngày tạo"
                            value={dayjs(foodDetail.createdAt).format("DD/MM/YYYY HH:mm")}
                            color="#1890ff"
                            bgColor="#e6f7ff"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <DetailItem
                            icon={foodDetail.active ? <CheckCircleOutlined /> : <StopOutlined />}
                            label="Trạng thái"
                            value={foodDetail.active ? "Hoạt động" : "Ngừng bán"}
                            color={foodDetail.active ? "#52c41a" : "#ff4d4f"}
                            bgColor={foodDetail.active ? "#f6ffed" : "#fff1f0"}
                        />
                    </Col>
                </Row>
            </Card>

            {/* TỔNG QUAN DINH DƯỠNG */}
            <Card
                title={<Text strong style={{ color: '#fa541c' }}><DashboardOutlined /> Tổng Quan Dinh Dưỡng</Text>}
                bordered={false}
                style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", marginBottom: 20 }}
            >
                <Row gutter={[16, 16]} style={{ fontWeight: "bold", textAlign: 'center' }}>
                    
                    {/* CALO (Điểm nhấn lớn) */}
                    <Col xs={24} sm={6}>
                        <Card 
                            size="small" 
                            style={{ backgroundColor: '#fff2e8', border: '1px solid #ff7a45' }}
                            bodyStyle={{ padding: '12px' }}
                        >
                            <Text style={{ color: '#ff7a45', fontSize: '1.2em', display: 'block' }}>TỔNG CALO</Text>
                            <Divider style={{ margin: '4px 0', borderColor: '#ff7a45' }} />
                            <Text strong style={{ color: '#ff4d4f', fontSize: '2em' }}>
                                {foodDetail.totalCalories.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </Text>
                            <Text strong style={{ color: '#ff4d4f', fontSize: '1.2em', marginLeft: 4 }}>kcal</Text>
                        </Card>
                    </Col>

                    {/* PROTEIN */}
                    <Col xs={24} sm={6}>
                        <Card size="small" style={{ backgroundColor: '#f9f0ff' }}>
                            <Text style={{ color: '#722ed1', fontSize: '1.2em', display: 'block' }}>Protein</Text>
                            <Divider style={{ margin: '4px 0', borderColor: '#722ed1' }} />
                            <Text strong style={{ color: '#722ed1', fontSize: '2em' }}>
                                {totalNutrients.protein.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </Text>
                            <Text strong style={{ color: '#722ed1', fontSize: '1.2em', marginLeft: 4 }}>g</Text>
                        </Card>
                    </Col>

                    {/* LIPID */}
                    <Col xs={24} sm={6}>
                        <Card size="small" style={{ backgroundColor: '#fffbe6' }}>
                            <Text style={{ color: '#faad14', fontSize: '1.2em', display: 'block' }}>Lipid</Text>
                            <Divider style={{ margin: '4px 0', borderColor: '#faad14' }} />
                            <Text strong style={{ color: '#faad14', fontSize: '2em' }}>
                                {totalNutrients.lipid.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </Text>
                            <Text strong style={{ color: '#faad14', fontSize: '1.2em', marginLeft: 4 }}>g</Text>
                        </Card>
                    </Col>

                    {/* CARB */}
                    <Col xs={24} sm={6}>
                        <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                            <Text style={{ color: '#52c41a', fontSize: '1.2em', display: 'block' }}>Carbohydrate</Text>
                            <Divider style={{ margin: '4px 0', borderColor: '#52c41a' }} />
                            <Text strong style={{ color: '#52c41a', fontSize: '2em' }}>
                                {totalNutrients.carb.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </Text>
                            <Text strong style={{ color: '#52c41a', fontSize: '1.2em', marginLeft: 4 }}>g</Text>
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* CHI TIẾT NGUYÊN LIỆU */}
            <Card
                title={<Text strong style={{ color: '#0050b3' }}><TagOutlined /> Chi Tiết Nguyên Liệu</Text>}
                bordered={false}
                style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
            >
                <Table
                    columns={ingredientColumns}
                    dataSource={foodDetail.ingredients}
                    rowKey={(item, index) => `${item.name}-${index}`}
                    pagination={false}
                    size="middle"
                    summary={() => (
                        <Table.Summary.Row style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                            <Table.Summary.Cell index={0} colSpan={2}>
                                <Text strong>TỔNG LƯỢNG DINH DƯỠNG CÁC NGUYÊN LIỆU</Text>
                            </Table.Summary.Cell>
                            
                            {/* Tổng Calo */}
                            <Table.Summary.Cell index={2} align="right">
                                <Text strong style={{ color: '#fa541c' }}>{totalNutrients.calories.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</Text>
                            </Table.Summary.Cell>
                            
                            {/* Tổng Protein */}
                            <Table.Summary.Cell index={3} align="right">
                                <Text strong style={{ color: '#722ed1' }}>{totalNutrients.protein.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</Text>
                            </Table.Summary.Cell>
                            
                            {/* Tổng Lipid */}
                            <Table.Summary.Cell index={4} align="right">
                                <Text strong style={{ color: '#faad14' }}>{totalNutrients.lipid.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</Text>
                            </Table.Summary.Cell>
                            
                            {/* Tổng Carb */}
                            <Table.Summary.Cell index={5} align="right">
                                <Text strong style={{ color: '#52c41a' }}>{totalNutrients.carb.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</Text>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    )}
                />
            </Card>
        </div>
    );
};

export default FoodDetailPage;