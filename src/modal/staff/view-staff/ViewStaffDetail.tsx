import React from "react";
import { Modal, Descriptions, Divider, Tag, Row, Col } from "antd";
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
            width={1000}
            centered={true}
        >
            <Row gutter={24}>
                <Col span={16}>
                    <Divider orientation="left" plain>
                        Thông tin cá nhân
                    </Divider>
                    <Descriptions bordered layout="horizontal" column={2}>
                        <Descriptions.Item label="Mã nhân viên" labelStyle={labelStyle}>
                            <Tag color="blue">{staffData.staffCode}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Họ và tên" labelStyle={labelStyle}>
                            {staffData.fullName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính" labelStyle={labelStyle}>
                            {staffData.gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh" labelStyle={labelStyle}>
                            {formatDate(dayjs(staffData.dob).format("YYYY-MM-DD"))}
                        </Descriptions.Item>
                        <Descriptions.Item label="SĐT" labelStyle={labelStyle}>
                            {staffData.phoneNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email" labelStyle={labelStyle}>
                            {staffData.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="CMND/CCCD" labelStyle={labelStyle}>
                            {staffData.IDCard}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dân tộc" labelStyle={labelStyle}>
                            {staffData.nation}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tôn giáo" labelStyle={labelStyle}>
                            {staffData.religion || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={2}>
                            {staffData.address}
                        </Descriptions.Item>
                    </Descriptions>
                </Col>
                <Col span={8}>
                    <Divider orientation="left" plain>
                        Thông tin hệ thống
                    </Divider>
                    <Descriptions bordered layout="horizontal" column={1}>
                        <Descriptions.Item label="Người tạo" labelStyle={labelStyle}>
                            {staffData.createdBy}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo" labelStyle={labelStyle}>
                            {formatDate(staffData.createdAt)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật bởi" labelStyle={labelStyle}>
                            {staffData.updatedBy || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật" labelStyle={labelStyle}>
                            {formatDate(staffData.updatedAt)}
                        </Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>
        </Modal>
    );
};

export default ViewStaffDetails;