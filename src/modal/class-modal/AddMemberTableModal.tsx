import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Input } from 'antd';
import { StudentInClass, TeacherInClass } from '../../types/class';

interface AddMemberTableModalProps {
    open: boolean;
    onCancel: () => void;
    onOk: (selectedMembers: any[]) => void;
    dataSource: (StudentInClass | TeacherInClass)[];
    title: string;
    selectionLimit?: number;
    isStudent: boolean;
}

const AddMemberTableModal: React.FC<AddMemberTableModalProps> = ({
    open,
    onCancel,
    onOk,
    dataSource,
    title,
    selectionLimit,
}) => {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [keyword, setKeyword] = useState('');


    const isStudent = useMemo(() => {
        if (!dataSource || dataSource.length === 0) return undefined;
        return 'studentCode' in dataSource[0];
    }, [dataSource]);



    const filteredData = useMemo(() => {
        if (!keyword) return dataSource;
        const lower = keyword.toLowerCase();

        return dataSource.filter((item: any) =>
            item.fullName?.toLowerCase().includes(lower) ||
            item.studentCode?.toLowerCase().includes(lower) ||
            item.staffCode?.toLowerCase().includes(lower) ||
            item.email?.toLowerCase().includes(lower)
        );
    }, [keyword, dataSource]);


    const columns = useMemo(() => {
        const baseColumns: any[] = [
            {
                title: 'Mã',
                dataIndex: isStudent ? 'studentCode' : 'staffCode',
                key: 'code',
            },
            {
                title: 'Họ tên',
                dataIndex: 'fullName',
                key: 'fullName',
            },
        ];

        if (isStudent) {
            baseColumns.push({
                title: 'Giới tính',
                dataIndex: 'gender',
                key: 'gender',
            });
        } else {
            baseColumns.push({
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
            });
        }

        return baseColumns;
    }, [isStudent]);



    const rowSelection = {
        selectedRowKeys: selectedRows.map(r => r._id),
        onChange: (_: React.Key[], rows: any[]) => {
            setSelectedRows(rows);
        },
        getCheckboxProps: (record: any) => ({
            disabled:
                selectionLimit !== undefined &&
                selectedRows.length >= selectionLimit &&
                !selectedRows.some(r => r._id === record._id),
        }),
    };

    const handleOk = () => {
        if (selectedRows.length > 0) {
            onOk(selectedRows);
        }
        handleClose();
    };

    const handleClose = () => {
        setSelectedRows([]);
        setKeyword('');
        onCancel();
    };

    useEffect(() => {
        if (!open) {
            setSelectedRows([]);
            setKeyword('');
        }
    }, [open]);

    return (
        <Modal
            title={title}
            open={open}
            onCancel={handleClose}
            onOk={handleOk}
            width={600}
            okText="Thêm"
            cancelText="Hủy"
            destroyOnClose
        >
            <Input.Search
                placeholder="Tìm theo tên hoặc mã..."
                allowClear
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ marginBottom: 16 }}
            />

            <Table
                rowSelection={{ type: 'checkbox', ...rowSelection }}
                columns={columns}
                dataSource={filteredData}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: 'Không có dữ liệu' }}
            />
        </Modal>
    );
};

export default AddMemberTableModal;
