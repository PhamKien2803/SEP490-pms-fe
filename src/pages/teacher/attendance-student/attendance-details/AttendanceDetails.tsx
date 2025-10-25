import React, { useEffect, useState } from 'react';
import {
    Card, Spin, Typography, Row, Col, Tag, List, Avatar, Space, Empty, Divider, Button
} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MinusCircleOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined,
    ReadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { teacherApis } from '../../../../services/apiServices';
import { IAttendanceDetailResponse } from '../../../../types/teacher';

const { Title, Text, Paragraph } = Typography;

type TAttendanceStatus = 'Có mặt' | 'Vắng mặt có phép' | 'Vắng mặt không phép' | 'Đi muộn';

const STATUS_CONFIG: Record<TAttendanceStatus, { icon: React.ReactNode; color: string; text: string }> = {
    'Có mặt': {
        icon: <CheckCircleOutlined />,
        color: '#52c41a',
        text: 'Có mặt'
    },
    'Đi muộn': {
        icon: <ClockCircleOutlined />,
        color: '#1890ff',
        text: 'Đi muộn'
    },
    'Vắng mặt có phép': {
        icon: <MinusCircleOutlined />,
        color: '#faad14',
        text: 'Vắng (P)'
    },
    'Vắng mặt không phép': {
        icon: <CloseCircleOutlined />,
        color: '#f5222d',
        text: 'Vắng (K)'
    },
};

function AttendanceDetails() {
    const { id: attendanceId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<IAttendanceDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (attendanceId) {
            setLoading(true);
            teacherApis.getAttendanceById(attendanceId)
                .then(setData)
                .catch((err) => {
                    console.error(err);
                    toast.error('Không thể tải dữ liệu điểm danh.');
                })
                .finally(() => setLoading(false));
        }
    }, [attendanceId]);

    if (loading) return <Spin fullscreen tip="Đang tải dữ liệu..." />;
    if (!data) return <Empty description="Không tìm thấy dữ liệu điểm danh." />;

    const stats = {
        present: 0,
        late: 0,
        absentPermitted: 0,
        absentNotPermitted: 0,
        total: data.students.length
    };

    data.students.forEach(item => {
        const status = item.status as TAttendanceStatus;
        if (status === 'Có mặt') stats.present++;
        else if (status === 'Đi muộn') stats.late++;
        else if (status === 'Vắng mặt có phép') stats.absentPermitted++;
        else if (status === 'Vắng mặt không phép') stats.absentNotPermitted++;
    });

    return (
        <div style={{ padding: 24 }}>
            <Card
                bordered={false}
                title={
                    <Row align="middle" gutter={16} wrap={false}>
                        <Col>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                                style={{ border: 'none', boxShadow: 'none' }}
                            />
                        </Col>
                        <Col flex="auto">
                            <Space size="large" wrap>
                                <Title level={3} style={{ margin: 0 }}>
                                    <TeamOutlined /> Chi tiết điểm danh
                                </Title>
                                <Tag color="blue">Lớp: {data.class.className}</Tag>
                                <Tag color="cyan">Ngày: {dayjs(data.date).format('DD/MM/YYYY')}</Tag>
                            </Space>
                        </Col>
                    </Row>
                }
            >
                <Space wrap size="small" style={{ marginBottom: 16 }}>
                    <Tag color="default" style={{ fontSize: 14 }}>Sĩ số: {stats.total}</Tag>
                    <Tag color="green" style={{ fontSize: 14 }}>Có mặt: {stats.present}</Tag>
                    <Tag color="blue" style={{ fontSize: 14 }}>Đi muộn: {stats.late}</Tag>
                    <Tag color="orange" style={{ fontSize: 14 }}>Vắng (P): {stats.absentPermitted}</Tag>
                    <Tag color="red" style={{ fontSize: 14 }}>Vắng (K): {stats.absentNotPermitted}</Tag>
                </Space>

                <Divider style={{ margin: '8px 0 16px' }} />

                <List
                    itemLayout="vertical"
                    dataSource={data.students}
                    renderItem={(item) => {
                        const status = item.status as TAttendanceStatus;
                        const config = STATUS_CONFIG[status];

                        return (
                            <List.Item
                                key={item.student._id}
                                style={{
                                    padding: '16px 24px',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                            >
                                <Row align="middle" gutter={[16, 16]}>
                                    <Col xs={24} sm={8} md={6}>
                                        <Space>
                                            <Avatar icon={<UserOutlined />} />
                                            <div>
                                                <Text strong style={{ fontSize: 15 }}>
                                                    {item.student.fullName}
                                                </Text>
                                                <Text type="secondary" style={{ display: 'block' }}>
                                                    {item.student.studentCode}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>

                                    <Col xs={24} sm={8} md={6}>
                                        <Tag icon={config.icon} color={config.color} style={{ fontSize: 14 }}>
                                            {config.text}
                                        </Tag>
                                    </Col>

                                    <Col xs={24} sm={8} md={12}>
                                        {item.note && (
                                            <Text italic type="secondary">
                                                Ghi chú: {item.note}
                                            </Text>
                                        )}
                                    </Col>
                                </Row>
                            </List.Item>
                        );
                    }}
                />

                <Divider />

                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Title level={5}><ReadOutlined /> Ghi chú chung</Title>
                        <Paragraph>
                            {data.generalNote || <Text type="secondary">Không có ghi chú</Text>}
                        </Paragraph>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}

export default AttendanceDetails;
