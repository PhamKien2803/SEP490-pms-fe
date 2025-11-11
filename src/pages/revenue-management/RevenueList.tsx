import React, { useEffect, useRef, useState } from "react";
import {
    Table,
    Button,
    Space,
    Input,
    Tooltip,
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

import { IRevenueItem, RevenueListResponse } from "../../types/revenues";
import { revenuesApis } from "../../services/apiServices";
import { usePageTitle } from "../../hooks/usePageTitle";
import { constants } from "../../constants";
import RevenueDetailsModal from "../../modal/revenues-details/RevenueDetailsModal";
import DeleteModal from "../../modal/delete-modal/DeleteModal";
import { usePagePermission } from "../../hooks/usePagePermission";

const RevenueList: React.FC = () => {
    usePageTitle("Quản lý khoản thu - Cá Heo Xanh");
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingLoading, setDeletingLoading] = useState(false);
    const [data, setData] = useState<IRevenueItem[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedRevenueId, setSelectedRevenueId] = useState<string | null>(null);
    const debounceRef = useRef<number | null>(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res: RevenueListResponse = await revenuesApis.getListRevenues({
                page: pagination.page,
                limit: pagination.limit,
            });

            const filtered = searchTerm
                ? res.data.filter((item) =>
                    item.revenueName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                : res.data;

            setData(filtered);
            setPagination((prev) => ({
                ...prev,
                total: res.page.totalCount,
            }));
        } catch (err) {
            typeof err === "string" ? toast.info(err) : toast.error("Không thể tải danh sách khoản thu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.page, pagination.limit, searchTerm]);

    const handleDelete = async () => {
        if (!deletingId) return;

        setDeletingLoading(true);
        try {
            await revenuesApis.deleteRevenue(deletingId);
            toast.success("Đã xóa khoản thu thành công");
            fetchData();
            setShowDeleteModal(false);
            setDeletingId(null);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Xóa thất bại");
        } finally {
            setDeletingLoading(false);
        }
    };


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setSearchTerm(value);
        }, 500);
    };

    const columns = [
        {
            title: "Mã",
            dataIndex: "revenueCode",
        },
        {
            title: "Tên khoản thu",
            dataIndex: "revenueName",
        },
        {
            title: "Đơn vị",
            dataIndex: "unit",
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            render: (val: number) => val.toLocaleString("vi-VN") + "₫",
        },
        {
            title: "Người tạo",
            dataIndex: "createdBy",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: (val: string) => new Date(val).toLocaleString(),
        },
        {
            title: "Hành động",
            render: (_: any, record: IRevenueItem) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedRevenueId(record._id);
                            setShowModal(true);
                        }}
                    />
                    {canUpdate && (
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => navigate(`${constants.APP_PREFIX}/revenues/edit/${record._id}`)}
                        />
                    )}
                    {canDelete && (
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                                setDeletingId(record._id);
                                setShowDeleteModal(true);
                            }}
                        />
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space
                style={{
                    marginBottom: 16,
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <h2>Quản lý khoản thu</h2>
                {canCreate && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`${constants.APP_PREFIX}/revenues/create`)}
                    >
                        Tạo khoản thu
                    </Button>
                )}
            </Space>
            <Tooltip title="Làm mới danh sách">
                <Button icon={<ReloadOutlined />}
                    onClick={() => fetchData()}
                    loading={loading}></Button>
            </Tooltip>
            <Input.Search
                placeholder="Tìm theo tên khoản thu"
                value={inputValue}
                onChange={handleSearchChange}
                allowClear
                style={{ marginBottom: 16, maxWidth: 300 }}
            />

            <Table
                rowKey="_id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    showSizeChanger: true,
                    onChange: (page, pageSize) =>
                        setPagination({ ...pagination, page, limit: pageSize }),
                }}
            />
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
                loading={deletingLoading}
                onClose={() => {
                    if (!deletingLoading) {
                        setShowDeleteModal(false);
                        setDeletingId(null);
                    }
                }}
                onConfirm={handleDelete}
            />

        </div>
    );
};

export default RevenueList;
