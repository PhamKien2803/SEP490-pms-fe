import { Table, Input, Button, Space, Typography, Tag, Card } from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const mockData = [
    {
        key: '1',
        curriculumCode: 'KID-001',
        curriculumName: 'Early Math Adventures',
        age: 4,
        activityNumber: 15,
        active: true,
        startTime: '2025-09-01T09:00:00Z',
        endTime: '2025-12-20T17:00:00Z',
    },
    {
        key: '2',
        curriculumCode: 'ART-002',
        curriculumName: 'Creative Canvas',
        age: 5,
        activityNumber: 12,
        active: true,
        startTime: '2025-09-01T09:00:00Z',
        endTime: '2026-01-15T17:00:00Z',
    },
    {
        key: '3',
        curriculumCode: 'SCI-003',
        curriculumName: 'Little Scientists',
        age: 6,
        activityNumber: 20,
        active: false,
        startTime: '2024-01-10T09:00:00Z',
        endTime: '2024-05-30T17:00:00Z',
    },
    {
        key: '4',
        curriculumCode: 'ENG-004',
        curriculumName: 'Storytelling & Phonics',
        age: 4,
        activityNumber: 18,
        active: true,
        startTime: '2025-10-01T09:00:00Z',
        endTime: '2026-02-28T17:00:00Z',
    },
];

const formatDate = (dateString: any) => {
    const options = { year: "numeric" as const, month: "2-digit" as const, day: "2-digit" as const };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};

function CurriculumManagement() {
    const columns = [
        {
            title: 'Mã chương trình',
            dataIndex: 'curriculumCode',
            key: 'curriculumCode',
            sorter: (a: { curriculumCode: string; }, b: { curriculumCode: any; }) => a.curriculumCode.localeCompare(b.curriculumCode),
        },
        {
            title: 'Tên chương trình',
            dataIndex: 'curriculumName',
            key: 'curriculumName',
            sorter: (a: { curriculumName: string; }, b: { curriculumName: any; }) => a.curriculumName.localeCompare(b.curriculumName),
        },
        {
            title: 'Độ tuổi',
            dataIndex: 'age',
            key: 'age',
            sorter: (a: { age: number; }, b: { age: number; }) => a.age - b.age,
        },
        {
            title: 'Số hoạt động',
            dataIndex: 'activityNumber',
            key: 'activityNumber',
            sorter: (a: { activityNumber: number; }, b: { activityNumber: number; }) => a.activityNumber - b.activityNumber,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text: any) => formatDate(text),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (text: any) => formatDate(text),
        },
        {
            title: 'Trạng thái',
            key: 'active',
            dataIndex: 'active',
            render: (active: any) => (
                <Tag color={active ? 'green' : 'volcano'}>
                    {active ? 'ĐANG HOẠT ĐỘNG' : 'KHÔNG HOẠT ĐỘNG'}
                </Tag>
            ),
            filters: [
                { text: 'Đang hoạt động', value: true },
                { text: 'Không hoạt động', value: false },
            ],
            onFilter: (value: any, record: { active: any; }) => record.active === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} />
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Space>
            ),
        },
    ];

    const onSearch = (value: any) => {
        console.log(value);
    };

    return (
        <Card>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Title level={2}>Quản lý Chương trình học</Title>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Search
                        placeholder="Tìm kiếm chương trình..."
                        onSearch={onSearch}
                        enterButton={<SearchOutlined />}
                        style={{ width: 400 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
                </div>
                <Table columns={columns} dataSource={mockData} rowKey="key" />
            </Space>
        </Card>
    );
}

export default CurriculumManagement;