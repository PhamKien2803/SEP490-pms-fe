import React from "react";
import { Modal, Descriptions, Divider, Tag } from "antd";
import { StaffRecord } from "../../../types/staff-management";

interface ViewStaffDetailsProps {
    open: boolean;
    onClose: () => void;
    staffData: StaffRecord | null;
}

const ViewStaffDetails: React.FC<ViewStaffDetailsProps> = ({
    open,
    onClose,
    staffData,
}) => {
    if (!staffData) {
        return null;
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const labelStyle = { width: '120px' };
    const contentStyle = { width: '30%' };

    return (
        <Modal
            title={`Thông tin chi tiết nhân viên: ${staffData.fullName}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
            centered={true}
            bodyStyle={{ maxHeight: '75vh', overflowY: 'auto' }}
        >
            <Divider orientation="left" plain>
                Thông tin cá nhân
            </Divider>
            <Descriptions bordered layout="horizontal" column={2}>
                {/* Sử dụng labelStyle và contentStyle ở đây */}
                <Descriptions.Item label="Mã nhân viên" labelStyle={labelStyle} contentStyle={contentStyle}>
                    <Tag color="blue">{staffData.staffCode}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Họ và tên" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {staffData.fullName}
                </Descriptions.Item>

                <Descriptions.Item label="Giới tính" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {staffData.gender}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {formatDate(staffData.dob ? staffData.dob.toISOString() : undefined)}
                </Descriptions.Item>

                <Descriptions.Item label="CMND/CCCD" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {staffData.IDCard}
                </Descriptions.Item>
                <Descriptions.Item label="Quốc tịch" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {staffData.nation}
                </Descriptions.Item>

                <Descriptions.Item label="Tôn giáo" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {staffData.religion || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ" span={2}>
                    {staffData.address}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain style={{ marginTop: 32 }}>
                Thông tin hệ thống
            </Divider>
            <Descriptions bordered layout="horizontal" column={2}>
                <Descriptions.Item label="Người tạo" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {staffData.createdBy}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {formatDate(staffData.createdAt)}
                </Descriptions.Item>

                <Descriptions.Item label="Cập nhật lần cuối bởi" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {staffData.updatedBy || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật" labelStyle={labelStyle} contentStyle={contentStyle}>
                    {formatDate(staffData.updatedAt)}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ViewStaffDetails;