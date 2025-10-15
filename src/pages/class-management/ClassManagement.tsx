import { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Space, Typography, Row, Col, Card, Select,
    Input, Tooltip, Spin, Flex
} from 'antd';
import {
    PlusOutlined, SyncOutlined, EyeOutlined, EditOutlined,
    LockOutlined, UnlockOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { ClassListItem } from '../../types/class';
import { SchoolYearListItem } from '../../types/schoolYear';
import { classApis, schoolYearApis } from '../../services/apiServices';
import { constants } from '../../constants';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

function ClassManagement() {
    const navigate = useNavigate();
    const [originalClassList, setOriginalClassList] = useState<ClassListItem[]>([]);
    const [filteredClassList, setFilteredClassList] = useState<ClassListItem[]>([]);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchClassList = useCallback(async (schoolYear: string) => {
        setLoading(true);
        try {
            const response = await classApis.getClassList({
                year: schoolYear,
                page: 1,
                limit: 1000,
            });
            setOriginalClassList(response.data);
            setFilteredClassList(response.data);
            setPagination(prev => ({ ...prev, total: response.page.totalCount, current: 1 }));
        } catch (error) {
            toast.info('Hiện chưa có lớp học nào trong năm học này !');
            setOriginalClassList([]);
            setFilteredClassList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchSchoolYears = async () => {
            try {
                const response = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
                const activeOrLatestYear = response.data.find(y => y.state === 'Đang hoạt động') || response.data[0];
                setSchoolYears(response.data);
                if (activeOrLatestYear) {
                    setSelectedSchoolYear(activeOrLatestYear.schoolYear);
                }
            } catch (error) {
                typeof error === "string" ? toast.warn(error) : toast.error('Không thể tải danh sách năm học.');
            }
        };
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        if (selectedSchoolYear) {
            setSearchTerm('');
            fetchClassList(selectedSchoolYear);
        }
    }, [selectedSchoolYear, fetchClassList]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = originalClassList.filter(item => {
            return (
                item.className.toLowerCase().includes(lowercasedFilter) ||
                item.classCode.toLowerCase().includes(lowercasedFilter)
            );
        });
        setFilteredClassList(filteredData);
        setPagination(prev => ({ ...prev, total: filteredData.length }));
    }, [searchTerm, originalClassList]);

    const handleLock = (id: string) => console.log('Lock class:', id);
    const handleUnlock = (id: string) => console.log('Unlock class:', id);

    const columns: ColumnsType<ClassListItem> = [
        { title: 'Mã Lớp', dataIndex: 'classCode', key: 'classCode' },
        { title: 'Tên Lớp', dataIndex: 'className', key: 'className' },
        { title: 'Độ tuổi', dataIndex: 'age', key: 'age' },
        { title: 'Sĩ Số', dataIndex: 'numberStudent', key: 'numberStudent', align: 'center' },
        { title: 'Số GV', dataIndex: 'numberTeacher', key: 'numberTeacher', align: 'center' },
        { title: 'Phòng học', dataIndex: 'room', key: 'room', align: 'center' },
        {
            title: 'Hành Động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/classes/view/${record._id}`)} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => navigate(`${constants.APP_PREFIX}/classes/update/${record._id}`)} />
                    </Tooltip>
                    <Tooltip title="Khóa lớp">
                        <Button type="text" danger icon={<LockOutlined />} onClick={() => handleLock(record._id)} />
                    </Tooltip>
                    <Tooltip title="Mở khóa">
                        <Button type="text" icon={<UnlockOutlined style={{ color: 'green' }} />} onClick={() => handleUnlock(record._id)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    if (loading && schoolYears.length === 0) {
        return <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 150px)' }}><Spin size="large" /></Flex>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Quản lý Lớp học</Title>
                    </Col>
                    <Col>
                        <Space wrap>
                            <Select
                                value={selectedSchoolYear}
                                style={{ width: 150 }}
                                onChange={(value) => setSelectedSchoolYear(value)}
                                placeholder="Chọn năm học"
                            >
                                {schoolYears.map(year => (
                                    <Option key={year._id} value={year.schoolYear}>{year.schoolYear}</Option>
                                ))}
                            </Select>
                            <Search
                                placeholder="Tìm kiếm theo tên, mã lớp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 200 }}
                            />
                            <Button icon={<SyncOutlined />}>Đồng bộ dữ liệu</Button>
                            <Button onClick={() => navigate(`${constants.APP_PREFIX}/classes/create`)} type="primary" icon={<PlusOutlined />}>Tạo mới</Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredClassList}
                    loading={loading}
                    rowKey="_id"
                    bordered
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize: pageSize }),
                    }}
                />
            </Card>
        </div>
    );
}

export default ClassManagement;