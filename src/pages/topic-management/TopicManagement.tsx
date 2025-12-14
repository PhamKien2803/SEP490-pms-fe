import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Card,
    Tooltip,
    Select,
    Input,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolYearApis, topicApis } from '../../services/apiServices';
import { SchoolYearListItem } from '../../types/schoolYear';
import { TopicListItem } from '../../types/topic';
import dayjs from 'dayjs';
import { constants } from '../../constants';
import DeleteModal from '../../modal/delete-modal/DeleteModal';
import { usePagePermission } from '../../hooks/usePagePermission';
import { usePageTitle } from '../../hooks/usePageTitle';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

function TopicManagement() {
    usePageTitle('Quản lý chủ đề - Cá Heo Xanh');
    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = usePagePermission();

    const [topics, setTopics] = useState<TopicListItem[]>([]);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchSchoolYears = useCallback(async () => {
        try {
            const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
            const sorted = [...res.data].sort((a, b) => {
                const startA = parseInt(a.schoolYear.split('-')[0]);
                const startB = parseInt(b.schoolYear.split('-')[0]);
                return startB - startA;
            });
            setSchoolYears(sorted);
            const activeYear = sorted.find(y => y.state === 'Đang hoạt động');
            if (activeYear) {
                setSelectedSchoolYear(activeYear.schoolYear);
            }
        } catch (error) {
            typeof error === 'string'
                ? toast.info(error)
                : toast.error('Không thể tải danh sách năm học.');
        } finally {
            setLoading(false);
        }
    }, []);


    const fetchTopics = useCallback(async (schoolYear: string) => {
        setLoading(true);
        try {
            const res = await topicApis.getTopicsList({
                schoolYear,
                page: 1,
                limit: 1000,
            });
            setTopics(res.data || []);
            if (!res.data?.length) {
                toast.info(`Năm học ${schoolYear} chưa có chủ đề nào.`);
            }
        } catch (error) {
            typeof error === 'string'
                ? toast.info("Không có chủ đề nào cho năm học này !")
                : toast.error('Không thể tải danh sách chủ đề.');
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
        }
    }, [selectedSchoolYear, fetchTopics]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchKeyword]);

    const filteredTopics = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return topics;
        return topics.filter(t =>
            t.topicCode.toLowerCase().includes(keyword) ||
            t.topicName.toLowerCase().includes(keyword)
        );
    }, [topics, searchKeyword]);

    const paginatedTopics = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        return filteredTopics.slice(start, start + pagination.pageSize);
    }, [filteredTopics, pagination]);

    const handleTableChange = (p: any) => {
        setPagination({ current: p.current, pageSize: p.pageSize });
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await topicApis.deleteTopic(deletingId);
            toast.success('Xóa chủ đề thành công!');
            setTopics(prev => {
                const newData = prev.filter(t => t._id !== deletingId);
                const maxPage = Math.ceil(newData.length / pagination.pageSize);
                setPagination(p => ({
                    ...p,
                    current: Math.min(p.current, maxPage || 1),
                }));
                return newData;
            });
            setIsDeleteModalVisible(false);
        } catch (error) {
            typeof error === 'string'
                ? toast.info(error)
                : toast.error('Xóa chủ đề thất bại.');
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const columns: ColumnsType<TopicListItem> = useMemo(() => [
        { title: 'Mã Chủ đề', dataIndex: 'topicCode', width: 150 },
        { title: 'Tên Chủ đề', dataIndex: 'topicName' },
        { title: 'Tháng', dataIndex: 'month', align: 'center', width: 100 },
        { title: 'Độ tuổi', dataIndex: 'age', align: 'center', width: 100 },
        { title: 'Người tạo', dataIndex: 'createdBy', width: 150 },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 120,
            render: (v) => dayjs(v).format('DD/MM/YYYY'),
        },
        {
            title: 'Hành động',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space>
                    {canUpdate && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="text"
                                icon={<EditOutlined style={{ color: '#1890ff' }} />}
                                onClick={() =>
                                    navigate(`${constants.APP_PREFIX}/topics/update/${record._id}`)
                                }
                            />
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    setDeletingId(record._id);
                                    setIsDeleteModalVisible(true);
                                }}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ], [navigate, canUpdate, canDelete]);

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2}>Quản lý Chủ đề</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Select
                                value={selectedSchoolYear}
                                style={{ width: 200 }}
                                onChange={setSelectedSchoolYear}
                            >
                                {schoolYears.map(y => (
                                    <Option key={y._id} value={y.schoolYear}>
                                        {y.schoolYear}
                                    </Option>
                                ))}
                            </Select>

                            <Search
                                placeholder="Tìm mã / tên chủ đề..."
                                allowClear
                                value={searchKeyword}
                                onChange={e => setSearchKeyword(e.target.value)}
                                style={{ width: 250 }}
                            />

                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => {
                                    setSearchKeyword('');
                                    selectedSchoolYear && fetchTopics(selectedSchoolYear);
                                }}
                                loading={loading}
                            />

                            {canCreate && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate(`${constants.APP_PREFIX}/topics/create`)}
                                >
                                    Tạo chủ đề mới
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={paginatedTopics}
                    rowKey="_id"
                    loading={loading}
                    bordered
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredTopics.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (t, r) => `${r[0]}–${r[1]} của ${t} chủ đề`,
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <DeleteModal
                open={isDeleteModalVisible}
                loading={isDeleting}
                onClose={() => setIsDeleteModalVisible(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

export default TopicManagement;
