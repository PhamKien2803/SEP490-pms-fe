import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  Empty,
  Select,
  Descriptions,
  Table,
  Tag,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  ScheduleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  BookOutlined,
  PhoneOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { parentDashboardApis } from "../../../services/apiServices";
import { Student } from "../../../types/parent";
import { ClassDetailResponse } from "../../../types/parent";
import { toast } from "react-toastify";
import { SchoolYearListItem } from "../../../types/schoolYear";

const { Title, Text } = Typography;
const { Option } = Select;

interface ClassChildParams {
  studentId: string;
  schoolYearId: string;
}

const studentColumns = [
  {
    title: "Mã HS",
    dataIndex: "studentCode",
    key: "studentCode",
    width: 120,
  },
  {
    title: "Họ và Tên",
    dataIndex: "fullName",
    key: "fullName",
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: "Giới tính",
    dataIndex: "gender",
    key: "gender",
    width: 100,
    render: (gender: string) => (
      <Tag color={gender?.toLowerCase() === "nam" ? "blue" : "pink"}>
        {gender || "N/A"}
      </Tag>
    ),
  },
];

const teacherColumns = [
  {
    title: "Họ và Tên",
    dataIndex: "fullName",
    key: "fullName",
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: "Số điện thoại",
    dataIndex: "phoneNumber",
    key: "phoneNumber",
    width: 150,
    render: (phone: string) =>
      phone ? (
        <>
          <PhoneOutlined /> {phone}
        </>
      ) : (
        "N/A"
      ),
  },
];

const ClassChild: React.FC = () => {
  const user = useCurrentUser();
  const [listChild, setListChild] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<
    string | undefined
  >(undefined);

  const params: ClassChildParams = useMemo(() => {
    const schoolYear = schoolYears?.filter(
      (item) => item?.schoolYear === selectedSchoolYear
    );
    return {
      studentId: selectedStudentId || "",
      schoolYearId: schoolYear?.[0]?._id || "",
    };
  }, [selectedStudentId, selectedSchoolYear]);

  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const response = await parentDashboardApis.getSchoolYearParent({
          page: 1,
          limit: 100,
        });
        if (response.data && response.data.length > 0) {
          const sorted = [...response.data].sort((a, b) => {
            const startA = parseInt(a.schoolYear.split("-")[0]);
            const startB = parseInt(b.schoolYear.split("-")[0]);
            return startB - startA;
          });

          const latestYear = sorted[0];

          setSchoolYears(sorted);
          setSelectedSchoolYear(latestYear.schoolYear);
        }
      } catch (error) {
        typeof error === "string"
          ? toast.warn(error)
          : toast.error("Không thể tải danh sách năm học.");
      }
    };

    fetchSchoolYears();
  }, []);

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

  const fetchClassDetail = async () => {
    if (!selectedStudentId || !selectedSchoolYear) {
      setClassDetail(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const data = await parentDashboardApis.getDataClass(params);
      setClassDetail(data);
    } catch (error) {
      setIsError(true);
      setClassDetail(null);
      console.error("Lỗi khi fetch chi tiết lớp:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetail();
  }, [params.studentId, params.schoolYearId]);

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

  const classData = classDetail?.class;

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
        <HomeOutlined style={{ marginRight: 10 }} />
        Thông Tin Chi Tiết Lớp Học
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
              <CalendarOutlined style={{ marginRight: 4 }} /> Chọn năm học:
            </Text>
            <Select
              value={selectedSchoolYear}
              style={{ width: "100%" }}
              onChange={(value) => setSelectedSchoolYear(value)}
              placeholder="Chọn năm học"
              size="large"
            >
              {schoolYears.map((year) => (
                <Option key={year._id} value={year.schoolYear}>
                  {year.schoolYear}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Spin spinning={isLoading}>
        {isError && !classData && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty
              description={
                <Title level={4} type="danger">
                  Không thể tải dữ liệu lớp học. Vui lòng thử lại.
                </Title>
              }
            />
          </div>
        )}

        {!classData && !isError && selectedStudentId && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty
              description={
                <Title level={4}>
                  Không tìm thấy thông tin lớp học của{" "}
                  <Text strong>{selectedStudent?.fullName}</Text> trong{" "}
                  <Text strong>{selectedSchoolYear}</Text>.
                </Title>
              }
            />
          </div>
        )}

        {classData && (
          <>
            <Card
              title={
                <Title level={4} style={{ margin: 0 }}>
                  <TeamOutlined /> Chi Tiết Lớp {classData.className}
                </Title>
              }
              bordered={false}
              style={{
                marginBottom: 24,
                backgroundColor: "#e6f7ff",
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
                      <BookOutlined /> Tên Lớp
                    </Text>
                  }
                >
                  <Text>
                    {classData.className} ({classData.classCode})
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong>
                      <EnvironmentOutlined /> Phòng Học
                    </Text>
                  }
                >
                  <Text>{classData.room?.roomName || "N/A"}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong>
                      <ScheduleOutlined /> Sĩ số
                    </Text>
                  }
                >
                  <Text>{classData.students?.length || 0} học sinh</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong>
                      <CalendarOutlined /> Năm Học
                    </Text>
                  }
                >
                  <Text>{classData.schoolYear?.schoolYear || "N/A"}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong>
                      <SolutionOutlined /> Độ tuổi
                    </Text>
                  }
                >
                  <Text>{classData.age || "N/A"}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Text strong>
                      <CheckCircleOutlined /> Trạng Thái
                    </Text>
                  }
                >
                  <Tag color={classData.active ? "success" : "red"}>
                    {classData.active ? "Đang hoạt động" : "Đã kết thúc"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Title level={3} style={{ margin: 20 }}>
              <TeamOutlined /> Danh Sách Giáo Viên
            </Title>
            <Card style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)" }}>
              <Table
                columns={teacherColumns}
                dataSource={classData.teachers ?? []}
                rowKey="_id"
                pagination={false}
                size="middle"
                locale={{
                  emptyText: "Chưa có thông tin giáo viên chính thức.",
                }}
              />
            </Card>

            <Title level={3} style={{ margin: 20 }}>
              <UserOutlined /> Danh Sách Học Sinh (
              {classData.students?.length || 0})
            </Title>
            <Card style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)" }}>
              <Table
                columns={studentColumns}
                dataSource={classData.students ?? []}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                size="middle"
              />
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default ClassChild;
