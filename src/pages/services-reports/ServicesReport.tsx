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
    const [schoolYear, setSchoolYear] = useState<string>("");
    const [data, setData] = useState<IServiceReportItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSchoolYears = async () => {
        try {
            const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
            const sorted = [...res.data].sort(
                (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
            setSchoolYears(sorted);
            if (!schoolYear && sorted.length > 0) {
                setSchoolYear(sorted[0].schoolYear);
            }
        } catch (err) {
            typeof err === "string" ? toast.warn(err) : toast.error("Không thể tải danh sách năm học");
        }
    };

    const fetchReports = async () => {
        if (!schoolYear) return;
        try {
            setLoading(true);
            const res = await reportsApis.getServiceReports({ schoolYear });
            setData(res.data);
        } catch (err) {
            typeof err === "string" ? toast.warn(err) : toast.error("Không thể tải dữ liệu báo cáo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        if (schoolYear) {
            fetchReports();
        }
    }, [schoolYear]);

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
                            value={schoolYear}
                            onChange={setSchoolYear}
                            style={{ width: 180 }}
                            placeholder="Chọn năm học"
                        >
                            {schoolYears.map((year) => (
                                <Option key={year._id} value={year.schoolYear}>
                                    {year.schoolYear}
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
