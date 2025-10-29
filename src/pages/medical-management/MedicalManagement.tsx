import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Card,
    Tooltip,
    Tag,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { medicalApis } from "../../services/apiServices";
import { usePagePermission } from "../../hooks/usePagePermission";
import { toast } from "react-toastify";
import { constants } from "../../constants";
import { useNavigate } from "react-router-dom";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import { HealthCertRecord } from "../../types/medical-management";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MedicalManagement: React.FC = () => {
    const navigate = useNavigate();
    const [dataMedicals, setDataMedicals] = useState<HealthCertRecord[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { canCreate, canUpdate, canDelete } = usePagePermission();

    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 5,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
        position: ["bottomCenter"],
        showTotal: (total) => `Tổng số: ${total} bản ghi`,
    });

    const fetchListMedical = useCallback(
        async (params: { page: number; limit: number }) => {
            setLoading(true);
            try {
                const response = await medicalApis.getListMedical(params);
                setDataMedicals(response.data);
                setPagination((prev) => ({
                    ...prev,
                    total: response.page.totalCount,
                    current: response.page.page,
                    pageSize: response.page.limit,
                }));
            } catch (error) {
                toast.error("Không thể tải danh sách hồ sơ sức khỏe.");
                setDataMedicals([]);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchListMedical({
            page: pagination.current!,
            limit: pagination.pageSize!,
        });
    }, [fetchListMedical, pagination.current, pagination.pageSize]);

    const filteredMedicals = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return dataMedicals;
        return dataMedicals.filter(
            (item) =>
                item.student.fullName.toLowerCase().includes(keyword) ||
                item.student.studentCode.toLowerCase().includes(keyword)
        );
    }, [dataMedicals, searchKeyword]);

    const handleTableChange = useCallback(
        (newPagination: TablePaginationConfig) => {
            setPagination((prev) => ({
                ...prev,
                current: newPagination.current,
                pageSize: newPagination.pageSize,
            }));
        },
        []
    );

    const handleOpenDeleteModal = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await medicalApis.deleteMedical(deletingId);
            toast.success("Xóa hồ sơ sức khỏe thành công!");
            setIsDeleteModalOpen(false);

            if (dataMedicals.length === 1 && pagination.current! > 1) {
                setPagination((prev) => ({ ...prev, current: prev.current! - 1 }));
            } else {
                fetchListMedical({
                    page: pagination.current!,
                    limit: pagination.pageSize!,
                });
            }
        } catch (error) {
            toast.error("Xóa hồ sơ sức khỏe thất bại.");
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const columns: ColumnsType<HealthCertRecord> = useMemo(
        () => [
            {
                title: "STT",
                key: "stt",
                width: 60,
                align: "center",
                className: "ant-table-header-nowrap",
                render: (_, __, index) => {
                    const page = pagination.current ?? 1;
                    const pageSize = pagination.pageSize ?? 5;
                    return (page - 1) * pageSize + index + 1;
                },
            },
            {
                title: "Mã HS",
                dataIndex: ["student", "studentCode"],
                key: "studentCode",
                width: 100,
                className: "ant-table-header-nowrap",
                render: (text) => <Text>{text}</Text>,
            },
            {
                title: "Tên Học sinh",
                dataIndex: ["student", "fullName"],
                key: "fullName",
                width: 150,
                className: "ant-table-header-nowrap",
            },
            {
                title: "Ngày sinh",
                dataIndex: ["student", "dob"],
                key: "dob",
                width: 120,
                render: (dob: string) => dayjs(dob).format("DD/MM/YYYY"),
            },
            {
                title: "Chiều cao (cm)",
                dataIndex: ["physicalDevelopment", "height"],
                key: "height",
                width: 100,
                align: "center",
                className: "ant-table-header-nowrap",
            },
            {
                title: "Cân nặng (kg)",
                dataIndex: ["physicalDevelopment", "weight"],
                key: "weight",
                width: 100,
                align: "center",
                className: "ant-table-header-nowrap",
            },
            {
                title: "Trạng thái SK",
                dataIndex: ["conclusion", "healthStatus"],
                key: "healthStatus",
                width: 150,
                className: "ant-table-header-nowrap",
                render: (status: string) => (
                    <Tag
                        color="default"
                        style={{ whiteSpace: "nowrap" }}
                    >
                        {status}
                    </Tag>
                ),
            },
            {
                title: "Hành động",
                key: "action",
                align: "left",
                width: 110,
                className: "ant-table-header-nowrap",
                render: (_: unknown, record: HealthCertRecord) => {

                    const medicalPrefix = `${constants.APP_PREFIX}/medicals`;

                    return (
                        <Space size="small">
                            <Tooltip title="Xem chi tiết">
                                <Button
                                    type="text"
                                    icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                                    onClick={() => navigate(`${medicalPrefix}/view/${record._id}`)}
                                />
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa hồ sơ">
                                {canUpdate && (
                                    <Button
                                        type="text"
                                        icon={<EditOutlined style={{ color: "#1890ff" }} />}
                                        onClick={() => navigate(`${medicalPrefix}/edit/${record._id}`)}
                                    />
                                )}
                            </Tooltip>
                            <Tooltip title="Xóa hồ sơ">
                                {canDelete && (
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleOpenDeleteModal(record._id)}
                                    />
                                )}
                            </Tooltip>
                        </Space>
                    );
                },
            },
        ],
        [canUpdate, canDelete, handleOpenDeleteModal, navigate, pagination.current, pagination.pageSize]
    );

    const cardHeader = useMemo(
        () => (
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        Quản lý Hồ sơ Sức khỏe Học sinh
                    </Title>
                </Col>
                <Col>
                    <Space>
                        <Input.Search
                            placeholder="Mã HS, Tên HS..."
                            style={{ width: 250 }}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            allowClear
                        />
                        <Tooltip title="Làm mới danh sách">
                            <Button
                                style={{ marginRight: 5 }}
                                icon={<ReloadOutlined />}
                                onClick={() =>
                                    fetchListMedical({
                                        page: pagination.current!,
                                        limit: pagination.pageSize!,
                                    })
                                }
                                loading={loading}
                            />
                        </Tooltip>
                        {canCreate && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate(`${constants.APP_PREFIX}/medicals/create`)}
                            >
                                Tạo mới
                            </Button>
                        )}
                    </Space>
                </Col>
            </Row>
        ),
        [searchKeyword, canCreate, navigate, fetchListMedical, pagination.current, pagination.pageSize, loading]
    );

    return (
        <div style={{ padding: "22px" }}>
            <Card
                title={cardHeader}
                bordered={false}
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredMedicals}
                    loading={loading}
                    rowKey="_id"
                    pagination={searchKeyword.trim() ? false : pagination}
                    onChange={handleTableChange}
                />
            </Card>

            <ModalConfirm
                open={isDeleteModalOpen}
                loading={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Bạn có chắc chắn muốn xóa hồ sơ sức khỏe này không? Hành động này không thể hoàn tác."
            />
        </div>
    );
};

export default MedicalManagement;