import React, { useCallback } from "react";
import { Modal, Descriptions, Divider, Tag, Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { StudentRecord } from "../../../types/student-management";
import dayjs from "dayjs";
import { enrollmentApis } from "../../../services/apiServices";
import { toast } from "react-toastify";

interface ViewStudentDetailsProps {
  open: boolean;
  onClose: () => void;
  studentData: StudentRecord | null;
}

const ViewStudentDetails: React.FC<ViewStudentDetailsProps> = ({
  open,
  onClose,
  studentData,
}) => {
  if (!studentData) {
    return null;
  }

  const handleViewPDF = useCallback(async (fileId: string) => {
    try {
      const arrayBuffer = await enrollmentApis.getPDFById(fileId);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      typeof error === "string"
        ? toast.warn(error)
        : toast.error("Không thể mở file PDF.");
    }
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const formatGender = (gender?: string) => {
    if (gender === "Nam") return "Nam";
    if (gender === "Nữ") return "Nữ";
    return "Khác";
  };

  const labelStyle = { width: "120px" };
  const contentStyle = { width: "30%" };

  return (
    <Modal
      title={`Thông tin chi tiết học sinh: ${studentData.fullName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered={true}
      bodyStyle={{ maxHeight: "75vh", overflowY: "auto" }}
    >
      <Divider orientation="left" plain>
        Thông tin cá nhân
      </Divider>
      <Descriptions bordered layout="horizontal" column={2}>
        {/* Sử dụng labelStyle và contentStyle ở đây */}
        <Descriptions.Item
          label="Mã học sinh"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          <Tag color="blue">{studentData.studentCode}</Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label="Họ và tên"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {studentData.fullName}
        </Descriptions.Item>

        <Descriptions.Item
          label="Giới tính"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {formatGender(studentData.gender)}
        </Descriptions.Item>
        <Descriptions.Item
          label="Ngày sinh"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {formatDate(studentData.dob)}
        </Descriptions.Item>

        <Descriptions.Item
          label="CMND/CCCD"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {studentData.idCard}
        </Descriptions.Item>
        <Descriptions.Item
          label="Quốc tịch"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {studentData.nation}
        </Descriptions.Item>

        <Descriptions.Item
          label="Tôn giáo"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {studentData.religion || "-"}
        </Descriptions.Item>
        {/* Địa chỉ span={2} nên không cần labelStyle cho mục này */}
        <Descriptions.Item label="Địa chỉ" span={2}>
          {studentData.address}
        </Descriptions.Item>
        <Descriptions.Item
          label="Giấy khai sinh"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            onClick={() => handleViewPDF(studentData.birthCertId)}
          >
            Giấy khai sinh.pdf
          </Button>
        </Descriptions.Item>

        <Descriptions.Item
          label="Giấy khám sức khỏe"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            onClick={() => handleViewPDF(studentData.healthCertId)}
          >
            Giấy khám sức khỏe.pdf
          </Button>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" plain style={{ marginTop: 32 }}>
        Thông tin hệ thống
      </Divider>
      <Descriptions bordered layout="horizontal" column={2}>
        {/* Áp dụng tương tự cho phần Thông tin hệ thống */}
        <Descriptions.Item
          label="Người tạo"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {studentData.createdBy}
        </Descriptions.Item>
        <Descriptions.Item
          label="Ngày tạo"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {formatDate(studentData.createdAt)}
        </Descriptions.Item>

        <Descriptions.Item
          label="Cập nhật lần cuối bởi"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {studentData.updatedBy || "-"}
        </Descriptions.Item>
        <Descriptions.Item
          label="Ngày cập nhật"
          labelStyle={labelStyle}
          contentStyle={contentStyle}
        >
          {formatDate(studentData.updatedAt)}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewStudentDetails;
