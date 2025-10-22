import { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Space, Typography, Row, Col, Card, Tooltip, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolYearApis, topicApis } from '../../services/apiServices';
import { SchoolYearListItem } from '../../types/schoolYear';
import { TopicListItem } from '../../types/topic';
import dayjs from 'dayjs';
import { constants } from '../../constants';
import DeleteModal from '../../modal/delete-modal/DeleteModal';

const { Title } = Typography;
const { Option } = Select;

function TopicManagement() {
    const navigate = useNavigate();
    const [topics, setTopics] = useState<TopicListItem[]>([]);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchSchoolYears = useCallback(async () => {
        try {
            const response = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
            const activeYears = response.data.filter(y => y.active);
            setSchoolYears(activeYears);

            const activeYear = activeYears.find(y => y.state === 'Đang hoạt động');
            if (activeYear) {
                setSelectedSchoolYear(activeYear.schoolYear);
            } else if (activeYears.length > 0) {
                setSelectedSchoolYear(activeYears[0].schoolYear);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách năm học.");
        }
    }, []);

    const fetchTopics = useCallback(async (schoolYearName: string) => {
        setLoading(true);
        setTopics([]);
        try {
            const response = await topicApis.getTopicsList({ schoolYear: schoolYearName });
            setTopics(response.data || []);
            if (response.data.length === 0) {
                toast.info(`Năm học ${schoolYearName} chưa có chủ đề nào.`);
            }
        } catch (error: any) {
            if (error?.response?.status === 404) {
                toast.info(`Năm học ${schoolYearName} chưa có chủ đề nào.`);
            } else {
                toast.error("Không thể tải danh sách chủ đề.");
            }
            setTopics([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchoolYears();
    }, [fetchSchoolYears]);

    useEffect(() => {
        if (selectedSchoolYear) {
            fetchTopics(selectedSchoolYear);
        } else {
            setLoading(false);
            setTopics([]);
        }
    }, [selectedSchoolYear, fetchTopics]);

    const showDeleteModal = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalVisible(true);
    };

    const hideDeleteModal = () => {
        setDeletingId(null);
        setIsDeleteModalVisible(false);
    };

    const handleDelete = useCallback(async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await topicApis.deleteTopic(deletingId);
            toast.success('Xóa chủ đề thành công!');
            setTopics(prev => prev.filter(t => t._id !== deletingId));
            hideDeleteModal();
        } catch (error) {
            toast.error("Xóa chủ đề thất bại.");
        } finally {
            setIsDeleting(false);
        }
    }, [deletingId]);

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const columns: ColumnsType<TopicListItem> = useMemo(() => [
        { title: 'Mã Chủ đề', dataIndex: 'topicCode', key: 'topicCode', width: 150 },
        { title: 'Tên Chủ đề', dataIndex: 'topicName', key: 'topicName' },
        { title: 'Tháng', dataIndex: 'month', key: 'month', align: 'center', width: 100 },
        { title: 'Độ tuổi', dataIndex: 'age', key: 'age', align: 'center', width: 100 },
        { title: 'Người tạo', dataIndex: 'createdBy', key: 'createdBy', width: 150 },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (text) => dayjs(text).format('DD/MM/YYYY')
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_: unknown, record: TopicListItem) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => navigate(`${constants.APP_PREFIX}/topics/update/${record._id}`)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record._id)} />
                    </Tooltip>
                </Space>
            ),
        },
    ], [handleNavigate]);

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Quản lý Chủ đề</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Select
                                placeholder="Chọn năm học"
                                style={{ width: 200 }}
                                value={selectedSchoolYear}
                                onChange={(value) => setSelectedSchoolYear(value)}
                                loading={loading && schoolYears.length === 0}
                            >
                                {schoolYears.map(year => (
                                    <Option key={year._id} value={year.schoolYear}>{year.schoolYear}</Option>
                                ))}
                            </Select>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/topics/create`)}>
                                Tạo chủ đề mới
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={topics}
                    loading={loading}
                    rowKey="_id"
                    bordered
                    pagination={{
                        total: topics.length,
                        showTotal: (total) => `Tổng số: ${total} chủ đề`,
                    }}
                />
            </Card>

            <DeleteModal
                open={isDeleteModalVisible}
                loading={isDeleting}
                onClose={hideDeleteModal}
                onConfirm={handleDelete}
            />
        </div>
    );
}

export default TopicManagement;