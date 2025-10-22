import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import {
    SaveOutlined,
    ArrowLeftOutlined,
    ClusterOutlined,
    AppstoreOutlined,
    CalendarOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
    AvailableTopicActivitiesResponse,
    UpdateTopicDto,
    ActivityInput,
    TopicActivityDetail,
    ManualActivityRow,
} from '../../../types/topic';
import { topicApis } from '../../../services/apiServices';
import { ageOptions } from '../../../components/hard-code-action';
import { toast } from 'react-toastify';
import ManualActivityTable from '../../../components/table/ManualActivityTable';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

const { Title } = Typography;
const { TabPane } = Tabs;

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: (i + 1).toString(),
}));

function TopicUpdate() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const user = useCurrentUser();
    const [availableActivities, setAvailableActivities] =
        useState<AvailableTopicActivitiesResponse | null>(null);

    const [manualFixRows, setManualFixRows] = useState<ManualActivityRow[]>([]);
    const [manualCoreRows, setManualCoreRows] = useState<ManualActivityRow[]>([]);
    const [manualEventRows, setManualEventRows] = useState<ManualActivityRow[]>(
        []
    );

    const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const transformApiToRows = (
        details: TopicActivityDetail[]
    ): ManualActivityRow[] => {
        return details.map((item) => ({
            key: item._id,
            activityId: item.activity._id,
            sessions: item.sessionsPerWeek,
            activityName: item.activity.activityName,
            activityTypeDisplay:
                item.activity.type === 'Bình thường'
                    ? item.activity.category
                    : item.activity.type,
            startTime: item.activity.startTime,
            endTime: item.activity.endTime,
            eventName: item.activity.eventName,
        }));
    };

    useEffect(() => {
        if (!id) {
            toast.error('Không tìm thấy ID chủ đề.');
            navigate(-1);
            return;
        }

        const fetchData = async () => {
            try {
                const topicData = await topicApis.getTopicById(id);

                form.setFieldsValue({
                    topicName: topicData.topicName,
                    age: topicData.age,
                    month: topicData.month,
                });

                const availableData = await topicApis.getAvailableTopicActivities({
                    age: topicData.age,
                    month: topicData.month,
                });
                setAvailableActivities(availableData);

                setManualFixRows(transformApiToRows(topicData.activitiFix));
                setManualCoreRows(transformApiToRows(topicData.activitiCore));
                setManualEventRows(transformApiToRows(topicData.activitiEvent));
            } catch (error) {
                toast.error('Lỗi khi tải dữ liệu chủ đề.');
                navigate(-1);
            } finally {
                setIsLoading(false);
                setIsDirty(false);
            }
        };

        fetchData();
    }, [id, navigate, form]);

    const checkDirtyState = () => isDirty;

    const handleBackClick = () => {
        if (checkDirtyState()) {
            setIsBackConfirmVisible(true);
        } else {
            navigate(-1);
        }
    };

    const updateManualRows = (
        setter: React.Dispatch<React.SetStateAction<ManualActivityRow[]>>,
        rows: ManualActivityRow[]
    ) => {
        setIsDirty(true);
        setter(rows);
    };

    const onFinish = async (values: any) => {
        if (!id) return;

        setIsSaving(true);

        const formatFixRows = (rows: ManualActivityRow[]): ActivityInput[] => {
            return rows
                .filter((row) => row.activityId)
                .map((row) => ({
                    activity: row.activityId!,
                    sessionsPerWeek: 1,
                }));
        };

        const formatCoreOrEventRows = (rows: ManualActivityRow[]): ActivityInput[] => {
            return rows
                .filter((row) => row.activityId && (row.sessions ?? 0) > 0)
                .map((row) => ({
                    activity: row.activityId!,
                    sessionsPerWeek: row.sessions!,
                }));
        };

        const finalFix = formatFixRows(manualFixRows);
        const finalCore = formatCoreOrEventRows(manualCoreRows);
        const finalEvent = formatCoreOrEventRows(manualEventRows);

        if (
            finalFix.length === 0 &&
            finalCore.length === 0 &&
            finalEvent.length === 0
        ) {
            toast.warn(
                'Vui lòng chọn ít nhất một hoạt động (và nhập số buổi nếu cần).'
            );
            setIsSaving(false);
            return;
        }

        const payload: UpdateTopicDto = {
            topicName: values.topicName,
            age: values.age,
            month: values.month,
            activitiFix: finalFix,
            activitiCore: finalCore,
            activitiEvent: finalEvent,
            updatedBy: user?.email,
        };

        try {
            await topicApis.updateTopic(id, payload);
            toast.success('Cập nhật chủ đề thành công!');
            navigate(-1);
        } catch (error) {
            toast.error('Cập nhật chủ đề thất bại!');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" style={{ minHeight: '60vh' }}>
                <Spin tip="Đang tải dữ liệu chủ đề..." size="large" />
            </Flex>
        );
    }

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={() => setIsDirty(true)}
                style={{ paddingBottom: 80 }}
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Title level={3} style={{ margin: 0 }}>
                        Cập nhật Chủ đề
                    </Title>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBackClick}>
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
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="age"
                                label="Độ tuổi"
                                rules={[{ required: true, message: 'Vui lòng chọn độ tuổi' }]}
                            >
                                <Select
                                    placeholder="Chọn độ tuổi"
                                    options={ageOptions}
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="month"
                                label="Tháng"
                                rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}
                            >
                                <Select
                                    placeholder="Chọn tháng"
                                    options={monthOptions}
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {availableActivities && (
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
                                <ManualActivityTable
                                    rows={manualFixRows}
                                    options={availableActivities.activitiFix}
                                    onChange={(rows) => updateManualRows(setManualFixRows, rows)}
                                    tableType="fix"
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
                                <ManualActivityTable
                                    rows={manualCoreRows}
                                    options={availableActivities.activitiCore}
                                    onChange={(rows) =>
                                        updateManualRows(setManualCoreRows, rows)
                                    }
                                    tableType="core"
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
                                <ManualActivityTable
                                    rows={manualEventRows}
                                    options={availableActivities.activitiEvent}
                                    onChange={(rows) =>
                                        updateManualRows(setManualEventRows, rows)
                                    }
                                    tableType="event"
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
                                <Button onClick={handleBackClick} disabled={isSaving}>
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSaving}
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
        </>
    );
}

export default TopicUpdate;