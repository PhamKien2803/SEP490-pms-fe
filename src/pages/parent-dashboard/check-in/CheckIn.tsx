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
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  HomeOutlined,
  TeamOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { parentDashboardApis } from "../../../services/apiServices";
import { Student } from "../../../types/parent";
import { CheckInResponse, CheckInParams } from "../../../types/parent";

const { Title, Text } = Typography;
const { Option } = Select;

const defaultDate = dayjs();

const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  let color = "default";
  let icon = <ClockCircleOutlined />;
  let text = status;

  switch (status.toLowerCase()) {
    case "Có mặt":
      color = "success";
      icon = <CheckCircleOutlined />;
      text = "Có Mặt";
      break;
    case "Vắng mặt có phép":
      color = "warning";
      icon = <AlertOutlined />;
      text = "Vắng (Có phép)";
      break;
    case "vắng không phép":
      color = "Vắng mặt không phép";
      icon = <AlertOutlined />;
      text = "Vắng (Không phép)";
      break;
    case "Đi muộn":
      color = "processing";
      icon = <ClockCircleOutlined />;
      text = "Đi muộn";
      break;
    default:
      color = "default";
      icon = <ClockCircleOutlined />;
      break;
  }

  return (
    <Tag
      icon={icon}
      color={color}
      style={{ fontSize: "1em", padding: "4px 8px" }}
    >
      {text}
    </Tag>
  );
};

const CheckIn: React.FC = () => {
  const user = useCurrentUser();
  const [listChild, setListChild] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(defaultDate);
  const [checkIn, setCheckIn] = useState<CheckInResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

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
      console.error("Lỗi khi tải danh sách con:", error);
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
      console.error("Lỗi khi fetch check-in:", error);
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
          color: "#1890ff",
          borderBottom: "2px solid #1890ff",
          paddingBottom: 8,
        }}
      >
        <ScheduleOutlined style={{ marginRight: 10 }} />
        Báo Cáo Điểm Danh Hàng Ngày
      </Title>
      <Divider style={{ margin: "16px 0" }} />

      <Card
        bordered={false}
        style={{
          marginBottom: 24,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#F0F8FF",
        }}
      >
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Text
              strong
              style={{ display: "block", marginBottom: 4, color: "#1890ff" }}
            >
              <UserOutlined style={{ marginRight: 4 }} /> Chọn con:
            </Text>
            <Select
              value={selectedStudentId}
              style={{ width: "100%" }}
              onChange={(value) => setSelectedStudentId(value)}
              placeholder="Chọn con của bạn"
              size="large"
            >
              {listChild.map((student) => (
                <Option key={student._id} value={student._id}>
                  {student?.fullName} ({student?.studentCode})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Text
              strong
              style={{ display: "block", marginBottom: 4, color: "#1890ff" }}
            >
              <ClockCircleOutlined style={{ marginRight: 4 }} /> Chọn ngày:
            </Text>
            <DatePicker
              value={selectedDate}
              onChange={(date) => {
                if (date) setSelectedDate(date);
              }}
              disabledDate={disabledDate}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              size="large"
            />
          </Col>
        </Row>
      </Card>

      <Spin spinning={isLoading}>
        {isError && !checkIn && (
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
        )}

        {!checkIn && !isError && selectedStudentId && (
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
            <Button onClick={fetchCheckIn}>Tải lại dữ liệu</Button>
          </div>
        )}

        {checkIn && (
          <>
            <Card
              title={
                <Title level={4} style={{ margin: 0 }}>
                  <CheckCircleOutlined /> Tóm Tắt Điểm Danh
                </Title>
              }
              bordered={false}
              style={{
                marginBottom: 24,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Descriptions
                column={{ xs: 1, sm: 2, md: 3 }}
                bordered
                size="middle"
              >
                <Descriptions.Item
                  label={
                    <Text strong>
                      <UserOutlined /> Học sinh
                    </Text>
                  }
                >
                  <Text>
                    {checkIn.student.student.fullName} (
                    {checkIn.student.student.studentCode})
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong>
                      <TeamOutlined /> Lớp học
                    </Text>
                  }
                >
                  <Text>
                    {checkIn.class.className} ({checkIn.class.classCode})
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong>
                      <CalendarOutlined /> Ngày
                    </Text>
                  }
                >
                  <Text>{dayjs(checkIn.date).format("DD/MM/YYYY")}</Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <Text strong>
                      <CheckCircleOutlined /> Tình trạng
                    </Text>
                  }
                  span={1.5}
                >
                  <StatusTag
                    status={checkIn.student.status || "Chưa điểm danh"}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Row gutter={24}>
              <Col span={12}>
                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      <TeamOutlined /> Thông tin giáo viên
                    </Title>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <Descriptions
                    column={1}
                    size="small"
                    layout="vertical"
                    colon={false}
                  >
                    <Descriptions.Item label={<Text strong>Tên</Text>}>
                      <Text>{checkIn.teacher.fullName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Điện thoại</Text>}>
                      <Text>
                        {checkIn.teacher.phoneNumber || "Không cung cấp."}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      <HomeOutlined /> Nhận xét chung của giáo viên
                    </Title>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <Text italic>
                    {checkIn.generalNote ||
                      "Không có ghi chú chung cho ngày học này."}
                  </Text>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left" style={{ margin: "24px 0" }}>
              <Title level={3} style={{ margin: 0 }}>
                <CalendarOutlined /> Chi Tiết Học Kỳ
              </Title>
            </Divider>

            <Descriptions column={2} bordered size="middle">
              <Descriptions.Item label={<Text strong>Năm học</Text>}>
                <Text>{checkIn.schoolYear.schoolYear}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Mã năm học</Text>}>
                <Text>{checkIn.schoolYear.schoolyearCode}</Text>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Spin>
    </div>
  );
};

export default CheckIn;
