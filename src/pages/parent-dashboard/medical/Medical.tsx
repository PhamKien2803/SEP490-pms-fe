import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Row,
  Col,
  Tag,
  Collapse,
  Divider,
  Spin,
  Empty,
  Button,
  Select,
  Table,
  Pagination,
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

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

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
        backgroundColor: "#e6f7ff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Descriptions
        title={
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            <UserOutlined style={{ marginRight: 8 }} /> Thông Tin Khám
          </Title>
        }
        column={{ xs: 1, sm: 2, lg: 3 }}
      >
        <Descriptions.Item label="Họ tên">{student.fullName}</Descriptions.Item>
        <Descriptions.Item label="Mã học sinh">
          {student.studentCode}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {formatDate(student.dob)}
        </Descriptions.Item>
        <Descriptions.Item label="Lớp">{classInfo.className}</Descriptions.Item>
        <Descriptions.Item label="Năm học">
          {schoolYear.schoolYear}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày khám">
          {formatDate(data.createdAt)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const renderPhysicalDevelopment = (pd: PhysicalDevelopment) => (
    <Descriptions column={1} layout="vertical" size="middle" bordered>
      <Descriptions.Item label="Chiều cao (cm)">
        <Text strong style={{ color: "#52c41a", fontSize: "1.1em" }}>
          {pd.height}
        </Text>
      </Descriptions.Item>
      <Descriptions.Item label="Cân nặng (kg)">
        <Text strong style={{ color: "#faad14", fontSize: "1.1em" }}>
          {pd.weight}
        </Text>
      </Descriptions.Item>
      <Descriptions.Item label="Chỉ số BMI">
        <Text strong>{pd.bodyMassIndex.toFixed(1)}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Đánh giá chung">
        <Text italic>{pd.evaluation}</Text>
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
        {ce.diseasesDetected.map((item, index) => (
          <Tag color="error" key={index} style={{ marginBottom: 4 }}>
            {item}
          </Tag>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="Dấu hiệu bất thường">
        {ce.abnormalSigns.map((item, index) => (
          <Tag color="warning" key={index} style={{ marginBottom: 4 }}>
            {item}
          </Tag>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="Ghi chú thêm từ bác sĩ">
        <Text italic type="secondary">
          {ce.notes}
        </Text>
      </Descriptions.Item>
    </Descriptions>
  );

  const renderConclusion = (conclusion: Conclusion) => (
    <Card
      bordered={false}
      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)" }}
    >
      <Descriptions column={1} layout="vertical" size="middle">
        <Descriptions.Item label="Tình trạng sức khỏe tổng quát">
          <Tag
            icon={<CheckCircleOutlined />}
            color={getHealthTagColor(conclusion.healthStatus)}
            style={{ fontSize: "1em", padding: "4px 8px" }}
          >
            <Text strong style={{ color: "inherit" }}>
              {conclusion.healthStatus.toUpperCase()}
            </Text>
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Lời khuyên từ chuyên gia">
          <Text mark>{conclusion.advice}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const handleViewPDF = useCallback(async (fileId: string) => {
    try {
      const arrayBuffer = await parentDashboardApis.getPDFById(fileId);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      typeof error === "string"
        ? toast.warn(error)
        : toast.error("Không thể mở file PDF hồ sơ sức khỏe.");
    }
  }, []);

  return (
    <div style={{ padding: "24px", margin: "0 auto" }}>
      <Button
        type="primary"
        onClick={onBack}
        style={{ marginBottom: 16, border: "none" }}
      >
        &larr; Quay lại danh sách hồ sơ
      </Button>
      <Title
        level={2}
        style={{
          color: "#0050b3",
          borderBottom: "2px solid #0050b3",
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

      <Row gutter={24}>
        <Col span={12}>
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                <RiseOutlined style={{ marginRight: 8, color: "#52c41a" }} />{" "}
                Phát Triển Thể Chất
              </Title>
            }
            bordered={false}
            style={{
              marginBottom: 24,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {renderPhysicalDevelopment(data.physicalDevelopment)}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                <SolutionOutlined
                  style={{ marginRight: 8, color: "#1890ff" }}
                />{" "}
                Kết Luận
              </Title>
            }
            bordered={false}
            style={{
              marginBottom: 24,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {renderConclusion(data.conclusion)}
          </Card>

          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                <FileTextOutlined
                  style={{ marginRight: 8, color: "#722ed1" }}
                />{" "}
                Tài Liệu Đính Kèm
              </Title>
            }
            bordered={false}
            style={{
              marginBottom: 24,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                >
                  Xem chi tiết
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left" style={{ margin: "24px 0" }}>
        <Title level={3} style={{ margin: 0 }}>
          <SolutionOutlined style={{ marginRight: 8 }} /> Khám Toàn Diện Chi Tiết
        </Title>
      </Divider>

      <Collapse
        defaultActiveKey={["1"]}
        expandIconPosition="right"
        style={{
          marginBottom: 24,
          border: "1px solid #d9d9d9",
          borderRadius: 8,
        }}
      >
        <Panel
          header={
            <Title level={4} style={{ margin: 0 }}>
              <SolutionOutlined style={{ marginRight: 8, color: "#eb2f96" }} />{" "}
              Chi Tiết Khám Toàn Diện
            </Title>
          }
          key="1"
        >
          {renderComprehensiveExamination(data.comprehensiveExamination)}
        </Panel>
      </Collapse>

      <Divider />
      <Text type="secondary" style={{ fontSize: "0.85em" }}>
        <CalendarOutlined /> Tạo lúc: {formatDate(data.createdAt)} | Người tạo:{" "}
        {data.createdBy}
      </Text>
    </div>
  );
};

const Medical: React.FC = () => {
  const user = useCurrentUser();
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();

  const [listChild, setListChild] = useState<Student[]>([]);
  const [listData, setListData] = useState<HealthCheckRecord[]>([]);
  const [pagination, setPagination] = useState<
    PageParams & { totalCount: number }
  >({ page: 1, limit: 10, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(false);

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
      console.error("Lỗi khi tải danh sách con:", error);
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
      console.error("Lỗi khi tải danh sách hồ sơ:", error);
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
        title: "Chiều Cao/Cân Nặng (cm/kg)",
        key: "physicalDevelopment",
        render: (record: HealthCheckRecord) => (
          <Text>
            {record.physicalDevelopment.height} /{" "}
            {record.physicalDevelopment.weight}
          </Text>
        ),
      },
      {
        title: "Đánh Giá Tổng Quát",
        dataIndex: ["physicalDevelopment", "evaluation"],
        key: "evaluation",
      },
      {
        title: "Kết Luận Sức Khỏe",
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
        width: 100,
        render: (record: HealthCheckRecord) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => setDetailRecord(record)}
            size="small"
            style={{ padding: 0 }}
          >
            Xem chi tiết
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
        style={{ color: "#1890ff", display: "flex", alignItems: "center" }}
      >
        <HeartOutlined style={{ marginRight: 10 }} /> Hồ Sơ Khám Sức Khỏe Định
        Kỳ
      </Title>
      <Divider style={{ margin: "16px 0" }} />

      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            <UserOutlined /> Lựa Chọn Hồ Sơ
          </Title>
        }
        bordered={false}
        style={{
          marginBottom: 24,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#fafafa",
        }}
      >
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Text strong style={{ color: "#595959" }}>
              Chọn tên con để xem hồ sơ:
            </Text>
          </Col>
          <Col span={18}>
            <Select
              value={selectedStudentId}
              style={{ width: 350 }}
              onChange={(value) => setSelectedStudentId(value)}
              placeholder="Chọn con của bạn"
              size="large"
              disabled={listChild.length === 0}
            >
              {listChild.map((student) => (
                <Option key={student._id} value={student._id}>
                  {student.fullName} ({student.studentCode})
                </Option>
              ))}
            </Select>
            {listChild.length === 0 && (
              <Text type="danger" style={{ marginLeft: 10 }}>
                Không tìm thấy hồ sơ học sinh.
              </Text>
            )}
          </Col>
        </Row>
      </Card>

      <Title
        level={3}
        style={{
          color: "#1890ff",
          borderBottom: "1px solid #e8e8e8",
          paddingBottom: 8,
        }}
      >
        <ContainerOutlined style={{ marginRight: 8 }} />
        Danh Sách Hồ Sơ Khám ({selectedStudent?.fullName || "..."})
      </Title>
      <Divider style={{ margin: "10px 0 20px 0" }} />

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
