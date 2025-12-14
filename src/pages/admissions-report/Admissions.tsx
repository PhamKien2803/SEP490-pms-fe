import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Card,
    Select,
    Tag,
    Tooltip,
    Input,
} from 'antd';
import {
    DownloadOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { enrollmentApis, schoolYearApis } from '../../services/apiServices';
import { EnrollmentListItem } from '../../types/enrollment';
import { SchoolYearListItem } from '../../types/schoolYear';
import { useExcelExport } from '../../hooks/useExcelExport';
import { usePagePermission } from '../../hooks/usePagePermission';
import dayjs from 'dayjs';
import { usePageTitle } from '../../hooks/usePageTitle';

const { Title } = Typography;
const { Option } = Select;

const Admissions: React.FC = () => {
    usePageTitle('Báo cáo tuyển sinh - Cá Heo Xanh');
    const { canExportfile } = usePagePermission();

    const [allEnrollments, setAllEnrollments] = useState<EnrollmentListItem[]>([]);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [selectedYear, setSelectedYear] = useState<SchoolYearListItem | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const fetchAllEnrollments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await enrollmentApis.getEnrollmentList({ page: 1, limit: 1000 });
            setAllEnrollments(response.data);
        } catch (error) {
            typeof error === 'string'
                ? toast.info(error)
                : toast.error('Hiện chưa có đơn tuyển sinh nào.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSchoolYears = useCallback(async () => {
        try {
            const res = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
            const sorted = [...res.data].sort((a, b) => {
                const aYear = parseInt(a.schoolYear.split('-')[0]);
                const bYear = parseInt(b.schoolYear.split('-')[0]);
                return bYear - aYear;
            });

            setSchoolYears(sorted);

            const active = sorted.find(y => y.state === 'Đang hoạt động') || sorted[0];
            if (active) setSelectedYear(active);
        } catch {
            toast.error('Không thể tải danh sách năm học');
        }
    }, []);

    useEffect(() => {
        fetchAllEnrollments();
        fetchSchoolYears();
    }, [fetchAllEnrollments, fetchSchoolYears]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchKeyword]);

    const filteredData = useMemo(() => {
        const keyword = searchKeyword.toLowerCase().trim();
        return allEnrollments
            .filter(item => item.state === 'Hoàn thành')
            .filter(item => {
                if (!selectedYear) return true;
                const createdYear = dayjs(item.createdAt).year();
                const startYear = dayjs(selectedYear.startDate).year();
                return createdYear === startYear;
            })
            .filter(item =>
                item.studentName.toLowerCase().includes(keyword) ||
                item.enrollmentCode.toLowerCase().includes(keyword) ||
                item.fatherName?.toLowerCase().includes(keyword)
            );
    }, [allEnrollments, selectedYear, searchKeyword]);

    const exportData = useMemo(() => {
        return filteredData.map(record => ({
            'Mã Đơn': record.enrollmentCode,
            'Tên Học Sinh': record.studentName,
            'Ngày Sinh': dayjs(record.studentDob).format('DD/MM/YYYY'),
            'Phụ Huynh': record.fatherName,
            'Trạng Thái': record.state,
            'Ngày Nộp': dayjs(record.createdAt).format('DD/MM/YYYY HH:mm'),
        }));
    }, [filteredData]);

    const { exportToExcel, isExporting: isExportingExcel } = useExcelExport({
        data: exportData,
        fileName: `BaoCaoTuyenSinh_${selectedYear?.schoolYear || 'NamHoc'}`,
    });

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
            render: text => dayjs(text).format('DD/MM/YYYY'),
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
            render: state => <Tag color="success">{state.toUpperCase()}</Tag>,
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: text => dayjs(text).format('DD/MM/YYYY HH:mm'),
        },
    ], []);

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            Báo cáo Tuyển sinh
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Select
                                value={selectedYear?._id}
                                style={{ width: 220 }}
                                onChange={(id) => {
                                    const found = schoolYears.find(y => y._id === id);
                                    if (found) setSelectedYear(found);
                                }}
                                placeholder="Chọn năm học"
                            >
                                {schoolYears.map(y => (
                                    <Option key={y._id} value={y._id}>
                                        {y.schoolYear}{y.state === 'Đang hoạt động' ? '' : ''}
                                    </Option>
                                ))}
                            </Select>

                            <Input.Search
                                placeholder="Tìm kiếm mã đơn, học sinh, phụ huynh"
                                allowClear
                                value={searchKeyword}
                                onChange={e => setSearchKeyword(e.target.value)}
                                style={{ width: 280 }}
                            />
                            <Tooltip title="Làm mới danh sách">
                                <Button icon={<ReloadOutlined />} onClick={fetchAllEnrollments} loading={loading} />
                            </Tooltip>
                            {canExportfile && (
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={exportToExcel}
                                    loading={isExportingExcel}
                                >
                                    Xuất Excel
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    rowKey="_id"
                    bordered
                    pagination={{
                        ...pagination,
                        total: filteredData.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        onChange: (page, pageSize) =>
                            setPagination({ current: page, pageSize }),
                        showTotal: (total) => `Tổng số: ${total} bản ghi`,
                    }}
                />
            </Card>
        </div>
    );
};

export default Admissions;
