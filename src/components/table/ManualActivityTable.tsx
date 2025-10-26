import React, { useMemo } from 'react';
import {
    Table,
    Select,
    Button,
    InputNumber,
    Tooltip,
    Tag, // <- Import Tag
} from 'antd';
import {
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
    ActivityReference,
    ManualActivityRow,
} from '../../types/topic';

const formatMinutesToTime = (minutes: number) => {
    if (isNaN(minutes) || minutes === null) return 'N/A';
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
};

interface ManualActivityTableProps {
    rows: ManualActivityRow[];
    options: ActivityReference[];
    onChange: (rows: ManualActivityRow[]) => void;
    tableType: 'fix' | 'core' | 'event';
}

const getTypeColor = (typeDisplay: string | undefined): string => {
    if (!typeDisplay) return 'default';
    const lowerType = typeDisplay.toLowerCase();
    if (lowerType === 'cố định') return 'blue';
    if (lowerType === 'sự kiện') return 'green';
    if (lowerType === 'học' || lowerType === 'core') return 'orange';
    return 'default';
};

const ManualActivityTable: React.FC<ManualActivityTableProps> = ({
    rows,
    options,
    onChange,
    tableType,
}) => {
    const handleAddRow = () => {
        const newKey = Date.now().toString();
        onChange([...rows, { key: newKey }]);
    };

    const handleDeleteRow = (key: string) => {
        onChange(rows.filter((row) => row.key !== key));
    };

    const activityOptions = options.map((opt) => ({
        label: opt.activityName,
        value: opt._id,
        typeDisplay: opt.type === 'Bình thường' ? opt.category : opt.type,
        startTime: opt.startTime,
        endTime: opt.endTime,
        eventName: opt.eventName,
    }));

    const selectedIdsSet = useMemo(() =>
        new Set(rows.map(r => r.activityId).filter(Boolean))
        , [rows]);

    const handleUpdateRow = (
        key: string,
        field: 'activityId' | 'sessions',
        value: string | number | null
    ) => {
        onChange(
            rows.map((row) => {
                if (row.key !== key) return row;

                if (field === 'activityId') {
                    const selectedOption = activityOptions.find(opt => opt.value === value);
                    return {
                        ...row,
                        activityId: value as string,
                        activityName: selectedOption?.label,
                        activityTypeDisplay: selectedOption?.typeDisplay,
                        startTime: selectedOption?.startTime,
                        endTime: selectedOption?.endTime,
                        eventName: selectedOption?.eventName,
                    };
                }

                if (field === 'sessions') {
                    let sessionsValue: number | undefined = undefined;
                    if (typeof value === 'number') sessionsValue = value;
                    else if (typeof value === 'string' && value !== '') {
                        const parsed = Number(value);
                        sessionsValue = isNaN(parsed) ? undefined : parsed;
                    }
                    return { ...row, sessions: sessionsValue };
                }

                return row;
            })
        );
    };

    const columns: TableProps<ManualActivityRow>['columns'] = [
        {
            title: 'Tên hoạt động',
            key: 'activityId',
            width: tableType === 'fix' ? '40%' : tableType === 'core' ? '50%' : '30%',
            render: (_, record) => {
                const filteredOptions = activityOptions.map(opt => {
                    const isSelectedByOther = selectedIdsSet.has(opt.value) && record.activityId !== opt.value;
                    return { ...opt, disabled: isSelectedByOther };
                });

                return (
                    <Select
                        showSearch
                        placeholder="Chọn hoạt động"
                        style={{ width: '100%' }}
                        options={filteredOptions}
                        value={record.activityId}
                        onChange={(value) => handleUpdateRow(record.key, 'activityId', value)}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                );
            },
        },
    ];

    if (tableType === 'fix') {
        columns.push({
            title: 'Thời gian',
            key: 'time',
            width: '25%',
            render: (_, record) => {
                const start = formatMinutesToTime(record.startTime as number);
                const end = formatMinutesToTime(record.endTime as number);
                if (start !== 'N/A' && end !== 'N/A') return `${start} - ${end}`;
                if (!record.activityId) return '...';
                return 'N/A';
            },
        });
    }

    if (tableType === 'event') {
        columns.push({
            title: 'Tên sự kiện',
            key: 'eventName',
            width: '25%',
            render: (_, record) => {
                if (record.eventName) return record.eventName;
                if (!record.activityId) return '...';
                return 'N/A';
            },
        });
    }

    columns.push({
        title: 'Loại',
        key: 'type',
        width: '20%',
        render: (_, record) => {
            if (!record.activityId) return '...';
            const color = getTypeColor(record.activityTypeDisplay);
            return <Tag color={color}>{record.activityTypeDisplay}</Tag>;
        },
    });

    if (tableType !== 'fix') {
        columns.push({
            title: 'Số buổi / tuần',
            key: 'sessions',
            width: tableType === 'core' ? '20%' : '15%',
            render: (_, record) => (
                <InputNumber
                    min={0}
                    max={10}
                    placeholder="Số buổi"
                    style={{ width: '100px' }}
                    value={record.sessions}
                    onChange={(value) => handleUpdateRow(record.key, 'sessions', value)}
                />
            ),
        });
    }

    columns.push({
        title: 'Hành động',
        key: 'action',
        width: tableType === 'fix' ? '15%' : '10%',
        align: 'center',
        render: (_, record) => (
            <Tooltip title="Xóa hàng này">
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteRow(record.key)}
                />
            </Tooltip>
        ),
    });

    return (
        <div style={{ marginTop: 16 }}>
            <Table
                columns={columns}
                dataSource={rows}
                rowKey="key"
                pagination={false}
                bordered
                size="small"
                locale={{
                    emptyText: 'Chưa có hoạt động nào được thêm. Nhấn nút bên dưới.',
                }}
            />
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddRow}
                style={{ width: '100%', marginTop: 8 }}
            >
                Thêm hoạt động
            </Button>
        </div>
    );
};

export default ManualActivityTable;