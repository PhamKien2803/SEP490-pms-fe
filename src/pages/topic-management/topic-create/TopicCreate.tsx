import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Tabs,
    Spin,
    Flex,
    Typography,
    Space,
    Affix,
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
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
    ActivityReference,
    AvailableTopicActivitiesResponse,
    CreateTopicDto,
    GetAvailableTopicActivitiesParams,
    ActivityInput,
    UnifiedActivityRow,
} from '../../../types/topic';
import { topicApis } from '../../../services/apiServices';
import { ageOptions } from '../../../components/hard-code-action';
import { toast } from 'react-toastify';
import MergedActivityTable from '../../../components/table/MergedActivityTable';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title } = Typography;
const { TabPane } = Tabs;

const getCurrentMonth = (): string => {
    return (new Date().getMonth() + 1).toString();
};

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: (i + 1).toString(),
}));


function TopicCreate() {
    usePageTitle('Tạo chủ đề - Cá Heo Xanh');
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const user = useCurrentUser();
    const [suggestedData, setSuggestedData] =
        useState<AvailableTopicActivitiesResponse | null>(null);
    const [fixActivities, setFixActivities] = useState<UnifiedActivityRow[]>([]);
    const [coreActivities, setCoreActivities] = useState<UnifiedActivityRow[]>([]);
    const [eventActivities, setEventActivities] = useState<UnifiedActivityRow[]>(
        []
    );

    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);
    const [_, setIsDirty] = useState(false);

    useEffect(() => {
        form.setFieldsValue({
            month: getCurrentMonth(),
        });
    }, [form]);

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
            sessions: undefined,
            startTime: act.startTime,
            endTime: act.endTime,
            eventName: act.eventName,
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

            setSuggestedData(response);

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
                    const { value: selectedValue, option } = value;
                    return {
                        ...row,
                        activityId: selectedValue,
                        activityTypeDisplay: option.typeDisplay,
                        startTime: option.startTime,
                        endTime: option.endTime,
                        eventName: option.eventName,
                    };
                }

                if (field === 'sessions') {
                    return { ...row, sessions: value };
                }

                return row;
            })
        );
    };

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

        const formatFixRows = (rows: UnifiedActivityRow[]): ActivityInput[] => {
            return rows
                .filter((row) => row.activityId)
                .map((row) => ({
                    activity: row.activityId!,
                    sessionsPerWeek: 1,
                }));
        };

        const formatCoreOrEventRows = (rows: UnifiedActivityRow[]): ActivityInput[] => {
            return rows
                .filter((row) => row.activityId && (row.sessions ?? 0) > 0)
                .map((row) => ({
                    activity: row.activityId!,
                    sessionsPerWeek: row.sessions!,
                }));
        };

        const finalFix = formatFixRows(fixActivities);
        const finalCore = formatCoreOrEventRows(coreActivities);
        const finalEvent = formatCoreOrEventRows(eventActivities);

        if (
            finalFix.length === 0 &&
            finalCore.length === 0 &&
            finalEvent.length === 0
        ) {
            toast.warn(
                'Vui lòng chọn ít nhất một hoạt động (và nhập số buổi nếu cần).'
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
            createdBy: user?.email,
            updatedBy: user?.email,
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
                                        tableType="fix"
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
                                        tableType="core"
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
                                        tableType="event"
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