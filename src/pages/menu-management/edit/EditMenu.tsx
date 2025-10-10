import React, { useEffect, useState } from 'react';
import { Form, Card, Button, Typography, Space, notification, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { MenuInitialData, MenuPayload, MenuRecord } from '../../../types/menu-management';

const { Title } = Typography;

const mockMenuData: MenuRecord = {
    _id: "68e5e849c5c3c7065f5e5ca8", weekStart: "2025-10-13T00:00:00.000Z", weekEnd: "2025-10-19T00:00:00.000Z", ageGroup: '5', notes: "Thực đơn trẻ 5 tuổi đã được chỉnh sửa",
    days: [
        { date: "2025-10-13T00:00:00.000Z", meals: [{ mealType: "sáng", foods: [{ name: "Bánh cuốn", weight: 150 }] }] }
    ] as any,
    totalCalo: 0, totalProtein: 0, totalLipid: 0, totalCarb: 0, createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

const EditMenuPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const navigate = useNavigate();

    const mockFetchMenuById = async (menuId: string): Promise<MenuRecord | null> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return menuId === mockMenuData._id ? mockMenuData : null;
    };

    useEffect(() => {
        if (id) {
            setFetchingData(true);
            mockFetchMenuById(id)
                .then(data => {
                    if (data) {
                        const initialValues: MenuInitialData = {
                            _id: data._id,
                            weekRange: [dayjs(data.weekStart), dayjs(data.weekEnd)],
                            ageGroup: data.ageGroup,
                            notes: data.notes,
                            days: data.days.map(day => ({
                                date: day.date,
                                meals: day.meals.map(meal => ({
                                    mealType: meal.mealType,
                                    foods: meal.foods.map(food => ({
                                        name: food.name,
                                        weight: food.weight
                                    }))
                                }))
                            }))
                        };
                        form.setFieldsValue(initialValues);
                    } else {
                        notification.error({ message: 'Lỗi', description: 'Không tìm thấy thực đơn này.' });
                        navigate('/menu-management');
                    }
                })
                .catch(() => {
                    notification.error({ message: 'Lỗi', description: 'Lỗi khi tải dữ liệu thực đơn.' });
                    navigate('/menu-management');
                })
                .finally(() => setFetchingData(false));
        }
    }, [id, form, navigate]);


    const mockUpdateMenuApi = async (menuId: string, payload: MenuPayload) => {
        console.log(menuId)
        return new Promise((resolve, reject) =>
            setTimeout(() => {
                if (payload.ageGroup === '1' && dayjs(payload.weekStart).isSame('2025-10-06T00:00:00.000Z', 'day')) {
                    reject(new Error("409 CONFLICT: Thực đơn tuần này đã tồn tại (sau khi sửa)."));
                } else {
                    resolve({ status: 200, message: "Update successfully" });
                }
            }, 1500)
        );
    };

    const handleFormSubmit = () => {
        form.validateFields()
            .then(async values => {
                if (!id) return;
                setLoading(true);
                
                const { weekRange, days, ...rest } = values;

                const payload: MenuPayload = {
                    ...rest,
                    weekStart: weekRange[0].startOf('day').toISOString(),
                    weekEnd: weekRange[1].endOf('day').toISOString(),
                    days: days,
                    updatedBy: "system" 
                };
                
                try {
                    await mockUpdateMenuApi(id, payload);
                    notification.success({
                        message: 'Cập nhật Thành Công',
                        description: `Thực đơn ID ${id} đã được cập nhật.`,
                    });
                    navigate('/menu-management'); 
                } catch (error: any) {
                    notification.error({
                        message: 'Cập nhật Thất Bại',
                        description: error.message || 'Có lỗi xảy ra trong quá trình cập nhật thực đơn.',
                    });
                } finally {
                    setLoading(false);
                }
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={3}>
                <ArrowLeftOutlined onClick={() => navigate('/menu-management')} style={{ marginRight: 16, cursor: 'pointer' }} />
                Chỉnh Sửa Thực Đơn Tuần ID: {id}
            </Title>
            <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Spin spinning={fetchingData} tip="Đang tải dữ liệu thực đơn...">
                    <Form
                        form={form}
                        layout="vertical"
                        name="update_menu_page_form"
                        initialValues={{ days: [] }}
                    >
                        <Space style={{ marginTop: 24 }}>
                            <Button 
                                type="primary" 
                                icon={<SaveOutlined />} 
                                onClick={handleFormSubmit} 
                                loading={loading}
                                disabled={fetchingData}
                            >
                                Lưu Thay Đổi
                            </Button>
                            <Button onClick={() => navigate('/menu-management')} disabled={loading || fetchingData}>
                                Hủy
                            </Button>
                        </Space>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default EditMenuPage;