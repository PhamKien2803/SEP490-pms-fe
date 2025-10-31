import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  Empty,
  Button,
  Descriptions,
  Select,
  DatePicker,
} from "antd";
import {
  SmileOutlined,
  CheckCircleOutlined,
  BookOutlined,
  InteractionOutlined,
  BulbOutlined,
  RestOutlined,
  CalendarOutlined,
  ForkOutlined,
  HeartOutlined,
  UserOutlined,
  MessageOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { FeedbackData, FeedbackParams, Student } from "../../../types/parent";
import { parentDashboardApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const defaultDate = "2025-10-27";

const HealthCard: React.FC<{ data: FeedbackData }> = ({ data }) => (
  <Card
    title={
      <Title level={4} style={{ margin: 0 }}>
        <HeartOutlined style={{ marginRight: 8, color: "#f5222d" }} />
        Sức Khỏe & Thể Chất
      </Title>
    }
    bordered={false}
    style={{ marginBottom: 24, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
  >
    <Descriptions column={1} size="small" layout="vertical" colon={false}>
      <Descriptions.Item label={<Text strong>Ghi chú sức khỏe</Text>}>
        <Text>{data.health.note || "Không có ghi chú."}</Text>
      </Descriptions.Item>
    </Descriptions>
  </Card>
);

const DailyHighlightCard: React.FC<{ data: FeedbackData }> = ({ data }) => (
  <Card
    title={
      <Title level={4} style={{ margin: 0 }}>
        <BulbOutlined style={{ marginRight: 8, color: "#faad14" }} />
        Điểm Nhấn Trong Ngày
      </Title>
    }
    bordered={false}
    style={{ marginBottom: 24, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
  >
    <Text italic>{data.dailyHighlight || "Không có điểm nhấn đặc biệt."}</Text>
  </Card>
);

const RemindersCard: React.FC<{ reminders: string[] }> = ({ reminders }) => (
  <Card
    title={
      <Title level={4} style={{ margin: 0 }}>
        <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
        Nhắc Nhở Của Giáo Viên
      </Title>
    }
    bordered={false}
    style={{ marginBottom: 24, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
  >
    {reminders.length > 0 ? (
      reminders.map((reminder, index) => (
        <Tag
          icon={<BulbOutlined />}
          color="processing"
          key={index}
          style={{ marginBottom: 8, padding: "4px 8px" }}
        >
          {reminder}
        </Tag>
      ))
    ) : (
      <Text type="secondary">Không có nhắc nhở đặc biệt.</Text>
    )}
  </Card>
);

const Feedback: React.FC = () => {
  const user = useCurrentUser();
  const [listChild, setListChild] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(defaultDate));
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const params: FeedbackParams = useMemo(
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
    if (!user?.parent) return;

    try {
      const response = await parentDashboardApis.getListChild(user.parent);
      setListChild(response?.students || []);
      if (response?.students?.length > 0) {
        setSelectedStudentId(response.students[0]._id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách con:", error);
      setIsLoading(false);
    }
  };

  const fetchFeedback = async () => {
    if (!selectedStudentId || !selectedDate) {
      setFeedbackData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const response = await parentDashboardApis.getListFeedback(params);

      setFeedbackData(response?.data || response);
    } catch (error) {
      setIsError(true);
      setFeedbackData(null);
      console.error("Lỗi khi fetch feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
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
        <MessageOutlined style={{ marginRight: 10 }} />
        Báo Cáo Hoạt Động & Phản Hồi Hàng Ngày
      </Title>
      <Divider style={{ margin: "16px 0" }} />

      <Card
        bordered={false}
        style={{
          marginBottom: 24,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#e6fffb",
        }}
      >
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Text
              strong
              style={{ display: "block", marginBottom: 4, color: "#595959" }}
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
              style={{ display: "block", marginBottom: 4, color: "#595959" }}
            >
              <ClockCircleOutlined style={{ marginRight: 4 }} /> Ngày báo cáo:
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
        {isError && !feedbackData && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty
              description={
                <Title level={4} type="danger">
                  Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại.
                </Title>
              }
            />
            <Button type="primary" onClick={fetchFeedback}>
              Thử lại
            </Button>
          </div>
        )}

        {!feedbackData && !isError && selectedStudentId && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty
              description={
                <Title level={4}>
                  Chưa có báo cáo hoạt động cho {selectedStudent?.fullName} vào
                  ngày {selectedDate.format("DD/MM/YYYY")}.
                </Title>
              }
            />
            <Button onClick={fetchFeedback}>Tải lại dữ liệu</Button>
          </div>
        )}

        {feedbackData && (
          <>
            <Card
              title={
                <Title level={4} style={{ margin: 0 }}>
                  <CalendarOutlined /> Thông tin báo cáo
                </Title>
              }
              bordered={false}
              style={{
                marginBottom: 24,
                backgroundColor: "#e6f7ff",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Text strong>Học sinh:</Text>{" "}
                  <Text>
                    {feedbackData.studentId?.fullName} (
                    {feedbackData.studentId?.studentCode})
                  </Text>
                </Col>
                <Col span={8}>
                  <Text strong>Lớp:</Text>{" "}
                  <Text>
                    {feedbackData.classId.className} (
                    {feedbackData.classId.classCode})
                  </Text>
                </Col>
                <Col span={8}>
                  <Text strong>Giáo viên:</Text>{" "}
                  <Text>{feedbackData.teacherId.fullName}</Text>
                </Col>
              </Row>
            </Card>

            <Row gutter={24}>
              <Col span={12}>
                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      <ForkOutlined
                        style={{ marginRight: 8, color: "#52c41a" }}
                      />{" "}
                      Ăn Uống
                    </Title>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <Descriptions column={2} size="small" layout="vertical">
                    <Descriptions.Item label={<Text strong>Bữa sáng</Text>}>
                      <Text>{feedbackData.eating.breakfast}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Bữa trưa</Text>}>
                      <Text>{feedbackData.eating.lunch}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Bữa xế</Text>}>
                      <Text>{feedbackData.eating.snack}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: "10px 0" }} />
                  <Text type="secondary">
                    Ghi chú: {feedbackData.eating.note || "Không có."}
                  </Text>
                </Card>
                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      <RestOutlined
                        style={{ marginRight: 8, color: "#722ed1" }}
                      />{" "}
                      Ngủ Nghỉ
                    </Title>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <Descriptions column={2} size="small" layout="vertical">
                    <Descriptions.Item label={<Text strong>Thời gian</Text>}>
                      <Text>{feedbackData.sleeping.duration}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Chất lượng</Text>}>
                      <Text>{feedbackData.sleeping.quality}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: "10px 0" }} />
                  <Text type="secondary">
                    Ghi chú: {feedbackData.sleeping.note || "Không có."}
                  </Text>
                </Card>
                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      <CheckCircleOutlined
                        style={{ marginRight: 8, color: "#eb2f96" }}
                      />{" "}
                      Vệ Sinh
                    </Title>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <Descriptions column={2} size="small" layout="vertical">
                    <Descriptions.Item label={<Text strong>Đi vệ sinh</Text>}>
                      <Text>{feedbackData.hygiene.toilet}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Rửa tay</Text>}>
                      <Text>{feedbackData.hygiene.handwash}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: "10px 0" }} />
                  <Text type="secondary">
                    Ghi chú: {feedbackData.hygiene.note || "Không có."}
                  </Text>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      <BookOutlined
                        style={{ marginRight: 8, color: "#fadb14" }}
                      />{" "}
                      Học Tập
                    </Title>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <Descriptions column={2} size="small" layout="vertical">
                    <Descriptions.Item label={<Text strong>Tập trung</Text>}>
                      <Text>{feedbackData.learning.focus}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Tham gia</Text>}>
                      <Text>{feedbackData.learning.participation}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: "10px 0" }} />
                  <Text type="secondary">
                    Ghi chú: {feedbackData.learning.note || "Không có."}
                  </Text>
                </Card>

                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      <InteractionOutlined
                        style={{ marginRight: 8, color: "#ff7a45" }}
                      />{" "}
                      Tương Tác & Cảm Xúc
                    </Title>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <Descriptions column={3} size="small" layout="vertical">
                    <Descriptions.Item label={<Text strong>Bạn bè</Text>}>
                      <Text>{feedbackData.social.friendInteraction}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Cảm xúc</Text>}>
                      <Text>{feedbackData.social.emotionalState}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong>Hành vi</Text>}>
                      <Text>{feedbackData.social.behavior}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: "10px 0" }} />
                  <Text type="secondary">
                    Ghi chú: {feedbackData.social.note || "Không có."}
                  </Text>
                </Card>
                <HealthCard data={feedbackData} />
              </Col>
            </Row>

            <Divider orientation="left" style={{ margin: "24px 0" }}>
              <Title level={3} style={{ margin: 0 }}>
                <SmileOutlined style={{ marginRight: 8 }} /> Nhận Xét & Ghi Chú
                Bổ Sung
              </Title>
            </Divider>

            <Row gutter={24}>
              <Col span={12}>
                <DailyHighlightCard data={feedbackData} />
              </Col>
              <Col span={12}>
                <Card
                  title={
                    <Title level={4} style={{ margin: 0 }}>
                      <SmileOutlined
                        style={{ marginRight: 8, color: "#73d13c" }}
                      />{" "}
                      Lời Nhận Xét Chung
                    </Title>
                  }
                  bordered={false}
                  style={{
                    marginBottom: 24,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.09)",
                  }}
                >
                  <Text>
                    {feedbackData.teacherNote ||
                      "Giáo viên không có nhận xét chung nào."}
                  </Text>
                </Card>
              </Col>
            </Row>

            <RemindersCard reminders={feedbackData.reminders} />
          </>
        )}
      </Spin>
    </div>
  );
};

export default Feedback;
