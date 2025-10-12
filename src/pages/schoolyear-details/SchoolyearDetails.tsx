import { useState, useEffect, useCallback } from 'react';
import { Button, Space, Typography, Card, Row, Col, Spin, Flex, Tooltip, Tag, Descriptions, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { schoolYearApis } from '../../services/apiServices';
import { SchoolYearListItem } from '../../types/schoolYear';
import dayjs from 'dayjs';

const { Title } = Typography;

const STATUS_CONFIG = {
    'Chưa hoạt động': { text: 'CHƯA HOẠT ĐỘNG', color: 'processing' },
    'Đang hoạt động': { text: 'ĐANG HOẠT ĐỘNG', color: 'success' },
    'Hết thời hạn': { text: 'HẾT THỜI HẠN', color: 'error' },
};

function SchoolyearDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [schoolYearData, setSchoolYearData] = useState<SchoolYearListItem | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) {
            toast.error("URL không hợp lệ, thiếu ID năm học.");
            navigate(-1);
            return;
        }
        setLoading(true);
        try {
            const data = await schoolYearApis.getSchoolYearById(id);
            setSchoolYearData(data);
        } catch (error) {
            toast.error("Không thể tải dữ liệu năm học.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 150px)' }}><Spin size="large" /></Flex>;
    }

    if (!schoolYearData) {
        return null;
    }

    const statusInfo = STATUS_CONFIG[schoolYearData.state as keyof typeof STATUS_CONFIG] || { text: schoolYearData.state.toUpperCase(), color: 'default' };

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Space align="center">
                            <Tooltip title="Quay lại">
                                <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                            </Tooltip>
                            <Title level={3} style={{ margin: 0 }}>
                                Chi tiết năm học: {schoolYearData.schoolYear}
                            </Title>
                        </Space>
                    </Col>
                </Row>

                <Divider />

                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="Mã năm học">{schoolYearData.schoolyearCode}</Descriptions.Item>
                    <Descriptions.Item label="Năm học">{schoolYearData.schoolYear}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">{dayjs(schoolYearData.startDate).format('DD/MM/YYYY')}</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">{dayjs(schoolYearData.endDate).format('DD/MM/YYYY')}</Descriptions.Item>
                    <Descriptions.Item label="Chỉ tiêu tuyển sinh">{schoolYearData.numberTarget}</Descriptions.Item>
                    <Descriptions.Item label="Người tạo">{schoolYearData.createdBy}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{dayjs(schoolYearData.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Cập nhật lần cuối">{dayjs(schoolYearData.updatedAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
}

export default SchoolyearDetails;