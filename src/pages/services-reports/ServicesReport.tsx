import { useEffect, useState } from "react";
import {
    Table,
    Select,
    Typography,
    Card,
    Row,
    Col,
    Tag,
    Space,
} from "antd";
import { reportsApis, schoolYearApis } from "../../services/apiServices";
import type { SchoolYearListItem } from "../../types/schoolYear";
import type { IServiceReportItem } from "../../types/servicesReport";
import { usePageTitle } from "../../hooks/usePageTitle";
import { toast } from "react-toastify";

const { Title } = Typography;
const { Option } = Select;

function ServicesReport() {
    usePageTitle("Báo cáo dịch vụ - Cá Heo Xanh");

    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedYear, setSelectedYear] = useState<SchoolYearListItem | undefined>();
    const [data, setData] = useState<IServiceReportItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSchoolYears = async () => {
        try {
            const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
            const sorted = [...res.data].sort(
                (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
            setSchoolYears(sorted);

            const activeYear = sorted.find(y => y.state === "Đang hoạt động") || sorted[0];
            if (activeYear) {
                setSelectedYear(activeYear);
            }
        } catch (err) {
            typeof err === "string" ? toast.info(err) : toast.error("Không thể tải danh sách năm học");
        }
    };

    const fetchReports = async () => {
        if (!selectedYear) return;
        try {
            setLoading(true);
            const res = await reportsApis.getServiceReports({ schoolYear: selectedYear.schoolYear });
            setData(res.data);
        } catch (err) {
            typeof err === "string" ? toast.info("Hiện chưa có thông tin báo cáo") : toast.error("Không thể tải dữ liệu báo cáo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        if (selectedYear) {
            fetchReports();
        }
    }, [selectedYear]);

    const columns = [
        {
            title: "Mã dịch vụ",
            dataIndex: "serviceCode",
            key: "serviceCode",
        },
        {
            title: "Học sinh",
            dataIndex: "studentName",
            key: "studentName",
        },
        {
            title: "Số lượng",
            dataIndex: "qty",
            key: "qty",
        },
        {
            title: "Thành tiền",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (val: number) => (
                <Tag color="blue">{val.toLocaleString("vi-VN")} ₫</Tag>
            ),
        },
        {
            title: "Người tạo",
            dataIndex: "createdBy",
            key: "createdBy",
        },
    ];

    return (
        <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={4} style={{ margin: 0 }}>
                        Báo cáo dịch vụ đã đăng ký
                    </Title>
                </Col>
                <Col>
                    <Space>
                        <span>Năm học:</span>
                        <Select
                            value={selectedYear?._id}
                            onChange={(id) => {
                                const found = schoolYears.find((y) => y._id === id);
                                if (found) setSelectedYear(found);
                            }}
                            style={{ width: 200 }}
                            placeholder="Chọn năm học"
                        >
                            {schoolYears.map((year) => (
                                <Option key={year._id} value={year._id}>
                                    {year.schoolYear}
                                    {year.state === "Đang hoạt động" ? "" : ""}
                                </Option>
                            ))}
                        </Select>
                    </Space>
                </Col>
            </Row>
            <Table
                bordered
                dataSource={data}
                columns={columns}
                rowKey={(record) =>
                    `${record.serviceCode}-${record.studentName}-${record.qty}`
                }
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
            />
        </Card>
    );
}

export default ServicesReport;
