import React from "react";
import { Modal, Button } from "antd";

interface ModalConfirmProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  title,
  open,
  loading,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      title="Xác nhận xóa"
      open={open}
      onCancel={onClose}
      confirmLoading={loading}
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          onClick={onConfirm}
        >
          Xóa
        </Button>,
      ]}
    >
      <p>
        {title ||
          "Bạn có chắc chắn muốn xóa chức năng này không? Hành động này không thể hoàn tác."}
      </p>
    </Modal>
  );
};

export default ModalConfirm;
