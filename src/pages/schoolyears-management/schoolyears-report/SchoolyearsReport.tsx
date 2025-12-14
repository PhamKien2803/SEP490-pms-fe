import { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Space, Typography, Row, Col, Card, Select, Spin, Flex, Tooltip } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { SchoolYearListItem, SchoolYearReport } from '../../../types/schoolYear';
import { schoolYearApis } from '../../../services/apiServices';
import { useExcelExport } from '../../../hooks/useExcelExport';
import { usePagePermission } from '../../../hooks/usePagePermission';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Title } = Typography;
const { Option } = Select;

function SchoolyearsReport() {
    usePageTitle('Báo cáo năm học - Cá Heo Xanh');
    const { canExportfile } = usePagePermission();
    const [reportData, setReportData] = useState<SchoolYearReport[]>([]);
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedYearId, setSelectedYearId] = useState<string | undefined>(undefined);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchReportData = useCallback(async () => {
        if (!selectedYearId || schoolYears.length === 0) {
            setReportData([]);
            return;
        }

        const selectedSchoolYear = schoolYears.find(sy => sy._id === selectedYearId);
        if (!selectedSchoolYear) return;

        setLoading(true);
        try {
            const yearNumber = parseInt(selectedSchoolYear.schoolYear.split('-')[0], 10);

            if (isNaN(yearNumber)) {
                toast.warn('Năm học không hợp lệ.');
                setReportData([]);
                return;
            }

            const response = await schoolYearApis.getStudentGraduatedReport({
                year: yearNumber,
                page: pagination.current,
                limit: pagination.pageSize,
            });

            setReportData(response.data || []);
            setPagination(prev => ({ ...prev, total: response.page.totalCount }));
        } catch (error) {
            typeof error === "string" ? toast.info("Hiện năm học chưa kết thúc hoặc không có học sinh tốt nghiệp.") : toast.error('Hiện năm học chưa kết thúc hoặc không có học sinh tốt nghiệp.');
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedYearId, schoolYears, pagination.current, pagination.pageSize]);

    useEffect(() => {
        const fetchSchoolYears = async () => {
            setLoading(true);
            try {
                const response = await schoolYearApis.getSchoolYearList({ page: 1, limit: 100 });
                const sorted = [...response.data].sort(
                    (a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf()
                );

                setSchoolYears(sorted);

                const activeYear = sorted.find(y => y.state === 'Đang hoạt động');
                const fallbackYear = sorted[0];

                if (activeYear) {
                    setSelectedYearId(activeYear._id);
                } else if (fallbackYear) {
                    setSelectedYearId(fallbackYear._id);
                }
            } catch (error) {
                typeof error === "string"
                    ? toast.info(error)
                    : toast.error('Không thể tải danh sách năm học.');
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolYears();
    }, []);


    useEffect(() => {
        fetchReportData();
    }, [fetchReportData, refreshTrigger]);
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTableChange = (newPagination: any) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const handleYearChange = (value: string) => {
        setSelectedYearId(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const exportData = useMemo(() => {
        return reportData.map(record => ({
            'Mã Học Sinh': record.studentCode,
            'Họ và Tên': record.fullName,
            'Ngày Sinh': dayjs(record.dob).format('DD/MM/YYYY'),
            'Giới Tính': record.gender,
            'CCCD': record.idCard,
            'Địa chỉ': record.address,
            'Ngày Tốt Nghiệp': record.graduatedAt ? dayjs(record.graduatedAt).format('DD/MM/YYYY') : '',
        }));
    }, [reportData]);

    const selectedYearName = schoolYears.find(y => y._id === selectedYearId)?.schoolYear || 'NamHoc';
    const { exportToExcel, isExporting: isExportingExcel } = useExcelExport({
        data: exportData,
        fileName: `BaoCaoTotNghiep_${selectedYearName}`,
    });

    const columns: ColumnsType<SchoolYearReport> = useMemo(() => [
        { title: 'Mã Học Sinh', dataIndex: 'studentCode', key: 'studentCode', width: 150 },
        { title: 'Họ và Tên', dataIndex: 'fullName', key: 'fullName' },
        {
            title: 'Căn cước công dân',
            dataIndex: 'idCard',
            key: 'idCard',
            render: (text) => text || 'N/A',
        },
        { title: 'Ngày Sinh', dataIndex: 'dob', key: 'dob', render: (text) => dayjs(text).format('DD/MM/YYYY'), width: 120 },
        { title: 'Giới Tính', dataIndex: 'gender', key: 'gender', width: 100 },
        { title: 'Ngày Tốt Nghiệp', dataIndex: 'graduatedAt', key: 'graduatedAt', render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : 'N/A', width: 150 },
    ], []);

    if (loading && schoolYears.length === 0) {
        return <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 150px)' }}><Spin size="large" /></Flex>;
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Báo cáo Học sinh Tốt nghiệp</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Tooltip title="Làm mới danh sách">
                                <Button icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    loading={loading}></Button>
                            </Tooltip>
                            <Select
                                value={selectedYearId}
                                style={{ width: 200 }}
                                onChange={handleYearChange}
                                placeholder="Chọn năm học"
                            >
                                {schoolYears.map(year => (
                                    <Option key={year._id} value={year._id}>{year.schoolYear}</Option>
                                ))}
                            </Select>
                            {canExportfile && (
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={exportToExcel}
                                    loading={isExportingExcel}
                                    disabled={reportData.length === 0}
                                >
                                    Xuất Excel
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={reportData}
                    loading={loading}
                    rowKey="_id"
                    bordered
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                    }}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
}

export default SchoolyearsReport;