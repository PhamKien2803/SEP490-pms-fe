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
    UnifiedActivityRow,
} from '../../types/topic';

const formatMinutesToTime = (minutes: number) => {
    if (isNaN(minutes) || minutes === null) return 'N/A';
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
};

interface MergedActivityTableProps {
    rows: UnifiedActivityRow[];
    options: ActivityReference[];
    onChange: (key: string, field: 'activityId' | 'sessions', value: any) => void;
    onDelete: (key: string) => void;
    onAddRow: () => void;
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


const MergedActivityTable: React.FC<MergedActivityTableProps> = ({
    rows,
    options,
    onChange,
    onDelete,
    onAddRow,
    tableType,
}) => {
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

    const columns: TableProps<UnifiedActivityRow>['columns'] = [
        {
            title: 'Tên hoạt động',
            key: 'activityName',
            width: tableType === 'fix' ? '40%' : tableType === 'core' ? '50%' : '30%',
            render: (_, record) => {
                if (record.type === 'manual') {
                    const filteredOptions = activityOptions.map(opt => {
                        const isSelectedByOther = selectedIdsSet.has(opt.value) && record.activityId !== opt.value;
                        return {
                            ...opt,
                            disabled: isSelectedByOther,
                        };
                    });

                    return (
                        <Select
                            showSearch
                            placeholder="Chọn hoạt động"
                            style={{ width: '100%' }}
                            options={filteredOptions}
                            value={record.activityId}
                            onChange={(value, option) =>
                                onChange(record.key, 'activityId', { value, option })
                            }
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    );
                }
                return record.activityName;
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
                if (record.type === 'manual' && !record.activityId) return '...';
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
                if (record.type === 'manual' && !record.activityId) return '...';
                return 'N/A';
            },
        });
    }

    columns.push(
        {
            title: 'Loại',
            key: 'type',
            width: '20%',
            render: (_, record) => {
                let typeDisplay: string | undefined;
                if (record.type === 'manual') {
                    const selected = activityOptions.find(opt => opt.value === record.activityId);
                    typeDisplay = selected ? selected.typeDisplay : undefined;
                } else {
                    typeDisplay = record.activityTypeDisplay;
                }

                if (!typeDisplay) return '...';

                const color = getTypeColor(typeDisplay);
                return <Tag color={color}>{typeDisplay}</Tag>;
            },
        }
    );

    if (tableType !== 'fix' && tableType !== 'event') {
        columns.push({
            title: 'Số buổi / tuần',
            key: 'sessions',
            width: tableType === 'core' ? '20%' : '15%',
            render: (_, record) => (
                <InputNumber
                    min={0}
                    max={10}
                    placeholder="Số buổi"
                    value={record.sessions}
                    onChange={(value) => onChange(record.key, 'sessions', value)}
                    style={{ width: '100px' }}
                />
            ),
        });
    }

    columns.push(
        {
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
                        onClick={() => onDelete(record.key)}
                    />
                </Tooltip>
            ),
        }
    );

    return (
        <>
            <Table
                columns={columns}
                dataSource={rows}
                rowKey="key"
                pagination={false}
                bordered
                size="small"
            />
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={onAddRow}
                style={{ width: '100%', marginTop: 8 }}
            >
                Thêm hoạt động
            </Button>
        </>
    );
};

export default MergedActivityTable;