import React, { useEffect, useState } from "react";
// THAY ĐỔI: Import thêm Row và Col
import { Modal, Form, Input, Button, DatePicker, Select, Row, Col } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export interface CreateParentFormDto {
  fullName: string;
  dob: string;
  phoneNumber?: string;
  email?: string;
  IDCard: string;
  gender: "male" | "female" | "other";
  address?: string;
  students?: string[];
  nation?: string;
  religion?: string;
}

interface CreateParentProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: CreateParentFormDto) => void | Promise<void>;
}

const CreateParent: React.FC<CreateParentProps> = ({
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<CreateParentFormDto>();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = (values: CreateParentFormDto) => {
    const finalValues: CreateParentFormDto = {
      ...values,
      dob: dayjs(values.dob).toISOString(),
    };
    onSubmit(finalValues);
  };

  const handleFinishFailed = () => {
    toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
  };

  const handleCancel = () => {
    if (form.isFieldsTouched()) {
      setIsConfirmVisible(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal
        title="Tạo mới Phụ huynh"
        open={open}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800} // Tăng chiều rộng Modal để có không gian cho 2 cột
        footer={[
          <Button key="back" onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            Tạo
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
        >
          {/* THAY ĐỔI: Sử dụng Row và Col để chia layout */}
          <Row gutter={24}>
            {/* Cột trái */}
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                  { min: 2, message: "Tên phải ít nhất 2 ký tự!" },
                  { max: 100, message: "Tên phải ít hơn 100 ký tự!" },
                ]}
              >
                <Input placeholder="e.g., Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                name="dob"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                />
              </Form.Item>
              
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="male">Nam</Select.Option>
                  <Select.Option value="female">Nữ</Select.Option>
                  <Select.Option value="other">Khác</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="nation" label="Dân tộc">
                <Input placeholder="e.g., Kinh" />
              </Form.Item>
            </Col>

            {/* Cột phải */}
            <Col span={12}>
              <Form.Item
                name="IDCard"
                label="CMND/CCCD"
                rules={[
                  { required: true, message: "Vui lòng nhập CMND/CCCD!" },
                  {
                    pattern: /^[0-9]{9,12}$/,
                    message: "CMND/CCCD phải từ 9-12 chữ số!",
                  },
                ]}
              >
                <Input placeholder="e.g., 123456789" />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  {
                    pattern: /^[0-9]{9,11}$/,
                    message: "Số điện thoại phải từ 9-11 chữ số!",
                  },
                ]}
              >
                <Input placeholder="e.g., 0987654321" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: "email", message: "Định dạng email không hợp lệ!" },
                ]}
              >
                <Input placeholder="e.g., example@gmail.com" />
              </Form.Item>

              <Form.Item name="religion" label="Tôn giáo">
                <Input placeholder="e.g., Không" />
              </Form.Item>
            </Col>

            {/* Mục địa chỉ chiếm toàn bộ chiều rộng */}
            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Bạn có chắc muốn hủy?"
        open={isConfirmVisible}
        onOk={() => {
          setIsConfirmVisible(false);
          onClose();
        }}
        onCancel={() => setIsConfirmVisible(false)}
        okText="Đồng ý"
        cancelText="Không"
      >
        <p>Các thay đổi sẽ không được lưu lại.</p>
      </Modal>
    </>
  );
};

export default CreateParent;