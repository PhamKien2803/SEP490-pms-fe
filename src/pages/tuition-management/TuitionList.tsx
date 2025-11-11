import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Table,
    Select,
    Card,
    Typography,
    Space,
    Row,
    Col,
    Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
    TuitionListItem,
    TuitionListResponse,
} from "../../types/tuition";
import {
    SchoolYearListItem,
    SchoolYearsListResponse,
} from "../../types/schoolYear";
import { schoolYearApis, tuitionApis } from "../../services/apiServices";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
};

const getStateTag = (state: string) => {
    const normalized = state?.trim().toLowerCase();

    switch (normalized) {
        case "đã thanh toán":
            return <Tag color="green">Đã thanh toán</Tag>;
        case "chưa thanh toán":
            return <Tag color="red">Chưa thanh toán</Tag>;
        case "đang xử lý":
        case "chờ xử lý":
            return <Tag color="orange">Đang xử lý</Tag>;
        case "thanh toán lỗi":
            return <Tag color="magenta">Thanh toán lỗi</Tag>;
        default:
            return <Tag>{state}</Tag>;
    }
};

const { Title } = Typography;
const { Option } = Select;

function TuitionList() {
    usePageTitle("Quản lý học phí - Cá Heo Xanh");
    const navigate = useNavigate();
    const [data, setData] = useState<TuitionListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

    const fetchSchoolYears = useCallback(async () => {
        try {
            const res: SchoolYearsListResponse =
                await schoolYearApis.getSchoolYearList({
                    page: 1,
                    limit: 100,
                });

            const sorted = [...res.data].sort(
                (a, b) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );

            setSchoolYears(sorted);

            if (!selectedSchoolYear && sorted.length > 0) {
                setSelectedSchoolYear(sorted[0].schoolYear);
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải danh sách năm học");
        }
    }, [selectedSchoolYear]);

    useEffect(() => {
        fetchSchoolYears();
    }, [fetchSchoolYears]);

    const fetchTuitionList = useCallback(async () => {
        if (!selectedSchoolYear) return;

        setLoading(true);
        try {
            const params = {
                limit: 10000,
                page: 1,
                schoolYear: selectedSchoolYear,
            };

            const response: TuitionListResponse =
                await tuitionApis.getTuitionList(params);
            setData(response.data);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải danh sách học phí");
        } finally {
            setLoading(false);
        }
    }, [selectedSchoolYear]);

    useEffect(() => {
        fetchTuitionList();
    }, [fetchTuitionList]);

    const filteredData = useMemo(() => {
        if (!selectedStatus) {
            return data;
        }
        return data.filter(
            (item) => item.state?.toLowerCase() === selectedStatus.toLowerCase()
        );
    }, [data, selectedStatus]);


    const columns = useMemo(
        () => [
            {
                title: "STT",
                width: 60,
                render: (_: any, __: any, index: number) => index + 1,
                fixed: "left" as const,
            },
            {
                title: "Tên học sinh",
                dataIndex: "studentName",
                key: "studentName",
                fixed: "left" as const,
                width: 200,
            },
            {
                title: "Tên học phí",
                dataIndex: "tuitionName",
                key: "tuitionName",
                width: 250,
            },
            {
                title: "Tháng",
                dataIndex: "month",
                key: "month",
                width: 80,
                align: "center" as const,
            },
            {
                title: "Số tiền",
                dataIndex: "totalAmount",
                key: "totalAmount",
                align: "right" as const,
                width: 150,
                render: formatCurrency,
            },
            {
                title: "Trạng thái",
                dataIndex: "state",
                key: "state",
                align: "center" as const,
                width: 140,
                render: getStateTag,
            },
            {
                title: "Ngày tạo",
                dataIndex: "createdAt",
                key: "createdAt",
                width: 120,
                render: formatDate,
            },
        ],
        [navigate]
    );

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        Quản lý học phí
                    </Title>
                </Col>
            </Row>

            <Card>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8} lg={6}>
                        <Select
                            placeholder="Chọn năm học"
                            value={selectedSchoolYear}
                            onChange={(value) => {
                                setSelectedSchoolYear(value);
                                setSelectedStatus(undefined);
                            }}
                            style={{ width: "100%" }}
                            loading={schoolYears.length === 0}
                        >
                            {schoolYears.map((item) => (
                                <Option key={item._id} value={item.schoolYear}>
                                    {item.schoolYear}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} md={8} lg={6}>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            allowClear
                            style={{ width: "100%" }}
                            value={selectedStatus}
                            onChange={(value) => setSelectedStatus(value)}
                        >
                            <Option value="Đã thanh toán">Đã thanh toán</Option>
                            <Option value="Chưa thanh toán">Chưa thanh toán</Option>
                            <Option value="Đang xử lý">Đang xử lý</Option>
                            <Option value="Thanh toán lỗi">Thanh toán lỗi</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                }}
                scroll={{ x: 1200 }}
                bordered
            />
        </Space>
    );
}

export default TuitionList;