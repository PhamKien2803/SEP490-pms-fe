import React, { useState, useEffect } from 'react';
import { Card, Spin, Flex, Typography, Button, Tooltip, Descriptions, Divider, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { enrollmentApis } from '../../services/apiServices';
import { EnrollmentListItem } from '../../types/enrollment';
import dayjs from 'dayjs';

const { Title } = Typography;

const EnrollmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<EnrollmentListItem | null>(null);

    useEffect(() => {
        if (!id) {
            toast.error('Không tìm thấy ID của đơn tuyển sinh.');
            navigate(-1);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await enrollmentApis.getEnrollmentById(id);
                setData(response);
            } catch (error) {
                typeof error === "string" ? toast.warn(error) : toast.error('Không thể tải chi tiết đơn tuyển sinh.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const renderStatusTag = (state: string) => {
        let color = 'default';
        if (state === 'Đã duyệt') color = 'success';
        if (state === 'Từ chối') color = 'error';
        if (state === 'Chờ xử lý') color = 'processing';
        return <Tag color={color}>{state.toUpperCase()}</Tag>;
    };

    if (loading || !data) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 150px)' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <Card bordered={false}>
                <Space align="center" style={{ marginBottom: '24px' }}>
                    <Tooltip title="Quay lại danh sách">
                        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                    </Tooltip>
                    <Title level={2} style={{ margin: 0 }}>
                        Chi tiết đơn tuyển sinh: {data.enrollmentCode}
                    </Title>
                </Space>

                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Trạng thái" span={2}>
                        {renderStatusTag(data.state)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày nộp đơn" span={2}>
                        {dayjs(data.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin học sinh</Divider>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Họ và tên">{data.studentName}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">{dayjs(data.studentDob).format('DD/MM/YYYY')}</Descriptions.Item>
                    <Descriptions.Item label="Giới tính">{data.studentGender}</Descriptions.Item>
                    <Descriptions.Item label="Mã định danh">{data.studentIdCard}</Descriptions.Item>
                    <Descriptions.Item label="Dân tộc">{data.studentNation}</Descriptions.Item>
                    <Descriptions.Item label="Tôn giáo">{data.studentReligion}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>{data.address}</Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin Cha</Divider>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Họ và tên">{data.fatherName}</Descriptions.Item>
                    <Descriptions.Item label="Nghề nghiệp">{data.fatherJob}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{data.fatherPhoneNumber}</Descriptions.Item>
                    <Descriptions.Item label="Email">{data.fatherEmail}</Descriptions.Item>
                    <Descriptions.Item label="CCCD" span={2}>{data.fatherIdCard}</Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin Mẹ</Divider>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Họ và tên">{data.motherName}</Descriptions.Item>
                    <Descriptions.Item label="Nghề nghiệp">{data.motherJob}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{data.motherPhoneNumber}</Descriptions.Item>
                    <Descriptions.Item label="Email">{data.motherEmail}</Descriptions.Item>
                    <Descriptions.Item label="CCCD" span={2}>{data.motherIdCard}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default EnrollmentDetail;
