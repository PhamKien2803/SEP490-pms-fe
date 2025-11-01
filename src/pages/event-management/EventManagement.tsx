import { useState, useEffect, useMemo } from 'react';
import {
    Table,
    Input,
    Button,
    Space,
    Typography,
    Tag,
    Card,
    Popconfirm,
    Tooltip,
    Row,
    Col,
    Select
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ReloadOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { eventApis, schoolYearApis } from '../../services/apiServices';
import { EventItem, GetEventsParams } from '../../types/event';
import { SchoolYearListItem } from '../../types/schoolYear';
import { useNavigate } from 'react-router-dom';
import { constants } from '../../constants';
import { usePagePermission } from '../../hooks/usePagePermission';
import { usePageTitle } from '../../hooks/usePageTitle';


const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('DD/MM/YYYY');
};

function EventManagement() {
    usePageTitle('Quản lý sự kiện - Cá Heo Xanh');
    const navigate = useNavigate();
    const { canCreate, canUpdate, canDelete } = usePagePermission();
    const [originalEvents, setOriginalEvents] = useState<EventItem[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchSchoolYears = async () => {
            setLoading(true);
            try {
                const response = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
                if (response.data && response.data.length > 0) {
                    const sortedYears = [...response.data].sort((a, b) => {
                        const startA = parseInt(a.schoolYear.split('-')[0]);
                        const startB = parseInt(b.schoolYear.split('-')[0]);
                        return startB - startA;
                    });
                    setSchoolYears(sortedYears);
                    if (!selectedSchoolYear) {
                        setSelectedSchoolYear(sortedYears[0].schoolYear);
                    }
                } else {
                    toast.warn("Không tìm thấy dữ liệu năm học nào.");
                    setLoading(false);
                }
            } catch (error) {
                toast.error('Không thể tải danh sách năm học.');
                setLoading(false);
            }
        };
        fetchSchoolYears();
    }, []); // Run once on mount

    const fetchEvents = async (year?: string, page = 1, limit = 10) => {
        if (!year) {
            setOriginalEvents([]);
            setFilteredEvents([]);
            setPagination(prev => ({ ...prev, total: 0, current: 1 }));
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params: GetEventsParams = { page, limit, schoolYear: year };
            const response = await eventApis.getEventList(params);
            setOriginalEvents(response.data);
            setFilteredEvents(response.data);
            setPagination(prev => ({ ...prev, total: response.page.totalCount, current: page, pageSize: limit }));
        } catch (error) {
            toast.info(`Không có sự kiện nào cho năm học ${year}.`);
            setOriginalEvents([]);
            setFilteredEvents([]);
            setPagination(prev => ({ ...prev, total: 0, current: 1 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSchoolYear) {
            fetchEvents(selectedSchoolYear, pagination.current, pagination.pageSize);
        } else if (schoolYears.length > 0) {
            setOriginalEvents([]);
            setFilteredEvents([]);
            setPagination(prev => ({ ...prev, total: 0, current: 1 }));
            setLoading(false);
        }
    }, [selectedSchoolYear, pagination.current, pagination.pageSize, schoolYears.length]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = originalEvents.filter(item =>
            item.eventName.toLowerCase().includes(lowercasedFilter) ||
            item.eventCode.toLowerCase().includes(lowercasedFilter) ||
            (item.note && item.note.toLowerCase().includes(lowercasedFilter))
        );
        setFilteredEvents(filteredData);
    }, [searchTerm, originalEvents]);

    const handleDelete = async (id: string) => {
        try {
            await eventApis.deleteEvent(id);
            toast.success('Xóa sự kiện thành công!');
            if (selectedSchoolYear) {
                const newCurrentPage = (filteredEvents.length === 1 && pagination.current > 1)
                    ? pagination.current - 1
                    : pagination.current;
                fetchEvents(selectedSchoolYear, newCurrentPage, pagination.pageSize);
            }
        } catch (error) {
            toast.error('Xóa sự kiện thất bại.');
        }
    };

    const handleRefresh = () => {
        setSearchTerm('');
        if (selectedSchoolYear) {
            fetchEvents(selectedSchoolYear, pagination.current, pagination.pageSize);
        }
    }

    const handleSchoolYearChange = (value: string | undefined) => {
        setSelectedSchoolYear(value);
        setSearchTerm('');
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleTableChange = (newPagination: any) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const columns = useMemo((): any[] => [
        {
            title: 'Mã Sự kiện',
            dataIndex: 'eventCode',
            key: 'eventCode',
            sorter: (a: EventItem, b: EventItem) => a.eventCode.localeCompare(b.eventCode),
        },
        {
            title: 'Tên Sự kiện',
            dataIndex: 'eventName',
            key: 'eventName',
            sorter: (a: EventItem, b: EventItem) => a.eventName.localeCompare(b.eventName),
        },
        {
            title: 'Ngày Bắt đầu',
            dataIndex: 'holidayStartDate',
            key: 'holidayStartDate',
            render: (text: string) => formatDate(text),
            sorter: (a: EventItem, b: EventItem) => dayjs(a.holidayStartDate).unix() - dayjs(b.holidayStartDate).unix(),
        },
        {
            title: 'Ngày Kết thúc',
            dataIndex: 'holidayEndDate',
            key: 'holidayEndDate',
            render: (text: string) => formatDate(text),
            sorter: (a: EventItem, b: EventItem) => dayjs(a.holidayEndDate).unix() - dayjs(b.holidayEndDate).unix(),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            key: 'active',
            dataIndex: 'active',
            align: 'center' as const,
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'volcano'}>
                    {active ? 'HOẠT ĐỘNG' : 'KHÔNG HĐ'}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Không hoạt động', value: false },
            ],
            onFilter: (value: any, record: EventItem) => record.active === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: EventItem) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        {canUpdate && (<Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => navigate(`${constants.APP_PREFIX}/events/update/${record._id}`)}
                        />)}

                    </Tooltip>
                    <Popconfirm
                        title="Xóa sự kiện"
                        description="Bạn có chắc chắn muốn xóa sự kiện này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        placement="topRight"
                    >
                        <Tooltip title="Xóa">
                            {canDelete && (
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            )}
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ], [handleDelete, navigate]);


    return (
        <div style={{ padding: '24px' }}>
            <Card bordered={false}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>
                            <Space align="center">
                                <CalendarOutlined style={{ color: '#1890ff' }} />
                                Quản lý Sự kiện
                            </Space>
                        </Title>
                    </Col>
                    <Col>
                        <Space wrap>
                            <Select
                                value={selectedSchoolYear}
                                style={{ width: 150 }}
                                onChange={handleSchoolYearChange}
                                placeholder="Chọn năm học"
                                loading={schoolYears.length === 0 && loading}
                                allowClear={false}
                            >
                                {schoolYears.map(year => (
                                    <Option key={year._id} value={year.schoolYear}>{year.schoolYear}</Option>
                                ))}
                            </Select>
                            <Search
                                placeholder="Tìm kiếm sự kiện..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Tooltip title="Làm mới danh sách">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    loading={loading && schoolYears.length > 0}
                                    disabled={!selectedSchoolYear}
                                />
                            </Tooltip>
                            {canCreate && (<Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate(`${constants.APP_PREFIX}/events/create`)}
                            >
                                Thêm mới
                            </Button>)}

                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredEvents}
                    loading={loading}
                    rowKey="_id"
                    bordered
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
}

export default EventManagement;