import React, { useMemo } from 'react';
import { Table, Input, Button, Space, Typography, Row, Col, Card } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
    key: React.Key;
    id: number;
    name: string;
}

const dataSource: DataType[] = [
    { key: '1', id: 1, name: 'Parent' },
    { key: '2', id: 2, name: 'Teacher' },
    { key: '3', id: 3, name: 'Administrative staff' },
    { key: '4', id: 4, name: 'Kế toán' },
];

const RoleManagement: React.FC = () => {

    const columns: ColumnsType<DataType> = useMemo(() => [
        {
            title: 'Role ID',
            dataIndex: 'id',
            key: 'id',
            width: '20%',
        },
        {
            title: 'Role name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '40%',
            render: (_: unknown, record: DataType) => (
                <Space size="middle">
                    <Button>Update</Button>
                    <Button>Delete</Button>
                    <Button>Phân quyền</Button>
                </Space>
            ),
        },
    ], []);

    const cardHeader = useMemo(() => (
        <Row justify="space-between" align="middle">
            <Col>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Role management
                </Typography.Title>
            </Col>
            <Col>
                <Space>
                    <Input
                        placeholder="Search"
                        style={{ width: 250 }}
                        prefix={<SearchOutlined />}
                    />
                    <Button type="primary" danger icon={<PlusOutlined />}>
                        Create
                    </Button>
                </Space>
            </Col>
        </Row>
    ), []);

    return (
        <div style={{ padding: '24px' }}>
            <Card title={cardHeader} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    pagination={{
                        position: ['bottomCenter'],
                    }}
                />
            </Card>
        </div>
    );
};

export default RoleManagement;