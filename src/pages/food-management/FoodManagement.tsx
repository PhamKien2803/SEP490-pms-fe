import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Typography,
    Row,
    Col,
    Card,
    Button,
    Space,
    Select,
    Empty,
    Table,
    Tooltip,
    Input,
    DatePicker,
    Tag,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    AppstoreOutlined,
    EyeOutlined,
    FilterOutlined,
    RobotOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import { constants } from "../../constants";

import { foodApis } from "../../services/apiServices";
import type { ColumnsType } from "antd/es/table";
import { FoodListParams, FoodListResponse, FoodRecord } from "../../types/food-management";
import { usePageTitle } from "../../hooks/usePageTitle";

dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const usePagePermission = () => ({
    canCreate: true,
    canUpdate: true,
    canDelete: true,
});

const AGE_GROUPS = [
    { value: "2", label: "1-3 tuổi" },
    { value: "3", label: "4-5 tuổi" }
];

const FoodManagement: React.FC = () => {
    usePageTitle('Món ăn tuần - Cá Heo Xanh');
    const navigate = useNavigate();

    const [allFoodList, setAllFoodList] = useState<FoodRecord[]>([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
    });

    const [_, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [isAITriggering, setIsAITriggering] = useState<boolean>(false);

    const { canCreate, canUpdate, canDelete } = usePagePermission();

    // Ngăn người dùng rời trang khi đang kích hoạt AI
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isAITriggering) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        if (isAITriggering) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isAITriggering]);

    const fetchAllFoods = useCallback(async () => {
        setLoading(true);
        try {
            //set limit lớn nhất để filter
            const apiParams: FoodListParams = {
                page: 1,
                limit: 1000,
                active: true,
            } as unknown as FoodListParams;

            const response: FoodListResponse = await foodApis.getListFood(apiParams);
            const mappedData = response?.data || [];
            setAllFoodList(mappedData);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Tải danh sách món ăn thất bại.");
            setAllFoodList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllFoods();
    }, [fetchAllFoods]);

    const handleTriggerAICalculation = async () => {
        setIsAITriggering(true);
        try {
            const response = await foodApis.triggerAICalculation();
            toast.success(response.message || "Kích hoạt tính toán Calo AI thành công!");
            await fetchAllFoods();
        } catch (error: any) {
            typeof error === "string" ? toast.info(error) : toast.error("Kích hoạt tính toán thất bại.");
        } finally {
            setIsAITriggering(false);
        }
    };

    const processedData = useMemo(() => {
        let data = [...allFoodList];

        if (searchKeyword.trim()) {
            const lowerKeyword = searchKeyword.trim().toLowerCase();
            data = data.filter(item =>
                item.foodName?.toLowerCase().includes(lowerKeyword)
            );
        }

        if (selectedAgeGroup) {
            data = data.filter(item => String(item.ageGroup) === selectedAgeGroup);
        }

        if (selectedDateRange) {
            const [start, end] = selectedDateRange;
            data = data.filter(item => {
                const created = dayjs(item.createdAt);
                return created.isBetween(start, end, 'day', '[]');
            });
        }

        return data;
    }, [allFoodList, searchKeyword, selectedAgeGroup, selectedDateRange]);

    const paginatedData = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        return processedData.slice(startIndex, endIndex);
    }, [processedData, pagination.page, pagination.limit]);

    const handlePaginationChange = (newPagination: any) => {
        setPagination((prev) => ({
            ...prev,
            page: newPagination.current,
            limit: newPagination.pageSize,
        }));
    };

    const handleAgeGroupChange = (value: string) => {
        setSelectedAgeGroup(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        setSelectedDateRange(dates as [Dayjs, Dayjs] | null);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDeleteFood = (foodId: string) => {
        setDeletingId(foodId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await foodApis.deleteFood(deletingId);
            toast.success("Xóa món ăn thành công!");

            // Xóa trực tiếp khỏi state để không cần gọi lại API fetchAll
            setAllFoodList(prev => prev.filter(item => item._id !== deletingId));
            setSelectedRowKeys(prev => prev.filter(key => key !== deletingId));

            setIsDeleteModalOpen(false);
            setDeletingId(null);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Xóa món ăn thất bại.");
        } finally {
            setIsDeleting(false);
        }
    };

    const navigateToCreate = () => {
        navigate(`${constants.APP_PREFIX}/foods/create`);
    }

    const navigateToEdit = (foodRecord: FoodRecord) => {
        navigate(`${constants.APP_PREFIX}/foods/edit/${foodRecord._id}`, {
            state: { foodDetail: foodRecord }
        });
    }

    const columns: ColumnsType<FoodRecord> = [
        {
            title: "STT",
            key: "index",
            width: 70,
            align: "center",
            render: (_text, _record, index) =>
                (pagination.page - 1) * pagination.limit + index + 1,
        },
        {
            title: "Tên Món Ăn",
            dataIndex: "foodName",
            key: "foodName",
            width: 250,
            ellipsis: true,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Nhóm Tuổi",
            dataIndex: "ageGroup",
            key: "ageGroup",
            width: 140,
            align: "center",
            render: (ageGroup) => {
                const ageGroupString = String(ageGroup);
                const group = AGE_GROUPS.find((g) => g.value === ageGroupString);
                return (
                    <Tooltip title={`Món ăn cho ${group?.label || ageGroupString}`}>
                        <Tag color="blue" style={{ minWidth: 80, textAlign: 'center' }}>
                            {group?.label || ageGroupString}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: "Tổng Calo (kcal)",
            dataIndex: "totalCalories",
            key: "totalCalories",
            width: 150,
            align: "center",
            render: (calo) => (
                <Text strong type="danger">
                    {Number(calo)?.toLocaleString('vi-VN') || 0}
                </Text>
            ),
        },
        {
            title: "Ngày Tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 140,
            render: (date) => <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>,
        },
        {
            title: "Trạng Thái",
            dataIndex: "active",
            key: "active",
            width: 120,
            align: "center",
            render: (active) => (
                <Tag color={active ? "green" : "red"}>
                    {active ? "Hoạt động" : "Ẩn"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            width: 160,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem Chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                            size="small"
                            onClick={() =>
                                navigate(`${constants.APP_PREFIX}/foods/view/${record._id}`, {
                                    state: { foodDetail: record }
                                })
                            }
                            disabled={loading || isAITriggering}
                        />
                    </Tooltip>
                    {canUpdate && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="text"
                                icon={<EditOutlined style={{ color: "#1890ff" }} />}
                                size="small"
                                onClick={() => navigateToEdit(record)}
                                disabled={loading || isAITriggering}
                            />
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Xóa món ăn">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                onClick={() => handleDeleteFood(record._id)}
                                disabled={loading || isAITriggering}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const cardHeader = useMemo(
        () => (
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Title level={3} style={{ margin: 0, paddingTop: 15 }}>
                        <AppstoreOutlined style={{ marginRight: 8 }} /> Quản lý Món ăn
                    </Title>
                </Col>

                <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
                    <Button
                        type="primary"
                        icon={<RobotOutlined />}
                        onClick={handleTriggerAICalculation}
                        loading={isAITriggering}
                        disabled={loading || isAITriggering}
                        style={{ marginLeft: 16, marginTop: 15, marginBottom: 15 }}
                    >
                        {isAITriggering ? 'Đang tính Calo AI...' : 'Kích hoạt Tính Calo AI (Calo=0)'}
                    </Button>
                </Col>

                <Col xs={24} style={{ marginBottom: 15 }}>
                    <Row justify="space-between" align="middle" gutter={[16, 16]}>
                        <Col>
                            <Space wrap size="middle" style={{ marginTop: 16 }}>
                                <Text strong><FilterOutlined style={{ marginRight: 4 }} /> Lọc:</Text>
                                <Select
                                    placeholder="Chọn Nhóm tuổi"
                                    style={{ width: 200 }}
                                    value={selectedAgeGroup}
                                    onChange={handleAgeGroupChange}
                                    disabled={loading}
                                >
                                    <Option key="all" value="">Tất cả nhóm tuổi</Option>
                                    {AGE_GROUPS.map((group) => (
                                        <Option key={group.label} value={group.label}>
                                            {group.label}
                                        </Option>
                                    ))}
                                </Select>
                                <Search
                                    placeholder="Tìm món ăn..."
                                    style={{ width: 250 }}
                                    value={searchKeyword}
                                    onChange={(e) => {
                                        setSearchKeyword(e.target.value);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    allowClear
                                />
                                <RangePicker
                                    format="DD/MM/YYYY"
                                    placeholder={["Ngày tạo từ", "đến"]}
                                    allowClear={true}
                                    value={selectedDateRange}
                                    onChange={handleDateRangeChange}
                                    style={{ width: 250 }}
                                />
                            </Space>
                        </Col>

                        <Col style={{ marginTop: 16 }}>
                            <Space wrap size="middle">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchAllFoods}
                                    loading={loading}
                                    disabled={isAITriggering}
                                >
                                    Làm mới Dữ liệu
                                </Button>

                                {canCreate && (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={navigateToCreate}
                                        loading={loading || isAITriggering}
                                        disabled={loading || isAITriggering}
                                    >
                                        Tạo mới
                                    </Button>
                                )}
                            </Space>
                        </Col>
                    </Row>
                </Col>
            </Row>
        ),
        [
            selectedAgeGroup,
            selectedDateRange,
            canCreate,
            loading,
            navigateToCreate,
            searchKeyword,
            isAITriggering,
            fetchAllFoods
        ]
    );

    return (
        <div style={{ padding: "16px 24px" }}>
            <Card
                title={cardHeader}
                bordered={false}
                size="small"
                style={{ boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)", borderRadius: 8 }}
                bodyStyle={{ padding: 0 }}
            >
                <Table
                    columns={columns}
                    dataSource={paginatedData}
                    rowKey="_id"
                    loading={loading}
                    onChange={handlePaginationChange}
                    size="small"
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: processedData.length,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} mục`,
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                description={`Không tìm thấy món ăn nào phù hợp với bộ lọc hiện tại.`}
                            />
                        ),
                    }}
                />
            </Card>

            <ModalConfirm
                open={isDeleteModalOpen}
                loading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Bạn có chắc chắn muốn xóa món ăn này không? Hành động này không thể hoàn tác."
            />
        </div>
    );
};

export default FoodManagement;