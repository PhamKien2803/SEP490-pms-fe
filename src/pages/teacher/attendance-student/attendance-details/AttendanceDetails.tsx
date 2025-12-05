import React, { useEffect, useState, useMemo } from 'react';
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
import { usePageTitle } from '../../../../hooks/usePageTitle';

const { Title, Text, Paragraph } = Typography;

type TAttendanceStatus = 'Có mặt' | 'Đã đón trẻ' | 'Vắng mặt';

const STATUS_CONFIG: Record<TAttendanceStatus, { icon: React.ReactNode; color: string; text: string }> = {
    'Có mặt': {
        icon: <CheckCircleOutlined />,
        color: '#52c41a',
        text: 'Có mặt'
    },
    'Đã đón trẻ': {
        icon: <MinusCircleOutlined />,
        color: '#fa8c16',
        text: 'Đã đón trẻ'
    },
    'Vắng mặt': {
        icon: <CloseCircleOutlined />,
        color: '#f5222d',
        text: 'Vắng mặt'
    },
};

function AttendanceDetails() {
    usePageTitle('Chi tiết điểm danh - Cá Heo Xanh');
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

    const stats = useMemo(() => {
        const stats = {
            present: 0,
            pickedUpChild: 0,
            absent: 0,
            total: data?.students.length || 0
        };

        if (!data) return stats;

        data.students.forEach(item => {
            const oldStatus = item.status as any;
            if (oldStatus === 'Có mặt' || oldStatus === 'Đi muộn') {
                stats.present++;
            } else if (oldStatus === 'Đã đón trẻ') {
                stats.pickedUpChild++;
            } else {
                stats.absent++;
            }
        });

        return stats;
    }, [data]);

    if (loading) return <Spin fullscreen tip="Đang tải dữ liệu..." />;
    if (!data) return <Empty description="Không tìm thấy dữ liệu điểm danh." />;

    const normalizeStatus = (oldStatus: string): TAttendanceStatus => {
        if (oldStatus === 'Có mặt' || oldStatus === 'Đi muộn') {
            return 'Có mặt';
        }
        if (oldStatus === 'Đã đón trẻ') {
            return 'Đã đón trẻ';
        }
        return 'Vắng mặt';
    };

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
                    <Tag color="default" style={{ fontSize: 14, padding: '4px 8px' }}>Sĩ số: {stats?.total}</Tag>
                    <Tag color="green" style={{ fontSize: 14, padding: '4px 8px' }}>Có mặt: {stats?.present}</Tag>
                    <Tag color="orange" style={{ fontSize: 14, padding: '4px 8px' }}>Đã đón trẻ: {stats?.pickedUpChild}</Tag>
                    <Tag color="red" style={{ fontSize: 14, padding: '4px 8px' }}>Vắng mặt: {stats?.absent}</Tag>
                </Space>

                <Divider style={{ margin: '8px 0 16px' }} />

                <List
                    itemLayout="vertical"
                    dataSource={data?.students}
                    renderItem={(item) => {
                        const status = normalizeStatus(item?.status);
                        const config = STATUS_CONFIG[status];
                        const hasDetails =
                            (status === 'Vắng mặt' && item?.note) ||
                            ((status === 'Có mặt' || status === 'Đã đón trẻ') && item?.timeCheckIn) ||
                            (status === 'Đã đón trẻ' && (item?.timeCheckOut || item?.guardian || item?.noteCheckout));

                        return (
                            <List.Item
                                key={item?.student._id}
                                style={{
                                    padding: '16px 24px',
                                    borderBottom: '1px solid #f0f0f0',
                                    background: status === 'Vắng mặt' ? '#fffbe6' : '#ffffff' // Highlight absent
                                }}
                            >
                                <Row align="top" gutter={[16, 16]}>
                                    {/* Col 1: Student Info */}
                                    <Col xs={24} sm={24} md={8} lg={7}>
                                        <Space>
                                            <Avatar
                                                size={48}
                                                src={item?.student?.imageStudent}
                                                icon={!item?.student?.imageStudent && <UserOutlined />}
                                                style={{ backgroundColor: '#f0f0f0' }}
                                            />
                                            <div>
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {item?.student?.fullName}
                                                </Text>
                                                <Text type="secondary" style={{ display: 'block' }}>
                                                    {item?.student?.studentCode}
                                                </Text>
                                            </div>
                                        </Space>
                                    </Col>

                                    {/* Col 2: Status Tag */}
                                    <Col xs={24} sm={24} md={6} lg={4}>
                                        <Tag icon={config?.icon} color={config?.color} style={{ fontSize: 14, padding: '4px 8px', marginTop: 4 }}>
                                            {config?.text}
                                        </Tag>
                                    </Col>

                                    {/* Col 3: Details Box */}
                                    <Col xs={24} sm={24} md={10} lg={13}>
                                        {hasDetails ? (
                                            <div style={{
                                                background: '#f9f9f9',
                                                border: '1px solid #f0f0f0',
                                                borderRadius: 8,
                                                padding: '12px 16px',
                                                width: '100%'
                                            }}>
                                                <Space direction="vertical" style={{ width: '100%' }} size={4}>

                                                    {(status === 'Có mặt' || status === 'Đã đón trẻ') && (
                                                        <Text style={{ fontSize: 14, color: '#333' }}>
                                                            <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                                            <Text strong>Giờ vào:</Text> {item?.timeCheckIn ? dayjs(item?.timeCheckIn).format('HH:mm') : 'N/A'}
                                                        </Text>
                                                    )}

                                                    {status === 'Đã đón trẻ' && (
                                                        <>
                                                            {item?.timeCheckOut && (
                                                                <Text style={{ fontSize: 14, color: '#333' }}>
                                                                    <ClockCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                                                                    <Text strong>Giờ ra:</Text> {dayjs(item?.timeCheckOut).format('HH:mm')}
                                                                </Text>
                                                            )}
                                                            {item?.guardian && (
                                                                <Text type="secondary" style={{ display: 'block', paddingLeft: 24 }}>
                                                                    <Text strong>Người đón:</Text> {item?.guardian.fullName} ({item?.guardian.relationship}) - {item?.guardian.phoneNumber}
                                                                </Text>
                                                            )}
                                                            {item?.noteCheckout && (
                                                                <Text italic type="secondary" style={{ display: 'block', paddingLeft: 24 }}>
                                                                    <Text strong>Ghi chú đón:</Text> {item?.noteCheckout}
                                                                </Text>
                                                            )}
                                                        </>
                                                    )}

                                                    {status === 'Vắng mặt' && item?.note && (
                                                        <Text italic type="secondary" style={{ fontSize: 14 }}>
                                                            <Text strong>Ghi chú:</Text> {item?.note}
                                                        </Text>
                                                    )}
                                                </Space>
                                            </div>
                                        ) : null}
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
                            {data?.generalNote || <Text type="secondary">Không có ghi chú</Text>}
                        </Paragraph>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}

export default AttendanceDetails;