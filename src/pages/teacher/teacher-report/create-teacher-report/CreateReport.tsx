import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Button,
  Typography,
  Select,
  message,
  Table,
  Card,
  Row,
  Col,
  Space,
  Tag,
  Input,
  Popover,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  LockOutlined,
  EditOutlined,
  BulbOutlined,
  CalendarOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import {
  IScheduleWeekResponse,
  IActivity,
  ILessonDetailResponse,
  ILessonPayload,
} from "../../../../types/teacher";
import { teacherApis } from "../../../../services/apiServices";
import type { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../../../hooks/usePageTitle";
const { Title, Text } = Typography;

const formatMinutesToTime = (minutes?: number | null): string => {
  if (minutes == null || isNaN(minutes)) return "--:--";
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const getWeekOfMonth = (dateString: string) => {
  const date = dayjs(dateString);
  const startOfMonth = date.startOf("month");
  return Math.ceil((date.date() + startOfMonth.day()) / 7);
};

const getActivityProps = (activity: IActivity) => {
  const commonProps = {
    style: {
      width: "100%",
      minHeight: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "normal",
      padding: "6px",
      fontSize: "13px",
      margin: 0,
    },
  };

  if (activity.type === "Cố định") {
    return {
      ...commonProps,
      color: "blue",
      icon: <LockOutlined />,
    };
  }

  if (activity.type === "Bình thường") {
    return {
      ...commonProps,
      color: "green",
      icon: <EditOutlined />,
      style: {
        ...commonProps.style,
        cursor: "pointer",
      },
    };
  }

  return {
    ...commonProps,
    color: "gold",
    icon: <BulbOutlined />,
  };
};

interface IScheduleRow {
  key: string;
  time: string;
  [dataIndex: string]: any;
}

function CreateReport() {
  usePageTitle('Tạo báo giảng - Cá Heo Xanh');
  const user = useCurrentUser();
  const navigate = useNavigate();
  const teacherId = useMemo(() => user?.staff, [user]);
  const [schoolYearId, setSchoolYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [scheduleData, setScheduleData] =
    useState<IScheduleWeekResponse | null>(null);
  const [_, setCreatedLesson] = useState<ILessonDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [unsavedText, setUnsavedText] = useState<string>("");
  const [__, setHasUnsavedChanges] = useState(false);

  const [editingCell, setEditingCell] = useState<{
    dayIndex: number;
    rowIndex: number;
  } | null>(null);

  useEffect(() => {
    setClassId(user?.staff || "");
    setSchoolYearId(user?.staff || "");
  }, [user]);

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    teacherApis
      .getScheduleWeek({
        teacherId,
        month: currentMonth.toString(),
        week: currentWeek.toString(),
      })
      .then((res) => setScheduleData(res))
      .finally(() => setLoading(false));
  }, [teacherId, currentMonth, currentWeek]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".lesson-textarea") && !target.closest(".ant-tag")) {
        setEditingCell(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleMonthChange = (value: number) => {
    setCurrentMonth(value);
    setCurrentWeek(1);
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    } else if (direction === "next") {
      const nextWeek = currentWeek + 1;
      const nextWeekDate = dayjs()
        .month(currentMonth - 1)
        .startOf("month")
        .add((nextWeek - 1) * 7, "day");
      if (nextWeekDate.month() + 1 === currentMonth) {
        setCurrentWeek(nextWeek);
      } else {
        toast.info(
          "Đã hết các tuần trong tháng này. Vui lòng chọn tháng khác."
        );
      }
    }
  };

  const uniqueStartTimes = useMemo(() => {
    if (!scheduleData) return [];
    const allActivities = scheduleData.scheduleDays.flatMap(
      (day) => day.activities
    );
    const times = [...new Set(allActivities.map((act) => act.startTime))];
    times.sort((a, b) => (a || 0) - (b || 0));
    return times;
  }, [scheduleData]);

  const handleNoteChange = (
    newText: string,
    dayIndex: number,
    rowIndex: number
  ) => {
    if (!scheduleData || !uniqueStartTimes) return;
    const targetStartTime = uniqueStartTimes[rowIndex];

    setScheduleData((prevData) => {
      if (!prevData) return null;

      const newScheduleDays = prevData.scheduleDays.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;

        const newActivities = day.activities.map((act) => {
          if (act.startTime === targetStartTime) {
            return { ...act, tittle: newText };
          }
          return act;
        });

        return { ...day, activities: newActivities };
      });

      return { ...prevData, scheduleDays: newScheduleDays };
    });
  };

  const handleNoteKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, _: number, __: number) => {
      if (e.key === "Enter" && !e.shiftKey) {
        return;
      }
    },
    []
  );

  const handleCreate = async () => {
    if (!classId || !schoolYearId || !scheduleData) {
      message.warning("Thiếu thông tin lớp, năm học hoặc lịch dạy.");
      return;
    }
    const payload: ILessonPayload = {
      classId: scheduleData.classId,
      schoolYearId: scheduleData.schoolYearId,
      month: scheduleData.month,
      weekNumber: scheduleData.week,
      topicName: scheduleData.topic,
      scheduleDays: scheduleData.scheduleDays.map((day) => ({
        date: day.date,
        dayName: day.dayName,
        isHoliday: day.isHoliday,
        notes: day.notes,
        activities: day.activities.map((act) => ({
          activity: act.activity,
          activityCode: act.activityCode || "",
          activityName: act.activityName || "",
          type: act.type || "",
          tittle: act.tittle,
          startTime: act.startTime,
          endTime: act.endTime,
        })),
      })),
      class: "",
      schoolYear: "",
    };
    try {
      setLoading(true);
      const res = await teacherApis.createLesson(payload);
      setCreatedLesson(res);
      toast.success("Tạo báo giảng thành công!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tạo báo giảng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const weekDateRange = useMemo(() => {
    if (!scheduleData || scheduleData.scheduleDays.length === 0) {
      return `Tuần ${currentWeek}`;
    }
    const startDate = dayjs(scheduleData.scheduleDays[0].date).format("DD/MM");
    const endDate = dayjs(
      scheduleData.scheduleDays[scheduleData.scheduleDays.length - 1].date
    ).format("DD/MM");
    return `${startDate} - ${endDate}`;
  }, [scheduleData, currentWeek]);

  const columns = useMemo<ColumnsType<IScheduleRow>>(() => {
    const baseColumns: ColumnsType<IScheduleRow> = [
      {
        title: "Thời gian",
        dataIndex: "time",
        key: "time",
        fixed: "left",
        width: 100,
        align: "center",
      },
    ];

    if (!scheduleData) return baseColumns;

    const totalRows = uniqueStartTimes.length || 1;

    const dayColumns: ColumnsType<IScheduleRow> = scheduleData.scheduleDays.map(
      (day, dayIndex) => ({
        title: (
          <div style={{ textAlign: "center" }}>
            <Text strong>{day.dayName}</Text>
            <br />
            <Text type="secondary">{dayjs(day.date).format("DD/MM")}</Text>
          </div>
        ),
        dataIndex: `day_${dayIndex}`,
        key: day._id,
        width: 180,
        render: (
          activity: IActivity | null,
          record: IScheduleRow,
          rowIndex: number
        ) => {
          const isHolidayAndEmpty =
            day.isHoliday && day.activities.length === 0;
          if (isHolidayAndEmpty) {
            if (rowIndex === 0) {
              return {
                children: (
                  <Tag
                    icon={<CalendarOutlined />}
                    color="default"
                    style={{
                      width: "100%",
                      minHeight: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "normal",
                      fontSize: "13px",
                      margin: 0,
                    }}
                  >
                    Ngày nghỉ
                  </Tag>
                ),
                props: {
                  rowSpan: totalRows,
                  style: {
                    textAlign: "center",
                    padding: "8px",
                    background: "#fafafa",
                  },
                },
              };
            } else {
              return { props: { rowSpan: 0 } };
            }
          }

          if (activity && activity.type === "Cố định") {
            let isMerged = false;
            for (let j = dayIndex - 1; j >= 0; j--) {
              const prevDay = scheduleData.scheduleDays[j];
              if (prevDay.isHoliday && prevDay.activities.length === 0) {
                break;
              }
              const prevActivity = record[`day_${j}`] as IActivity | null;
              if (
                prevActivity &&
                prevActivity.type === "Cố định" &&
                prevActivity.activityCode === activity.activityCode
              ) {
                isMerged = true;
                break;
              }
              if (prevActivity && prevActivity.type === "Cố định") break;
            }
            if (isMerged) {
              return { props: { colSpan: 0 } };
            }
          }

          let colSpan = 1;
          if (activity && activity.type === "Cố định") {
            for (
              let j = dayIndex + 1;
              j < scheduleData.scheduleDays.length;
              j++
            ) {
              const nextDay = scheduleData.scheduleDays[j];
              if (nextDay.isHoliday && nextDay.activities.length === 0) {
                break;
              }
              const nextActivity = record[`day_${j}`] as IActivity | null;
              if (
                nextActivity &&
                nextActivity.type === "Cố định" &&
                nextActivity.activityCode === activity.activityCode
              ) {
                colSpan++;
              } else {
                break;
              }
            }
          }

          if (!activity) {
            return {
              children: null,
              props: { colSpan, style: { padding: "8px" } },
            };
          }

          const isEditable = activity.type === "Bình thường";
          const isEditing =
            isEditable &&
            editingCell?.dayIndex === dayIndex &&
            editingCell?.rowIndex === rowIndex;

          const children = (
            <div
              style={{ textAlign: "left", width: "100%", position: "relative" }}
            >
              <Tag
                {...getActivityProps(activity)}
                onClick={(e) => {
                  e.stopPropagation(); // tránh click lan ra ngoài
                  if (!isEditable) return;
                  if (
                    editingCell?.dayIndex === dayIndex &&
                    editingCell?.rowIndex === rowIndex
                  ) {
                    setEditingCell(null);
                  } else {
                    const initText =
                      activity.tittle && activity.tittle.trim().length > 0
                        ? activity.tittle
                        : "";
                    setEditingCell({ dayIndex, rowIndex });
                    setUnsavedText(initText);
                  }
                }}
              >
                {activity.activityName || "Trống"}
              </Tag>

              {isEditable && (
                <div
                  className={`lesson-textarea-wrapper ${isEditing ? "open" : ""
                    }`}
                  style={{ transition: "all 0.3s ease", marginTop: 10 }}
                >
                  {isEditing ? (
                    <Input.TextArea
                      autoFocus
                      className="lesson-textarea"
                      placeholder="Nhập nội dung bài học..."
                      value={unsavedText}
                      onChange={(e) => {
                        setUnsavedText(e.target.value);
                        setHasUnsavedChanges(true);
                        handleNoteChange(e.target.value, dayIndex, rowIndex);
                      }}
                      onKeyDown={(e) =>
                        handleNoteKeyDown(e, dayIndex, rowIndex)
                      }
                      autoSize={{ minRows: 2 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    activity.tittle && (
                      <Text
                        style={{
                          whiteSpace: "pre-wrap",
                          display: "block",
                          padding: "4px 8px",
                        }}
                      >
                        {activity.tittle}
                      </Text>
                    )
                  )}
                </div>
              )}
            </div>
          );

          return {
            children: children,
            props: {
              colSpan: colSpan,
              style: {
                textAlign: "center",
                padding: "8px",
                verticalAlign: "top",
              },
            },
          };
        },
      })
    );

    return [...baseColumns, ...dayColumns];
  }, [scheduleData, uniqueStartTimes, editingCell, handleNoteKeyDown]);

  const dataSource = useMemo<IScheduleRow[]>(() => {
    if (!scheduleData) return [];
    if (uniqueStartTimes.length === 0) {
      if (
        scheduleData.scheduleDays.some(
          (day) => day.isHoliday && day.activities.length === 0
        )
      ) {
        return [{ key: "empty-holiday", time: "N/A" }];
      }
      return [];
    }
    return uniqueStartTimes.map((startTime) => {
      const timeString = formatMinutesToTime(startTime);
      const rowData: IScheduleRow = {
        key: timeString,
        time: timeString,
      };
      scheduleData.scheduleDays.forEach((day, index) => {
        const activity = day.activities.find(
          (act) => act.startTime === startTime
        );
        rowData[`day_${index}`] = activity || null;
      });
      return rowData;
    });
  }, [scheduleData, uniqueStartTimes]);

  return (
    <Card
      title={
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Lịch dạy và Báo giảng
            </Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)}>
                Trở về
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                loading={loading}
              >
                Tạo báo giảng
              </Button>
            </Space>
          </Col>
        </Row>
      }
      style={{ margin: 16 }}
    >
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={currentMonth}
          onChange={handleMonthChange}
          options={Array.from({ length: 12 }, (_, i) => ({
            label: `Tháng ${i + 1}`,
            value: i + 1,
          }))}
          style={{ width: 120 }}
        />
        <Space.Compact>
          <Button
            icon={<LeftOutlined />}
            onClick={() => handleWeekChange("prev")}
            disabled={currentWeek === 1}
          />
          <Button style={{ width: "auto", minWidth: 120, cursor: "default" }}>
            {weekDateRange}
            {(scheduleData?.scheduleDays?.length ?? 0) > 0 && (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {scheduleData &&
                  scheduleData.scheduleDays.length > 0 &&
                  `(Tuần ${getWeekOfMonth(
                    scheduleData.scheduleDays[0].date
                  )} trong tháng)`}
              </Text>
            )}
          </Button>

          <Button
            icon={<RightOutlined />}
            onClick={() => handleWeekChange("next")}
          />
        </Space.Compact>
      </Space>

      <Row justify="end" style={{ marginBottom: 8 }}>
        <Popover
          title="💡 Hướng dẫn nhập bài học"
          content={
            <div>
              • Nhấp vào ô hoạt động{" "}
              <Tag color="green" icon={<EditOutlined />}>
                Bình thường
              </Tag>{" "}
              để nhập nội dung bài học.
              <br />• Dùng <code>-</code> để gạch đầu dòng mỗi ý. (Ví dụ:{" "}
              <code>- Hoạt động A</code>)
              <br />• Nhấn <kbd>Shift</kbd> + <kbd>Enter</kbd> hoặc Enter để
              xuống dòng mới trong cùng một hoạt động.
            </div>
          }
          trigger="click"
        >
          <Button icon={<BulbOutlined />} type="dashed">
            Hướng dẫn điền bài học
          </Button>
        </Popover>
      </Row>

      <Table
        columns={columns}
        dataSource={dataSource}
        bordered
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}

export default CreateReport;
