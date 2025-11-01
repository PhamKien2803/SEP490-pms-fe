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
  Tag,
  Alert,
  Tabs,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
  RestOutlined,
  ScheduleOutlined,
  BulbOutlined,
  TagOutlined,
} from "@ant-design/icons";

import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { parentDashboardApis } from "../../../services/apiServices";
import {
  ScheduleActivity,
  ScheduleDay,
  ScheduleList,
  ScheduleParams,
} from "../../../types/parent";
import { SchoolYearListItem } from "../../../types/schoolYear";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Student {
  _id: string;
  fullName: string;
  studentCode?: string;
  gender?: string;
}
interface SchoolYear {
  _id: string;
  schoolYear: string;
}
interface ClassInfo {
  _id: string;
  classCode: string;
  className: string;
  room?: { roomName: string };
  students?: Student[];
  teachers?: any[];
  schoolYear?: SchoolYear;
  age?: string | number;
  active?: boolean;
}
interface ClassDetailResponse {
  class: ClassInfo | null;
}

const FAKE_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, "0"),
  label: `Tháng ${i + 1}`,
}));

const groupDaysIntoWeeks = (
  days: ScheduleDay[]
): { label: string; key: string; days: ScheduleDay[] }[] => {
  if (days.length === 0) return [];

  const sortedDays = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const weeks: { [key: string]: ScheduleDay[] } = {};

  sortedDays.forEach((day) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    const monday = new Date(date);
    monday.setDate(diff);

    const weekKey = monday.toISOString().split("T")[0];

    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    weeks[weekKey].push(day);
  });

  return Object.keys(weeks).map((key, index) => {
    const startDate = new Date(key);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const label = `Tuần ${index + 1}: ${startDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    })} - ${endDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    })}`;

    return {
      label: label,
      key: key,
      days: weeks[key].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    };
  });
};

const Schedule: React.FC = () => {
  const user = useCurrentUser();
  const [listChild, setListChild] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<
    string | undefined
  >(undefined);
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    FAKE_MONTHS[currentMonthIndex].value
  );

  const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(
    null
  );
  const [scheduleList, setScheduleList] = useState<ScheduleList>([]);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isClassLoading, setIsClassLoading] = useState<boolean>(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState<boolean>(false);
  const [isClassError, setIsClassError] = useState<boolean>(false);
  const [isScheduleError, setIsScheduleError] = useState<boolean>(false);

  const classData = classDetail?.class;
  const classId = classData?._id;

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
    const getDataListChild = async () => {
      if (!user?.parent) {
        setIsInitialLoading(false);
        return;
      }
      try {
        const response = await parentDashboardApis.getListChild(user.parent);
        const students = response?.students || [];
        setListChild(students);

        if (students.length > 0) {
          setSelectedStudentId(students[0]._id);
        } else {
          setIsInitialLoading(false);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách con:", error);
        setIsInitialLoading(false);
      }
    };
    getDataListChild();
  }, [user?.parent]);

  const fetchClassDetail = async () => {
    if (!selectedStudentId || !selectedSchoolYear) {
      setClassDetail(null);
      setIsClassLoading(false);
      setIsInitialLoading(false);
      return;
    }

    setIsClassLoading(true);
    setIsClassError(false);
    setScheduleList([]);

    const schoolYear = schoolYears?.filter(
      (item) => item?.schoolYear === selectedSchoolYear
    );

    try {
      const data: ClassDetailResponse = await parentDashboardApis.getDataClass({
        studentId: selectedStudentId,
        schoolYearId: schoolYear?.[0]?._id || "",
      });
      setClassDetail(data);
    } catch (error) {
      setIsClassError(true);
      setClassDetail(null);
      console.error("Lỗi khi fetch chi tiết lớp:", error);
    } finally {
      setIsClassLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId && selectedSchoolYear) {
      fetchClassDetail();
    }
  }, [selectedStudentId, selectedSchoolYear]);

  useEffect(() => {
    const fetchScheduleDetail = async () => {
      if (!classId || !selectedMonth || isClassLoading) {
        setScheduleList([]);
        setIsScheduleLoading(false);
        return;
      }

      setIsScheduleLoading(true);
      setIsScheduleError(false);
      try {
        const params: ScheduleParams = {
          // Thay thế "68f7aec1d534d267d0f61493" bằng classId thực tế
          classId: "68f7aec1d534d267d0f61493",
          month: selectedMonth,
        };

        const data: ScheduleList = await parentDashboardApis.getDataSchedule(
          params
        );
        setScheduleList(data);
      } catch (error) {
        setIsScheduleError(true);
        setScheduleList([]);
        console.error("Lỗi khi fetch lịch học:", error);
      } finally {
        setIsScheduleLoading(false);
      }
    };

    if (classId) {
      fetchScheduleDetail();
    }
  }, [classId, selectedMonth, isClassLoading]);

  const currentSchedule = scheduleList.length > 0 ? scheduleList[0] : null;

  const selectedStudent = listChild.find((s) => s._id === selectedStudentId);
  const selectedMonthName = FAKE_MONTHS.find(
    (m) => m.value === selectedMonth
  )?.label;

  const weeklyScheduleTabs = useMemo(() => {
    if (!currentSchedule) return [];
    return groupDaysIntoWeeks(currentSchedule.scheduleDays);
  }, [currentSchedule]);

  const formatMinutesToTime = (minutes: number) => {
    if (isNaN(minutes) || minutes === null) return "N/A";
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const mins = (minutes % 60).toString().padStart(2, "0");
    return `${hours}:${mins}`;
  };

  const renderActivityBlock = (activity: ScheduleActivity, index: number) => {
    const timeDisplay =
      activity.startTime && activity.endTime
        ? `${formatMinutesToTime(activity.startTime)} - ${formatMinutesToTime(
            activity.endTime
          )}`
        : "N/A";

    console.log("activity", activity);
    const category = activity.activity?.category || "";
    const type = activity.activity?.type || "";

    return (
      <div
        key={activity._id || index}
        style={{
          padding: "10px 12px",
          marginBottom: 10,
          borderLeft: `5px solid geekblue`,
          backgroundColor: "#ffffff",
          borderRadius: 6,
          boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
        }}
      >
        <Text
          strong
          style={{
            color: "#096dd9",
            display: "block",
            fontSize: 14,
            marginBottom: 4,
          }}
        >
          <ClockCircleOutlined style={{ marginRight: 5 }} /> {timeDisplay}
        </Text>
        <Text
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
            fontSize: 14,
            color: "#333",
          }}
        >
          <BulbOutlined style={{ marginRight: 5, color: "#faad14" }} />
          {activity.activity?.activityName || "Hoạt động chung"}
        </Text>

        <Row gutter={8}>
          {!!category && (
            <Col>
              <Tag color={"geekblue"} icon={<TagOutlined />}>
                {category}
              </Tag>
            </Col>
          )}

          {!!type && (
            <Col>
              <Tag color="default" style={{ color: "#8c8c8c" }}>
                {type}
              </Tag>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const renderDayCard = (day: ScheduleDay) => {
    const dateDisplay = new Date(day.date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });

    const isWeekend =
      day.dayName.includes("Chủ Nhật") || day.dayName.includes("Thứ Bảy");
    const dayColor = day.isHoliday
      ? "#cf1322"
      : isWeekend
      ? "#fa8c16"
      : "#08979c";
    const headerBgColor = day.isHoliday
      ? "#fff1f0"
      : isWeekend
      ? "#fff7e6"
      : "#e6fffa";

    const title = (
      <Text strong style={{ color: dayColor, fontSize: 16 }}>
        {day.dayName}, {dateDisplay}
      </Text>
    );

    return (
      <Col
        style={{
          minWidth: 280,
          flexGrow: 1,
          paddingBottom: 20,
        }}
        key={day._id}
      >
        <Card
          title={title}
          size="small"
          style={{
            height: "100%",
            borderTop: `5px solid ${dayColor}`,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          headStyle={{
            padding: "12px 16px",
            backgroundColor: headerBgColor,
            borderBottom: `1px solid ${dayColor}50`,
          }}
          bodyStyle={{ padding: "12px 12px" }}
        >
          {day.isHoliday ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <RestOutlined
                style={{ color: "#cf1322", fontSize: 32, marginBottom: 15 }}
              />
              <Title level={5} type="danger" style={{ margin: 0 }}>
                NGHỈ HỌC TRONG NGÀY
              </Title>
              {day.notes && (
                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: 8 }}
                >
                  {day.notes}
                </Text>
              )}
            </div>
          ) : day.activities.length > 0 ? (
            day.activities
              .sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
              .map(renderActivityBlock)
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "30px 0",
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <TagOutlined
                style={{ color: "#bfbfbf", fontSize: 20, marginBottom: 10 }}
              />
              <Text italic type="secondary" style={{ display: "block" }}>
                Không có hoạt động chính thức.
              </Text>
            </div>
          )}
          {day.notes && !day.isHoliday && (
            <Alert
              message={
                <Text strong style={{ color: "#08979c" }}>
                  <FileTextOutlined style={{ marginRight: 5 }} /> Ghi chú
                </Text>
              }
              description={<Text type="secondary">{day.notes}</Text>}
              type="info"
              style={{ marginTop: 15, borderLeft: "4px solid #08979c" }}
              showIcon={false}
            />
          )}
        </Card>
      </Col>
    );
  };

  if (isInitialLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang tải thông tin học sinh..." />
      </div>
    );
  }

  if (listChild.length === 0 && !isInitialLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Empty
          description={
            <Title level={4}>Không tìm thấy hồ sơ học sinh nào.</Title>
          }
          style={{ padding: "50px 0" }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      <Title
        level={2}
        style={{
          color: "#08979c",
          borderBottom: "2px solid #08979c",
          paddingBottom: 8,
          marginBottom: 16,
        }}
      >
        <ScheduleOutlined style={{ marginRight: 10 }} />
        Thời Khóa Biểu Học Tập
      </Title>
      <Divider style={{ margin: "0 0 24px 0" }} />

      <Card
        bordered={true}
        title={
          <Text strong style={{ color: "#08979c" }}>
            <UserOutlined /> Lọc Thông Tin
          </Text>
        }
        style={{
          marginBottom: 24,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#ffffff",
        }}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={8}>
            <Text
              strong
              style={{ display: "block", marginBottom: 4, color: "#595959" }}
            >
              Chọn con:
            </Text>
            <Select
              value={selectedStudentId}
              style={{ width: "100%" }}
              onChange={(value) => setSelectedStudentId(value)}
              placeholder="Chọn con của bạn"
              size="large"
              disabled={isInitialLoading}
            >
              {listChild.map((student) => (
                <Option key={student._id} value={student._id}>
                  {student?.fullName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text
              strong
              style={{ display: "block", marginBottom: 4, color: "#595959" }}
            >
              Chọn năm học:
            </Text>
            <Select
              value={selectedSchoolYear}
              style={{ width: "100%" }}
              onChange={(value) => setSelectedSchoolYear(value)}
              placeholder="Chọn năm học"
              size="large"
              disabled={!selectedStudentId || isClassLoading}
            >
              {schoolYears.map((year) => (
                <Option key={year._id} value={year.schoolYear}>
                  {year.schoolYear}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text
              strong
              style={{ display: "block", marginBottom: 4, color: "#595959" }}
            >
              Chọn tháng:
            </Text>
            <Select
              value={selectedMonth}
              style={{ width: "100%" }}
              onChange={(value) => setSelectedMonth(value)}
              placeholder="Chọn tháng"
              size="large"
              disabled={!classData || isScheduleLoading}
            >
              {FAKE_MONTHS.map((month) => (
                <Option key={month.value} value={month.value}>
                  {month.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Spin
        spinning={isClassLoading || isScheduleLoading}
        tip={
          isClassLoading ? "Đang tải thông tin lớp..." : "Đang tải lịch học..."
        }
      >
        {classData && (
          <Alert
            message={
              <Text strong style={{ color: "#135200" }}>
                <HomeOutlined style={{ marginRight: 5 }} /> Lớp Học:
                {classData.className} ({classData.classCode})
              </Text>
            }
            description={`Thời khóa biểu của bé ${selectedStudent?.fullName} trong ${selectedMonthName} (${selectedSchoolYear}).`}
            type="success"
            showIcon
            style={{
              marginBottom: 24,
              backgroundColor: "#f6ffed",
              borderLeft: "5px solid #52c41a",
            }}
          />
        )}
        {!selectedStudentId || !selectedSchoolYear ? (
          <Alert
            message="Vui lòng chọn Con và Năm học để xem thời khóa biểu."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : isClassError ? (
          <Alert
            message="Lỗi tải dữ liệu lớp học"
            description="Không thể tải thông tin lớp học. Vui lòng kiểm tra lại kết nối hoặc thử lại."
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : !classData && !isClassLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty
              description={
                <Title level={4}>
                  Không tìm thấy thông tin lớp học của bé
                  {selectedStudent?.fullName} trong năm {selectedSchoolYear}.
                </Title>
              }
            />
          </div>
        ) : isScheduleError && !isScheduleLoading ? (
          <Alert
            message="Lỗi kết nối!"
            description={`Không thể tải dữ liệu lịch học tháng ${selectedMonthName}.`}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : !currentSchedule &&
          !isScheduleError &&
          !isScheduleLoading &&
          classData ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Empty
              description={
                <Title level={4}>
                  Chưa có Thời khóa biểu chính thức cho lớp
                  {classData.className} trong {selectedMonthName}.
                </Title>
              }
            />
          </div>
        ) : null}
        {currentSchedule && (
          <Card
            title={
              <Title level={4} style={{ margin: 0, color: "#08979c" }}>
                <CalendarOutlined />
                Lịch Học Chi Tiết theo Tuần
              </Title>
            }
            bordered={false}
            style={{
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)",
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 0 }}
          >
            {weeklyScheduleTabs.length > 0 ? (
              <Tabs
                defaultActiveKey={weeklyScheduleTabs[0].key}
                type="line"
                size="large"
                style={{ padding: "0 24px" }}
              >
                {weeklyScheduleTabs.map((week) => (
                  <TabPane tab={week.label} key={week.key}>
                    <div style={{ overflowX: "auto", padding: "10px 0" }}>
                      <Row
                        gutter={[20, 0]}
                        wrap={false}
                        justify="start"
                        style={{
                          minWidth: "100%",
                          display: "flex",
                          flexWrap: "nowrap",
                        }}
                      >
                        {week.days.map(renderDayCard)}
                      </Row>
                    </div>
                  </TabPane>
                ))}
              </Tabs>
            ) : (
              <Empty
                description="Không có dữ liệu lịch học nào được tìm thấy trong tháng đã chọn."
                style={{ padding: 48 }}
              />
            )}
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default Schedule;
