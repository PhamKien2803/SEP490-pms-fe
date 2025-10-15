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
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import { constants } from "../../constants";

import { foodApis } from "../../services/apiServices"; 
import type { ColumnsType } from "antd/es/table";
import { FoodListParams, FoodListResponse, FoodRecord } from "../../types/food-management"; 

// ... (Các định nghĩa constants, interfaces Pagination, AGE_GROUPS giữ nguyên)
const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const usePagePermission = () => ({
    canCreate: true,
    canUpdate: true,
    canDelete: true,
});

interface Pagination {
    page: number;
    limit: number;
    total: number;
}

const AGE_GROUPS = [
    { value: "1", label: "Dưới 1 tuổi" },
    { value: "2", label: "1-3 tuổi" },
    { value: "3", label: "4-5 tuổi" }
];

const FoodManagement: React.FC = () => {
    const navigate = useNavigate();
    const defaultDateRange = useMemo<[Dayjs, Dayjs]>(() => {
        const now = dayjs();
        const oneYearAgo = now.subtract(1, "year");
        return [oneYearAgo, now];
    }, []);

    const [foodList, setFoodList] = useState<FoodRecord[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
    });

    // 🌟 Giữ lại state cho Checkbox chọn hàng (dù không dùng để tính calo)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); 
    // -----------------------------------------------------------------------
    
    const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [selectedDateRange, setSelectedDateRange] = useState<
        [Dayjs, Dayjs] | null
    >(defaultDateRange);

    const [loading, setLoading] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    // 🌟 State cho API kích hoạt tính calo chung (API GET không tham số)
    const [isAITriggering, setIsAITriggering] = useState<boolean>(false); 

    const { canCreate, canUpdate, canDelete } = usePagePermission();

    // 🌟 Hàm gọi API KÍCH HOẠT TÍNH CALO CHUNG (API GET: /caculate-calo)
    const handleTriggerAICalculation = async () => {
        setIsAITriggering(true);
        try {
            // Gọi API GET không cần tham số
            const response = await foodApis.triggerAICalculation(); 
            
            toast.success(response.message || "Kích hoạt tính toán Calo AI thành công!");
            
            // Sau khi tính toán xong, tải lại danh sách
            fetchFoodList(
                pagination.page,
                pagination.limit,
                selectedAgeGroup,
                searchKeyword,
                selectedDateRange
            );
        } catch (error: any) {
            console.error("Lỗi kích hoạt tính toán Calo AI:", error);
            const errorMessage = error.response?.data?.message || "Kích hoạt tính toán thất bại. Vui lòng thử lại.";
            toast.error(errorMessage);
        } finally {
            setIsAITriggering(false);
        }
    };
    // ----------------------------------------------------

    const fetchFoodList = useCallback(
        async (
            page: number,
            limit: number,
            ageGroup: string,
            keyword: string,
            dateRange: [Dayjs, Dayjs] | null
        ) => {
            setLoading(true);

            const weekStart = dateRange ? dateRange[0].format("YYYY-MM-DD") : "";
            const weekEnd = dateRange ? dateRange[1].format("YYYY-MM-DD") : "";

            const params = {
                page,
                limit,
                ageGroup: ageGroup || undefined,
                weekStart: weekStart,
                weekEnd: weekEnd,
                keyword: keyword || undefined,
                active: true,
            };

            const apiParams: FoodListParams = {
                page: params.page,
                limit: params.limit,
                ageGroup: params.ageGroup,
                weekStart: params.weekStart,
                weekEnd: params.weekEnd,
                keyword: params.keyword,
                active: params.active,
            } as FoodListParams;

            try {
                const response: FoodListResponse = await foodApis.getListFood(apiParams);

                const mappedData = response?.data || [];
                setFoodList(mappedData);

                setPagination((prev) => ({
                    page: response?.page?.page || prev.page,
                    limit: response?.page?.limit || prev.limit,
                    total: response?.page?.totalCount || 0,
                }));
            } catch (error) {
                console.error("Lỗi tải danh sách món ăn:", error);
                toast.error("Tải danh sách món ăn thất bại. Vui lòng thử lại.");
                setFoodList([]);
                setPagination((prev) => ({ ...prev, total: 0 }));
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchFoodList(
            pagination.page,
            pagination.limit,
            selectedAgeGroup,
            searchKeyword,
            selectedDateRange
        );
    }, [
        fetchFoodList,
        selectedAgeGroup,
        searchKeyword,
        selectedDateRange,
        pagination.page,
        pagination.limit,
    ]);

    const handlePaginationChange = (newPagination: any) => {
        setPagination((prev) => ({
            ...prev,
            page: newPagination.current,
            limit: newPagination.pageSize,
        }));
    };

    const handleAgeGroupChange = (value: string) => {
        setSelectedAgeGroup(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
        setSelectedRowKeys([]); // Reset chọn hàng khi lọc
    };

    const handleDateRangeChange = (
        dates: [Dayjs | null, Dayjs | null] | null
    ) => {
        setSelectedDateRange(dates as [Dayjs, Dayjs] | null);
        setPagination((prev) => ({ ...prev, page: 1 }));
        setSelectedRowKeys([]); // Reset chọn hàng khi lọc
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
            setIsDeleteModalOpen(false);
            setDeletingId(null);
            
            // Bỏ chọn nếu món bị xóa
            setSelectedRowKeys(prev => prev.filter(key => key !== deletingId)); 

            fetchFoodList(
                pagination.page,
                pagination.limit,
                selectedAgeGroup,
                searchKeyword,
                selectedDateRange
            );
        } catch (error) {
            console.error("Lỗi xóa món ăn:", error);
            toast.error("Xóa món ăn thất bại. Vui lòng thử lại.");
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

    // 🌟 Cấu hình Row Selection
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
        getCheckboxProps: (record: FoodRecord) => ({
            disabled: loading || isAITriggering, // Vô hiệu hóa khi đang xử lý
        }),
    };
    // -----------------------------

    const columns: ColumnsType<FoodRecord> = [
        // ... (Columns giữ nguyên)
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
                    />
                </Tooltip>
                    {canUpdate && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="text"
                                icon={<EditOutlined style={{ color: "#1890ff" }} />}
                                size="small"
                                onClick={() => navigateToEdit(record)}
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
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const filteredFoods = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return foodList;
        return foodList.filter(
            (item) =>
                item.foodName?.toLowerCase().includes(keyword)
        );
    }, [foodList, searchKeyword]);

    const cardHeader = useMemo(
        () => (
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Title level={3} style={{ margin: 0, paddingTop: 15 }}>
                        <AppstoreOutlined style={{ marginRight: 8 }} /> Quản lý Món ăn
                    </Title>
                </Col>

                {/* 🌟 Nút Kích hoạt Tính Calo AI chung (Dùng API GET không tham số) */}
                <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
                    <Card size="small" style={{ display: 'inline-block', border: '1px solid #d9d9d9', marginTop: 15 }}>
                        <Text strong style={{ color: '#000', fontSize: '0.9em' }}>
                            {selectedRowKeys.length > 0 ? 
                                `Đã chọn ${selectedRowKeys.length} món ăn.` :
                                'Chưa chọn món ăn nào.'}
                        </Text>
                    </Card>

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
                {/* --------------------------- */}

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
                                    onChange={(e) => setSearchKeyword(e.target.value)}
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
                            {canCreate && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={navigateToCreate}
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Tạo mới
                                </Button>
                            )}
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
            handleAgeGroupChange, 
            handleDateRangeChange, 
            searchKeyword,
            // Dependencies cho tính năng mới
            isAITriggering,
            handleTriggerAICalculation,
            selectedRowKeys.length
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
                    dataSource={filteredFoods}
                    rowKey="_id"
                    loading={loading}
                    onChange={handlePaginationChange}
                    size="small"
                    // 🌟 Áp dụng rowSelection để có checkbox
                    rowSelection={rowSelection} 
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        pageSizeOptions: ["10", "20", "50"],
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