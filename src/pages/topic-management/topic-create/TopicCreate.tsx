import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  // message, // Đã xóa
  Tabs,
  Table,
  InputNumber,
  Spin,
  Flex,
  Typography,
  Space,
  Affix,
  Tooltip,
  Modal,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  SaveOutlined,
  BulbOutlined,
  ArrowLeftOutlined,
  ClusterOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  ActivityReference,
  AvailableTopicActivitiesResponse,
  CreateTopicDto,
  GetAvailableTopicActivitiesParams,
  ActivityInput,
} from '../../../types/topic';
import { topicApis } from '../../../services/apiServices';
import { ageOptions } from '../../../components/hard-code-action';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const getCurrentMonth = (): string => {
  return (new Date().getMonth() + 1).toString();
};

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `Tháng ${i + 1}`,
  value: (i + 1).toString(),
}));

// --- STATE MỚI CHO HÀNG TRONG BẢNG ---
// Hàng trong bảng giờ có 2 loại:
// 1. 'suggested': Lấy từ API gợi ý, tên HĐ là text
// 2. 'manual': Người dùng tự thêm, tên HĐ là Select
interface UnifiedActivityRow {
  key: string; // _id (suggested) hoặc Date.now() (manual)
  type: 'suggested' | 'manual';
  activityId?: string; // ID của hoạt động
  activityName?: string; // Tên HĐ (chỉ cho 'suggested')
  activityTypeDisplay?: string; // Loại HĐ (chỉ cho 'suggested')
  sessions?: number; // Số buổi
}

// --- COMPONENT BẢNG GỘP (MỚI) ---
interface MergedActivityTableProps {
  rows: UnifiedActivityRow[];
  options: ActivityReference[]; // Danh sách HĐ cho Select
  onChange: (key: string, field: 'activityId' | 'sessions', value: any) => void;
  onDelete: (key: string) => void;
  onAddRow: () => void;
}

const MergedActivityTable: React.FC<MergedActivityTableProps> = ({
  rows,
  options,
  onChange,
  onDelete,
  onAddRow,
}) => {
  const activityOptions = options.map((opt) => ({
    label: opt.activityName,
    value: opt._id,
    // Lưu thêm thông tin để lookup
    typeDisplay: opt.type === 'Bình thường' ? opt.category : opt.type,
  }));

  const columns: TableProps<UnifiedActivityRow>['columns'] = [
    {
      title: 'Tên hoạt động',
      key: 'activityName',
      width: '40%',
      render: (_, record) => {
        if (record.type === 'manual') {
          return (
            <Select
              showSearch
              placeholder="Chọn hoạt động"
              style={{ width: '100%' }}
              options={activityOptions}
              value={record.activityId}
              onChange={(value, option) =>
                onChange(record.key, 'activityId', { value, option })
              }
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          );
        }
        return record.activityName;
      },
    },
    {
      title: 'Loại',
      key: 'type',
      width: '25%',
      render: (_, record) => {
        if (record.type === 'manual') {
          const selected = activityOptions.find(
            (opt) => opt.value === record.activityId
          );
          return selected ? selected.typeDisplay : '...';
        }
        return record.activityTypeDisplay;
      },
    },
    {
      title: 'Số buổi / tuần',
      key: 'sessions',
      width: '25%',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={10}
          placeholder="Số buổi"
          value={record.sessions}
          onChange={(value) => onChange(record.key, 'sessions', value)}
          style={{ width: '100px' }}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xóa hàng này">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.key)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="key"
        pagination={false}
        bordered
        size="small"
      />
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={onAddRow}
        style={{ width: '100%', marginTop: 8 }}
      >
        Thêm hoạt động
      </Button>
    </>
  );
};

// --- COMPONENT CHÍNH (ĐÃ CẬP NHẬT) ---
function TopicCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Nguồn data gốc từ API (dùng cho Select options)
  const [suggestedData, setSuggestedData] =
    useState<AvailableTopicActivitiesResponse | null>(null);

  // State cho 3 bảng
  const [fixActivities, setFixActivities] = useState<UnifiedActivityRow[]>([]);
  const [coreActivities, setCoreActivities] = useState<UnifiedActivityRow[]>([]);
  const [eventActivities, setEventActivities] = useState<UnifiedActivityRow[]>(
    []
  );

  const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      month: getCurrentMonth(),
    });
  }, [form]);

  // Biến đổi data API sang data cho bảng
  const transformApiToRows = (
    activities: ActivityReference[]
  ): UnifiedActivityRow[] => {
    return activities.map((act) => ({
      key: act._id,
      type: 'suggested',
      activityId: act._id,
      activityName: act.activityName,
      activityTypeDisplay:
        act.type === 'Bình thường' ? act.category : act.type,
      sessions: undefined, // Mặc định không có số buổi
    }));
  };

  const checkDirtyState = () => {
    const formValues = form.getFieldsValue();
    const isFormDirty = !!formValues.topicName;
    const areTablesDirty =
      fixActivities.length > 0 ||
      coreActivities.length > 0 ||
      eventActivities.length > 0;
    return isFormDirty || areTablesDirty;
  };

  const handleBackClick = () => {
    if (checkDirtyState()) {
      setIsBackConfirmVisible(true);
    } else {
      navigate(-1);
    }
  };

  const handleSuggest = async () => {
    try {
      const values = await form.validateFields(['age', 'month']);
      setSuggestLoading(true);
      setSuggestedData(null);
      setFixActivities([]);
      setCoreActivities([]);
      setEventActivities([]);

      const params: GetAvailableTopicActivitiesParams = {
        age: values.age,
        month: values.month,
      };
      const response = await topicApis.getAvailableTopicActivities(params);
      
      // 1. Lưu data gốc cho Options
      setSuggestedData(response);
      
      // 2. Điền vào các bảng
      setFixActivities(transformApiToRows(response.activitiFix));
      setCoreActivities(transformApiToRows(response.activitiCore));
      setEventActivities(transformApiToRows(response.activitiEvent));
      
      setIsDirty(true);
      toast.info('Đã tải gợi ý. Bạn có thể nhập số buổi hoặc thêm hoạt động.');
    } catch (error) {
      toast.info('Vui lòng chọn Độ tuổi và Tháng');
    } finally {
      setSuggestLoading(false);
    }
  };

  // --- Hàm cập nhật 1 hàng trong bảng ---
  const handleTableRowChange = (
    type: 'fix' | 'core' | 'event',
    key: string,
    field: 'activityId' | 'sessions',
    value: any
  ) => {
    setIsDirty(true);
    const setter =
      type === 'fix'
        ? setFixActivities
        : type === 'core'
        ? setCoreActivities
        : setEventActivities;

    setter((prevRows) =>
      prevRows.map((row) => {
        if (row.key !== key) return row;

        if (field === 'activityId') {
          // value là { value, option }
          return {
            ...row,
            activityId: value.value,
            activityTypeDisplay: value.option.typeDisplay, // Cập nhật loại
          };
        }

        if (field === 'sessions') {
          return { ...row, sessions: value };
        }
        
        return row;
      })
    );
  };

  // --- Hàm xóa 1 hàng khỏi bảng ---
  const handleTableRowDelete = (type: 'fix' | 'core' | 'event', key: string) => {
    setIsDirty(true);
    const setter =
      type === 'fix'
        ? setFixActivities
        : type === 'core'
        ? setCoreActivities
        : setEventActivities;
    setter((prevRows) => prevRows.filter((row) => row.key !== key));
  };

  // --- Hàm thêm 1 hàng thủ công ---
  const handleTableRowAdd = (type: 'fix' | 'core' | 'event') => {
    setIsDirty(true);
    const setter =
      type === 'fix'
        ? setFixActivities
        : type === 'core'
        ? setCoreActivities
        : setEventActivities;
    
    const newRow: UnifiedActivityRow = {
      key: Date.now().toString(),
      type: 'manual',
    };

    setter((prevRows) => [...prevRows, newRow]);
  };

  const onFinish = async (values: any) => {
    if (!suggestedData) {
      toast.warn('Vui lòng nhấn "Gợi ý hoạt động" trước khi lưu.');
      return;
    }

    setLoading(true);

    const formatRows = (rows: UnifiedActivityRow[]): ActivityInput[] => {
      return rows
        .filter((row) => row.activityId && (row.sessions ?? 0) > 0)
        .map((row) => ({
          activity: row.activityId!,
          sessionsPerWeek: row.sessions!,
        }));
    };

    const finalFix = formatRows(fixActivities);
    const finalCore = formatRows(coreActivities);
    const finalEvent = formatRows(eventActivities);

    if (
      finalFix.length === 0 &&
      finalCore.length === 0 &&
      finalEvent.length === 0
    ) {
      toast.warn(
        'Vui lòng chọn ít nhất một hoạt động (bằng cách nhập số buổi).'
      );
      setLoading(false);
      return;
    }

    const payload: CreateTopicDto = {
      topicName: values.topicName,
      age: values.age,
      month: values.month,
      activitiFix: finalFix,
      activitiCore: finalCore,
      activitiEvent: finalEvent,
      createdBy: 'admin_user',
      updatedBy: 'admin_user',
    };

    try {
      await topicApis.createTopic(payload);
      toast.success('Tạo chủ đề thành công!');
      navigate(-1);
    } catch (error) {
      toast.error('Tạo chủ đề thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Spin spinning={suggestLoading} tip="Đang tải gợi ý...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={() => setIsDirty(true)}
          style={{ paddingBottom: 80 }}
        >
          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>
              Tạo mới Chủ đề
            </Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackClick}
            >
              Quay lại
            </Button>
          </Flex>

          <Card title="Thông tin chung" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="topicName"
                  label="Tên chủ đề"
                  rules={[{ required: true, message: 'Vui lòng nhập tên chủ đề' }]}
                >
                  <Input placeholder="Ví dụ: Chủ đề Gia đình" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24} align="bottom">
              <Col xs={24} sm={8}>
                <Form.Item
                  name="age"
                  label="Độ tuổi"
                  rules={[{ required: true, message: 'Vui lòng chọn độ tuổi' }]}
                >
                  <Select placeholder="Chọn độ tuổi" options={ageOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="month"
                  label="Tháng"
                  rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}
                >
                  <Select placeholder="Chọn tháng" options={monthOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label=" ">
                  <Button
                    type="primary"
                    ghost
                    icon={<BulbOutlined />}
                    onClick={handleSuggest}
                    style={{ width: '100%' }}
                    loading={suggestLoading}
                  >
                    Gợi ý hoạt động
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {suggestedData && (
            <Card title="Danh sách hoạt động">
              <Tabs defaultActiveKey="fix">
                <TabPane
                  tab={
                    <Space>
                      <ClusterOutlined style={{ color: '#1890ff' }} />
                      Hoạt động cố định
                    </Space>
                  }
                  key="fix"
                >
                  <MergedActivityTable
                    rows={fixActivities}
                    options={suggestedData.activitiFix}
                    onChange={(key, field, value) =>
                      handleTableRowChange('fix', key, field, value)
                    }
                    onDelete={(key) => handleTableRowDelete('fix', key)}
                    onAddRow={() => handleTableRowAdd('fix')}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <Space>
                      <AppstoreOutlined style={{ color: '#fa8c16' }} />
                      Hoạt động học (Core)
                    </Space>
                  }
                  key="core"
                >
                  <MergedActivityTable
                    rows={coreActivities}
                    options={suggestedData.activitiCore}
                    onChange={(key, field, value) =>
                      handleTableRowChange('core', key, field, value)
                    }
                    onDelete={(key) => handleTableRowDelete('core', key)}
                    onAddRow={() => handleTableRowAdd('core')}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <Space>
                      <CalendarOutlined style={{ color: '#52c41a' }} />
                      Hoạt động sự kiện
                    </Space>
                  }
                  key="event"
                >
                  <MergedActivityTable
                    rows={eventActivities}
                    options={suggestedData.activitiEvent}
                    onChange={(key, field, value) =>
                      handleTableRowChange('event', key, field, value)
                    }
                    onDelete={(key) => handleTableRowDelete('event', key)}
                    onAddRow={() => handleTableRowAdd('event')}
                  />
                </TabPane>
              </Tabs>
            </Card>
          )}

          <Affix offsetBottom={0}>
            <Card
              bordered={false}
              style={{
                backgroundColor: '#ffffff',
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Flex justify="end">
                <Space>
                  <Button
                    onClick={handleBackClick}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Lưu
                  </Button>
                </Space>
              </Flex>
            </Card>
          </Affix>
        </Form>

        <Modal
          title={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <ExclamationCircleOutlined
                style={{ color: '#faad14', marginRight: 8, fontSize: '22px' }}
              />
              Xác nhận quay lại
            </span>
          }
          open={isBackConfirmVisible}
          onOk={() => navigate(-1)}
          onCancel={() => setIsBackConfirmVisible(false)}
          okText="Đồng ý"
          cancelText="Không"
          zIndex={1001}
        >
          <p>Các thay đổi chưa được lưu sẽ bị mất. Bạn có chắc muốn tiếp tục?</p>
        </Modal>
      </Spin>
    </>
  );
}

export default TopicCreate;