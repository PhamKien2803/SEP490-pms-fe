import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Table,
    Button,
    Space,
    Input,
    Tooltip,
    Typography,
    Card,
} from "antd";
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { IRevenueItem } from "../../types/revenues";
import { revenuesApis } from "../../services/apiServices";
import { usePageTitle } from "../../hooks/usePageTitle";
import { constants } from "../../constants";
import RevenueDetailsModal from "../../modal/revenues-details/RevenueDetailsModal";
import DeleteModal from "../../modal/delete-modal/DeleteModal";
import { usePagePermission } from "../../hooks/usePagePermission";

const { Title } = Typography;
const { Search } = Input;

const RevenueList: React.FC = () => {
    usePageTitle("Quản lý khoản thu - Cá Heo Xanh");
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const navigate = useNavigate();

    const [revenues, setRevenues] = useState<IRevenueItem[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [showModal, setShowModal] = useState(false);
    const [selectedRevenueId, setSelectedRevenueId] = useState<string | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchRevenues = useCallback(async () => {
        setLoading(true);
        try {
            const res = await revenuesApis.getListRevenues({
                page: 1,
                limit: 1000,
            });
            setRevenues(res.data || []);
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Không thể tải danh sách khoản thu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRevenues();
    }, [fetchRevenues]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchKeyword]);

    const filteredRevenues = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return revenues;
        return revenues.filter(r =>
            r.revenueName.toLowerCase().includes(keyword) ||
            r.revenueCode.toLowerCase().includes(keyword)
        );
    }, [revenues, searchKeyword]);

    const paginatedRevenues = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        return filteredRevenues.slice(start, start + pagination.pageSize);
    }, [filteredRevenues, pagination]);

    const handleTableChange = (p: any) => {
        setPagination({ current: p.current, pageSize: p.pageSize });
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await revenuesApis.deleteRevenue(deletingId);
            toast.success("Xóa khoản thu thành công!");

            setRevenues(prev => {
                const newData = prev.filter(r => r._id !== deletingId);
                const maxPage = Math.ceil(newData.length / pagination.pageSize);
                setPagination(p => ({
                    ...p,
                    current: Math.min(p.current, maxPage || 1),
                }));
                return newData;
            });

            setShowDeleteModal(false);
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Xóa khoản thu thất bại");
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const columns = [
        { title: "Mã", dataIndex: "revenueCode", width: 120 },
        { title: "Tên khoản thu", dataIndex: "revenueName", width: 200 },
        { title: "Đơn vị", dataIndex: "unit", width: 120 },
        {
            title: "Số tiền",
            dataIndex: "amount",
            width: 150,
            render: (val: number) => val.toLocaleString("vi-VN") + "₫",
        },
        { title: "Người tạo", dataIndex: "createdBy", width: 150 },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 160,
            render: (val: string) => new Date(val).toLocaleString(),
        },
        {
            title: "Hành động",
            width: 120,
            render: (_: any, record: IRevenueItem) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setSelectedRevenueId(record._id);
                                setShowModal(true);
                            }}
                        />
                    </Tooltip>
                    {canUpdate && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() =>
                                    navigate(`${constants.APP_PREFIX}/revenues/edit/${record._id}`)
                                }
                            />
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Xóa">
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => {
                                    setDeletingId(record._id);
                                    setShowDeleteModal(true);
                                }}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title={
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                        <Title level={3} style={{ margin: 0 }}>Quản lý khoản thu</Title>
                        <Space>
                            <Search
                                placeholder="Tìm theo tên hoặc mã khoản thu"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                allowClear
                                style={{ width: 250 }}
                            />
                            <Tooltip title="Làm mới danh sách">
                                <Button icon={<ReloadOutlined />} onClick={fetchRevenues} loading={loading} />
                            </Tooltip>
                            {canCreate && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate(`${constants.APP_PREFIX}/revenues/create`)}
                                >
                                    Tạo mới
                                </Button>
                            )}
                        </Space>
                    </Space>
                }
            >
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={paginatedRevenues}
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredRevenues.length,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                        showTotal: (t, r) => `${r[0]}–${r[1]} của ${t} khoản thu`,
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <RevenueDetailsModal
                open={showModal}
                revenueId={selectedRevenueId}
                onClose={() => {
                    setShowModal(false);
                    setSelectedRevenueId(null);
                }}
            />

            <DeleteModal
                open={showDeleteModal}
                loading={isDeleting}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default RevenueList;
