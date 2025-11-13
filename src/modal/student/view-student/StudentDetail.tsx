import React, { useEffect, useState, useCallback } from "react";
import {
    Descriptions,
    Divider,
    Tag,
    Button,
    Card,
    Spin,
    Typography,
    Row,
    Col,
    Flex,
    Avatar,
    Tabs,
    Tooltip,
    Space,
} from "antd";
import {
    FilePdfOutlined,
    ArrowLeftOutlined,
    UserOutlined,
    SolutionOutlined,
    ManOutlined,
    WomanOutlined,
    QuestionOutlined,
    IdcardOutlined,
    HomeOutlined,
    FlagOutlined,
    SafetyOutlined,
    InfoCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    TeamOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
    StudentDetailResponses,
    StudentRecord,
} from "../../../types/student-management";
import { enrollmentApis, studentApis } from "../../../services/apiServices";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const THEME_COLOR = "#08979c";
const BACKGROUND_GREY = "#f0f2f5";


const StudentDetail: React.FC = () => {
    usePageTitle("Thông tin chi tiết - Cá Heo Xanh");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<StudentRecord | null>(null);
    const [parents, setParents] = useState<StudentDetailResponses["parents"] | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStudentDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await studentApis.getStudentById(id);
            setStudentData(res.student);
            setParents(res.parents || null);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải thông tin học sinh.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchStudentDetail();
    }, [fetchStudentDetail]);

    const handleViewPDF = async (fileId?: string) => {
        if (!fileId) {
            toast.warn("Không tìm thấy file đính kèm.");
            return;
        }
        try {
            const arrayBuffer = await enrollmentApis.getPDFById(fileId);
            const blob = new Blob([arrayBuffer], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, "_blank");
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể mở file PDF.");
        }
    };

    const formatDate = (date?: string) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "-";

    const formatGender = (gender?: string) => {
        if (gender === "Nam")
            return <Tag color="blue" icon={<ManOutlined />}>Nam</Tag>;
        if (gender === "Nữ")
            return <Tag color="pink" icon={<WomanOutlined />}>Nữ</Tag>;
        return <Tag icon={<QuestionOutlined />}>Khác</Tag>;
    };

    const imageUrl = studentData?.imageStudent;

    if (loading || !studentData) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: "calc(100vh - 150px)" }}>
                <Spin size="large" tip="Đang tải dữ liệu học sinh..." />
            </Flex>
        );
    }

    const renderParentInfo = (parent?: any, label?: string) => (
        <>
            <Divider orientation="left" plain>
                <Title level={5}>{label}</Title>
            </Divider>
            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={`Họ tên ${label}`}>
                    {parent?.fullName || "Không có thông tin"}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> SĐT {label}</>}>
                    {parent?.phoneNumber || "Không có thông tin"}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email {label}</>}>
                    {parent?.email || "Không có thông tin"}
                </Descriptions.Item>
                <Descriptions.Item label={`Nghề nghiệp ${label}`}>
                    {parent?.job || "Không có thông tin"}
                </Descriptions.Item>
                <Descriptions.Item label={`CCCD ${label}`}>
                    {parent?.IDCard || "Không có thông tin"}
                </Descriptions.Item>
            </Descriptions>
        </>
    );

    return (
        <div style={{ padding: "24px", background: BACKGROUND_GREY }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
                <Col>
                    <Space align="center">
                        <Tooltip title="Quay lại danh sách">
                            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                        </Tooltip>
                        <Title level={3} style={{ margin: 0 }}>
                            Chi tiết hồ sơ học sinh
                        </Title>
                        <Title level={4} style={{ margin: 0, color: "#595959" }}>
                            ({studentData.fullName})
                        </Title>
                    </Space>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", textAlign: "center" }}>
                        <Avatar
                            size={140}
                            src={imageUrl}
                            icon={<UserOutlined />}
                            style={{
                                border: `4px solid ${THEME_COLOR}`,
                                backgroundColor: "#e6fffb",
                                color: THEME_COLOR,
                                marginBottom: 20,
                            }}
                        />
                        <Title level={3} style={{ margin: 0 }}>
                            {studentData.fullName}
                        </Title>
                        <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px", marginTop: 8 }}>
                            {studentData.studentCode}
                        </Tag>
                        <Divider />
                        <Descriptions column={1} size="small" layout="horizontal">
                            <Descriptions.Item label={<Text strong>Ngày sinh</Text>}>
                                {formatDate(studentData.dob)}
                            </Descriptions.Item>
                            <Descriptions.Item label={<Text strong>Giới tính</Text>}>
                                {formatGender(studentData.gender)}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card
                        bordered={false}
                        style={{ marginTop: 24, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                        title={
                            <Title level={4} style={{ margin: 0 }}>
                                <FileTextOutlined style={{ marginRight: 8 }} />
                                Tài Liệu Đính Kèm
                            </Title>
                        }
                    >
                        <Button
                            type="link"
                            icon={<FilePdfOutlined />}
                            onClick={() => handleViewPDF(studentData.birthCertId)}
                            disabled={!studentData.birthCertId}
                            style={{ paddingLeft: 0, display: "block" }}
                        >
                            Giấy khai sinh
                        </Button>
                        <Button
                            type="link"
                            icon={<FilePdfOutlined />}
                            onClick={() => handleViewPDF(studentData.healthCertId)}
                            disabled={!studentData.healthCertId}
                            style={{ paddingLeft: 0, display: "block" }}
                        >
                            Giấy khám sức khỏe
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
                        <Tabs defaultActiveKey="personal" type="card">
                            <TabPane
                                tab={<><SolutionOutlined /> Thông Tin Cá Nhân</>}
                                key="personal"
                            >
                                <Descriptions bordered layout="horizontal" column={1}>
                                    <Descriptions.Item label={<><IdcardOutlined /> CCCD</>}>
                                        {studentData.idCard}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><FlagOutlined /> Quốc tịch</>}>
                                        {studentData.nation}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><SafetyOutlined /> Tôn giáo</>}>
                                        {studentData.religion || "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>
                                        {studentData.address}
                                    </Descriptions.Item>
                                </Descriptions>
                            </TabPane>

                            <TabPane tab={<><TeamOutlined /> Thông Tin Phụ Huynh</>} key="parent">
                                {renderParentInfo(parents?.father, "Cha")}
                                {renderParentInfo(parents?.mother, "Mẹ")}
                            </TabPane>

                            <TabPane tab={<><InfoCircleOutlined /> Thông Tin Hệ Thống</>} key="system">
                                <Descriptions bordered column={1} size="small">
                                    <Descriptions.Item label="Người tạo">
                                        {studentData.createdBy}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày tạo">
                                        {formatDate(studentData.createdAt)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cập nhật lần cuối bởi">
                                        {studentData.updatedBy || "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày cập nhật">
                                        {formatDate(studentData.updatedAt)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDetail;
