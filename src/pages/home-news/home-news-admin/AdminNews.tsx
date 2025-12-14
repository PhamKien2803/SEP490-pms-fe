import { useEffect, useState, useMemo } from "react";
import {
    Card,
    Row,
    Col,
    Typography,
    Select,
    Space,
    Table,
    Tag,
    Spin,
    Statistic,
    Empty,
    Button,
    Progress,
    Avatar
} from "antd";
import {
    TeamOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    ReloadOutlined,
    RiseOutlined,
    SolutionOutlined
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { schoolYearApis, statisticsApis } from "../../../services/apiServices";
import { GetClassStatisticsResponse } from "../../../types/statistics";

const { Title, Text } = Typography;

function AdminNews() {
    const [stats, setStats] = useState<GetClassStatisticsResponse | null>(null);
    const [schoolYears, setSchoolYears] = useState<any[]>([]);
    const [schoolYear, setSchoolYear] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);

    const fetchSchoolYears = async () => {
        try {
            const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });

            const sorted = [...res.data].sort(
                (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
            setSchoolYears(sorted);
            if (!schoolYear) {
                const activeYear = sorted.find((y) => y.state === "Đang hoạt động");
                if (activeYear) {
                    setSchoolYear(activeYear.schoolYear);
                }
            }
        } catch {
            toast.error("Không thể tải danh sách năm học");
        }
    };


    const fetchStatistics = async () => {
        try {
            setLoadingStats(true);
            const res = await statisticsApis.getClassStatistics();
            setStats(res);
        } catch {
            toast.error("Không thể tải thống kê");
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchSchoolYears(), fetchStatistics()]).finally(() => setLoading(false));
    }, []);

    const filteredData = useMemo(() => {
        if (!schoolYear || !stats) return [];
        return stats.data.filter((item) => item.schoolYear.schoolYear === schoolYear);
    }, [schoolYear, stats]);

    const summaryData = useMemo(() => {
        if (filteredData.length === 0) return { classes: 0, students: 0, avg: 0, maxStudents: 0 };
        const totalClasses = filteredData.reduce((acc, curr) => acc + (curr.totalClasses || 0), 0);
        const totalStudents = filteredData.reduce((acc, curr) => acc + (curr.totalStudents || 0), 0);
        const maxStudents = Math.max(...filteredData.map(d => d.totalStudents || 0));

        return {
            classes: totalClasses,
            students: totalStudents,
            avg: totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0,
            maxStudents: maxStudents
        };
    }, [filteredData]);

    const columns = [
        {
            title: "Khối Lớp",
            dataIndex: "grade",
            key: "grade",
            render: (text: string, record: any) => (
                <Space>
                    <Avatar style={{ backgroundColor: "#e6f7ff", color: "#1890ff" }} icon={<ReadOutlined />} />
                    <Text strong>{text || record._id}</Text>
                </Space>
            )
        },
        {
            title: "Tổng Lớp",
            dataIndex: "totalClasses",
            key: "totalClasses",
            render: (val: number) => <Tag color="geekblue">{val} Lớp</Tag>
        },
        {
            title: "Học Sinh",
            dataIndex: "totalStudents",
            key: "totalStudents",
            width: 300,
            render: (val: number) => {
                const percent = summaryData.maxStudents ? (val / summaryData.maxStudents) * 100 : 0;
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Progress
                            percent={percent}
                            showInfo={false}
                            strokeColor={{ from: "#108ee9", to: "#87d068" }}
                            size="small"
                        />
                        <Text style={{ width: 60, textAlign: "right" }}>{val} HS</Text>
                    </div>
                );
            }
        },
        {
            title: "Trung Bình",
            key: "avg",
            render: (_: any, record: any) => {
                const avg = record.totalClasses ? Math.round(record.totalStudents / record.totalClasses) : 0;
                return <Text type="secondary">{avg} HS/Lớp</Text>;
            }
        }
    ];

    return (
        <div style={{ padding: 24, backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ margin: 0, color: "#262626" }}>
                        Thống kê số liệu
                    </Title>
                    <Text type="secondary">Thống kê số liệu giáo dục theo năm học</Text>
                </Col>
                <Col>
                    <Space size="middle">
                        <Select
                            value={schoolYear}
                            style={{ width: 220 }}
                            size="large"
                            onChange={setSchoolYear}
                            suffixIcon={<CalendarOutlined />}
                            placeholder="Chọn năm học"
                            options={schoolYears.map((y) => ({
                                label: `Năm học ${y.schoolYear}`,
                                value: y.schoolYear
                            }))}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            size="large"
                            onClick={fetchStatistics}
                            loading={loadingStats}
                            type="text"
                            shape="circle"
                        />
                    </Space>
                </Col>
            </Row>

            <Spin spinning={loading || loadingStats} size="large">
                <Row gutter={[24, 24]}>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12 }}>
                            <Statistic
                                title={<Text type="secondary">Tổng Giáo Viên</Text>}
                                value={stats?.totalTeachers ?? 0}
                                valueStyle={{ color: "#1890ff", fontWeight: 600 }}
                                prefix={<UserOutlined style={{ backgroundColor: "#e6f7ff", padding: 8, borderRadius: 8, marginRight: 8 }} />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12 }}>
                            <Statistic
                                title={<Text type="secondary">Tổng Nhân Viên</Text>}
                                value={stats?.staffCount ?? 0}
                                valueStyle={{ color: "#722ed1", fontWeight: 600 }}
                                prefix={<SolutionOutlined style={{ backgroundColor: "#f9f0ff", padding: 8, borderRadius: 8, marginRight: 8 }} />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12 }}>
                            <Statistic
                                title={<Text type="secondary">Tổng Phụ Huynh</Text>}
                                value={stats?.parentCount ?? 0}
                                valueStyle={{ color: "#eb2f96", fontWeight: 600 }}
                                prefix={<TeamOutlined style={{ backgroundColor: "#fff0f6", padding: 8, borderRadius: 8, marginRight: 8 }} />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12 }}>
                            <Statistic
                                title={<Text type="secondary">Sĩ Số Trung Bình</Text>}
                                value={summaryData.avg}
                                suffix="HS"
                                valueStyle={{ color: "#fa541c", fontWeight: 600 }}
                                prefix={<RiseOutlined style={{ backgroundColor: "#fff7e6", padding: 8, borderRadius: 8, marginRight: 8 }} />}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} lg={16}>
                        <Card title="Chi Tiết Thống Kê Theo Khối" bordered={false} style={{ borderRadius: 12 }}>
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                rowKey={(r: any) => r.schoolYearId}
                                pagination={false}
                                locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Tỉ Trọng Phân Bổ" bordered={false} style={{ borderRadius: 12 }}>
                            {filteredData.length > 0 ? (
                                <Space direction="vertical" style={{ width: "100%" }} size="large">
                                    {filteredData.map((item, index) => {
                                        const percent = summaryData.students
                                            ? Math.round((item.totalStudents / summaryData.students) * 100)
                                            : 0;
                                        return (
                                            <div key={index}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                    <Text type="secondary">{percent}%</Text>
                                                </div>
                                                <Progress
                                                    percent={percent}
                                                    showInfo={false}
                                                    strokeColor="#1890ff"
                                                    trailColor="#f5f5f5"
                                                />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {item.totalStudents} học sinh
                                                </Text>
                                            </div>
                                        );
                                    })}
                                </Space>
                            ) : (
                                <Empty description="Không có dữ liệu" />
                            )}
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
}

export default AdminNews;
