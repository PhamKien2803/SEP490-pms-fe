import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Card,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  Empty,
  Tag,
  Alert,
  Tabs,
  Collapse,
  Space,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
  RestOutlined,
  ScheduleOutlined,
  BulbOutlined,
  TagOutlined,
  CoffeeOutlined,
  SunOutlined,
  ReadOutlined,
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
import ScheduleFilters from "../../../components/schedule-filter/ScheduleFilters";
import { Student, ClassDetailResponse } from "../../../types/schedule-parent";
import { formatMinutesToTime, groupDaysIntoWeeks } from "../../../utils/format";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, "0"),
  label: `Tháng ${i + 1}`,
}));

const getActivityUiProps = (
  type: string | undefined
): { color: string; tag: string; icon: React.ReactElement } => {
  const activityType = type || "Bình thường";
  switch (activityType.toLowerCase()) {
    case "cố định":
      return {
        color: "#faad14",
        tag: "Cố định",
        icon: <ScheduleOutlined />,
      };
    case "sự kiện":
      return {
        color: "#13c2c2",
        tag: "Sự kiện",
        icon: <BulbOutlined />,
      };
    case "bình thường":
    default:
      return {
        color: "#40a9ff",
        tag: "Bình thường",
        icon: <FileTextOutlined />,
      };
  }
};

const DraggableRow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeftStart: 0,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    e.preventDefault();
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      scrollLeftStart: container.scrollLeft,
    };
    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.clientX;
    const walk = x - dragStateRef.current.startX;
    scrollRef.current.scrollLeft = dragStateRef.current.scrollLeftStart - walk;
  }, []);

  const stopDragging = useCallback(() => {
    const container = scrollRef.current;
    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "auto";
    }
    dragStateRef.current.isDragging = false;
  }, []);

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      style={{
        overflowX: "auto",
        padding: "10px 0",
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
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
    monthOptions[currentMonthIndex].value
  );

  const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(
    null
  );
  const [scheduleList, setScheduleList] = useState<ScheduleList>([]);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isClassLoading, setIsClassLoading] = useState<boolean>(true);
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
          ? toast.info(error)
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
        typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải danh sách con")
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
      typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải chi tiết lớp")
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
          classId: classId,
          month: selectedMonth,
        };

        const data: ScheduleList = await parentDashboardApis.getDataSchedule(
          params
        );
        setScheduleList(data);
      } catch (error) {
        setIsScheduleError(true);
        setScheduleList([]);
        typeof error === "string" ? toast.info(error) : toast.error("Lỗi khi tải lịch học")
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
  const selectedMonthName = monthOptions.find(
    (m) => m.value === selectedMonth
  )?.label;

  const weeklyScheduleTabs = useMemo(() => {
    if (!currentSchedule) return [];
    return groupDaysIntoWeeks(currentSchedule.scheduleDays);
  }, [currentSchedule]);

  const renderActivityBlock = useCallback(
    (activity: ScheduleActivity, index: number) => {
      const timeDisplay =
        activity.startTime && activity.endTime
          ? `${formatMinutesToTime(activity.startTime)} - ${formatMinutesToTime(
            activity.endTime
          )}`
          : "N/A";

      const uiProps = getActivityUiProps(activity.type);

      return (
        <div
          key={activity._id || index}
          style={{
            padding: "10px 12px",
            marginBottom: 10,
            borderLeft: `5px solid ${uiProps.color}`,
            backgroundColor: "#ffffff",
            borderRadius: 6,
            boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
          }}
        >
          <Text
            style={{
              display: "block",
              marginBottom: 4,
              fontWeight: 600,
              fontSize: 14,
              color: "#333",
            }}
          >
            <span style={{ marginRight: 5, color: uiProps.color }}>
              {uiProps.icon}
            </span>
            {activity?.activityName || "Trống"}
          </Text>

          <Text
            strong
            style={{
              color: uiProps.color,
              display: "block",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            <ClockCircleOutlined style={{ marginRight: 5 }} /> {timeDisplay}
          </Text>

          {activity?.tittle && (
            <Text
              strong
              style={{
                display: "block",
                paddingTop: 8,
                marginTop: 8,
                fontSize: 14,
                color: "#434343",
                borderTop: "1px dashed #d9d9d9",
              }}
            >
              <ReadOutlined style={{ marginRight: 8, color: uiProps.color }} />
              {activity.tittle}
            </Text>
          )}

          <Row gutter={8} style={{ marginTop: 10 }}>
            {!!activity.type && (
              <Col>
                <Tag color={uiProps.color}>{uiProps.tag}</Tag>
              </Col>
            )}
          </Row>
        </div>
      );
    },
    []
  );

  const renderDayColumn = useCallback(
    (day: ScheduleDay) => {
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

      const morningActivities = day.activities
        .filter((act) => (act.startTime || 0) < 720)
        .sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

      const afternoonActivities = day.activities
        .filter((act) => (act.startTime || 0) >= 720)
        .sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

      return (
        <Col
          style={{
            minWidth: 300,
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
              backgroundColor: "#f9f9f9",
            }}
            headStyle={{
              padding: "12px 16px",
              backgroundColor: headerBgColor,
              borderBottom: `1px solid ${dayColor}50`,
            }}
            bodyStyle={{ padding: "12px" }}
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
              <Collapse
                defaultActiveKey={["morning", "afternoon"]}
                bordered={false}
                style={{ backgroundColor: "transparent" }}
              >
                <Panel
                  header={
                    <Text strong style={{ fontSize: 15, color: "#0050b3" }}>
                      <CoffeeOutlined style={{ marginRight: 8 }} />
                      Buổi Sáng ({morningActivities.length})
                    </Text>
                  }
                  key="morning"
                  style={{
                    backgroundColor: "#f0f5ff",
                    borderRadius: 4,
                    marginBottom: 12,
                    border: "1px solid #d6e4ff",
                  }}
                >
                  {morningActivities.length > 0 ? (
                    morningActivities.map(renderActivityBlock)
                  ) : (
                    <Text italic type="secondary">
                      Không có hoạt động buổi sáng.
                    </Text>
                  )}
                </Panel>

                <Panel
                  header={
                    <Text strong style={{ fontSize: 15, color: "#d46b08" }}>
                      <SunOutlined style={{ marginRight: 8 }} />
                      Buổi Chiều ({afternoonActivities.length})
                    </Text>
                  }
                  key="afternoon"
                  style={{
                    backgroundColor: "#fff7e6",
                    borderRadius: 4,
                    border: "1px solid #ffe7ba",
                  }}
                >
                  {afternoonActivities.length > 0 ? (
                    afternoonActivities.map(renderActivityBlock)
                  ) : (
                    <Text italic type="secondary">
                      Không có hoạt động buổi chiều.
                    </Text>
                  )}
                </Panel>
              </Collapse>
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
    },
    [renderActivityBlock]
  );

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

      <ScheduleFilters
        listChild={listChild}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        schoolYears={schoolYears}
        selectedSchoolYear={selectedSchoolYear}
        setSelectedSchoolYear={setSelectedSchoolYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        monthOptions={monthOptions}
        isInitialLoading={isInitialLoading}
        isClassLoading={isClassLoading}
        isScheduleLoading={isScheduleLoading}
        classData={classData}
      />

      <Spin
        spinning={isClassLoading || isScheduleLoading}
        tip={
          isClassLoading ? "Đang tải thông tin lớp..." : "Đang tải lịch học..."
        }
      >
        {classData && (
          <Alert
            message={
              <Text strong style={{ color: "#1890ff" }}>
                <HomeOutlined style={{ marginRight: 5 }} /> Lớp Học:{" "}
                {classData.className} ({classData.classCode})
              </Text>
            }
            description={`Thời khóa biểu của bé ${selectedStudent?.fullName} trong ${selectedMonthName} (${selectedSchoolYear}).`}
            type="success"
            // showIcon
            style={{
              marginBottom: 24,
              backgroundColor: "rgba(240, 248, 255, 1)",
              border: "2px solid #e9f0f5ff",
            }}
          />
        )}
        {(!selectedStudentId || !selectedSchoolYear) && !isClassLoading ? (
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
                  Không tìm thấy thông tin lớp học của bé{" "}
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
                  Chưa có Thời khóa biểu chính thức cho lớp{" "}
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
                <Space>
                  <CalendarOutlined />
                  Lịch Học Chi Tiết theo Tuần
                </Space>
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
                    <DraggableRow>
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
                        {week.days.map(renderDayColumn)}
                      </Row>
                    </DraggableRow>
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