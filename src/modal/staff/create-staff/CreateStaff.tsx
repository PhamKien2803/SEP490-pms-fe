import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, DatePicker, Select, Row, Col, Typography } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { CreateStaffData } from "../../../types/staff-management";
import { noSpecialCharactersandNumberRule } from "../../../utils/format";

dayjs.extend(customParseFormat);

interface CreateStaffProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (values: CreateStaffData) => void;
}

interface FormValues {
    fullName: string;
    dob: dayjs.Dayjs | null;
    IDCard: string;
    gender: string;
    address: string;
    nation: string;
    religion: string;
    email: string;
    phoneNumber: string;
    isTeacher: boolean;
}

const { Option } = Select;
const { Title } = Typography;

const CreateStaff: React.FC<CreateStaffProps> = ({
    open,
    loading,
    onClose,
    onSubmit,
}) => {
    const [form] = Form.useForm<FormValues>();
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    useEffect(() => {
        if (!open) {
            form.resetFields();
        } else {
            form.setFieldsValue({
                isTeacher: false,
            } as any);
        }
    }, [open, form]);

    const handleFinish = (values: FormValues) => {
        const formattedDob = values.dob ? values.dob.toISOString() : "";

        const finalValues: CreateStaffData = {
            fullName: values.fullName,
            dob: formattedDob,
            IDCard: values.IDCard,
            email: values.email,
            phoneNumber: values.phoneNumber,
            gender: values.gender,
            address: values.address,
            nation: values.nation,
            religion: values.religion,
            isTeacher: values.isTeacher,
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

    const handleConfirmClose = () => {
        setIsConfirmVisible(false);
        form.resetFields();
        onClose();
    }

    return (
      <>
        <Modal
          title="Tạo mới Hồ sơ Nhân viên"
          open={open}
          onCancel={handleCancel}
          confirmLoading={loading}
          width={990}
          centered
          destroyOnClose
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
              Tạo Hồ sơ
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
          >
            <Row gutter={24}>
              {/* Cột trái */}
              <Col span={12}>
                <Title level={5} style={{ marginTop: 0, color: "#1890ff" }}>
                  Thông tin Cơ bản
                </Title>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="fullName"
                      label="Họ và Tên"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên!" },
                        noSpecialCharactersandNumberRule,
                      ]}
                    >
                      <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="dob"
                      label="Ngày sinh"
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày sinh!" },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            const date = dayjs(value);
                            const today = dayjs();
                            const age = today.diff(date, "year");
                            if (date.isAfter(today, "day"))
                              return Promise.reject(
                                new Error(
                                  "Ngày sinh không được trong tương lai!"
                                )
                              );
                            if (age < 18)
                              return Promise.reject(
                                new Error("Nhân viên phải từ 18 tuổi trở lên!")
                              );
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="IDCard"
                      label="CMND/CCCD/Hộ chiếu"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số định danh!",
                        },
                      ]}
                    >
                      <Input type="number" placeholder="012345678901" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="gender"
                      label="Giới tính"
                      rules={[
                        { required: true, message: "Vui lòng chọn giới tính!" },
                      ]}
                    >
                      <Select placeholder="Chọn giới tính">
                        <Option value="Nam">Nam</Option>
                        <Option value="Nữ">Nữ</Option>
                        <Option value="Khác">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              {/* Cột phải */}
              <Col span={12}>
                <Title level={5} style={{ marginTop: 0, color: "#1890ff" }}>
                  Thông tin Liên hệ & Chuyên môn
                </Title>
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { type: "email", message: "Email không hợp lệ!" },
                        { required: true, message: "Vui lòng nhập email!" },
                      ]}
                    >
                      <Input placeholder="abc@gmail.com" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="phoneNumber"
                      label="Số điện thoại"
                      rules={[
                        {
                          pattern: /^[0-9]{9,11}$/,
                          message: "SĐT phải từ 9-11 chữ số!",
                        },
                        { required: true, message: "Vui lòng nhập SĐT!" },
                      ]}
                    >
                      <Input type="number" placeholder="0912345678" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="isTeacher"
                      label={
                        <span style={{ fontWeight: "bold" }}>
                          Là Giáo viên?
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng xác nhận vai trò!",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn vai trò">
                        <Option value={true}>Có (Giáo viên)</Option>
                        <Option value={false}>Không (Nhân viên khác)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={5} style={{ marginTop: 15, color: "#1890ff" }}>
                  Thông tin Xã hội
                </Title>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="nation"
                      label="Dân tộc"
                      rules={[
                        { required: true, message: "Vui lòng chọn dân tộc!" },
                      ]}
                    >
                      <Select showSearch placeholder="Chọn dân tộc">
                        {[
                          "Kinh",
                          "Tày",
                          "Thái",
                          "Hoa",
                          "Khmer",
                          "Mường",
                          "Nùng",
                          "H'Mông",
                          "Dao",
                          "Gia Rai",
                          "Ê Đê",
                          "Ba Na",
                          "Chăm",
                          "Sán Chay",
                          "Cơ Ho",
                          "Xê Đăng",
                          "Sán Dìu",
                          "Hrê",
                          "Ra Glai",
                          "Mnông",
                          "Thổ",
                          "Stiêng",
                          "Khơ Mú",
                          "Bru - Vân Kiều",
                          "Cơ Tu",
                          "Giáy",
                          "Tà Ôi",
                          "Mạ",
                          "Co",
                          "Chơ Ro",
                          "Xinh Mun",
                          "Hà Nhì",
                          "Chu Ru",
                          "Lào",
                          "La Chí",
                          "La Ha",
                          "Phù Lá",
                          "La Hủ",
                          "Kháng",
                          "Lự",
                          "Lô Lô",
                          "Chứt",
                          "Mảng",
                          "Pà Thẻn",
                          "Co Lao",
                          "Cống",
                          "Bố Y",
                          "Si La",
                          "Pu Péo",
                          "Brâu",
                          "Ơ Đu",
                          "Rơ Măm",
                        ].map((ethnic) => (
                          <Option key={ethnic} value={ethnic}>
                            {ethnic}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="religion"
                      label="Tôn giáo"
                      rules={[
                        { required: true, message: "Vui lòng chọn tôn giáo!" },
                      ]}
                    >
                      <Select placeholder="Có hoặc Không">
                        <Option value="Không">Không</Option>
                        <Option value="Có">Có</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="address"
                      label="Địa chỉ Thường trú"
                      rules={[
                        { required: true, message: "Vui lòng nhập địa chỉ!" },
                      ]}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal
          title="Bạn có chắc muốn hủy?"
          open={isConfirmVisible}
          onOk={handleConfirmClose}
          onCancel={() => setIsConfirmVisible(false)}
          okText="Đồng ý"
          cancelText="Không"
          okButtonProps={{ danger: true }}
        >
          <p>
            Các thay đổi bạn đã nhập sẽ <strong>không</strong> được lưu lại.
          </p>
        </Modal>
      </>
    );
};

export default CreateStaff;