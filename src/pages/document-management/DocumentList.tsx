import { useEffect, useState } from "react";
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
import { SchoolYearListItem, SchoolYearsListResponse } from "../../types/schoolYear";
import { documentsApis, schoolYearApis } from "../../services/apiServices";
import ViewDocumentModal from "../../modal/document-details/ViewDocumentModal";
import { useNavigate } from "react-router-dom";
import { constants } from "../../constants";
import { toast } from "react-toastify";
import { usePagePermission } from "../../hooks/usePagePermission";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

function DocumentList() {
    usePageTitle("Quản lý chứng từ - Cá Heo Xanh");
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const navigate = useNavigate();
    const [data, setData] = useState<IDocumentItem[]>([]);
    const [filteredData, setFilteredData] = useState<IDocumentItem[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [schoolYear, setSchoolYear] = useState<string>("");
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<IDocumentDetailResponse | undefined>();

    const fetchDocuments = async () => {
        if (!schoolYear) return;
        try {
            const res = await documentsApis.getDocumentList({ schoolYear, page, limit });
            setData(res.data);
            setTotal(res.page.totalCount);
        } catch (err) {
            typeof err === "string" ? toast.info(err) : toast.error("Không thể tải danh sách chứng từ");
        }
    };

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
        } catch (err) {
            typeof err === "string" ? toast.info(err) : toast.error("Không thể tải danh sách năm học");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await documentsApis.deleteDocument(id);
            toast.success("Đã xóa chứng từ");
            fetchDocuments();
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

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        if (schoolYear) fetchDocuments();
    }, [schoolYear, page, limit]);

    useEffect(() => {
        const filtered = data.filter((item) =>
            item.documentName.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        setFilteredData(filtered);
    }, [data, searchKeyword]);

    const columns: ColumnsType<IDocumentItem> = [
        {
            title: "Mã",
            dataIndex: "documentCode",
        },
        {
            title: "Tên chứng từ",
            dataIndex: "documentName",
        },
        {
            title: "Người nhận",
            dataIndex: "receiver",
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            render: (val) => `${val.toLocaleString("vi-VN")}₫`,
        },
        {
            title: "Ngày lập",
            dataIndex: "documentDate",
            render: (val) =>
                `${new Date(val).toLocaleTimeString("vi-VN")} ${new Date(val).toLocaleDateString("vi-VN")}`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (val) => (
                <Tag color={val === "Đã thanh toán" ? "green" : "orange"}>{val}</Tag>
            ),
        },
        {
            title: "Hành động",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record._id)}
                    />
                    {canUpdate && (
                        <Button icon={<EditOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/documents/edit/${record._id}`)} />
                    )}
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        {canDelete && (
                            <Button icon={<DeleteOutlined />} danger />
                        )}
                    </Popconfirm>
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
                        <Button onClick={() => navigate(`${constants.APP_PREFIX}/documents/create`)} type="primary" icon={<PlusOutlined />}>
                            Tạo chứng từ
                        </Button>
                    )}
                </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchDocuments()}
                    />
                </Col>
                <Col flex="300px">
                    <Search
                        allowClear
                        placeholder="Tìm theo tên chứng từ"
                        onSearch={(val) => setSearchKeyword(val)}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </Col>
                <Col flex="200px">
                    <Select
                        value={schoolYear}
                        onChange={(val) => {
                            setPage(1);
                            setSchoolYear(val);
                        }}
                        style={{ width: "100%" }}
                    >
                        {schoolYears.map((sy) => (
                            <Option key={sy.schoolYear} value={sy.schoolYear}>
                                {sy.schoolYear}
                            </Option>
                        ))}
                    </Select>
                </Col>
            </Row>

            <Table
                rowKey="_id"
                columns={columns}
                dataSource={filteredData}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                    onChange: setPage,
                    showSizeChanger: true,
                    onShowSizeChange: (_, size) => setLimit(size),
                    pageSizeOptions: ["5", "10", "20", "50"],
                    showTotal: (total) => `${total} chứng từ`,
                }}
                bordered
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
