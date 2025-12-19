import {
    Table,
    Button,
    Space,
    Select,
    Typography,
    Tag,
    Tooltip,
    Input,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ReceiptItem } from "../../types/receipts";
import { receiptsApis, schoolYearApis } from "../../services/apiServices";
import type { SchoolYearListItem } from "../../types/schoolYear";
import { toast } from "react-toastify";
import { usePageTitle } from "../../hooks/usePageTitle";
import { constants } from "../../constants";
import { useNavigate } from "react-router-dom";
import { usePagePermission } from "../../hooks/usePagePermission";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const receiptStates = [
    "Đã xác nhận",
    "Chưa xác nhận",
    "Đã thanh toán",
    "Chờ thanh toán",
    "Đã huỷ",
];

function ReceiptsManagement() {
    usePageTitle("Quản lý biên lai - Cá Heo Xanh");
    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = usePagePermission();

    const [data, setData] = useState<ReceiptItem[]>([]);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [schoolYear, setSchoolYear] = useState<SchoolYearListItem | undefined>();
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterState, setFilterState] = useState<string | undefined>();

    const fetchSchoolYears = async () => {
        try {
            const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
            const sorted = [...res.data].sort(
                (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
            setSchoolYears(sorted);
            const activeYear = sorted.find(y => y.state === "Đang hoạt động");
            if (activeYear) {
                setSchoolYear(activeYear);
            } else if (!schoolYear && sorted.length > 0) {
                setSchoolYear(sorted[0]);
            }
        } catch (err) {
            typeof err === "string"
                ? toast.info(err)
                : toast.error("Không thể tải danh sách năm học");
        }
    };

    const fetchReceipts = async () => {
        if (!schoolYear) return;
        try {
            setLoading(true);
            const res = await receiptsApis.getReceiptList({
                schoolYear: schoolYear.schoolYear,
                page: 1,
                limit: 1000,
            });
            setData(res.data || []);
        } catch (err) {
            typeof err === "string"
                ? toast.info(err)
                : toast.error("Không thể tải danh sách biên lai");
            setData([]);
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
    }, [schoolYear]);

    useEffect(() => {
        setPagination(p => ({ ...p, current: 1 }));
    }, [searchKeyword, filterState]);

    const filteredData = useMemo(() => {
        const keyword = searchKeyword.toLowerCase().trim();
        return data.filter((item) => {
            const matchesKeyword =
                !keyword ||
                item.receiptCode.toLowerCase().includes(keyword) ||
                item.receiptName.toLowerCase().includes(keyword);
            const matchesState = !filterState || item.state === filterState;
            return matchesKeyword && matchesState;
        });
    }, [data, searchKeyword, filterState]);

    const paginatedData = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        return filteredData.slice(start, start + pagination.pageSize);
    }, [filteredData, pagination]);

    const handleDelete = async (id: string) => {
        try {
            await receiptsApis.deleteReceipt(id);
            toast.success("Xoá biên lai thành công");
            setData(prev => {
                const newData = prev.filter(item => item._id !== id);
                const maxPage = Math.ceil(newData.length / pagination.pageSize);
                setPagination(p => ({
                    ...p,
                    current: Math.min(p.current, maxPage || 1),
                }));
                return newData;
            });
        } catch (err) {
            typeof err === "string"
                ? toast.info(err)
                : toast.error("Xoá thất bại");
        }
    };

    const columns: ColumnsType<ReceiptItem> = [
        { title: "Mã biên lai", dataIndex: "receiptCode" },
        { title: "Tên biên lai", dataIndex: "receiptName" },
        { title: "Tháng", dataIndex: "month" },
        { title: "Người tạo", dataIndex: "createdBy" },
        {
            title: "Trạng thái",
            dataIndex: "state",
            render: (state: string) => {
                const stateMap: Record<string, { color: string; label: string }> = {
                    "Đã xác nhận": { color: "green", label: "Đã xác nhận" },
                    "Chưa xác nhận": { color: "blue", label: "Chưa xác nhận" },
                    "Đã thanh toán": { color: "purple", label: "Đã thanh toán" },
                    "Chờ thanh toán": { color: "orange", label: "Chờ thanh toán" },
                    "Đã huỷ": { color: "red", label: "Đã huỷ" },
                };
                const display = stateMap[state] || { color: "default", label: state };
                return <Tag color={display.color}>{display.label}</Tag>;
            },
        },
        {
            title: "Hành động",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() =>
                                navigate(`${constants.APP_PREFIX}/receipts/detail/${record._id}`)
                            }
                        />
                    </Tooltip>
                    {canUpdate && schoolYear?.state !== "Hết thời hạn" && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() =>
                                    navigate(`${constants.APP_PREFIX}/receipts/edit/${record._id}`)
                                }
                            />
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Xóa">
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(record._id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>Quản lý biên lai</Title>
            <Space style={{ marginBottom: 16 }} wrap>
                <Select
                    placeholder="Chọn năm học"
                    allowClear
                    style={{ width: 200 }}
                    onChange={(id) => {
                        const found = schoolYears.find((y) => y._id === id);
                        if (found) setSchoolYear(found);
                    }}
                    value={schoolYear?._id}
                >
                    {schoolYears.map((item) => (
                        <Option key={item._id} value={item._id}>
                            {item.schoolYear}
                            {item.state === "Đang hoạt động" ? "" : ""}
                        </Option>
                    ))}
                </Select>

                <Search
                    placeholder="Tìm mã / tên biên lai..."
                    allowClear
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ width: 250 }}
                />

                <Select
                    placeholder="Lọc theo trạng thái"
                    allowClear
                    style={{ width: 200 }}
                    value={filterState}
                    onChange={(value) => setFilterState(value)}
                >
                    {receiptStates.map(state => (
                        <Option key={state} value={state}>{state}</Option>
                    ))}
                </Select>

                <Tooltip title="Làm mới">
                    <Button icon={<ReloadOutlined />} onClick={() => fetchReceipts()} loading={loading} />
                </Tooltip>

                {canCreate && schoolYear?.state !== "Hết thời hạn" && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`${constants.APP_PREFIX}/receipts/create`)}
                    >
                        Tạo biên lai
                    </Button>
                )}

            </Space>

            <Table
                columns={columns}
                dataSource={paginatedData}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredData.length,
                    showSizeChanger: true,
                    onChange: (current, pageSize) =>
                        setPagination({ current, pageSize }),
                    showTotal: (total, range) =>
                        `${range[0]}–${range[1]} trong tổng ${total} biên lai`,
                }}
            />
        </div>
    );
}

export default ReceiptsManagement;
