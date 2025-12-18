// import React, { useState, useEffect } from 'react';
// import { Modal, Table } from 'antd';
// import { StudentInClass, TeacherInClass } from '../../types/class';

// interface AddMemberTableModalProps {
//     open: boolean;
//     onCancel: () => void;
//     onOk: (selectedMembers: any[]) => void;
//     dataSource: (StudentInClass | TeacherInClass)[];
//     title: string;
//     selectionLimit?: number;
// }

// const AddMemberTableModal: React.FC<AddMemberTableModalProps> = ({
//     open,
//     onCancel,
//     onOk,
//     dataSource,
//     title,
//     selectionLimit,
// }) => {
//     const [selectedRows, setSelectedRows] = useState<any[]>([]);

//     const columns = [
//         { title: 'Mã', dataIndex: dataSource?.[0]?.hasOwnProperty('studentCode') ? 'studentCode' : 'staffCode', key: 'code' },
//         { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
//     ];

//     const rowSelection = {
//         onChange: (_: React.Key[], selectedRows: any[]) => {
//             setSelectedRows(selectedRows);
//         },
//         getCheckboxProps: (record: any) => ({
//             disabled: (selectionLimit !== undefined && selectionLimit <= 0) || (selectionLimit !== undefined && selectedRows.length >= selectionLimit && !selectedRows.some(row => row._id === record._id)),
//             name: record.fullName,
//         }),
//     };

//     const handleOk = () => {
//         if (selectedRows.length > 0) {
//             onOk(selectedRows);
//         }
//         // Đóng modal sau khi nhấn OK bất kể có chọn hay không
//         onCancel();
//     };

//     // Reset selected rows khi modal được mở lại
//     useEffect(() => {
//         if (!open) {
//             setSelectedRows([]);
//         }
//     }, [open]);

//     return (
//         <Modal
//             title={title}
//             open={open}
//             onCancel={onCancel}
//             onOk={handleOk}
//             width={600}
//             okText="Thêm"
//             cancelText="Hủy"
//         >
//             <Table
//                 rowSelection={{ type: 'checkbox', ...rowSelection }}
//                 columns={columns}
//                 dataSource={dataSource}
//                 rowKey="_id"
//                 pagination={{ pageSize: 5 }}
//             />
//         </Modal>
//     );
// };

// export default AddMemberTableModal;



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

    const isStudent = useMemo(
        () => dataSource?.[0] && 'studentCode' in dataSource[0],
        [dataSource]
    );


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


    const columns = [
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
            />
        </Modal>
    );
};

export default AddMemberTableModal;
