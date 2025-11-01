import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, Button, Space, Typography, Row, Col, Card, Tooltip, Tag, Select, Modal } from 'antd';
import { SearchOutlined, EditOutlined, EyeOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { enrollmentApis } from '../../services/apiServices';
import { EnrollmentListItem } from '../../types/enrollment';
import { usePagePermission } from '../../hooks/usePagePermission';
import { useExcelExport } from '../../hooks/useExcelExport';
import dayjs from 'dayjs';
import { constants } from '../../constants';
import { usePageTitle } from '../../hooks/usePageTitle';

const EnrollmentManagement: React.FC = () => {
    usePageTitle('Quản lý tuyển sinh - Cá Heo Xanh');
    const { canUpdate, canApproveAll } = usePagePermission();
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
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [isApproveAllModalVisible, setIsApproveAllModalVisible] = useState(false);
    const [recordsToApprove, setRecordsToApprove] = useState<EnrollmentListItem[]>([]);
    const [isApprovingAll, setIsApprovingAll] = useState(false);

    const exportData = useMemo(() => {
        return recordsToApprove.map(record => ({
            'Mã Đơn': record.enrollmentCode,
            'Tên Học Sinh': record.studentName,
            'Ngày Sinh': dayjs(record.studentDob).format('DD/MM/YYYY'),
            'Tên Cha': record.fatherName,
            'Tên Mẹ': record.motherName,
            'Trạng Thái': record.state,
        }));
    }, [recordsToApprove]);

    const { exportToExcel, isExporting: isExportingExcel } = useExcelExport({
        data: exportData,
        fileName: 'DanhSachChoDuyet',
    });

    const fetchAllEnrollments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await enrollmentApis.getEnrollmentList({ page: 1, limit: 1000 });
            setAllEnrollments(response.data);
        } catch (error) {
            toast.info('Hiện chưa có đơn tuyển sinh nào. Vui lòng tạo mới!');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllEnrollments();
    }, [fetchAllEnrollments]);

    const filteredEnrollments = useMemo(() => {
        let data = allEnrollments;
        if (statusFilters && statusFilters.length > 0) {
            data = data.filter(item => statusFilters.includes(item.state));
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
    }, [allEnrollments, searchQuery, statusFilters]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchQuery, statusFilters]);

    const handleOpenApproveAllModal = useCallback(() => {
        const toApprove = allEnrollments.filter(
            item => item.state === 'Chờ BGH phê duyệt'
        );
        if (toApprove.length === 0) {
            toast.info('Không có bản ghi nào ở trạng thái "Chờ BGH phê duyệt" để duyệt.');
            return;
        }
        setRecordsToApprove(toApprove);
        setIsApproveAllModalVisible(true);
    }, [allEnrollments]);

    const handleConfirmApproveAll = useCallback(async () => {
        setIsApprovingAll(true);
        try {
            const idsToApprove = recordsToApprove.map(record => record._id);
            await enrollmentApis.approveAllEnrollments({ ids: idsToApprove });
            toast.success(`Đã duyệt thành công ${recordsToApprove.length} bản ghi.`);
            setIsApproveAllModalVisible(false);
            fetchAllEnrollments();
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Duyệt hàng loạt thất bại. Vui lòng thử lại!');
        } finally {
            setIsApprovingAll(false);
        }
    }, [recordsToApprove, fetchAllEnrollments]);

    const handleTableChange = useCallback((newPagination: TablePaginationConfig) => {
        setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
    }, []);

    const renderStatusTag = useCallback((state: string) => {
        let color = 'default';
        if (state === 'Hoàn thành') color = 'success';
        if (state === 'Chờ bổ sung') color = 'warning';
        if (state === 'Chờ xử lý') color = 'processing';
        if (state === 'Chờ BGH phê duyệt') color = 'blue';
        if (state === 'Chưa đủ điều kiện nhập học') color = 'orange';
        if (state === 'Xử lý lỗi') color = 'error';
        if (state === 'Chờ xử lý tự động') color = 'default';
        return <Tag color={color}>{state.toUpperCase()}</Tag>;
    }, []);

    const columns: ColumnsType<EnrollmentListItem> = useMemo(() => [
        { title: 'Mã đơn', dataIndex: 'enrollmentCode', key: 'enrollmentCode' },
        { title: 'Tên học sinh', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Ngày sinh', dataIndex: 'studentDob', key: 'studentDob', render: (text) => dayjs(text).format('DD/MM/YYYY') },
        { title: 'Phụ huynh', dataIndex: 'fatherName', key: 'fatherName' },
        { title: 'Trạng thái', dataIndex: 'state', key: 'state', render: renderStatusTag },
        { title: 'Ngày nộp', dataIndex: 'createdAt', key: 'createdAt', render: (text) => dayjs(text).format('DD/MM/YYYY') },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_: unknown, record: EnrollmentListItem) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/enrollments/view/${record._id}`)} />
                    </Tooltip>
                    {canUpdate && (
                        <Tooltip title="Chỉnh sửa">
                            <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} onClick={() => navigate(`${constants.APP_PREFIX}/enrollments/edit/${record._id}`)} />} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ], [navigate, canUpdate, renderStatusTag]);

    const approveAllColumns: ColumnsType<EnrollmentListItem> = useMemo(() => [
        { title: 'Mã đơn', dataIndex: 'enrollmentCode', key: 'enrollmentCode' },
        { title: 'Tên học sinh', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Ngày sinh', dataIndex: 'studentDob', key: 'studentDob', render: (text) => dayjs(text).format('DD/MM/YYYY') },
    ], []);

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
                                mode="multiple"
                                maxTagCount={2}
                                placeholder="Lọc theo trạng thái"
                                style={{ minWidth: 220 }}
                                value={statusFilters}
                                onChange={(values) => setStatusFilters(values)}
                                allowClear
                            >
                                <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
                                <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                                <Select.Option value="Chờ bổ sung">Chờ bổ sung</Select.Option>
                                <Select.Option value="Chờ BGH phê duyệt">Chờ BGH phê duyệt</Select.Option>
                                <Select.Option value="Chưa đủ điều kiện nhập học">Chưa đủ điều kiện nhập học</Select.Option>
                                <Select.Option value="Xử lý lỗi">Xử lý lỗi</Select.Option>
                                <Select.Option value="Chờ xử lý tự động">Chờ xử lý tự động</Select.Option>
                            </Select>
                            <Tooltip title="Làm mới danh sách">
                                <Button icon={<ReloadOutlined />}
                                    onClick={fetchAllEnrollments}
                                    loading={loading}></Button>
                            </Tooltip>
                            {canApproveAll && (
                                <Button type="primary" onClick={handleOpenApproveAllModal}>Duyệt tất cả</Button>
                            )}

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

            <Modal
                title="Xác nhận duyệt hàng loạt"
                open={isApproveAllModalVisible}
                onCancel={() => setIsApproveAllModalVisible(false)}
                width={800}
                footer={[
                    <Button key="export" icon={<DownloadOutlined />} onClick={exportToExcel} loading={isExportingExcel}>
                        Xuất Excel
                    </Button>,
                    <Button key="back" onClick={() => setIsApproveAllModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={isApprovingAll} onClick={handleConfirmApproveAll}>
                        Duyệt ({recordsToApprove.length})
                    </Button>,
                ]}
            >
                <p>
                    Tìm thấy <strong>{recordsToApprove.length}</strong> bản ghi ở trạng thái "Chờ BGH phê duyệt".
                    Bạn có chắc muốn duyệt tất cả các bản ghi này không?
                </p>
                <Table
                    size="small"
                    columns={approveAllColumns}
                    dataSource={recordsToApprove}
                    rowKey="_id"
                    pagination={{ pageSize: 5 }}
                    bordered
                />
            </Modal>
        </div>
    );
};

export default EnrollmentManagement;