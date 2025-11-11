import { useEffect, useState } from "react";
import { Card, Select, Table, Typography, Tag, Space, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { HistoryFeeItem, RevenueItem } from "../../../types/tuition";
import { tuitionApis } from "../../../services/apiServices";
import { servicesApis } from "../../../services/apiServices";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { formatCurrency, formatDate } from "../../../utils/format";
import { SchoolYearItem } from "../../../types/services";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text } = Typography;
const { Option } = Select;

function HistoryFee() {
    usePageTitle("Lịch sử học phí - Cá Heo Xanh");
    const currentUser = useCurrentUser();
    const parentId = currentUser?.parent || "";
    const [schoolYears, setSchoolYears] = useState<SchoolYearItem[]>([]);
    const [selectedYear, setSelectedYear] = useState<string | undefined>();
    const [historyData, setHistoryData] = useState<HistoryFeeItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const fetchSchoolYears = async () => {
        try {
            const res = await servicesApis.getSchoolYears();
            setSchoolYears(res.data);
            if (res.data.length > 0) {
                const newestYear = res.data[0].schoolYear;
                setSelectedYear(newestYear);
            }
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải danh sách năm học");
        }
    };


    const fetchHistoryFee = async () => {
        if (!parentId || !selectedYear) return;
        try {
            setLoading(true);
            const res = await tuitionApis.getHistoryFee({
                parentId,
                schoolYear: selectedYear,
            });
            setHistoryData(res.data);
            setTotalAmount(res.totalAmount);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải dữ liệu học phí");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        fetchHistoryFee();
    }, [selectedYear]);

    const columns: ColumnsType<HistoryFeeItem> = [
        {
            title: "Học sinh",
            dataIndex: "studentName",
            key: "studentName",
        },
        {
            title: "Tên khoản thu",
            dataIndex: "tuitionName",
            key: "tuitionName",
        },
        {
            title: "Tháng",
            dataIndex: "month",
            key: "month",
            render: (month: number) => `Tháng ${month}`,
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (amount: number) => formatCurrency(amount),
        },
        {
            title: "Trạng thái",
            dataIndex: "state",
            key: "state",
            render: (state: string) => (
                <Tag color={state === "Đã thanh toán" ? "green" : "red"}>
                    {state}
                </Tag>
            ),
        },
        {
            title: "Biên lai",
            key: "receipt",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.receiptCode}</Text>
                    <Text type="secondary">{record.receiptName}</Text>
                </Space>
            ),
        },
        {
            title: "Khoản thu chi tiết",
            key: "revenueList",
            render: (_, record) => (
                <Space direction="vertical">
                    {record.revenueList.map((item: RevenueItem) => (
                        <div key={item.revenueId}>
                            <Text>
                                {item.revenueName}: {formatCurrency(item.amount)}
                            </Text>
                        </div>
                    ))}
                </Space>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => formatDate(date),
        },
    ];

    return (
        <Card>
            <Title level={4}>Lịch sử học phí</Title>
            <Space style={{ marginBottom: 16 }}>
                <Text strong>Năm học:</Text>
                <Select
                    value={selectedYear}
                    onChange={(val) => setSelectedYear(val)}
                    style={{ width: 200 }}
                >
                    {schoolYears.map((year) => (
                        <Option key={year._id} value={year.schoolYear}>
                            {year.schoolYear}
                        </Option>
                    ))}
                </Select>
            </Space>
            <Divider />
            <Table
                columns={columns}
                dataSource={historyData}
                rowKey="tuitionId"
                loading={loading}
                pagination={{ pageSize: 5 }}
                footer={() => (
                    <div style={{ textAlign: "right" }}>
                        <Text strong>Tổng tiền: {formatCurrency(totalAmount)}</Text>
                    </div>
                )}
            />
        </Card>
    );
}

export default HistoryFee;
