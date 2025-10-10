import React from "react";
import { Modal, Descriptions, Divider, Tag } from "antd";
import { StaffRecord } from "../../../types/staff-management";
import dayjs from "dayjs";

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
        return dayjs(dateString).format("DD/MM/YYYY");
    };

    const labelStyle = { width: '120px' }; 

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
                
                {/* 1. Mã nhân viên & Họ và tên */}
                <Descriptions.Item label="Mã nhân viên" labelStyle={labelStyle}>
                    <Tag color="blue">{staffData.staffCode}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Họ và tên" labelStyle={labelStyle}>
                    {staffData.fullName}
                </Descriptions.Item>

                {/* 2. Giới tính & Ngày sinh */}
                <Descriptions.Item label="Giới tính" labelStyle={labelStyle}>
                    {staffData.gender}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh" labelStyle={labelStyle}>
                    {formatDate(dayjs(staffData.dob).format("YYYY-MM-DD"))}
                </Descriptions.Item>

                {/* 3. SĐT & Email */}
                <Descriptions.Item label="SĐT" labelStyle={labelStyle}>
                    {staffData.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Email" labelStyle={labelStyle}>
                    {staffData.email}
                </Descriptions.Item>

                {/* 4. CMND/CCCD & Quốc tịch */}
                <Descriptions.Item label="CMND/CCCD" labelStyle={labelStyle}>
                    {staffData.IDCard}
                </Descriptions.Item>
                <Descriptions.Item label="Quốc tịch" labelStyle={labelStyle}>
                    {staffData.nation}
                </Descriptions.Item>

                {/* 5. Tôn giáo & Địa chỉ */}
                <Descriptions.Item label="Tôn giáo" labelStyle={labelStyle}>
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
                    <Descriptions.Item label="Người tạo">
                      {staffData.createdBy}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {formatDate(staffData.createdAt)}
                    </Descriptions.Item>
            
                    <Descriptions.Item label="Cập nhật lần cuối bởi">
                      {staffData.updatedBy || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                      {formatDate(staffData.updatedAt)}
                    </Descriptions.Item>
                  </Descriptions>
        </Modal>
    );
};

export default ViewStaffDetails;