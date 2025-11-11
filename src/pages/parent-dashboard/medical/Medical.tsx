import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Row,
  Col,
  Tag,
  Divider,
  Spin,
  Empty,
  Button,
  Select,
  Table,
  Pagination,
  Form,
  Tabs,
} from "antd";
import {
  UserOutlined,
  RiseOutlined,
  HeartOutlined,
  SolutionOutlined,
  CalendarOutlined,
  ContainerOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  ReconciliationOutlined,
  FilePdfOutlined,
  NumberOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

import {
  HealthCheckResponse,
  HealthCheckRecord,
  Student,
  PageParams,
  PhysicalDevelopment,
  ComprehensiveExamination,
  Conclusion,
  ClassInfo,
  SchoolYear,
} from "../../../types/parent";
import { parentDashboardApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { toast } from "react-toastify";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const THEME_COLOR = "#08979c";

interface HealthCheckDetailProps {
  data: HealthCheckRecord;
  onBack: () => void;
}

const HealthCheckDetail: React.FC<HealthCheckDetailProps> = ({
  data,
  onBack,
}) => {
  const formatDate = (dateString: string) =>
    dayjs(dateString).format("DD/MM/YYYY");

  const getHealthTagColor = (status: string) => {
    if (status.toLowerCase().includes("tốt")) return "success";
    if (status.toLowerCase().includes("theo dõi")) return "warning";
    if (status.toLowerCase().includes("kém")) return "error";
    return "default";
  };

  const renderStudentInfo = (
    student: Student,
    classInfo: ClassInfo,
    schoolYear: SchoolYear
  ) => (
    <Card
      bordered={false}
      style={{
        marginBottom: 24,
        backgroundColor: "#e6fffb",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        border: "1px solid #b5f5ec",
      }}
    >
      <Descriptions
        title={
          <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
            <UserOutlined style={{ marginRight: 8 }} /> Thông Tin Khám
          </Title>
        }
        column={{ xs: 1, sm: 2, lg: 3 }}
      >
        <Descriptions.Item
          label={
            <Text strong>
              <UserOutlined /> Họ tên
            </Text>
          }
        >
          {student.fullName}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Text strong>
              <NumberOutlined /> Mã học sinh
            </Text>
          }
        >
          {student.studentCode}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Text strong>
              <CalendarOutlined /> Ngày sinh
            </Text>
          }
        >
          {formatDate(student.dob)}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Text strong>
              <TeamOutlined /> Lớp
            </Text>
          }
        >
          {classInfo.className}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Text strong>
              <CalendarOutlined /> Năm học
            </Text>
          }
        >
          {schoolYear.schoolYear}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Text strong>
              <CalendarOutlined /> Ngày khám
            </Text>
          }
        >
          {formatDate(data.createdAt)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const renderPhysicalDevelopment = (pd: PhysicalDevelopment) => (
    <Descriptions column={2} layout="horizontal" size="middle" bordered>
      <Descriptions.Item
        label={
          <Text strong>
            <RiseOutlined /> Chiều cao (cm)
          </Text>
        }
      >
        <Text strong style={{ color: "#52c41a", fontSize: "1.2em" }}>
          {pd.height} cm
        </Text>
      </Descriptions.Item>
      <Descriptions.Item
        label={
          <Text strong>
            <RiseOutlined /> Cân nặng (kg)
          </Text>
        }
      >
        <Text strong style={{ color: "#faad14", fontSize: "1.2em" }}>
          {pd.weight} kg
        </Text>
      </Descriptions.Item>
      <Descriptions.Item label="Chỉ số BMI" span={2}>
        <Text strong>{pd.bodyMassIndex.toFixed(1)}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Đánh giá chung" span={2}>
        <Paragraph italic>{pd.evaluation}</Paragraph>
      </Descriptions.Item>
    </Descriptions>
  );

  const renderComprehensiveExamination = (ce: ComprehensiveExamination) => (
    <Descriptions column={1} layout="vertical" size="middle" bordered>
      <Descriptions.Item label="Phát triển tinh thần">
        <Text>{ce.mentalDevelopment}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Phát triển vận động">
        <Text>{ce.motorDevelopment}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Bệnh lý đã phát hiện">
        {ce.diseasesDetected.length > 0 ? (
          ce.diseasesDetected.map((item, index) => (
            <Tag color="error" key={index} style={{ marginBottom: 4 }}>
              {item}
            </Tag>
          ))
        ) : (
          <Text type="secondary">Không có.</Text>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Dấu hiệu bất thường">
        {ce.abnormalSigns.length > 0 ? (
          ce.abnormalSigns.map((item, index) => (
            <Tag color="warning" key={index} style={{ marginBottom: 4 }}>
              {item}
            </Tag>
          ))
        ) : (
          <Text type="secondary">Không có.</Text>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Ghi chú thêm từ bác sĩ">
        <Text italic type="secondary">
          {ce.notes || "Không có."}
        </Text>
      </Descriptions.Item>
    </Descriptions>
  );

  const renderConclusion = (conclusion: Conclusion) => (
    <Descriptions column={1} layout="vertical" size="middle">
      <Descriptions.Item label="Tình trạng sức khỏe tổng quát">
        <Tag
          icon={<CheckCircleOutlined />}
          color={getHealthTagColor(conclusion.healthStatus)}
          style={{
            fontSize: "1.1em",
            padding: "5px 10px",
            borderRadius: "12px",
            fontWeight: "bold",
          }}
        >
          {conclusion.healthStatus.toUpperCase()}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Lời khuyên từ chuyên gia">
        <Paragraph mark>{conclusion.advice}</Paragraph>
      </Descriptions.Item>
    </Descriptions>
  );

  const handleViewPDF = useCallback(async (fileId: string) => {
    try {
      const arrayBuffer = await parentDashboardApis.getPDFById(fileId);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      typeof error === "string"
        ? toast.info(error)
        : toast.error("Không thể mở file PDF hồ sơ sức khỏe.");
    }
  }, []);

  return (
    <div style={{ padding: "24px", margin: "0 auto" }}>
      <Button
        type="primary"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>
      <Title
        level={2}
        style={{
          color: THEME_COLOR,
          borderBottom: `2px solid ${THEME_COLOR}`,
          paddingBottom: 8,
        }}
      >
        <HeartOutlined style={{ marginRight: 10 }} /> Hồ Sơ Khám Sức Khỏe Định
        Kỳ
      </Title>
      <Text type="secondary">
        Cập nhật lần cuối: {dayjs(data.updatedAt).fromNow()} (
        {formatDate(data.updatedAt)})
      </Text>
      <Divider style={{ margin: "16px 0" }} />

      {renderStudentInfo(data.student, data.class, data.schoolYear)}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
            bordered={false}
          >
            <Tabs defaultActiveKey="1" size="large">
              <TabPane
                tab={
                  <span>
                    <RiseOutlined />
                    Phát Triển Thể Chất
                  </span>
                }
                key="1"
              >
                {renderPhysicalDevelopment(data.physicalDevelopment)}
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <ReconciliationOutlined />
                    Khám Toàn Diện
                  </span>
                }
                key="2"
              >
                {renderComprehensiveExamination(data.comprehensiveExamination)}
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                <SolutionOutlined style={{ marginRight: 8 }} />
                Kết Luận
              </Title>
            }
            bordered={false}
            style={{
              marginBottom: 24,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            {renderConclusion(data.conclusion)}
          </Card>

          <Card
            title={
              <Title level={4} style={{ margin: 0, color: THEME_COLOR }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Tài Liệu Đính Kèm
              </Title>
            }
            bordered={false}
            style={{
              marginBottom: 24,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tên file">
                <Text code>{data.healthCertFiles.filename}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tải lên">
                <Text>{formatDate(data.healthCertFiles.uploadDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hành động">
                <Button
                  onClick={() => handleViewPDF(data?.student?.healthCertId)}
                  type="primary"
                  size="small"
                  icon={<FilePdfOutlined />}
                >
                  Xem file PDF
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />
      <Text type="secondary" style={{ fontSize: "0.85em" }}>
        <CalendarOutlined /> Tạo lúc: {formatDate(data.createdAt)} | Người tạo:{" "}
        {data.createdBy}
      </Text>
    </div>
  );
};

const Medical: React.FC = () => {
  usePageTitle("Hồ sơ sức khỏe - Cá Heo Xanh");
  const user = useCurrentUser();
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();

  const [listChild, setListChild] = useState<Student[]>([]);
  const [listData, setListData] = useState<HealthCheckRecord[]>([]);
  const [pagination, setPagination] = useState<
    PageParams & { totalCount: number }
  >({ page: 1, limit: 10, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [detailRecord, setDetailRecord] = useState<HealthCheckRecord | null>(
    null
  );

  useEffect(() => {
    getDataListChild();
  }, []);

  const getDataListChild = async () => {
    try {
      if (!user?.parent) {
        return;
      }
      const response = await parentDashboardApis.getListChild(
        user.parent || ""
      );
      setListChild(response?.students);
      if (response?.students?.length > 0) {
        setSelectedStudentId(response.students[0]._id);
      }
    } catch (error) {
      typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải danh sách con")
    }
  };

  const fetchHealthChecks = async () => {
    if (!selectedStudentId) {
      setListData([]);
      setPagination((prev) => ({ ...prev, totalCount: 0 }));
      return;
    }

    setIsLoading(true);
    try {
      const response: HealthCheckResponse =
        await parentDashboardApis.getListMedical(selectedStudentId, {
          page: pagination.page,
          limit: pagination.limit,
        });

      setListData(response.data);
      setPagination({
        totalCount: response.page.totalCount,
        limit: response.page.limit,
        page: response.page.page,
      });
    } catch (error) {
      typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải danh sách hồ sơ")
      setListData([]);
      setPagination((prev) => ({ ...prev, totalCount: 0 }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId && pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    } else if (selectedStudentId) {
      fetchHealthChecks();
    }
  }, [selectedStudentId]);

  useEffect(() => {
    if (selectedStudentId && listChild.length > 0) {
      fetchHealthChecks();
    }
  }, [pagination.page, pagination.limit]);

  const columns = useMemo(
    () => [
      {
        title: "Ngày Khám",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
        sorter: (a: HealthCheckRecord, b: HealthCheckRecord) =>
          dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        width: 150,
      },
      {
        title: "Năm Học",
        dataIndex: ["schoolYear", "schoolYear"],
        key: "schoolYear",
        width: 150,
      },
      {
        title: "Chiều Cao/Cân Nặng",
        key: "physicalDevelopment",
        render: (record: HealthCheckRecord) => (
          <Text>
            {record.physicalDevelopment.height}cm /{" "}
            {record.physicalDevelopment.weight}kg
          </Text>
        ),
      },
      {
        title: "Đánh Giá",
        dataIndex: ["physicalDevelopment", "evaluation"],
        key: "evaluation",
      },
      {
        title: "Kết Luận",
        dataIndex: ["conclusion", "healthStatus"],
        key: "healthStatus",
        render: (text: string) => {
          const color = text.toLowerCase().includes("tốt")
            ? "success"
            : text.toLowerCase().includes("theo dõi")
              ? "warning"
              : "default";
          return <Tag color={color}>{text.toUpperCase()}</Tag>;
        },
        width: 150,
      },
      {
        title: "Hành Động",
        key: "action",
        width: 120,
        fixed: "right" as const,
        render: (record: HealthCheckRecord) => (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setDetailRecord(record)}
            size="small"
          >
            Xem
          </Button>
        ),
      },
    ],
    []
  );

  if (detailRecord) {
    return (
      <HealthCheckDetail
        data={detailRecord}
        onBack={() => setDetailRecord(null)}
      />
    );
  }

  const selectedStudent = listChild.find((s) => s._id === selectedStudentId);

  return (
    <div style={{ padding: "24px", margin: "0 auto" }}>
      <Title
        level={2}
        style={{
          color: THEME_COLOR,
          borderBottom: `2px solid ${THEME_COLOR}`,
          paddingBottom: 8,
        }}
      >
        <HeartOutlined style={{ marginRight: 10 }} />
        Quản Lý Sức Khỏe
      </Title>
      <Divider style={{ margin: "16px 0" }} />
      <Card
        bordered
        title={
          <Text strong>
            <FilterOutlined style={{ marginRight: 8 }} />
            Lọc Hồ Sơ
          </Text>
        }
        style={{
          marginBottom: 24,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Form layout="vertical">
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong>
                    <UserOutlined style={{ marginRight: 4 }} />
                    Chọn con
                  </Text>
                }
              >
                <Select
                  value={selectedStudentId}
                  style={{ width: "100%" }}
                  onChange={(value) => setSelectedStudentId(value)}
                  placeholder="Chọn con của bạn"
                  size="large"
                  loading={listChild.length === 0 && isLoading}
                  disabled={listChild.length === 0}
                >
                  {listChild.map((student) => (
                    <Option key={student._id} value={student._id}>
                      {student.fullName} ({student.studentCode})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Title
        level={3}
        style={{
          color: THEME_COLOR,
          paddingBottom: 8,
        }}
      >
        <ContainerOutlined style={{ marginRight: 8 }} />
        Danh Sách Hồ Sơ Khám ({selectedStudent?.fullName || "..."})
      </Title>

      <Spin spinning={isLoading}>
        {listData.length > 0 ? (
          <div className="health-check-list">
            <Table
              columns={columns}
              dataSource={listData}
              rowKey="_id"
              pagination={false}
              bordered
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
              scroll={{ x: 800 }}
            />
            <div
              style={{
                textAlign: "right",
                marginTop: 20,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={pagination.totalCount}
                onChange={(page, pageSize) =>
                  setPagination((prev) => ({ ...prev, page, limit: pageSize }))
                }
                showSizeChanger
                pageSizeOptions={["10", "20", "30"]}
                showTotal={(total) => `Tổng ${total} hồ sơ`}
              />
            </div>
          </div>
        ) : (
          <Empty
            description={
              <Title level={4}>
                Không có hồ sơ khám sức khỏe nào cho học sinh này.
              </Title>
            }
            style={{ padding: "50px 0" }}
          />
        )}
      </Spin>
    </div>
  );
};

export default Medical;