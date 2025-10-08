import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, Space, Typography, Row, Col, Card, Tooltip, Tag, Select } from 'antd';
import { SearchOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { enrollmentApis } from '../../services/apiServices';
import { EnrollmentListItem } from '../../types/enrollment';
import dayjs from 'dayjs';
import { constants } from '../../constants';

const EnrollmentManagement: React.FC = () => {
    const navigate = useNavigate();
    const [allEnrollments, setAllEnrollments] = useState<EnrollmentListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: (total) => `Tổng số: ${total} bản ghi`,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const fetchAllEnrollments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await enrollmentApis.getEnrollmentList({ page: 1, limit: 1000 });
            setAllEnrollments(response.data);
        } catch (error) {
            toast.error('Tải danh sách đơn tuyển sinh thất bại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllEnrollments();
    }, [fetchAllEnrollments]);

    const filteredEnrollments = useMemo(() => {
        let data = allEnrollments;

        if (statusFilter) {
            data = data.filter(item => item.state === statusFilter);
        }

        if (searchQuery) {
            const keyword = searchQuery.trim().toLowerCase();
            data = data.filter(item =>
                item.studentName.toLowerCase().includes(keyword) ||
                item.enrollmentCode.toLowerCase().includes(keyword) ||
                item.fatherName.toLowerCase().includes(keyword)
            );
        }

        return data;
    }, [allEnrollments, searchQuery, statusFilter]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchQuery, statusFilter]);

    const handleTableChange = useCallback((newPagination: TablePaginationConfig) => {
        setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
    }, []);

    const renderStatusTag = (state: string) => {
        let color = 'default';
        if (state === 'Hoàn thành') color = 'success';
        if (state === 'Chờ bổ sung') color = 'error';
        if (state === 'Chờ xử lý') color = 'processing';
        if (state === 'Chờ BGH phê duyệt') color = 'processing';
        if (state === 'Chưa đủ điều kiện nhập học') color = 'warning';
        return <Tag color={color}>{state.toUpperCase()}</Tag>;
    };

    const columns: ColumnsType<EnrollmentListItem> = useMemo(() => [
        {
            title: 'Mã đơn',
            dataIndex: 'enrollmentCode',
            key: 'enrollmentCode',
        },
        {
            title: 'Tên học sinh',
            dataIndex: 'studentName',
            key: 'studentName',
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'studentDob',
            key: 'studentDob',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Phụ huynh',
            dataIndex: 'fatherName',
            key: 'fatherName',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'state',
            key: 'state',
            render: renderStatusTag,
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_: unknown, record: EnrollmentListItem) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/enrollments/view/${record._id}`)} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} onClick={() => navigate(`${constants.APP_PREFIX}/enrollments/edit/${record._id}`)} />} />
                    </Tooltip>
                </Space>
            ),
        },
    ], [navigate]);

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Typography.Title level={2} style={{ margin: 0 }}>
                            Quản lý Tuyển sinh
                        </Typography.Title>
                    </Col>
                    <Col>
                        <Space>
                            <Input
                                placeholder="Tìm theo tên, mã đơn..."
                                prefix={<SearchOutlined />}
                                style={{ width: 250 }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                allowClear
                            />
                            <Select
                                placeholder="Lọc theo trạng thái"
                                style={{ width: 180 }}
                                onChange={(value) => setStatusFilter(value)}
                                allowClear
                            >
                                <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
                                <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                                <Select.Option value="Chờ bổ sung">Chờ bổ sung</Select.Option>
                                <Select.Option value="Chờ BGH phê duyệt">Chờ BGH phê duyệt</Select.Option>
                                <Select.Option value="Chưa đủ điều kiện nhập học">Chưa đủ điều kiện nhập học</Select.Option>
                            </Select>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredEnrollments}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ ...pagination, total: filteredEnrollments.length }}
                    onChange={handleTableChange}
                    bordered
                />
            </Card>


        </div>
    );
};

export default EnrollmentManagement;

