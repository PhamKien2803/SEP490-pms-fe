import { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Space, Typography, Row, Col, Card, Tooltip, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolYearApis } from '../../services/apiServices';
import { SchoolYearListItem } from '../../types/schoolYear';
import dayjs from 'dayjs';
import { constants } from '../../constants';
import DeleteModal from '../../modal/delete-modal/DeleteModal';
import { usePagePermission } from '../../hooks/usePagePermission';

const { Title } = Typography;

function SchoolYears() {
    const navigate = useNavigate();
    const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { canCreate, canUpdate, canDelete } = usePagePermission();

    const fetchAllSchoolYears = useCallback(async () => {
        setLoading(true);
        try {
            const response = await schoolYearApis.getSchoolYearList({ page: 1, limit: 1000 });
            setSchoolYears(response.data || []);

        } catch (error) {
            toast.info('Hiện chưa có năm học nào. Vui lòng tạo mới!');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllSchoolYears();
    }, [fetchAllSchoolYears]);

    const activeSchoolYears = useMemo(() => {
        return schoolYears.filter(year => year.active);
    }, [schoolYears]);

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
            await schoolYearApis.deleteSchoolYear(deletingId);
            toast.success('Xóa năm học thành công!');
            setSchoolYears(prevYears => prevYears.filter(year => year._id !== deletingId));
            hideDeleteModal();
        } catch (error) {
            toast.error("Xóa năm học thất bại.");
        } finally {
            setIsDeleting(false);
        }
    }, [deletingId]);

    const renderStatusTag = useCallback((state: string) => {
        let color;
        switch (state) {
            case 'Đang hoạt động':
                color = 'success';
                break;
            case 'Hết thời hạn':
                color = 'error';
                break;
            case 'Chưa hoạt động':
                color = 'processing';
                break;
            default:
                color = 'default';
        }
        return <Tag color={color}>{state.toUpperCase()}</Tag>;
    }, []);

    const columns: ColumnsType<SchoolYearListItem> = useMemo(() => [
        { title: 'Mã Năm học', dataIndex: 'schoolyearCode', key: 'schoolyearCode' },
        { title: 'Năm học', dataIndex: 'schoolYear', key: 'schoolYear', align: 'center' },
        { title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', render: (text) => dayjs(text).format('DD/MM/YYYY') },
        { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', render: (text) => dayjs(text).format('DD/MM/YYYY') },
        { title: 'Chỉ tiêu', dataIndex: 'numberTarget', key: 'numberTarget', align: 'center' },
        {
            title: 'Trạng thái',
            dataIndex: 'state',
            key: 'state',
            align: 'center',
            render: renderStatusTag,
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_: unknown, record: SchoolYearListItem) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/schoolYears/view/${record._id}`)} />
                    </Tooltip>
                    {canUpdate && (
                        <Tooltip title="Chỉnh sửa">
                            <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => navigate(`${constants.APP_PREFIX}/schoolYears/edit/${record._id}`)} />
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record._id)} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ], [navigate, renderStatusTag]);

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Quản lý Năm học</Title>
                    </Col>
                    <Col>
                        <Tooltip title="Làm mới danh sách">
                            <Button style={{ marginRight: 5 }} icon={<ReloadOutlined />}
                                onClick={fetchAllSchoolYears}
                                loading={loading}>Làm mới danh sách</Button>
                        </Tooltip>
                        {canCreate && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`${constants.APP_PREFIX}/schoolYears/create`)}>
                                Tạo năm học mới
                            </Button>
                        )}
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={activeSchoolYears}
                    loading={loading}
                    rowKey="_id"
                    bordered
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

export default SchoolYears;