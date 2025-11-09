import {
    Table,
    Button,
    Space,
    Popconfirm,
    Select,
    Typography,
    Tag,
    Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ReceiptItem, ReceiptListResponse } from "../../types/receipts";
import { receiptsApis, schoolYearApis } from "../../services/apiServices";
import {
    SchoolYearListItem,
    SchoolYearsListResponse,
} from "../../types/schoolYear";
import { toast } from "react-toastify";
import { usePageTitle } from "../../hooks/usePageTitle";
import { constants } from "../../constants";
import { useNavigate } from "react-router-dom";
import { usePagePermission } from "../../hooks/usePagePermission";
const { Title } = Typography;
const { Option } = Select;

function ReceiptsManagement() {
    const navigate = useNavigate();
    usePageTitle("Quản lý biên lai - Cá Heo Xanh");
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const [data, setData] = useState<ReceiptItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [schoolYear, setSchoolYear] = useState<string | undefined>();
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);

    const fetchSchoolYears = async () => {
        try {
            const res: SchoolYearsListResponse = await schoolYearApis.getSchoolYearList({
                page: 1,
                limit: 100,
            });
            const sorted = [...res.data].sort(
                (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
            setSchoolYears(sorted);
            if (!schoolYear && sorted.length > 0) {
                setSchoolYear(sorted[0].schoolYear);
            }
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error("Không thể tải danh sách năm học");
        }
    };

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const res: ReceiptListResponse = await receiptsApis.getReceiptList({
                page,
                limit,
                schoolYear: schoolYear || "",
            });
            setData(res.data);
            setTotal(res.page.totalCount);
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error("Không thể tải danh sách biên lai");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        if (schoolYear) {
            fetchReceipts();
        }
    }, [page, limit, schoolYear]);

    const handleDelete = async (id: string) => {
        try {
            await receiptsApis.deleteReceipt(id);
            toast.success("Xoá biên lai thành công");
            fetchReceipts();
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error("Xoá thất bại");
        }
    };


    const columns: ColumnsType<ReceiptItem> = [
        {
            title: "Mã biên lai",
            dataIndex: "receiptCode",
        },
        {
            title: "Tên biên lai",
            dataIndex: "receiptName",
        },
        {
            title: "Tháng",
            dataIndex: "month",
        },
        {
            title: "Người tạo",
            dataIndex: "createdBy",
        },
        {
            title: "Trạng thái",
            dataIndex: "state",
            render: (state: string) => {
                const stateMap: Record<string, { color: string; label: string }> = {
                    CONFIRMED: { color: "green", label: "Đã xác nhận" },
                    PENDING: { color: "blue", label: "Chờ xác nhận" },
                };

                const display = stateMap[state] || { color: "default", label: state };

                return <Tag color={display.color}>{display.label}</Tag>;
            },

        },
        {
            title: "Hành động",
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`${constants.APP_PREFIX}/receipts/detail/${record._id}`)}
                    />
                    {canUpdate && (
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`${constants.APP_PREFIX}/receipts/edit/${record._id}`)}
                        />
                    )}
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xoá biên lai này không?"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        {canDelete && (
                            <Button type="link" danger icon={<DeleteOutlined />} />
                        )}
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>Quản lý biên lai</Title>
            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Chọn năm học"
                    allowClear
                    style={{ width: 240 }}
                    onChange={(value) => setSchoolYear(value)}
                    value={schoolYear}
                >
                    {schoolYears.map((item) => (
                        <Option key={item._id} value={item.schoolYear}>
                            {item.schoolYear}
                        </Option>
                    ))}
                </Select>
                <Tooltip title="Làm mới danh sách">
                    <Button icon={<ReloadOutlined />}
                        onClick={() => fetchReceipts()}
                        loading={loading}></Button>
                </Tooltip>
                {canCreate && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/receipts/create`)}>
                        Tạo biên lai
                    </Button>
                )}
            </Space>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                    onChange: (newPage, newPageSize) => {
                        setPage(newPage);
                        setLimit(newPageSize);
                    },
                    showSizeChanger: true,
                }}
            />
        </div>
    );
}

export default ReceiptsManagement;
