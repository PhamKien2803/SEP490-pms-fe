import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Table,
  Tag,
  Spin,
  Empty,
  Row,
  Col,
  Button,
  Space,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ILessonDetailResponse } from "../../../../types/teacher";
import { teacherApis } from "../../../../services/apiServices";

const { Title, Text } = Typography;

const formatMinutesToTime = (minutes?: number | null): string => {
  if (minutes == null || isNaN(minutes)) return "--:--";
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<ILessonDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    teacherApis
      .getLessonById(id)
      .then((res) => {
        setLesson(res);
        setCurrentDayIndex(0);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin fullscreen />;
  if (!lesson) return <Empty description="Không tìm thấy báo giảng" />;

  const day = lesson.scheduleDays[currentDayIndex];

  return (
    <Card
      title={<Title level={4}>Chi tiết báo giảng</Title>}
      style={{ margin: 16 }}
    >
      <Space style={{ marginBottom: 10 }}>
        <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)}>
          Trở về
        </Button>
      </Space>

      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Lớp">{lesson.className}</Descriptions.Item>
        <Descriptions.Item label="Năm học">
          {lesson.schoolYear}
        </Descriptions.Item>
        <Descriptions.Item label="Tháng">{`Tháng ${lesson.month}`}</Descriptions.Item>
        <Descriptions.Item label="Tuần">{`Tuần ${lesson.weekNumber}`}</Descriptions.Item>
        <Descriptions.Item label="Chủ đề" span={2}>
          {lesson.topicName || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={lesson.status === "Dự Thảo" ? "orange" : "green"}>
            {lesson.status}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Card
        style={{ marginTop: 32 }}
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Button
                icon={<LeftOutlined />}
                disabled={currentDayIndex === 0}
                onClick={() => setCurrentDayIndex((prev) => prev - 1)}
              />
            </Col>
            <Col>
              {day.dayName} ({dayjs(day.date).format("DD/MM/YYYY")})
            </Col>
            <Col>
              <Button
                icon={<RightOutlined />}
                disabled={currentDayIndex === lesson.scheduleDays.length - 1}
                onClick={() => setCurrentDayIndex((prev) => prev + 1)}
              />
            </Col>
          </Row>
        }
      >
        {day.isHoliday ? (
          <Tag color="default">Ngày nghỉ</Tag>
        ) : day.activities.length === 0 ? (
          <Text type="secondary">Không có hoạt động</Text>
        ) : (
          <Table
            size="small"
            bordered
            pagination={false}
            dataSource={day.activities.map((act, i) => ({
              ...act,
              key: i,
            }))}
            columns={[
              {
                title: "Thời gian",
                render: (_, record) =>
                  `${formatMinutesToTime(
                    record.startTime
                  )} - ${formatMinutesToTime(record.endTime)}`,
              },
              {
                title: "Hoạt động",
                dataIndex: "activityName",
                key: "activityName",
              },
              {
                title: "Loại",
                dataIndex: "type",
                key: "type",
                render: (type: string) => (
                  <Tag
                    color={
                      type === "Cố định"
                        ? "blue"
                        : type === "Bình thường"
                        ? "green"
                        : "gold"
                    }
                  >
                    {type}
                  </Tag>
                ),
              },
              {
                title: "Bài học",
                dataIndex: "tittle",
                key: "tittle",
                render: (t: string) =>
                  t ? (
                    <div>
                      {t
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, idx) => (
                          <div key={idx} style={{ marginBottom: 4 }}>
                            <span style={{ whiteSpace: "pre-wrap" }}>
                              • {line.trim()}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <Text type="secondary">—</Text>
                  ),
              },
            ]}
          />
        )}
      </Card>
    </Card>
  );
}

export default ReportDetails;
