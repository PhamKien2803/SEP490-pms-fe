
import React from 'react';
import { Modal, Descriptions, Space, Typography, Tag, Button } from 'antd';
import { CloseCircleOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { IGuardianRecord } from '../../../types/guardians';

const { Text } = Typography;
const ACCENT_COLOR = "#1890ff";

interface ViewGuardianDetailsProps {
    open: boolean;
    guardianData: IGuardianRecord | null;
    onClose: () => void;
}

const ViewGuardianDetails: React.FC<ViewGuardianDetailsProps> = ({
    open, guardianData, onClose,
}) => {
    const data = guardianData;

    return (
        <Modal
            title={<Space><UserOutlined style={{ color: ACCENT_COLOR }} /> Chi tiết Người Đưa Đón</Space>}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>
            ]}
            width={600}
            closeIcon={<CloseCircleOutlined style={{ color: ACCENT_COLOR }} />}
        >
            {data ? (
                <Descriptions bordered column={1} size="small" style={{ marginTop: 20 }}>
                    <Descriptions.Item label="Họ và Tên">
                        <Text strong>{data.fullName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                        {data.dob ? dayjs(data.dob).format("DD/MM/YYYY") : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                        <Space><PhoneOutlined /> {data.phoneNumber}</Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mối quan hệ">
                        {data.relationship} ({data.relationshipDetail || 'Không có'})
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày ủy quyền">
                        {typeof data.delegationPeriod !== 'string' && data.delegationPeriod?.fromDate ? 
                            dayjs(data.delegationPeriod.fromDate).format("DD/MM/YYYY") : 'Chưa ủy quyền'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">
                        {data.note || 'Không có ghi chú.'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={data.status === "Còn hiệu lực" ? "processing" : "default"}>
                            {data.status}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>Không tìm thấy thông tin chi tiết.</p>
            )}
        </Modal>
    );
};

export default ViewGuardianDetails;