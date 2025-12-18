import { useEffect, useState, useCallback } from 'react';
import {
    Modal, Spin, Descriptions, Tag, Row, Col, Avatar,
    Typography, Tabs, Button, Empty, Flex, theme, List
} from 'antd';
import {
    FilePdfOutlined, UserOutlined, PaperClipOutlined, DatabaseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { teacherApis } from '../../services/apiServices';
import { StudentDetailResponse } from '../../types/teacher';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useToken } = theme;

interface Props {
    studentId: string;
    open: boolean;
    onClose: () => void;
}

function StudentDetailModal({ studentId, open, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState<StudentDetailResponse | null>(null);
    const { token } = useToken();
    const handleViewPDF = useCallback(async (fileId: string) => {
        try {
            const arrayBuffer = await teacherApis.getPDFById(fileId);
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } catch (error) {
            typeof error === "string"
                ? toast.warn(error)
                : toast.error('Không thể mở file PDF.');
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        setLoading(true);
        setStudent(null);
        teacherApis
            .getStudentDetails(studentId)
            .then(setStudent)
            .catch(() => {
                Modal.error({
                    title: 'Lỗi',
                    content: 'Không thể tải thông tin học sinh.'
                });
                onClose();
            })
            .finally(() => setLoading(false));
    }, [open]);

    const getAvatarLetter = (name: string) => {
        return name?.[0]?.toUpperCase() || <UserOutlined />;
    };

    const renderFileLink = (
        file: { filename: string; _id: string } | undefined | null,
        title: string
    ) => {
        if (!file || !file._id) {
            return (
                <List.Item>
                    <List.Item.Meta
                        avatar={<FilePdfOutlined style={{ fontSize: 24, color: token.colorTextDisabled }} />}
                        title={title}
                        description={<Text type="secondary">Chưa có file</Text>}
                    />
                </List.Item>
            );
        }

        return (
            <List.Item
                onClick={() => handleViewPDF(file._id)}
                style={{ cursor: 'pointer' }}
            >
                <List.Item.Meta
                    avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#f5222d' }} />}
                    title={title}
                    description={<Text underline>{file?.filename}</Text>}
                />
            </List.Item>
        );
    };

    const renderModalContent = () => {
        if (loading || !student) {
            return (
                <Flex justify="center" align="center" style={{ minHeight: 400 }}>
                    <Spin tip="Đang tải thông tin học sinh..." size="large" />
                </Flex>
            );
        }

        return (
            <>
                <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24, padding: '0 8px' }}>
                    <Col>
                        <Avatar
                            size={64}
                            src={student?.imageStudent}
                            style={{
                                backgroundColor: token.colorPrimary,
                                color: '#fff',
                            }}
                        >
                            {!student?.imageStudent && (getAvatarLetter(student?.fullName))}
                        </Avatar>

                    </Col>
                    <Col flex="auto">
                        <Title level={4} style={{ margin: 0 }}>{student?.fullName} - {student?.nickname}</Title>
                        <Text type="secondary">{student?.studentCode}</Text>
                    </Col>
                    <Col>
                        {student?.active ? (
                            <Tag color="green" style={{ fontSize: 14, padding: '4px 8px' }}>Đang học</Tag>
                        ) : (
                            <Tag color="red" style={{ fontSize: 14, padding: '4px 8px' }}>Ngưng học</Tag>
                        )}
                    </Col>
                </Row>

                <Tabs defaultActiveKey="1" type="card">
                    <TabPane
                        tab={<span><UserOutlined /> Thông tin cá nhân</span>}
                        key="1"
                    >
                        <Descriptions layout="vertical" bordered size="small" column={2}>
                            <Descriptions.Item label="Ngày sinh">
                                {dayjs(student?.dob).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {student?.gender}
                            </Descriptions.Item>
                            <Descriptions.Item label="Dân tộc">
                                {student?.nation}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tôn giáo">
                                {student?.religion}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {student?.address}
                            </Descriptions.Item>
                        </Descriptions>
                    </TabPane>

                    <TabPane
                        tab={<span><PaperClipOutlined /> Hồ sơ đính kèm</span>}
                        key="2"
                    >
                        <List>
                            {renderFileLink(student?.birthCertFile, 'Giấy khai sinh')}
                            {renderFileLink(student?.healthCertFile, 'Giấy khám sức khỏe')}
                        </List>
                        {!student?.birthCertFile && !student?.healthCertFile && (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Không có hồ sơ nào"
                            />
                        )}
                    </TabPane>

                    <TabPane
                        tab={<span><DatabaseOutlined /> Thông tin hệ thống</span>}
                        key="3"
                    >
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Người tạo">{student?.createdBy}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(student?.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người cập nhật">{student?.updatedBy}</Descriptions.Item>
                            <Descriptions.Item label="Ngày cập nhật">
                                {dayjs(student?.updatedAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </TabPane>
                </Tabs>
            </>
        );
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Chi tiết học sinh</Title>}
            open={open}
            onCancel={onClose}
            footer={
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>
            }
            width={800}
            destroyOnClose
        >
            {renderModalContent()}
        </Modal>
    );
}

export default StudentDetailModal;
