import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Select,
  Table,
  Typography,
  Spin,
  Button,
  Card,
  Space,
  Tooltip,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { SchoolYearListItem } from '../../../types/schoolYear';
import { ILessonListItem } from '../../../types/teacher';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { usePagePermission } from '../../../hooks/usePagePermission';
import { teacherApis } from '../../../services/apiServices';
import { constants } from '../../../constants';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title } = Typography;

const getStatusTag = (status: string) => {
  switch (status) {
    case 'Dự thảo':
      return <Tag color="blue">Dự thảo</Tag>;
    case 'Chờ duyệt':
      return <Tag color="orange">Chờ duyệt</Tag>;
    case 'Hoàn thành':
      return <Tag color="green">Hoàn thành</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

function TeacherReport() {
  usePageTitle('Báo giảng- Cá Heo Xanh');
  const user = useCurrentUser();
  const isAdmin = user?.isAdmin;
  const teacherId = useMemo(() => user?.staff, [user]);

  const { canUpdate, canCreate } = usePagePermission();
  const navigate = useNavigate();

  const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [lessonData, setLessonData] = useState<ILessonListItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch school years
  useEffect(() => {
    teacherApis.getSchoolYearList({ page: 0, limit: 100 }).then((res) => {
      const sorted = res.data.sort(
        (a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix()
      );
      setSchoolYears(sorted);

      const activeYear = sorted.find(y => y.state === 'Đang hoạt động');
      if (activeYear) {
        setSelectedYear(activeYear.schoolYear);
      }
    }).catch(() => {
      setSchoolYears([]);
    });
  }, []);


  // Fetch lesson list
  const fetchLessonList = useCallback(() => {
    if (!selectedYear) return;

    const params: any = {
      schoolYear: selectedYear,
      limit: '30',
      page: '0',
    };

    if (!isAdmin) {
      if (!teacherId) return;
      params.teacherId = teacherId;
    }

    setLoading(true);
    teacherApis
      .getListLesson(params)
      .then((res) => setLessonData(res.data))
      .finally(() => setLoading(false));
  }, [teacherId, selectedYear, isAdmin]);

  useEffect(() => {
    fetchLessonList();
  }, [fetchLessonList]);

  // Columns config
  const columns: ColumnsType<ILessonListItem> = [
    {
      title: 'Lớp học',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Năm học',
      dataIndex: 'schoolYear',
      key: 'schoolYear',
    },
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Tuần',
      dataIndex: 'weekNumber',
      key: 'weekNumber',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(`${constants.APP_PREFIX}/lessons/detail/${record._id}`)
              }
            />
          </Tooltip>

          {!isAdmin &&
            (record.status === 'Dự thảo' || record.status === 'Chờ duyệt') &&
            canUpdate && (
              <Tooltip title="Cập nhật">
                <Button
                  type="text"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() =>
                    navigate(`${constants.APP_PREFIX}/lessons/edit/${record._id}`)
                  }
                />
              </Tooltip>
            )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Title level={3} style={{ margin: 0 }}>
          {isAdmin ? 'Danh sách báo giảng giáo viên' : 'Báo cáo thời khóa biểu theo tuần'}
        </Title>
      }
      extra={
        !isAdmin &&
        canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${constants.APP_PREFIX}/lessons/create`)}
          >
            Tạo mới báo giảng
          </Button>
        )
      }
      style={{ margin: 24 }}
    >
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Select
          value={selectedYear}
          onChange={(value) => {
            setSelectedYear(value);
            setLessonData([]);
          }}
          options={schoolYears.map((item) => ({
            label: item?.schoolYear,
            value: item?.schoolYear,
          }))}
          style={{ minWidth: 220 }}
        />

        <Tooltip title="Làm mới danh sách">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchLessonList}
            loading={loading}
          >
            Làm mới danh sách
          </Button>
        </Tooltip>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={lessonData}
          rowKey="_id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 'max-content' }}
        />
      </Spin>
    </Card>
  );
}

export default TeacherReport;
