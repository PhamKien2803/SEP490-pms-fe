// src/modal/view-parent-details/ViewParentDetails.tsx
import React from "react";
import { Modal, Descriptions } from "antd";
import { Parent } from "../../types/auth"; // Điều chỉnh đường dẫn nếu cần

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
      title={`Thông tin chi tiết: ${parentData.fullName}`}
      open={open}
      onCancel={onClose}
      footer={null} // Không cần nút OK/Cancel vì chỉ xem
      width={800}
    >
      <Descriptions bordered layout="vertical">
        <Descriptions.Item label="Mã phụ huynh">
          {parentData.parentCode}
        </Descriptions.Item>
        <Descriptions.Item label="Họ và tên">
          {parentData.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {formatDate(parentData.dob)}
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
          {parentData.religion}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={3}>
          {parentData.address}
        </Descriptions.Item>
        <Descriptions.Item label="Người tạo">
          {parentData.createdBy}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {formatDate(parentData.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật lần cuối bởi">
          {parentData.updatedBy || "-"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewParentDetails;