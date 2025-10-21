import { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, Button, Space, Typography, Tag, Card, Popconfirm, Flex, Spin, Tooltip } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { constants } from '../../constants';
import { toast } from 'react-toastify';
import { curriculumsApis } from '../../services/apiServices';
import { CurriculumItem } from '../../types/curriculums';
import { usePagePermission } from '../../hooks/usePagePermission';

const { Title } = Typography;
const { Search } = Input;

const formatMinutesToTime = (minutes: number) => {
    if (isNaN(minutes)) return 'N/A';
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
};


function CurriculumManagement() {
    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const [originalCurriculums, setOriginalCurriculums] = useState<CurriculumItem[]>([]);
    const [filteredCurriculums, setFilteredCurriculums] = useState<CurriculumItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchCurriculums = useCallback(async () => {
        setLoading(true);
        try {
            const response = await curriculumsApis.getCurriculumsList({
                page: 1,
                limit: 1000,
            });
            setOriginalCurriculums(response.data);
            setFilteredCurriculums(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.length,
                current: 1
            }));
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Lấy danh sách chương trình học thất bại!');
            setOriginalCurriculums([]);
            setFilteredCurriculums([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurriculums();
    }, [fetchCurriculums]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = originalCurriculums.filter(item =>
            item.activityName.toLowerCase().includes(lowercasedFilter) ||
            item.activityCode.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredCurriculums(filteredData);

        setPagination(prev => ({
            ...prev,
            total: filteredData.length,
            current: 1,
        }));
    }, [searchTerm, originalCurriculums]);


    const handleDelete = async (id: string) => {
        try {
            await curriculumsApis.deleteCurriculum(id);
            toast.success('Xóa chương trình học thành công!');
            fetchCurriculums();
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Xóa chương trình học thất bại. Vui lòng thử lại.');
        }
    };

    const columns = useMemo((): any[] => [
        {
            title: 'Mã Hoạt động',
            dataIndex: 'activityCode',
            key: 'activityCode',
            sorter: (a: CurriculumItem, b: CurriculumItem) => a.activityCode.localeCompare(b.activityCode),
        },
        {
            title: 'Tên Hoạt động',
            dataIndex: 'activityName',
            key: 'activityName',
            sorter: (a: CurriculumItem, b: CurriculumItem) => a.activityName.localeCompare(b.activityName),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            filters: [
                { text: 'Cố định', value: 'Cố định' },
                { text: 'Bình thường', value: 'Bình thường' },
            ],
            onFilter: (value: any, record: CurriculumItem) => record.type === value,
            render: (type: string) => {
                const color = type === 'Cố định' ? 'blue' : 'purple';
                return <Tag color={color}>{type.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Chi tiết',
            key: 'details',
            sorter: (a: CurriculumItem, b: CurriculumItem) => {
                // Ưu tiên 'Cố định' lên trước
                if (a.type === 'Cố định' && b.type === 'Bình thường') return -1;
                if (a.type === 'Bình thường' && b.type === 'Cố định') return 1;

                if (a.type === 'Cố định') {
                    return (a.startTime ?? 0) - (b.startTime ?? 0);
                }

                if (a.type === 'Bình thường') {
                    return (a.age ?? 0) - (b.age ?? 0);
                }
                return 0;
            },
            defaultSortOrder: 'ascend',
            render: (_: any, record: CurriculumItem) => {
                if (record.type === 'Cố định') {
                    return `Thời gian: ${formatMinutesToTime(record.startTime as number)} - ${formatMinutesToTime(record.endTime as number)}`;
                }
                if (record.type === 'Bình thường') {
                    const ageText = record.age === 0 ? "Dưới 1 tuổi" : (record.age || 'N/A');
                    return `Độ tuổi: ${ageText}, Danh mục: ${record.category || 'N/A'}`;
                }
                return 'N/A';
            },
        },
        {
            title: 'Trạng thái',
            key: 'active',
            dataIndex: 'active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'volcano'}>
                    {active ? 'ĐANG HOẠT ĐỘNG' : 'KHÔNG HOẠT ĐỘNG'}
                </Tag>
            ),
            filters: [
                { text: 'Đang hoạt động', value: true },
                { text: 'Không hoạt động', value: false },
            ],
            onFilter: (value: any, record: CurriculumItem) => record.active === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: CurriculumItem) => (
                <Space size="middle">
                    {canUpdate && (<Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => navigate(`${constants.APP_PREFIX}/curriculums/update/${record._id}`)} />)}

                    <Popconfirm
                        title="Xóa chương trình học"
                        description="Bạn có chắc chắn muốn xóa chương trình này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        {canDelete && (<Button type="text" danger icon={<DeleteOutlined />} />)}

                    </Popconfirm>
                </Space>
            ),
        },
    ], [handleDelete, canUpdate, canDelete, navigate]);


    return (
        <Card>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Title level={2}>Quản lý hoạt động</Title>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                        <Search
                            placeholder="Tìm kiếm theo tên, mã hoạt động..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: 400 }}
                            allowClear
                        />
                        <Tooltip title="Làm mới danh sách">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchCurriculums}
                                loading={loading}
                            />
                        </Tooltip>
                        {canCreate && (<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/curriculums/create`)}>
                            Thêm mới
                        </Button>)}

                    </Space>

                </div>
                {loading ? (
                    <Flex align="center" justify="center" style={{ minHeight: '400px' }}>
                        <Spin size="large" />
                    </Flex>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredCurriculums}
                        rowKey="_id"
                        bordered
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize: pageSize }),
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                        }}
                    />
                )}
            </Space>
        </Card>
    );
}

export default CurriculumManagement;