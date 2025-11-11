import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Space, Typography, Row, Col, Card, Select, Tag, Tooltip } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'react-toastify';
import { enrollmentApis } from '../../services/apiServices';
import { EnrollmentListItem } from '../../types/enrollment';
import { useExcelExport } from '../../hooks/useExcelExport';
import { usePagePermission } from "../../hooks/usePagePermission";
import dayjs from 'dayjs';
import { usePageTitle } from '../../hooks/usePageTitle';

const { Title } = Typography;

const Admissions: React.FC = () => {
    usePageTitle('Báo cáo tuyển sinh - Cá Heo Xanh');
    const { canExportfile } = usePagePermission();
    const [allEnrollments, setAllEnrollments] = useState<EnrollmentListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

    const fetchAllEnrollments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await enrollmentApis.getEnrollmentList({ page: 1, limit: 1000 });
            setAllEnrollments(response.data);
        } catch (error) {
            // typeof error === "string" ? toast.warn(error) : toast.error('Không thể tải danh sách đơn tuyển sinh.');
            typeof error === "string" ? toast.info(error) : toast.error('Hiện chưa có đơn tuyển sinh nào.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllEnrollments();
    }, [fetchAllEnrollments]);

    const filteredData = useMemo(() => {
        return allEnrollments
            .filter(item => item.state === 'Hoàn thành')
            .filter(item => {
                if (!selectedYear) return true;
                return dayjs(item.createdAt).year() === selectedYear;
            });
    }, [allEnrollments, selectedYear]);

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
        fileName: `BaoCaoTuyenSinh_${selectedYear}`,
    });

    const columns: ColumnsType<EnrollmentListItem> = useMemo(() => [
        { title: 'Mã đơn', dataIndex: 'enrollmentCode', key: 'enrollmentCode' },
        { title: 'Tên học sinh', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Ngày sinh', dataIndex: 'studentDob', key: 'studentDob', render: (text) => dayjs(text).format('DD/MM/YYYY') },
        { title: 'Phụ huynh', dataIndex: 'fatherName', key: 'fatherName' },
        { title: 'Trạng thái', dataIndex: 'state', key: 'state', render: (state) => <Tag color="success">{state.toUpperCase()}</Tag> },
        { title: 'Ngày nộp', dataIndex: 'createdAt', key: 'createdAt', render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm') },
    ], []);

    const generateYearOptions = () => {
        const currentYear = dayjs().year();
        const years = [];
        for (let i = currentYear; i >= currentYear - 10; i--) {
            years.push({ value: i, label: `Năm ${i}` });
        }
        return years;
    };

    const yearOptions = useMemo(generateYearOptions, []);

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
                                value={selectedYear}
                                style={{ width: 150 }}
                                onChange={(value) => setSelectedYear(value)}
                                options={yearOptions}
                                placeholder="Chọn năm"
                            />
                            <Tooltip title="Làm mới danh sách">
                                <Button icon={<ReloadOutlined />}
                                    onClick={fetchAllEnrollments}
                                    loading={loading}></Button>
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
                        showTotal: (total) => `Tổng số: ${total} bản ghi`,
                    }}
                />
            </Card>
        </div>
    );
};

export default Admissions;