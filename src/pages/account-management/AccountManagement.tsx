import {
    Button,
    Table,
    Space,
    Input,
    Tag,
    Row,
    Col,
    Avatar,
    Typography,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
    CrownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
const { Title, Text } = Typography;
interface User {
    key: string;
    email: string;
    roleList: { _id: string; name: string }[];
    isAdmin: boolean;
    active: boolean;
    staff?: { _id: string; fullName: string };
    parent?: { _id: string; fullName: string };
}

const mockData: User[] = [
    {
        key: '1',
        email: 'admin@school.com',
        roleList: [{ _id: 'role1', name: 'Super Admin' }],
        isAdmin: true,
        active: true,
        staff: { _id: 'staff1', fullName: 'Nguyễn Quản Trị' },
    },
    {
        key: '2',
        email: 'teacher.a@school.com',
        roleList: [{ _id: 'role2', name: 'Giáo viên' }],
        isAdmin: false,
        active: true,
        staff: { _id: 'staff2', fullName: 'Trần Văn A' },
    },
    {
        key: '3',
        email: 'parent.b@example.com',
        roleList: [{ _id: 'role3', name: 'Phụ huynh' }],
        isAdmin: false,
        active: true,
        parent: { _id: 'parent1', fullName: 'Lê Thị Bích' },
    },
    {
        key: '4',
        email: 'accountant.c@school.com',
        roleList: [{ _id: 'role4', name: 'Kế toán' }],
        isAdmin: false,
        active: false,
        staff: { _id: 'staff3', fullName: 'Phạm Văn C' },
    },
];

function AccountManagement() {
    const columns: ColumnsType<User> = [
        {
            title: 'Tài khoản',
            dataIndex: 'email',
            key: 'email',
            render: (_, record) => {
                const name = record.staff?.fullName || record.parent?.fullName || 'Chưa liên kết';
                return (
                    <Space direction="vertical" size={0}>
                        <Space>
                            <Avatar icon={<UserOutlined />} />
                            <a style={{ fontWeight: 500 }}>{name}</a>
                        </Space>
                        <Text type="secondary" style={{ paddingLeft: 40 }}>{record.email}</Text>
                    </Space>
                )
            }
        },
        {
            title: 'Vai trò',
            key: 'roleList',
            dataIndex: 'roleList',
            render: (_, record) => (
                <>
                    {record.isAdmin && (
                        <Tag icon={<CrownOutlined />} color="gold">
                            Admin
                        </Tag>
                    )}
                    {record.roleList.map((role) => (
                        <Tag color="blue" key={role._id}>
                            {role.name}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: 'Tài khoản liên kết',
            key: 'linkedAccount',
            render: (_, record) => {
                if (record.staff) return <Tag color="cyan">Nhân viên</Tag>;
                if (record.parent) return <Tag color="purple">Phụ huynh</Tag>;
                return <Tag>Hệ thống</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            key: 'active',
            dataIndex: 'active',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: () => (
                <Space size="middle">
                    <a>Sửa</a>
                    <a>Xóa</a>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3}>Quản lý tài khoản</Title>
                </Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Tìm kiếm..."
                            prefix={<SearchOutlined />}
                            style={{ width: 250 }}
                        />
                        <Button type="primary" icon={<PlusOutlined />}>
                            Thêm tài khoản
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Table columns={columns} dataSource={mockData} rowKey="key" />
        </div>
    );
}

export default AccountManagement;