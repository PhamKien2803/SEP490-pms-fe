import React, { useEffect, useState } from "react";
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
    toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
  };

  const handleCancel = () => {
    if (form.isFieldsTouched(false)) {
      setIsConfirmVisible(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => setIsConfirmVisible(false);

  const handleConfirmOk = () => {
    setIsConfirmVisible(false);
    onClose();
  };

  return (
    <>
      <Modal
        title="Tạo mới Phụ huynh"
        open={open}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
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
          autoComplete="off"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                  { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
                  { max: 100, message: "Tên phải ít hơn 100 ký tự!" },
                ]}
              >
                <Input placeholder="Ví dụ: Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                name="dob"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
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
                <Input placeholder="Ví dụ: Kinh" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="IDCard"
                label="CMND/CCCD"
                rules={[
                  { required: true, message: "Vui lòng nhập CMND/CCCD!" },
                  {
                    pattern: /^[0-9]{9,12}$/,
                    message: "CMND/CCCD hợp lệ có 9 hoặc 12 chữ số!",
                  },
                ]}
              >
                <Input placeholder="Nhập 9 hoặc 12 số" />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  {
                    pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input placeholder="Ví dụ: 0987654321" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: "email", message: "Định dạng email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Ví dụ: example@gmail.com" />
              </Form.Item>

              <Form.Item name="religion" label="Tôn giáo">
                <Input placeholder="Ví dụ: Không" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={2} placeholder="Nhập số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận hủy"
        open={isConfirmVisible}
        onOk={handleConfirmOk}
        onCancel={handleConfirmCancel}
        okText="Đồng ý"
        cancelText="Không"
        keyboard={false}
      >
        <p>Các thay đổi của bạn sẽ không được lưu. Bạn có chắc muốn hủy không?</p>
      </Modal>
    </>
  );
};

export default CreateParent;