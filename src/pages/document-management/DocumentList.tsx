import { useEffect, useMemo, useState } from "react";
import {
    Table,
    Button,
    Select,
    Typography,
    Tag,
    Popconfirm,
    Row,
    Col,
    Input,
    Space,
    Tooltip,
} from "antd";
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { usePageTitle } from "../../hooks/usePageTitle";
import { IDocumentDetailResponse, IDocumentItem } from "../../types/documents";
import { SchoolYearListItem } from "../../types/schoolYear";
import { documentsApis, schoolYearApis } from "../../services/apiServices";
import ViewDocumentModal from "../../modal/document-details/ViewDocumentModal";
import { useNavigate } from "react-router-dom";
import { constants } from "../../constants";
import { toast } from "react-toastify";
import { usePagePermission } from "../../hooks/usePagePermission";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const STATUS_OPTIONS = ["Tất cả", "Đã thanh toán", "Chờ thanh toán"];

function DocumentList() {
    usePageTitle("Quản lý chứng từ - Cá Heo Xanh");
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<IDocumentItem[]>([]);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [schoolYear, setSchoolYear] = useState<string>("");

    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả");

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    const [loading, setLoading] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<IDocumentDetailResponse | undefined>();

    const fetchSchoolYears = async () => {
        try {
            const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
            const sorted = [...res.data].sort(
                (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
            setSchoolYears(sorted);

            const activeYear = sorted.find(y => y.state === "Đang hoạt động");
            if (activeYear) {
                setSchoolYear(activeYear.schoolYear);
            } else if (sorted.length > 0) {
                setSchoolYear(sorted[0].schoolYear);
            }
        } catch (err) {
            typeof err === "string"
                ? toast.info(err)
                : toast.error("Không thể tải danh sách năm học");
        }
    };

    const fetchDocuments = async () => {
        if (!schoolYear) return;
        setLoading(true);
        try {
            const res = await documentsApis.getDocumentList({
                schoolYear,
                page: 1,
                limit: 1000,
            });
            setDocuments(res.data || []);
        } catch (err) {
            typeof err === "string"
                ? toast.info(err)
                : toast.error("Không thể tải danh sách chứng từ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        if (schoolYear) {
            fetchDocuments();
            setPagination(p => ({ ...p, current: 1 }));
        }
    }, [schoolYear]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(item => {
            const matchKeyword = item.documentName
                .toLowerCase()
                .includes(searchKeyword.toLowerCase());

            const matchStatus =
                statusFilter === "Tất cả" || item.status === statusFilter;

            return matchKeyword && matchStatus;
        });
    }, [documents, searchKeyword, statusFilter]);

    const paginatedDocuments = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        return filteredDocuments.slice(start, start + pagination.pageSize);
    }, [filteredDocuments, pagination]);

    const handleDelete = async (id: string) => {
        try {
            await documentsApis.deleteDocument(id);
            toast.success("Đã xóa chứng từ");

            setDocuments(prev => {
                const newData = prev.filter(item => item._id !== id);
                const maxPage = Math.ceil(newData.length / pagination.pageSize);
                setPagination(p => ({
                    ...p,
                    current: Math.min(p.current, maxPage || 1),
                }));
                return newData;
            });
        } catch (err) {
            typeof err === "string" ? toast.info(err) : toast.error("Xóa thất bại");
        }
    };

    const handleView = async (id: string) => {
        try {
            const res = await documentsApis.getDocumentById(id);
            setViewData(res);
            setViewModalOpen(true);
        } catch (err) {
            typeof err === "string" ? toast.info(err) : toast.error("Không thể tải chi tiết");
        }
    };

    const columns: ColumnsType<IDocumentItem> = [
        { title: "Mã", dataIndex: "documentCode" },
        { title: "Tên chứng từ", dataIndex: "documentName" },
        { title: "Người nhận", dataIndex: "receiver" },
        {
            title: "Số tiền",
            dataIndex: "amount",
            render: val => `${val.toLocaleString("vi-VN")} ₫`,
        },
        {
            title: "Ngày lập",
            dataIndex: "documentDate",
            render: val =>
                `${new Date(val).toLocaleTimeString("vi-VN")} ${new Date(val).toLocaleDateString("vi-VN")}`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: val => (
                <Tag color={val === "Đã thanh toán" ? "green" : "orange"}>{val}</Tag>
            ),
        },
        {
            title: "Hành động",
            align: "center",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleView(record._id)} />
                    {canUpdate && (
                        <Button
                            icon={<EditOutlined />}
                            onClick={() =>
                                navigate(`${constants.APP_PREFIX}/documents/edit/${record._id}`)
                            }
                        />
                    )}
                    {canDelete && (
                        <Popconfirm
                            title="Bạn chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete(record._id)}
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px 32px" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>Quản lý chứng từ</Title>
                </Col>
                <Col>
                    {canCreate && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() =>
                                navigate(`${constants.APP_PREFIX}/documents/create`)
                            }
                        >
                            Tạo chứng từ
                        </Button>
                    )}
                </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                    <Tooltip title="Làm mới danh sách">
                        <Button icon={<ReloadOutlined />} onClick={fetchDocuments} />
                    </Tooltip>
                </Col>

                <Col flex="280px">
                    <Search
                        allowClear
                        placeholder="Tìm theo tên chứng từ"
                        value={searchKeyword}
                        onChange={e => {
                            setPagination(p => ({ ...p, current: 1 }));
                            setSearchKeyword(e.target.value);
                        }}
                    />
                </Col>

                <Col flex="200px">
                    <Select
                        value={statusFilter}
                        onChange={val => {
                            setPagination(p => ({ ...p, current: 1 }));
                            setStatusFilter(val);
                        }}
                        style={{ width: "100%" }}
                    >
                        {STATUS_OPTIONS.map(st => (
                            <Option key={st} value={st}>{st}</Option>
                        ))}
                    </Select>
                </Col>

                <Col flex="220px">
                    <Select
                        value={schoolYear}
                        onChange={(val) => setSchoolYear(val)}
                        style={{ width: "100%" }}
                        placeholder="Chọn năm học"
                    >
                        {schoolYears.map(sy => (
                            <Option key={sy._id} value={sy.schoolYear}>
                                {sy.schoolYear}
                                {sy.state === "Đang hoạt động" ? "" : ""}
                            </Option>
                        ))}
                    </Select>
                </Col>
            </Row>

            <Table
                rowKey="_id"
                columns={columns}
                dataSource={paginatedDocuments}
                loading={loading}
                bordered
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredDocuments.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    showTotal: (t, r) => `${r[0]}–${r[1]} của ${t} chứng từ`,
                    onChange: (page, pageSize) =>
                        setPagination({ current: page, pageSize }),
                }}
            />

            <ViewDocumentModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                data={viewData}
            />
        </div>
    );
}

export default DocumentList;
