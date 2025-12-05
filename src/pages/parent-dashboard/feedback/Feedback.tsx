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
  Form,
  Tabs,
  List,
  Alert,
} from "antd";
import {
  SmileOutlined,
  CheckCircleOutlined,
  BookOutlined,
  InteractionOutlined,
  BulbOutlined,
  RestOutlined,
  ForkOutlined,
  HeartOutlined,
  UserOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  BellOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { FeedbackData, FeedbackParams, Student } from "../../../types/parent";
import { parentDashboardApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import dayjs, { Dayjs } from "dayjs";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { toast } from "react-toastify";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const defaultDate = new Date();

const Feedback: React.FC = () => {
  usePageTitle("Đánh giá hàng ngày - Cá Heo Xanh");
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
      typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải danh sách con")
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
      typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải đánh giá")
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
          color: "#08979c",
          borderBottom: "2px solid #08979c",
          paddingBottom: 8,
        }}
      >
        <MessageOutlined style={{ marginRight: 10 }} />
        Báo Cáo Hoạt Động & Phản Hồi Hàng Ngày
      </Title>
      <Divider style={{ margin: "16px 0" }} />

      <Card
        bordered
        title={
          <Text strong>
            <FilterOutlined style={{ marginRight: 8 }} />
            Lọc Báo Cáo
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
                    Ngày báo cáo
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
        {/* {isError && !feedbackData && (
          <Alert
            message={<Title level={4} style={{ margin: 0 }}>Lỗi Tải thông tin</Title>}
            description="Không thể tải thông tin báo cáo. Vui lòng kiểm tra kết nối và thử lại."
            type="error"
            showIcon
            action={
              <Button type="primary" danger onClick={fetchFeedback}>
                Thử lại
              </Button>
            }
            style={{ padding: "24px" }}
          />
        )} */}

        {!feedbackData && selectedStudentId && (
          <Alert
            message={<Title level={4} style={{ margin: 0 }}>Chưa Có Đánh Giá</Title>}
            description={
              <>
                Hiện tại chưa có báo cáo hoạt động cho học sinh{" "}
                <Text strong>{selectedStudent?.fullName}</Text> vào ngày{" "}
                <Text strong>{selectedDate.format("DD/MM/YYYY")}</Text>.
              </>
            }
            type="info"
            showIcon
            style={{ padding: "24px" }}
          />
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
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card
                style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                bordered={false}
              >
                <Tabs defaultActiveKey="eating" size="large">
                  <TabPane
                    tab={
                      <span>
                        <ForkOutlined />
                        Ăn Uống
                      </span>
                    }
                    key="eating"
                  >
                    <Descriptions column={2} bordered size="middle">
                      <Descriptions.Item label={<Text strong>Bữa sáng</Text>}>
                        <Text>{feedbackData?.eating?.breakfast}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Bữa trưa</Text>}>
                        <Text>{feedbackData?.eating?.lunch}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Bữa xế</Text>}
                        span={2}
                      >
                        <Text>{feedbackData?.eating?.snack}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Ghi chú</Text>}
                        span={2}
                      >
                        <Text type="secondary">
                          {feedbackData?.eating?.note || "Không có."}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </TabPane>

                  <TabPane
                    tab={
                      <span>
                        <RestOutlined />
                        Ngủ Nghỉ
                      </span>
                    }
                    key="sleeping"
                  >
                    <Descriptions column={2} bordered size="middle">
                      <Descriptions.Item label={<Text strong>Thời gian</Text>}>
                        <Text>{feedbackData?.sleeping?.duration}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Chất lượng</Text>}>
                        <Text>{feedbackData?.sleeping?.quality}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Ghi chú</Text>}
                        span={2}
                      >
                        <Text type="secondary">
                          {feedbackData?.sleeping?.note || "Không có."}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </TabPane>

                  <TabPane
                    tab={
                      <span>
                        <CheckCircleOutlined />
                        Vệ Sinh
                      </span>
                    }
                    key="hygiene"
                  >
                    <Descriptions column={2} bordered size="middle">
                      <Descriptions.Item label={<Text strong>Đi vệ sinh</Text>}>
                        <Text>{feedbackData?.hygiene?.toilet}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Rửa tay</Text>}>
                        <Text>{feedbackData?.hygiene?.handwash}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Ghi chú</Text>}
                        span={2}
                      >
                        <Text type="secondary">
                          {feedbackData?.hygiene?.note || "Không có."}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </TabPane>

                  <TabPane
                    tab={
                      <span>
                        <BookOutlined />
                        Học Tập
                      </span>
                    }
                    key="learning"
                  >
                    <Descriptions column={2} bordered size="middle">
                      <Descriptions.Item label={<Text strong>Tập trung</Text>}>
                        <Text>{feedbackData?.learning?.focus}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Tham gia</Text>}>
                        <Text>{feedbackData?.learning?.participation}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Ghi chú</Text>}
                        span={2}
                      >
                        <Text type="secondary">
                          {feedbackData?.learning?.note || "Không có."}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </TabPane>

                  <TabPane
                    tab={
                      <span>
                        <InteractionOutlined />
                        Tương Tác
                      </span>
                    }
                    key="social"
                  >
                    <Descriptions column={2} bordered size="middle">
                      <Descriptions.Item label={<Text strong>Bạn bè</Text>}>
                        <Text>{feedbackData?.social?.friendInteraction}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<Text strong>Cảm xúc</Text>}>
                        <Text>{feedbackData?.social?.emotionalState}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Hành vi</Text>}
                        span={2}
                      >
                        <Text>{feedbackData?.social?.behavior}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={<Text strong>Ghi chú</Text>}
                        span={2}
                      >
                        <Text type="secondary">
                          {feedbackData?.social?.note || "Không có."}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </TabPane>
                </Tabs>
              </Card>

              <Card
                title={
                  <Title level={4} style={{ margin: 0 }}>
                    <SmileOutlined
                      style={{ marginRight: 8, color: "#73d13c" }}
                    />
                    Nhận Xét Chung
                  </Title>
                }
                bordered={false}
                style={{
                  marginTop: 24,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Paragraph
                  style={{ fontSize: "1em" }}
                  italic={!feedbackData?.teacherNote}
                >
                  {feedbackData?.teacherNote ||
                    "Giáo viên không có nhận xét chung nào."}
                </Paragraph>
                <Divider style={{ margin: "16px 0" }} />
                <Title level={5}>
                  <HeartOutlined style={{ marginRight: 8, color: "#f5222d" }} />
                  Ghi chú Sức khỏe
                </Title>
                <Paragraph
                  style={{ fontSize: "1em" }}
                  italic={!feedbackData?.health?.note}
                >
                  {feedbackData?.health?.note || "Không có ghi chú sức khỏe."}
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={
                  <Title level={4} style={{ margin: 0 }}>
                    <InfoCircleOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    Thông Tin Ngày Học
                  </Title>
                }
                bordered={false}
                style={{
                  marginBottom: 24,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Descriptions column={1} layout="vertical">
                  <Descriptions.Item
                    label={<Text strong>Giáo viên phụ trách</Text>}
                  >
                    <Text>{feedbackData?.teacherId?.fullName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<Text strong>Điểm nhấn trong ngày</Text>}
                  >
                    <Text type="secondary">
                      {feedbackData?.dailyHighlight ||
                        "Không có điểm nhấn đặc biệt."}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card
                title={
                  <Title level={4} style={{ margin: 0 }}>
                    <BellOutlined
                      style={{ marginRight: 8, color: "#faad14" }}
                    />
                    Nhắc Nhở Của Giáo Viên
                  </Title>
                }
                bordered={false}
                style={{
                  marginBottom: 24,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                {feedbackData?.reminders?.length > 0 ? (
                  <List
                    dataSource={feedbackData?.reminders}
                    renderItem={(item, _) => (
                      <List.Item style={{ padding: "8px 0", border: "none" }}>
                        <Tag
                          icon={<BulbOutlined />}
                          color="processing"
                          style={{
                            padding: "6px 12px",
                            fontSize: "14px",
                            width: "100%",
                            whiteSpace: "normal",
                          }}
                        >
                          {item}
                        </Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">Không có nhắc nhở đặc biệt.</Text>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default Feedback;