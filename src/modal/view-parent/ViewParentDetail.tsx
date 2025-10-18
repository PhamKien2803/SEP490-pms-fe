import React from "react";
import { Modal, Descriptions, Divider, Tag } from "antd";
import { Parent } from "../../types/auth";

interface ViewParentDetailsProps {
  open: boolean;
  onClose: () => void;
  parentData: Parent | null;
}

const ViewParentDetails: React.FC<ViewParentDetailsProps> = ({
  open,
  onClose,
  parentData,
}) => {
  if (!parentData) {
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

  const formatGender = (gender?: string) => {
    if (gender === "male") return "Nam";
    if (gender === "female") return "Nữ";
    return "Khác";
  };

  return (
    <Modal
      title={`Thông tin chi tiết phụ huynh: ${parentData.fullName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Divider orientation="left" plain>
        Thông tin cá nhân
      </Divider>
      <Descriptions bordered layout="horizontal" column={2}>
        <Descriptions.Item label="Mã phụ huynh">
          <Tag color="blue">{parentData.parentCode}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Họ và tên">
          {parentData.fullName}
        </Descriptions.Item>

        <Descriptions.Item label="Giới tính">
          {formatGender(parentData.gender)}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {parentData.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{parentData.email}</Descriptions.Item>

        <Descriptions.Item label="CMND/CCCD">
          {parentData.IDCard}
        </Descriptions.Item>
        <Descriptions.Item label="Quốc tịch">
          {parentData.nation}
        </Descriptions.Item>

        <Descriptions.Item label="Tôn giáo">
          {parentData.religion || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          {parentData.address}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" plain style={{ marginTop: 32 }}>
        Thông tin hệ thống
      </Divider>
      <Descriptions bordered layout="horizontal" column={2}>
        <Descriptions.Item label="Người tạo">
          {parentData.createdBy}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {formatDate(parentData.createdAt)}
        </Descriptions.Item>

        <Descriptions.Item label="Cập nhật lần cuối bởi">
          {parentData.updatedBy || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">
          {formatDate(parentData.updatedAt)}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewParentDetails;