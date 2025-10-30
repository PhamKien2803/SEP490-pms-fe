import React from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Button,
  Avatar,
  Table,
  Badge,
  List,
  Space,
  Anchor,
} from "antd";
import {
  ScheduleOutlined, 
  ForkOutlined,     
  UserOutlined,      
  TeamOutlined,      
  CheckCircleOutlined, 
  HeartOutlined,     
  MessageOutlined,   
  CalendarOutlined,
  BookOutlined,
  ExceptionOutlined,
  SmileOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  LineChartOutlined,
  EditOutlined, // Icon cho nút update
  PhoneOutlined, // Icon cho liên hệ giáo viên
  FilePdfOutlined // Icon cho xem PDF
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Link } = Anchor;

// --- Dữ liệu giả định (Mock Data) ---
const mockStudentInfo = {
  name: "Nguyễn Văn A",
  className: "Lớp Mầm Xanh 2025",
  age: 5,
  avatarUrl: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqMNCiZSDiW.png",
  studentCode: "HS98765",
  address: "22B, Đường Vòng Cung, Quận 1",
  parentName: "Nguyễn Thị B",
  parentPhone: "090-123-4567"
};

const mockSchedule = [
  { day: 'Thứ Hai', time: '8:00 - 9:00', activity: 'Thể dục nhịp điệu', key: '1' },
  { day: 'Thứ Hai', time: '9:00 - 10:00', activity: 'Học toán với đồ chơi', key: '2' },
  { day: 'Thứ Ba', time: '8:00 - 9:00', activity: 'Vẽ và tô màu', key: '3' },
  { day: 'Thứ Tư', time: '8:00 - 9:00', activity: 'Kể chuyện sáng tạo', key: '4' },
  { day: 'Thứ Năm', time: '9:00 - 10:00', activity: 'Âm nhạc và vận động', key: '5' },
];

const mockMenu = [
    'Thứ Hai: Sáng (Cháo thịt bằm), Trưa (Cơm sườn non, canh bí)',
    'Thứ Ba: Sáng (Sữa và bánh mì), Trưa (Mì Ý sốt cà, Salad)',
    'Thứ Tư: Sáng (Phở gà), Trưa (Cơm cuộn, súp kem nấm)',
    'Thứ Năm: Sáng (Bún riêu), Trưa (Gà nướng, khoai tây nghiền)',
    'Thứ Sáu: Sáng (Bánh bao), Trưa (Cá sốt cà chua, rau luộc)',
];

const mockAttendance = [
    { date: '25/10/2025', status: 'Có mặt', key: '1' },
    { date: '26/10/2025', status: 'Vắng (Có phép)', key: '2' },
    { date: '27/10/2025', status: 'Có mặt', key: '3' },
    { date: '28/10/2025', status: 'Có mặt', key: '4' },
    { date: '29/10/2025', status: 'Vắng (Không phép)', key: '5' },
    { date: '30/10/2025', status: 'Có mặt', key: '6' },
];

const mockHealthRecord = [
    { title: 'Cân nặng', value: '20 kg', icon: <LineChartOutlined style={{ color: '#52c41a' }}/> },
    { title: 'Chiều cao', value: '115 cm', icon: <LineChartOutlined style={{ color: '#1890ff' }}/> },
    { title: 'Chỉ số BMI', value: '15.1 (Bình thường)', icon: <LineChartOutlined style={{ color: '#faad14' }}/> },
    { title: 'Ghi chú y tế', value: 'Khỏe mạnh, cần bổ sung canxi và vitamin D.', icon: <SolutionOutlined style={{ color: '#eb2f96' }}/> },
];

const mockFeedback = [
    { title: 'Phản hồi GV (27/10)', content: 'Hôm nay con rất tích cực tham gia các hoạt động nhóm, có tiến bộ trong việc chia sẻ đồ chơi.', type: 'positive' },
    { title: 'Góp ý PH (26/10)', content: 'Xin hỏi về buổi dã ngoại sắp tới, cần chuẩn bị gì cho con?', type: 'neutral' },
    { title: 'Phản hồi GV (25/10)', content: 'Con có biểu hiện hơi buồn ngủ vào buổi chiều, đã được cô động viên.', type: 'negative' },
];

// --- Danh sách Neo (Anchor Links) ---
const anchorLinks = [
    { href: '#student-info', title: 'Học sinh', icon: <UserOutlined /> },
    { href: '#class-info', title: 'Lớp học', icon: <TeamOutlined /> },
    { href: '#schedule', title: 'Lịch Học', icon: <ScheduleOutlined /> },
    { href: '#menu', title: 'Thực Đơn', icon: <ForkOutlined /> },
    { href: '#attendance', title: 'Điểm Danh', icon: <CheckCircleOutlined /> },
    { href: '#health', title: 'Sức khỏe', icon: <HeartOutlined /> },
    { href: '#feedback', title: 'Phản hồi', icon: <MessageOutlined /> },
];

// --- Dashboard Chính ---
const ParentDashboard: React.FC = () => {

  // --- Components Con tái sử dụng (Student Info) ---
  const StudentProfileCard = () => (
    <Card 
        bordered={false} 
        style={{ 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #e6f7ff, #fffbe6)', // Gradient nhẹ
            borderRadius: 16, // Bo tròn nhiều hơn
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', // Bóng đổ mạnh hơn
            padding: '24px 0'
        }}
    >
        <Avatar size={100} src={mockStudentInfo.avatarUrl} icon={<UserOutlined />} style={{ marginBottom: 16, border: '3px solid #1890ff' }} />
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{mockStudentInfo.name}</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>{mockStudentInfo.className}</Text>
        <Divider style={{ margin: '24px 0' }} />
        <Row gutter={16}>
            <Col span={12}>
                <Text strong><CalendarOutlined style={{ color: '#faad14' }} /> Tuổi:</Text> <Text>{mockStudentInfo.age}</Text>
            </Col>
            <Col span={12}>
                <Text strong><SolutionOutlined style={{ color: '#52c41a' }} /> Mã HS:</Text> <Text>{mockStudentInfo.studentCode}</Text>
            </Col>
        </Row>
        <Button 
            type="primary" 
            icon={<EditOutlined />} 
            style={{ marginTop: 24, borderRadius: 8 }} // Bo tròn nút
            size="large"
        >
            Cập nhật thông tin
        </Button>
    </Card>
  );

  return (
    <Layout style={{ background: '#f0f2f5' }}> {/* Background nhẹ nhàng cho toàn bộ Layout */}
      {/* 1. Header Cố định với Anchor Navigation */}
      <div 
        style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10, 
            width: '100%', 
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Bóng đổ rõ nét hơn
            padding: '16px 24px',
            borderRadius: '0 0 12px 12px' // Bo tròn góc dưới
        }}
      >
        <Row align="middle" justify="space-between">
            <Col>
                <Title level={3} style={{ margin: 0, color: '#0050b3' }}> {/* Màu xanh đậm hơn cho tiêu đề chính */}
                    Dashboard Phụ Huynh
                </Title>
            </Col>
            <Col>
                <Anchor direction="horizontal" affix={false} style={{ background: 'transparent' }} targetOffset={80}> {/* targetOffset để tránh header bị che */}
                    {anchorLinks.map(link => (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            title={
                                <Space style={{ color: '#333' }}> {/* Màu chữ đậm hơn cho Link */}
                                    {React.cloneElement(link.icon, { style: { color: '#1890ff' } })} {/* Tô màu icon */}
                                    {link.title}
                                </Space>
                            } 
                        />
                    ))}
                </Anchor>
            </Col>
            <Col>
                <Button 
                    icon={<UserOutlined />} 
                    type="default" 
                    style={{ borderRadius: 8, borderColor: '#d9d9d9' }}
                    size="large"
                >
                    Tài khoản
                </Button>
            </Col>
        </Row>
      </div>

      {/* 2. Content chính (Dạng cuộn dọc) */}
      <Content style={{ padding: "32px 24px 48px", background: '#f0f2f5' }}> {/* Padding rộng hơn */}
        
        <Row gutter={[32, 32]}> {/* Khoảng cách gutter lớn hơn */}
          
          {/* Cột 1: Thông tin tổng quan và Lớp học (Quan trọng) */}
          <Col xs={24} lg={8}>
            
            {/* 3. Thông tin Học sinh */}
            <div id="student-info" style={{ paddingTop: 0 }}> {/* Remove paddingTop vì Card đã có margin */}
                <StudentProfileCard />
            </div>

            <Divider style={{ margin: '32px 0', borderColor: '#d9d9d9' }}> {/* Màu divider */}
                <Text type="secondary" style={{ fontSize: 16 }}>Thông tin chung</Text>
            </Divider>

            {/* 4. Thông tin Lớp học */}
            <div id="class-info" style={{ paddingTop: 0 }}>
                <Card 
                    title={
                        <Title level={4} style={{ margin: 0, color: '#722ed1' }}> {/* Màu tím nhẹ nhàng */}
                            <TeamOutlined style={{ marginRight: 8 }} /> Thông tin Lớp học
                        </Title>
                    }
                    style={{ 
                        marginBottom: 0, 
                        borderRadius: 12, 
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
                        background: '#fff0f6' // Nền hồng nhạt nhẹ
                    }}
                    bodyStyle={{ padding: 24 }}
                >
                    <Text strong><BookOutlined style={{ color: '#eb2f96' }} /> Lớp:</Text> <Text>{mockStudentInfo.className}</Text><br/>
                    <Text strong><UserOutlined style={{ color: '#eb2f96' }} /> Giáo viên chủ nhiệm:</Text> <Text>Cô Trần Thị C</Text><br/>
                    <Text strong><SolutionOutlined style={{ color: '#eb2f96' }} /> Sĩ số:</Text> <Text>30 học sinh</Text><br/>
                    <Text strong><CalendarOutlined style={{ color: '#eb2f96' }} /> Năm học:</Text> <Text>2024-2025</Text><br/>
                    <Button 
                        type="primary" 
                        ghost 
                        icon={<PhoneOutlined />} 
                        style={{ marginTop: 24, borderRadius: 8 }}
                        size="large"
                    >
                        Liên hệ Giáo viên
                    </Button>
                </Card>
            </div>
          </Col>

          {/* Cột 2: Nội dung chi tiết (Lịch học, Thực đơn, Điểm danh, Sức khỏe, Feedback) */}
          <Col xs={24} lg={16}>

            {/* 1. Xem Lịch học */}
            <Card 
                id="schedule" 
                title={
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        <ScheduleOutlined style={{ marginRight: 8 }} /> Lịch Học Tuần Này
                    </Title>
                }
                extra={<Button type="link" icon={<CalendarOutlined />} style={{ color: '#1890ff' }}>Xem chi tiết Lịch năm học</Button>}
                style={{ 
                    marginBottom: 32, 
                    borderRadius: 12, 
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
                    background: '#e6f7ff' // Nền xanh nhạt nhẹ
                }}
                bodyStyle={{ padding: 24 }}
            >
                <Table 
                    dataSource={mockSchedule}
                    pagination={false}
                    columns={[
                        { title: 'Thứ', dataIndex: 'day', key: 'day' },
                        { title: 'Thời gian', dataIndex: 'time', key: 'time' },
                        { title: 'Hoạt động', dataIndex: 'activity', key: 'activity' },
                    ]}
                    // Row selection để thêm màu sắc cho hàng
                    rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
                    // Thêm style cho table header
                    summary={() => (
                        <Table.Summary.Row>
                           <Table.Summary.Cell index={0} colSpan={3} style={{ borderBottom: 'none' }}>
                               <Text type="secondary">Cập nhật: 01/11/2025</Text>
                           </Table.Summary.Cell>
                        </Table.Summary.Row>
                    )}
                />
            </Card>

            {/* 2. Xem Thực đơn */}
            <Card 
                id="menu" 
                title={
                    <Title level={4} style={{ margin: 0, color: '#faad14' }}>
                        <ForkOutlined style={{ marginRight: 8 }} /> Thực Đơn Bữa Ăn (Tuần)
                    </Title>
                }
                extra={<Button type="link" icon={<ExceptionOutlined />} style={{ color: '#faad14' }}>Bảng dinh dưỡng chi tiết</Button>}
                style={{ 
                    marginBottom: 32, 
                    borderRadius: 12, 
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
                    background: '#fffbe6' // Nền vàng nhạt nhẹ
                }}
                bodyStyle={{ padding: 24 }}
            >
                <List
                    bordered={false} // Bỏ border của List để List.Item có border riêng
                    dataSource={mockMenu}
                    renderItem={(item) => (
                        <List.Item style={{ borderBottom: '1px dashed #f0f0f0', padding: '12px 0' }}>
                            <Text strong><BookOutlined style={{ color: '#faad14' }} /></Text> {item}
                        </List.Item>
                    )}
                />
            </Card>

            {/* 5. Xem Điểm danh học sinh */}
            <Card 
                id="attendance" 
                title={
                    <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                        <CheckCircleOutlined style={{ marginRight: 8 }} /> Lịch Sử Điểm Danh
                    </Title>
                }
                extra={<Button type="link" icon={<CalendarOutlined />} style={{ color: '#52c41a' }}>Xem báo cáo chi tiết</Button>}
                style={{ 
                    marginBottom: 32, 
                    borderRadius: 12, 
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
                    background: '#f6ffed' // Nền xanh lá nhạt nhẹ
                }}
                bodyStyle={{ padding: 24 }}
            >
                <Table 
                    dataSource={mockAttendance} 
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                    columns={[
                        { title: 'Ngày', dataIndex: 'date', key: 'date', width: '30%' },
                        { 
                            title: 'Trạng thái', 
                            dataIndex: 'status', 
                            key: 'status',
                            render: (status) => (
                                <Badge 
                                    status={
                                        status.includes('Có mặt') ? 'success' : 
                                        status.includes('Vắng (Có phép)') ? 'warning' : 'error'
                                    } 
                                    text={status} 
                                />
                            ),
                        },
                    ]}
                />
            </Card>
            
            {/* 6. Xem Hồ sơ sức khỏe học sinh */}
            <Card
                id="health"
                title={
                    <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
                        <HeartOutlined style={{ marginRight: 8 }} /> Hồ Sơ Sức Khỏe
                    </Title>
                }
                extra={<Button type="link" icon={<LineChartOutlined />} style={{ color: '#ff4d4f' }}>Lịch sử khám</Button>}
                style={{ 
                    marginBottom: 32, 
                    borderRadius: 12, 
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
                    background: '#fff0f0' // Nền hồng/đỏ nhạt nhẹ
                }}
                bodyStyle={{ padding: 24 }}
            >
                <Row gutter={[24, 16]}>
                    {mockHealthRecord.map((item, index) => (
                        <Col xs={24} md={12} key={index}>
                            <Card 
                                size="small" 
                                title={<Space>{item.icon} <Text strong>{item.title}</Text></Space>}
                                extra={item.title === 'Ghi chú y tế' && <Button size="small" type="primary" ghost icon={<FilePdfOutlined />}>Xem PDF</Button>}
                                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                            >
                                <Text>{item.value}</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
            
            {/* 7. Xem Feedback */}
            <Card
                id="feedback"
                title={
                    <Title level={4} style={{ margin: 0, color: '#722ed1' }}>
                        <MessageOutlined style={{ marginRight: 8 }} /> Phản Hồi & Góp Ý
                    </Title>
                }
                extra={<Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }}>Gửi Góp Ý Mới</Button>}
                style={{ 
                    marginBottom: 0, 
                    borderRadius: 12, 
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
                    background: '#f9f0ff' // Nền tím nhạt nhẹ
                }}
                bodyStyle={{ padding: 24 }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={mockFeedback}
                    renderItem={(item) => (
                        <List.Item
                            actions={[<Button key="detail" type="text" icon={<ArrowRightOutlined />}>Xem chi tiết</Button>]}
                            style={{ borderBottom: '1px dashed #f0f0f0', padding: '12px 0' }}
                        >
                            <List.Item.Meta
                                avatar={
                                    item.type === 'positive' ? <SmileOutlined style={{ color: '#52c41a', fontSize: 28 }} /> : 
                                    item.type === 'neutral' ? <MessageOutlined style={{ color: '#faad14', fontSize: 28 }} /> :
                                    <ExceptionOutlined style={{ color: '#ff4d4f', fontSize: 28 }} />
                                }
                                title={<Text strong>{item.title}</Text>}
                                description={item.content}
                            />
                        </List.Item>
                    )}
                />
            </Card>

          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ParentDashboard;