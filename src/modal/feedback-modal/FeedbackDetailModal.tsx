import {
    Modal,
    Tabs,
    Tag,
    Typography,
    Space,
    List,
    Card,
    Col,
    Row,
} from 'antd';
import {
    ScheduleOutlined,
    ReadOutlined,
    TeamOutlined,
    HeartOutlined,
    StarOutlined,
    UserOutlined,
    BankOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import { IFeedbackListItem } from '../../types/teacher';

const { Text } = Typography;

interface Props {
    feedback: IFeedbackListItem | null;
    onClose: () => void;
}

const FeedbackDetailModal = ({ feedback, onClose }: Props) => {
    if (!feedback) return null;

    const sectionCard = (title: string, items: { label: string; value: string }[]) => (
        <Card size="small" title={title} style={{ marginBottom: 16 }} bordered>
            <Row gutter={[16, 8]}>
                {items.map((item, idx) => (
                    <Col key={idx} span={12}>
                        <Text strong>{item.label}:</Text> <Text>{item.value || '—'}</Text>
                    </Col>
                ))}
            </Row>
        </Card>
    );

    const tabItems = [
        {
            key: '1',
            label: (
                <Space>
                    <ScheduleOutlined /> Sinh hoạt
                </Space>
            ),
            children: (
                <>
                    {sectionCard('Ăn uống', [
                        { label: 'Bữa sáng', value: feedback.eating.breakfast },
                        { label: 'Bữa trưa', value: feedback.eating.lunch },
                        { label: 'Bữa xế', value: feedback.eating.snack },
                        { label: 'Nhận xét', value: feedback.eating.note },
                    ])}
                    {sectionCard('Ngủ', [
                        { label: 'Thời gian', value: feedback.sleeping.duration },
                        { label: 'Chất lượng', value: feedback.sleeping.quality },
                        { label: 'Nhận xét', value: feedback.sleeping.note },
                    ])}
                    {sectionCard('Vệ sinh', [
                        { label: 'Đi vệ sinh', value: feedback.hygiene.toilet },
                        { label: 'Rửa tay', value: feedback.hygiene.handwash },
                        { label: 'Nhận xét', value: feedback.hygiene.note },
                    ])}
                </>
            ),
        },
        {
            key: '2',
            label: (
                <Space>
                    <ReadOutlined /> Học tập
                </Space>
            ),
            children: sectionCard('Chi tiết học tập', [
                { label: 'Tập trung học', value: feedback.learning.focus },
                { label: 'Tham gia bài học', value: feedback.learning.participation },
                { label: 'Nhận xét', value: feedback.learning.note },
            ]),
        },
        {
            key: '3',
            label: (
                <Space>
                    <TeamOutlined /> Xã hội
                </Space>
            ),
            children: sectionCard('Chi tiết xã hội', [
                { label: 'Tương tác bạn bè', value: feedback.social.friendInteraction },
                { label: 'Cảm xúc', value: feedback.social.emotionalState },
                { label: 'Hành vi', value: feedback.social.behavior },
                { label: 'Nhận xét', value: feedback.social.note },
            ]),
        },
        {
            key: '4',
            label: (
                <Space>
                    <HeartOutlined /> Sức khỏe
                </Space>
            ),
            children: sectionCard('Chi tiết sức khỏe', [
                { label: 'Tình trạng chung', value: feedback.health.note },
            ]),
        },
        {
            key: '5',
            label: (
                <Space>
                    <StarOutlined /> Khác
                </Space>
            ),
            children: (
                <>
                    {sectionCard('Ghi chú chung', [
                        { label: 'Nổi bật trong ngày', value: feedback.dailyHighlight },
                        { label: 'Nhận xét giáo viên', value: feedback.teacherNote },
                    ])}
                    <Card size="small" title="Nhắc nhở" bordered>
                        <List
                            size="small"
                            dataSource={feedback.reminders}
                            renderItem={(item) => <List.Item>{item}</List.Item>}
                            locale={{ emptyText: 'Không có nhắc nhở nào' }}
                        />
                    </Card>
                </>
            ),
        },
    ];

    return (
        <Modal
            open={!!feedback}
            onCancel={onClose}
            footer={null}
            title={
                <Space>
                    <MessageOutlined />
                    Chi tiết phản hồi
                </Space>
            }
            width={900}
        >
            <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                <Col>
                    <Tag color="green" icon={<UserOutlined />}>
                        {feedback.studentId.fullName}
                    </Tag>
                </Col>
                <Col>
                    <Tag color="blue" icon={<BankOutlined />}>
                        {feedback.classId.className}
                    </Tag>
                </Col>
            </Row>

            <Tabs defaultActiveKey="1" items={tabItems} />
        </Modal>
    );
};

export default FeedbackDetailModal;
