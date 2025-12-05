import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Button,
  Avatar,
  Select,
  Spin,
  Alert,
  Descriptions,
  Space,
  Tooltip,
  Tabs,
  Form,
  Input,
} from "antd";
import {
  UserOutlined,
  SolutionOutlined,
  CalendarOutlined,
  PhoneOutlined,
  SafetyOutlined,
  FlagOutlined,
  SmileOutlined,
  MailOutlined,
  SyncOutlined,
  IdcardOutlined,
  TeamOutlined,
  LockOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  ParentInfo,
  StudentListItem,
  ParentStudentsListResponse,
} from "../../../types/parent";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { parentDashboardApis } from "../../../services/apiServices";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title, Text } = Typography;
const { Option } = Select;

const ACCENT_COLOR = "#0050b3";
const PRIMARY_COLOR = "#e6f7ff";
const TEXT_COLOR = "#262626";
const BACKGROUND_GREY = "#F0F2F5";

const getDisplayDate = (dob: dayjs.Dayjs | null): string => {
  return dob ? dob.format("DD/MM/YYYY") : "Chưa cập nhật";
};

interface ParentCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ParentCard: React.FC<ParentCardProps> = ({ icon, label, value }) => (
  <Card
    bordered={false}
    style={{
      backgroundColor: PRIMARY_COLOR,
      borderRadius: 8,
      marginBottom: 16,
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    }}
    bodyStyle={{ padding: "15px 20px" }}
  >
    <Space direction="vertical" size={2} style={{ width: "100%" }}>
      <Text type="secondary" style={{ fontSize: 13, color: "#6A6A6A" }}>
        {label}
      </Text>
      <Space>
        {icon}
        <Text strong style={{ color: TEXT_COLOR, fontSize: 16 }}>
          {value}
        </Text>
      </Space>
    </Space>
  </Card>
);

const ChangePasswordTab: React.FC<{ parentId: string }> = ({ parentId }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await parentDashboardApis.changePasswordParent(parentId, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
      form.resetFields();
    } catch (error) {
      typeof error === "string" ? toast.info(error) : toast.error("Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", paddingTop: 20 }}>
      <Title level={5} style={{ textAlign: "center", marginBottom: 30 }}>
        Đổi mật khẩu tài khoản
      </Title>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="oldPassword"
          label="Mật khẩu hiện tại"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu cũ" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={<SaveOutlined />}
            style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR, marginTop: 10 }}
          >
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const UpdateParentInfoTab: React.FC<{ parent: ParentInfo; onUpdateSuccess: () => void }> = ({
  parent,
  onUpdateSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      fullName: parent.fullName,
      email: parent.email,
      phoneNumber: parent.phoneNumber,
      job: parent.job,
      idCard: parent.idCard,
    });
  }, [parent, form]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        phoneNumber: values.phoneNumber,
        IDCard: values.idCard,
        job: values.job,
      };

      await parentDashboardApis.updateParentInfor(parent._id, payload);
      toast.success("Cập nhật thông tin thành công!");
      onUpdateSuccess();
    } catch (error) {
      typeof error === "string" ? toast.info(error) : toast.error("Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 10 }}>
      <Alert
        message="Thông tin định danh như CCCD cần chính xác để đảm bảo hồ sơ hợp lệ."
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Họ và tên (Không thể sửa)"
            >
              <Input prefix={<UserOutlined />} disabled style={{ color: '#000' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email (Không thể sửa)"
            >
              <Input prefix={<MailOutlined />} disabled style={{ color: '#000' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="job" label="Nghề nghiệp">
              <Input prefix={<SolutionOutlined />} placeholder="Công việc hiện tại" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="idCard"
              label="Số CCCD/CMND"
              rules={[{ required: true, message: "Vui lòng nhập CCCD" }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Số CCCD" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 10, textAlign: 'right' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            style={{ backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR }}
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const StudentInfoSection: React.FC<{
  student: StudentListItem;
  parent: ParentInfo;
  refreshData: () => void;
}> = ({ student, parent, refreshData }) => {
  const items = [
    {
      key: "1",
      label: (
        <span>
          <SolutionOutlined /> Chi tiết hồ sơ
        </span>
      ),
      children: (
        <>
          <Title
            level={4}
            style={{
              margin: "0 0 30px 0",
              borderLeft: `5px solid ${ACCENT_COLOR}`,
              paddingLeft: 15,
              fontWeight: 700,
              color: TEXT_COLOR,
              fontSize: 22,
            }}
          >
            <SolutionOutlined style={{ marginRight: 12, color: ACCENT_COLOR }} />{" "}
            CHI TIẾT HỒ SƠ HỌC SINH
          </Title>

          <Descriptions
            column={{ xs: 1, sm: 2, lg: 3 }}
            size="small"
            labelStyle={{ fontWeight: 600, color: "#6A6A6A" }}
            contentStyle={{ color: TEXT_COLOR }}
            style={{ marginBottom: 30 }}
          >
            <Descriptions.Item label="Dân tộc">
              <FlagOutlined style={{ color: ACCENT_COLOR, marginRight: 5 }} />
              {student?.nation}
            </Descriptions.Item>
            <Descriptions.Item label="Tôn giáo">
              <SafetyOutlined style={{ color: ACCENT_COLOR, marginRight: 5 }} />
              {student?.religion}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ margin: "30px 0" }}>
            <Text strong style={{ color: TEXT_COLOR, fontSize: 16 }}>
              <TeamOutlined style={{ marginRight: 8, color: ACCENT_COLOR }} />{" "}
              THÔNG TIN LIÊN HỆ PHỤ HUYNH
            </Text>
          </Divider>

          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24} md={8}>
              <ParentCard
                label="Họ tên Phụ huynh"
                value={parent?.fullName}
                icon={<UserOutlined style={{ color: ACCENT_COLOR }} />}
              />
            </Col>
            <Col xs={24} md={8}>
              <ParentCard
                label="Số điện thoại"
                value={parent?.phoneNumber}
                icon={<PhoneOutlined style={{ color: ACCENT_COLOR }} />}
              />
            </Col>
            <Col xs={24} md={8}>
              <ParentCard
                label="Số CCCD/CMND"
                value={parent?.idCard}
                icon={<IdcardOutlined style={{ color: ACCENT_COLOR }} />}
              />
            </Col>
            <Col xs={24} md={9}>
              <ParentCard
                label="Email"
                value={parent?.email}
                icon={<MailOutlined style={{ color: ACCENT_COLOR }} />}
              />
            </Col>
            <Col xs={24} md={8}>
              <ParentCard
                label="Nghề Nghiệp"
                value={parent?.job}
                icon={<SolutionOutlined style={{ color: ACCENT_COLOR }} />}
              />
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <EditOutlined /> Cập nhật thông tin
        </span>
      ),
      children: (
        <UpdateParentInfoTab parent={parent} onUpdateSuccess={refreshData} />
      ),
    },
    {
      key: "3",
      label: (
        <span>
          <LockOutlined /> Đổi mật khẩu
        </span>
      ),
      children: <ChangePasswordTab parentId={parent._id} />,
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        border: `1px solid ${BACKGROUND_GREY}`,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Row gutter={[0, 0]}>
        <Col
          xs={24}
          lg={8}
          style={{
            padding: 40,
            background: PRIMARY_COLOR,
            color: TEXT_COLOR,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: window.innerWidth < 992 ? 12 : 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", textAlign: "center" }}>
            <Avatar
              size={140}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "white",
                color: ACCENT_COLOR,
                marginBottom: 20,
                border: "6px solid rgba(0, 0, 0, 0.1)",
                fontSize: 70,
              }}
            />
            <Title
              level={3}
              style={{
                margin: "0 0 4px 0",
                fontWeight: 700,
                fontSize: 28,
                textAlign: "center",
                width: "100%",
                color: TEXT_COLOR,
              }}
            >
              {student?.fullName}
            </Title>
          </div>
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              width: "100%",
              marginTop: 10,
              color: TEXT_COLOR,
            }}
          >
            Mã HS:{" "}
            <Text strong style={{ color: ACCENT_COLOR }}>
              {student?.studentCode}
            </Text>
          </Text>
          <Divider
            style={{
              margin: "30px 0",
              borderColor: "rgba(0, 0, 0, 0.2)",
            }}
          />

          <Descriptions
            column={1}
            size="middle"
            colon={false}
            layout="horizontal"
            labelStyle={{
              fontWeight: 600,
              width: 120,
              color: TEXT_COLOR,
            }}
            contentStyle={{ fontWeight: 500, color: TEXT_COLOR }}
            style={{ width: "100%", maxWidth: 300, textAlign: "left" }}
          >
            <Descriptions.Item
              label={
                <Space style={{ color: ACCENT_COLOR }}>
                  <CalendarOutlined /> Ngày sinh:
                </Space>
              }
            >
              {getDisplayDate(student?.dob)}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space style={{ color: ACCENT_COLOR }}>
                  <SmileOutlined /> Giới tính:
                </Space>
              }
            >
              {student?.gender}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space style={{ color: ACCENT_COLOR }}>
                  <IdcardOutlined /> CCCD:
                </Space>
              }
            >
              {student?.idCard}
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col xs={24} lg={16} style={{ padding: "20px 40px", background: "#fff", minHeight: 600 }}>
          <Tabs defaultActiveKey="1" items={items} />
        </Col>
      </Row>
    </Card>
  );
};

const StudentInfo: React.FC = () => {
  usePageTitle("Hồ sơ học sinh - Cá Heo Xanh");
  const [data, setData] = useState<ParentStudentsListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );

  const currentUser = useCurrentUser();
  const userId = currentUser?.parent;

  const fetchParentStudents = useCallback(async () => {
    if (!userId) {
      setError("Không tìm thấy ID người dùng (Phụ huynh).");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await parentDashboardApis.getParentStudent(userId);

      if (!response.success) {
        throw new Error("API trả về thất bại.");
      }

      const transformedStudents: StudentListItem[] = response.students.map(
        (s) => ({
          ...s,
          dob: s.dob ? dayjs(s.dob) : null,
        })
      );

      setData({ ...response, students: transformedStudents });

      if (transformedStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(transformedStudents[0]._id);
      }
    } catch (err) {
      setError(
        "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc quyền truy cập."
      );
      setData(null);
      typeof error === "string"
        ? toast.info(error)
        : toast.error("Tải dữ liệu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, userId]);

  useEffect(() => {
    fetchParentStudents();
  }, [fetchParentStudents]);

  const currentStudent = useMemo(() => {
    if (!data || !selectedStudentId) return null;
    return data.students.find((s) => s._id === selectedStudentId);
  }, [data, selectedStudentId]);

  const cardHeader = useMemo(
    () => (
      <Row
        justify="space-between"
        align="middle"
        style={{ padding: "20px 24px" }}
      >
        <Col>
          <Title
            level={3}
            style={{ margin: 0, fontWeight: 700, color: TEXT_COLOR }}
          >
            <TeamOutlined style={{ marginRight: 10, color: ACCENT_COLOR }} /> Hồ
            sơ & Tài khoản
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <Tooltip title="Làm mới dữ liệu">
              <Button
                icon={<SyncOutlined spin={loading} style={{ fontSize: 16 }} />}
                onClick={fetchParentStudents}
                loading={loading}
                type="text"
                style={{ color: TEXT_COLOR }}
              />
            </Tooltip>
            {data && data?.students?.length > 1 && (
              <Select
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                style={{ width: 250 }}
                size="large"
                placeholder="Chọn học sinh để xem..."
                dropdownStyle={{ borderRadius: 8 }}
                suffixIcon={<UserOutlined style={{ color: ACCENT_COLOR }} />}
              >
                {data?.students.map((student) => (
                  <Option key={student._id} value={student._id}>
                    <Space>
                      <Avatar
                        size="small"
                        style={{ backgroundColor: ACCENT_COLOR }}
                        icon={<UserOutlined />}
                      />
                      {student?.fullName}
                    </Space>
                  </Option>
                ))}
              </Select>
            )}
          </Space>
        </Col>
      </Row>
    ),
    [data, selectedStudentId, loading, fetchParentStudents]
  );

  return (
    <Spin spinning={loading}>
      <div
        style={{
          padding: "40px",
          minHeight: "100vh",
          backgroundColor: BACKGROUND_GREY,
        }}
      >
        <Card
          title={cardHeader}
          bordered={false}
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
            border: "none",
          }}
          bodyStyle={{ padding: 0 }}
        >
          {error && (
            <Alert
              message="Lỗi Tải Dữ Liệu"
              description={error}
              type="error"
              showIcon
              style={{ margin: 24, borderRadius: 8 }}
            />
          )}

          {(!data || data.students.length === 0) && !error && (
            <Alert
              message="Thông báo"
              description="Không tìm thấy thông tin học sinh nào được liên kết với tài khoản này."
              type="info"
              showIcon
              style={{ margin: 24, borderRadius: 8 }}
            />
          )}
        </Card>

        {currentStudent && data && (
          <StudentInfoSection
            student={currentStudent}
            parent={data.parent}
            refreshData={fetchParentStudents}
          />
        )}
      </div>
    </Spin>
  );
};

export default StudentInfo;