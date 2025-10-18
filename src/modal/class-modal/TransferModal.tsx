import React, { useState, useEffect } from 'react';
import { Modal, Select, Typography } from 'antd';
import { AvailableClassForStudent, AvailableClassForTeacher } from '../../types/class';

const { Option } = Select;

interface TransferModalProps {
    open: boolean;
    onCancel: () => void;
    onConfirm: (newClassId?: string) => void;
    itemName: string;
    itemType: 'student' | 'teacher';
    transferableClasses: (AvailableClassForStudent | AvailableClassForTeacher)[];
    isLoading: boolean;
}

const TransferModal: React.FC<TransferModalProps> = ({
    open,
    onCancel,
    onConfirm,
    itemName,
    itemType,
    transferableClasses,
    isLoading,
}) => {
    const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
    const title = `Chuyển lớp cho ${itemType === 'student' ? 'học sinh' : 'giáo viên'}: ${itemName}`;

    useEffect(() => {
        if (!open) {
            setSelectedClassId(undefined);
        }
    }, [open]);

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onCancel}
            onOk={() => onConfirm(selectedClassId)}
            okText="Xác nhận chuyển"
            cancelText="Hủy"
            confirmLoading={isLoading}
        >
            <Typography.Paragraph>Chọn lớp học mới để chuyển đến:</Typography.Paragraph>
            <Select
                showSearch
                placeholder="Chọn lớp mới"
                style={{ width: '100%' }}
                value={selectedClassId}
                onChange={(value) => setSelectedClassId(value)}
                optionFilterProp="children"
                filterOption={(input, option) => (String(option?.children) ?? '').toLowerCase().includes(input.toLowerCase())}
                loading={!transferableClasses && isLoading}
            >
                {transferableClasses?.map((cls) => (
                    <Option key={cls._id} value={cls._id}>{cls.className}</Option>
                ))}
            </Select>
        </Modal>
    );
};

export default TransferModal;