import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  Empty,
  Button,
  Descriptions,
  Select,
  DatePicker,
  Tag,
  Form,
  Avatar,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ScheduleOutlined,
  FilterOutlined,
  StopOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { parentDashboardApis } from "../../../services/apiServices";
import { Student } from "../../../types/parent";
import { CheckInResponse, CheckInParams } from "../../../types/parent";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option } = Select;

const defaultDate = dayjs();

const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  let color = "default";
  let icon = <ClockCircleOutlined />;
  let text = status;

  switch (status.toLowerCase()) {
    case "có mặt":
      color = "success";
      icon = <CheckCircleOutlined />;
      text = "Có Mặt";
      break;
    case "vắng mặt":
      color = "error";
      icon = <StopOutlined />;
      text = "Vắng Mặt";
      break;
    default:
      color = "default";
      icon = <ClockCircleOutlined />;
      text = "Chưa điểm danh";
      break;
  }

  return (
    <Tag
      icon={icon}
      color={color}
      style={{
        fontSize: "1.1em",
        padding: "5px 10px",
        borderRadius: "12px",
        fontWeight: "bold",
      }}
    >
      {text}
    </Tag>
  );
};

const getStatusBorderColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "có mặt":
      return "#52c41a";
    case "vắng mặt":
      return "#f5222d";
    default:
      return "#bfbfbf";
  }
};

const CheckIn: React.FC = () => {
  usePageTitle("Điểm danh hàng ngày - Cá Heo Xanh");
  const user = useCurrentUser();
  const [listChild, setListChild] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(defaultDate);
  const [checkIn, setCheckIn] = useState<CheckInResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_, setIsError] = useState<boolean>(false);

  const params: CheckInParams = useMemo(
    () => ({
      studentId: selectedStudentId || "",
      date: selectedDate.format("YYYY-MM-DD"),
    }),
    [selectedStudentId, selectedDate]
  );

  const disabledDate = (current: Dayjs) => {
    return current && current.isAfter(dayjs(), "day");
  };

  useEffect(() => {
    getDataListChild();
  }, [user?.parent]);

  const getDataListChild = async () => {
    if (!user?.parent) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await parentDashboardApis.getListChild(user.parent);
      const students = response?.students || [];
      setListChild(students);

      if (students.length > 0) {
        setSelectedStudentId(students[0]._id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải danh sách con")
      setIsLoading(false);
    }
  };

  const fetchCheckIn = async () => {
    if (!selectedStudentId || !selectedDate) {
      setCheckIn(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const data = await parentDashboardApis.getDataCheckIn(params);
      setCheckIn(data);
    } catch (error) {
      setIsError(true);
      setCheckIn(null);
      typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải check-in")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckIn();
  }, [params.studentId, params.date]);

  const selectedStudent = listChild.find((s) => s._id === selectedStudentId);

  if (isLoading && listChild.length === 0 && !selectedStudentId) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang tải thông tin học sinh..." />
      </div>
    );
  }

  if (listChild.length === 0 && !isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty
          description={
            <Title level={4}>
              Không tìm thấy hồ sơ học sinh nào thuộc quyền quản lý của bạn.
            </Title>
          }
          style={{ padding: "50px 0" }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", margin: "0 auto" }}>
      <Title
        level={2}
        style={{
          color: "#08979c",
          borderBottom: "2px solid #08979c",
          paddingBottom: 8,
        }}
      >
        <ScheduleOutlined style={{ marginRight: 10 }} />
        Báo Cáo Điểm Danh Hàng Ngày
      </Title>
      <Divider style={{ margin: "16px 0" }} />

      <Card
        bordered
        title={
          <Text strong>
            <FilterOutlined style={{ marginRight: 8 }} />
            Lọc Thông Tin
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
                  loading={isLoading && listChild.length === 0}
                >
                  {listChild.map((student) => (
                    <Option key={student._id} value={student._id}>
                      {student?.fullName} ({student?.studentCode})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Chọn ngày
                  </Text>
                }
              >
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => {
                    if (date) setSelectedDate(date);
                  }}
                  disabledDate={disabledDate}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  size="large"
                  allowClear={false}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Spin spinning={isLoading}>
        {/* {isError && !checkIn && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty
              description={
                <Title level={4} type="danger">
                  Không thể tải dữ liệu điểm danh. Vui lòng thử lại.
                </Title>
              }
            />
            <Button type="primary" onClick={fetchCheckIn}>
              Thử lại
            </Button>
          </div>
        )} */}

        {!checkIn && selectedStudentId && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty
              description={
                <Title level={4}>
                  Chưa có thông tin điểm danh cho{" "}
                  <Text strong>{selectedStudent?.fullName}</Text> vào ngày{" "}
                  <Text strong>{selectedDate.format("DD/MM/YYYY")}</Text>.
                </Title>
              }
            />
            <Button onClick={fetchCheckIn}>Tải lại</Button>
          </div>
        )}

        {checkIn && (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10} lg={8}>
              <Card
                title={
                  <Text strong style={{ fontSize: "1.1rem" }}>
                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                    Thông Tin Điểm Danh
                  </Text>
                }
                bordered={false}
                style={{
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  borderTop: `5px solid ${getStatusBorderColor(
                    checkIn?.student?.status
                  )}`,
                }}
              >
                <Descriptions column={1} size="middle" layout="vertical">
                  <Descriptions.Item
                    label={<Text strong>Học sinh</Text>}
                    style={{ paddingBottom: 16 }}
                  >
                    <Text strong style={{ fontSize: "1.1em", color: "#1890ff" }}>
                      {checkIn?.student?.student?.fullName} (
                      {checkIn?.student?.student?.studentCode})
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={<Text strong>Lớp học</Text>}
                    style={{ paddingBottom: 16 }}
                  >
                    <Text>
                      {checkIn?.class?.className} ({checkIn?.class?.classCode})
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={<Text strong>Trạng thái ngày học</Text>}
                  >
                    <StatusTag
                      status={checkIn?.student?.status || "Chưa điểm danh"}
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={14} lg={16}>
              <Card
                title={
                  <Text strong style={{ fontSize: "1.1rem" }}>
                    <TeamOutlined style={{ marginRight: 8 }} />
                    Chi Tiết từ Giáo Viên
                  </Text>
                }
                bordered={false}
                style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
              >
                <Descriptions column={1} layout="vertical" size="middle">
                  <Descriptions.Item
                    label={<Text strong>Giáo viên phụ trách</Text>}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ marginRight: 12, backgroundColor: "#08979c" }}
                      />
                      <div>
                        <Text strong style={{ display: "block" }}>
                          {checkIn?.teacher?.fullName}
                        </Text>
                        <Text type="secondary">
                          {checkIn?.teacher?.phoneNumber || "Không có SĐT"}
                        </Text>
                      </div>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Text strong>
                        <CommentOutlined style={{ marginRight: 4 }} />
                        Nhận xét chung của giáo viên
                      </Text>
                    }
                  >
                    {checkIn.generalNote ? (
                      <Text italic style={{ fontSize: "1em" }}>
                        "{checkIn?.generalNote}"
                      </Text>
                    ) : (
                      <Text italic type="secondary">
                        Không có ghi chú chung cho ngày học này.
                      </Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Xóa phần thông tin học kỳ */}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default CheckIn;