import React, { useEffect, useState, useCallback } from "react";
import {
    Typography,
    Card,
    Space,
    Tag,
    Spin,
    Descriptions,
    Button,
    Divider,
} from "antd";
import {
    ArrowLeftOutlined,
    UserOutlined,
    CalendarOutlined,
    ManOutlined,
    WomanOutlined,
    HomeOutlined,
    HeartOutlined,
    FilePdfOutlined,
    LineChartOutlined,
    WarningOutlined,
    BulbOutlined,
    MedicineBoxOutlined,
    ClockCircleOutlined,
    BookOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { enrollmentApis, medicalApis } from "../../../services/apiServices";
import { HealthCertRecord } from "../../../types/medical-management";
import { constants } from "../../../constants";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text } = Typography;
const { Item } = Descriptions;

const MedicalDetail: React.FC = () => {
    usePageTitle('Chi tiết hồ sơ sức khỏe - Cá Heo Xanh');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [medicalDetail, setMedicalDetail] = useState<HealthCertRecord | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMedicalDetail = useCallback(async (medicalId: string) => {
        setLoading(true);
        try {
            const response: HealthCertRecord = await medicalApis.getMedicalById(medicalId || "");
            setMedicalDetail(response);
        } catch (error) {
            toast.error("Tải chi tiết hồ sơ sức khỏe thất bại.");
            setMedicalDetail(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleViewPDF = useCallback(async (fileId: string) => {
        try {
            const arrayBuffer = await enrollmentApis.getPDFById(fileId);
            const blob = new Blob([arrayBuffer], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, "_blank");
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Không thể mở file PDF hồ sơ sức khỏe.");
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchMedicalDetail(id);
        }
    }, [id, fetchMedicalDetail]);

    const renderArrayData = (data: string[] | undefined) => {
        if (!data || data.length === 0) {
            return <Text type="secondary">Không có</Text>;
        }
        return (
            <Space size={[0, 8]} wrap>
                {data.map((item, index) => (
                    <Tag key={index} color="blue">
                        {item}
                    </Tag>
                ))}
            </Space>
        );
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                }}
            >
                <Spin tip="Đang tải chi tiết hồ sơ sức khỏe..." size="large" />
            </div>
        );
    }

    if (!medicalDetail) {
        return (
            <div style={{ padding: "24px" }}>
                <Title level={3}>
                    <ArrowLeftOutlined
                        onClick={() => navigate(`${constants.APP_PREFIX}/medical`)}
                        style={{ marginRight: 16, cursor: "pointer" }}
                    />
                    Không tìm thấy Hồ Sơ Sức Khỏe
                </Title>
                <Card>
                    <Text>Hồ sơ sức khỏe với ID: {id} không tồn tại hoặc đã bị xóa.</Text>
                </Card>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "24px",
                backgroundColor: "#f0f2f5",
                minHeight: "100vh",
            }}
        >
            <Title level={3} style={{ marginBottom: 20 }}>
                <ArrowLeftOutlined
                    onClick={() => navigate(`${constants.APP_PREFIX}/medicals`)}
                    style={{ marginRight: 16, cursor: "pointer", color: "#0050b3" }}
                />
                Hồ Sơ Sức Khỏe: {medicalDetail.student.fullName}
            </Title>

            <Card
                title={
                    <Space size="middle">
                        <UserOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                        <Title level={4} style={{ margin: 0 }}>
                            Thông tin Học sinh
                        </Title>
                    </Space>
                }
                bordered={false}
                style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    marginBottom: 30,
                    borderRadius: 8,
                }}
            >
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
                    <Item label={<Text strong>Mã Học Sinh</Text>} span={1}>
                        <Text copyable>{medicalDetail.student.studentCode}</Text>
                    </Item>
                    <Item label={<Text strong>Họ và Tên</Text>} span={2}>
                        {medicalDetail.student.fullName}
                    </Item>
                    <Item label={<Text strong><CalendarOutlined /> Ngày Sinh</Text>} span={1}>
                        {dayjs(medicalDetail.student.dob).format("DD/MM/YYYY")}
                    </Item>
                    <Item label={<Text strong>Giới Tính</Text>} span={1}>
                        <Space>
                            {medicalDetail.student.gender === 'Nam' ? <ManOutlined /> : <WomanOutlined />}
                            {medicalDetail.student.gender}
                        </Space>
                    </Item>
                    <Item label={<Text strong><HomeOutlined /> Địa Chỉ</Text>} span={1}>
                        {medicalDetail.student.address}
                    </Item>
                </Descriptions>
            </Card>

            <Card
                title={
                    <Space size="middle">
                        <LineChartOutlined style={{ fontSize: 20, color: "#faad14" }} />
                        <Title level={4} style={{ margin: 0 }}>
                            Phát Triển Thể Chất
                        </Title>
                    </Space>
                }
                bordered={false}
                style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    marginBottom: 30,
                    borderRadius: 8,
                }}
            >
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
                    <Item label={<Text strong>Chiều Cao (cm)</Text>} span={1}>
                        <Text strong>{medicalDetail.physicalDevelopment.height}</Text>
                    </Item>
                    <Item label={<Text strong>Cân Nặng (kg)</Text>} span={1}>
                        <Text strong>{medicalDetail.physicalDevelopment.weight}</Text>
                    </Item>
                    <Item label={<Text strong>Chỉ Số BMI</Text>} span={1}>
                        <Text strong style={{ color: "#08979c" }}>{medicalDetail.physicalDevelopment.bodyMassIndex}</Text>
                    </Item>
                    <Item label={<Text strong><BookOutlined /> Đánh Giá</Text>} span={3}>
                        <Text>{medicalDetail.physicalDevelopment.evaluation}</Text>
                    </Item>
                </Descriptions>
            </Card>

            <Card
                title={
                    <Space size="middle">
                        <Title level={4} style={{ margin: 0 }}>
                            Khám Tổng Quát
                        </Title>
                    </Space>
                }
                bordered={false}
                style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    marginBottom: 30,
                    borderRadius: 8,
                }}
            >
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
                    <Item label={<Text strong>Phát Triển Tinh Thần</Text>} span={3}>
                        {medicalDetail.comprehensiveExamination.mentalDevelopment}
                    </Item>
                    <Item label={<Text strong>Phát Triển Vận Động</Text>} span={3}>
                        {medicalDetail.comprehensiveExamination.motorDevelopment}
                    </Item>
                    <Item label={<Text strong><MedicineBoxOutlined /> Bệnh Đã Phát Hiện</Text>} span={3}>
                        {renderArrayData(medicalDetail.comprehensiveExamination.diseasesDetected)}
                    </Item>
                    <Item label={<Text strong><WarningOutlined /> Dấu Hiệu Bất Thường</Text>} span={3}>
                        {renderArrayData(medicalDetail.comprehensiveExamination.abnormalSigns)}
                    </Item>
                    <Item label={<Text strong><WarningOutlined /> Nguy Cơ Bệnh</Text>} span={3}>
                        {renderArrayData(medicalDetail.comprehensiveExamination.diseaseRisk)}
                    </Item>
                    <Item label={<Text strong><BookOutlined /> Ghi Chú Cận Lâm Sàng</Text>} span={3}>
                        <Text>{medicalDetail.comprehensiveExamination.notes || "Không có ghi chú"}</Text>
                    </Item>
                </Descriptions>
            </Card>

            <Card
                title={
                    <Space size="middle">
                        <HeartOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                        <Title level={4} style={{ margin: 0 }}>
                            Kết Luận và Lời Khuyên
                        </Title>
                    </Space>
                }
                bordered={false}
                style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    marginBottom: 30,
                    borderRadius: 8,
                }}
            >
                <Descriptions bordered column={1} size="middle">
                    <Item label={<Text strong>Trạng Thái Sức Khỏe Chung</Text>} span={1}>
                        <Text style={{ fontSize: 14 }}>
                            {medicalDetail.conclusion.healthStatus}
                        </Text>
                    </Item>
                    <Item label={<Text strong><BulbOutlined /> Lời Khuyên Y Tế</Text>} span={1}>
                        <Text>{medicalDetail.conclusion.advice || "Không có lời khuyên cụ thể."}</Text>
                    </Item>
                </Descriptions>
            </Card>

            <Card
                title={
                    <Space size="middle">
                        <FilePdfOutlined style={{ fontSize: 20, color: "#f5222d" }} />
                        <Title level={4} style={{ margin: 0 }}>
                            Tệp Đính Kèm & Lịch Sử
                        </Title>
                    </Space>
                }
                bordered={false}
                style={{
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    borderRadius: 8,
                }}
            >
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
                    <Item label={<Text strong>Tệp Hồ Sơ Gốc</Text>} span={3}>
                        {medicalDetail.healthCertFiles ? (
                            <Button
                                type="link"
                                icon={<FilePdfOutlined />}
                                onClick={() => handleViewPDF(medicalDetail.healthCertFiles!._id)}
                                style={{ paddingLeft: 0 }}
                            >
                                {medicalDetail.healthCertFiles.filename} ({Math.ceil(medicalDetail.healthCertFiles.length / 1024)} KB)
                            </Button>
                        ) : (
                            <Text type="secondary">Không có file đính kèm</Text>
                        )}
                    </Item>
                    <Divider orientation="left" plain>
                        <Text strong><ClockCircleOutlined /> Lịch Sử Cập Nhật</Text>
                    </Divider>
                    <Item label={<Text strong>Người Tạo</Text>} span={1}>
                        {medicalDetail.createdBy || "-"}
                    </Item>
                    <Item label={<Text strong>Ngày Tạo</Text>} span={1}>
                        {medicalDetail.createdAt
                            ? dayjs(medicalDetail.createdAt).format("DD/MM/YYYY HH:mm")
                            : "-"}
                    </Item>
                    <Item label={<Text strong>Người Cập Nhật</Text>} span={1}>
                        {medicalDetail.updatedBy || "-"}
                    </Item>
                    <Item label={<Text strong>Ngày Cập Nhật Cuối</Text>} span={1}>
                        {medicalDetail.updatedAt
                            ? dayjs(medicalDetail.updatedAt).format("DD/MM/YYYY HH:mm")
                            : "-"}
                    </Item>
                    <Item label={<Text strong>Trạng Thái Active</Text>} span={2}>
                        <Tag color={medicalDetail.active ? "success" : "default"}>
                            {medicalDetail.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                        </Tag>
                    </Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default MedicalDetail;