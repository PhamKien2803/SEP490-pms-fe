import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import {
  PlusOutlined,
  CloseCircleOutlined,
  SaveOutlined,
  UserOutlined,
  PhoneOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { IGuardianForm, IGuardianPayload } from "../../../types/guardians";
import { guardianApis } from "../../../services/apiServices";

const convertFormToPayload = (
  formData: IGuardianForm,
  parentId: string
): IGuardianPayload => {
  return {
    ...formData,
    parentId: parentId,
  } as IGuardianPayload;
};
const ACCENT_COLOR = "#1890ff";

const { Title, Text } = Typography;
const { Option } = Select;

interface CreateGuardianProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedStudentId: string | null;
  parentId: string | undefined;
  canCreate: boolean;
}

const CreateGuardian: React.FC<CreateGuardianProps> = ({
  open,
  onClose,
  onSuccess,
  selectedStudentId,
  parentId,
  canCreate,
}) => {
  const [form] = Form.useForm<IGuardianForm>();
  const [isConfirmCancelVisible, setIsConfirmCancelVisible] = useState(false);

  const finalizeCloseModal = () => {
    onClose();
    setIsConfirmCancelVisible(false);
    form.resetFields();
  };

  const handleCloseModal = () => {
    if (form.isFieldsTouched()) {
      setIsConfirmCancelVisible(true);
    } else {
      finalizeCloseModal();
    }
  };

  const handleFormSubmit = async (values: IGuardianForm) => {
    if (!selectedStudentId || !parentId) {
      toast.error("Lỗi dữ liệu: Không tìm thấy ID học sinh hoặc phụ huynh.");
      return;
    }

    if (!canCreate) {
      toast.error("Bạn không có quyền tạo mới.");
      return;
    }

    const payload = convertFormToPayload(values, parentId);

    try {
      await guardianApis.createGuardian(payload);
      toast.success("Thêm người đưa đón mới thành công!");
      onSuccess();
    } catch (error: any) {
      const errorMessage = error || "Thực hiện thất bại: Thêm mới.";
      toast.error(errorMessage);
    }
  };

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        studentId: selectedStudentId,
        parentId: parentId,
      } as Partial<IGuardianForm>);
    }
  }, [open, selectedStudentId, parentId, form]);

  return (
    <>
      <Modal
        title={
          <Title level={4} style={{ margin: 0, color: ACCENT_COLOR }}>
            <PlusOutlined style={{ marginRight: 8 }} /> Thêm Người Đưa Đón Mới
          </Title>
        }
        open={open}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        closeIcon={<CloseCircleOutlined style={{ color: ACCENT_COLOR }} />}
        destroyOnClose
      >
        <Divider style={{ margin: "10px 0 20px 0" }} />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ active: true }}
          autoComplete="off"
        >
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ tên người đưa đón!",
              },
            ]}
            tooltip="Nhập họ và tên đầy đủ của người được ủy quyền đưa đón"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ví dụ: Nguyễn Văn A"
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dob"
                label="Ngày sinh"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  placeholder="Ngày/Tháng/Năm"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="09xxxxxxxx"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="relationship"
                label="Mối quan hệ"
                rules={[
                  { required: true, message: "Vui lòng chọn mối quan hệ!" },
                ]}
              >
                <Select placeholder="Chọn quan hệ" size="large">
                  {[
                    "Ông",
                    "Bà",
                    "Cô",
                    "Dì",
                    "Chú",
                    "Bác",
                    "Bạn bố mẹ",
                    "Anh",
                    "Chị",
                    "Khác",
                  ].map((rel) => (
                    <Option key={rel} value={rel}>
                      {rel}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="relationshipDetail"
                label="Chi tiết quan hệ"
                tooltip="Ví dụ: Cô ruột, Chú họ, Bạn thân của mẹ..."
              >
                <Input placeholder="Chi tiết (Không bắt buộc)" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: "10px 0 20px 0" }}>
            <Text strong style={{ color: ACCENT_COLOR }}>
              <TeamOutlined style={{ marginRight: 8 }} /> Thời Gian Ủy Quyền
            </Text>
          </Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="pickUpDate"
                label="Ngày Bắt Đầu Ủy Quyền"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày ủy quyền!" },
                ]}
                tooltip="Ngày người này bắt đầu được phép đưa đón"
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  placeholder="Ngày bắt đầu"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="note"
            label="Ghi chú"
            tooltip="Ghi chú quan trọng về việc đưa đón (Ví dụ: Chỉ đón vào thứ 5, Cần mang theo CMND)"
          >
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú chi tiết (Không bắt buộc)"
            />
          </Form.Item>

          <Form.Item name="studentId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="parentId" hidden>
            <Input />
          </Form.Item>

          <Divider style={{ margin: "20px 0 10px 0" }} />
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCloseModal}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                style={{
                  backgroundColor: ACCENT_COLOR,
                  borderColor: ACCENT_COLOR,
                }}
                disabled={!canCreate}
              >
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Bạn có chắc muốn hủy?"
        open={isConfirmCancelVisible}
        onOk={finalizeCloseModal}
        onCancel={() => setIsConfirmCancelVisible(false)}
        okText="Đồng ý"
        cancelText="Không"
        okButtonProps={{ danger: true }}
      >
        <p>Các thay đổi bạn đang thực hiện sẽ không được lưu lại.</p>
      </Modal>
    </>
  );
};

export default CreateGuardian;
