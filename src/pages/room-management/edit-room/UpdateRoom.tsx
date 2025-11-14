import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Form,
  Input,
  Space,
  InputNumber,
  Tooltip,
  Modal,
  Spin,
  Tag,
  Descriptions,
} from "antd";
import {
  RollbackOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  ReadOutlined,
  ToolOutlined,
  TagOutlined,
  CheckCircleOutlined,
  FormOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  SendOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { constants } from "../../../constants";
import { roomApis } from "../../../services/apiServices";
import {
  RoomRecord,
  RoomFacility,
  RoomState,
} from "../../../types/room-management";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { noSpecialCharactersandNumberRule, noSpecialCharactersRule } from "../../../utils/format";

const { Title, Text } = Typography;
const { Item } = Descriptions;
const { TextArea } = Input;

const getStateTagColor = (state: RoomState) => {
  switch (state) {
    case "Hoàn thành":
      return "green";
    case "Chờ nhân sự xác nhận":
      return "blue";
    case "Chờ giáo viên duyệt":
      return "orange";
    case "Chờ xử lý":
      return "gold";
    case "Dự thảo":
      return "default";
    default:
      return "default";
  }
};

const FacilityInputRow: React.FC<{
  field: any;
  remove: (index: number) => void;
  isEditing: boolean;
  roomState: RoomState | undefined;
}> = ({ field, remove, isEditing, roomState }) => {
  const isGeneralEditable = isEditing && roomState === "Dự thảo";
  const isDefectMissingEditable =
    isEditing &&
    (roomState === "Chờ giáo viên duyệt" || roomState === "Hoàn thành");

  const disabledFacilityName = !isGeneralEditable;
  const disabledFacilityType = !isGeneralEditable;
  const disabledQuantity = !isGeneralEditable;

  const disabledNotes = !isGeneralEditable && !isDefectMissingEditable;
  const disabledDefectMissing = !isDefectMissingEditable;
  const isRemovable = isGeneralEditable;

  const { name, fieldKey } = field;
  const facilities = Form.useWatch("facilities");

  const currentFacility = facilities?.[name];
  const totalQuantity = currentFacility?.quantity ?? 0;
  const currentQuantityDefect = currentFacility?.quantityDefect ?? 0;
  const currentQuantityMissing = currentFacility?.quantityMissing ?? 0;

  const maxMissing = totalQuantity - currentQuantityDefect;
  const maxDefectWhileEditingMissing = totalQuantity - currentQuantityMissing;

  const validateQuantityDefect = (
    _: any,
    value: number | undefined
  ): Promise<void> => {
    if (value !== undefined && value + currentQuantityMissing > totalQuantity) {
      return Promise.reject(
        new Error(
          `Hỏng/Lỗi (${value}) + Thiếu (${currentQuantityMissing}) không được vượt quá Tổng (${totalQuantity})`
        )
      );
    }
    return Promise.resolve();
  };

  const validateQuantityMissing = (
    _: any,
    value: number | undefined
  ): Promise<void> => {
    if (value !== undefined && value + currentQuantityDefect > totalQuantity) {
      return Promise.reject(
        new Error(
          `Thiếu (${value}) + Hỏng/Lỗi (${currentQuantityDefect}) không được vượt quá Tổng (${totalQuantity})`
        )
      );
    }
    return Promise.resolve();
  };

  return (
    <Row
      key={field.key}
      gutter={[12, 12]}
      align="top"
      style={{
        marginBottom: 16,
        padding: "12px",
        border: "1px solid #e8e8e8",
        borderRadius: 4,
        backgroundColor: isEditing ? "#fffbe6" : "#f7f7f7",
      }}
    >
      <Col xs={24} sm={10} md={6}>
        <Form.Item
          {...field}
          name={[name, "facilityName"]}
          fieldKey={[fieldKey, "facilityName"]}
          label={
            <Space>
              <TagOutlined /> Tên thiết bị
            </Space>
          }
          rules={[{ required: true, message: "Nhập tên thiết bị" }, noSpecialCharactersandNumberRule]}
        >
          <Input
            placeholder="Ví dụ: Bàn học trẻ em"
            disabled={disabledFacilityName}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={7} md={5}>
        <Form.Item
          {...field}
          name={[name, "facilityType"]}
          fieldKey={[fieldKey, "facilityType"]}
          label={
            <Space>
              <ToolOutlined /> Loại
            </Space>
          }
          rules={[{ required: true, message: "Nhập loại thiết bị" }, noSpecialCharactersandNumberRule]}
        >
          <Input
            placeholder="Ví dụ: Nội thất"
            disabled={disabledFacilityType}
          />
        </Form.Item>
      </Col>

      <Col xs={8} sm={3} md={3}>
        <Form.Item
          {...field}
          name={[name, "quantity"]}
          fieldKey={[fieldKey, "quantity"]}
          label="SL Tổng"
          rules={[{ required: true, message: "Nhập SL" }]}
        >
          <InputNumber
            type="number"
            min={1}
            style={{ width: "100%" }}
            placeholder="10"
            disabled={disabledQuantity}
          />
        </Form.Item>
      </Col>
      <Col xs={8} sm={4} md={3}>
        <Form.Item
          {...field}
          name={[name, "quantityDefect"]}
          fieldKey={[fieldKey, "quantityDefect"]}
          label="Hỏng/Lỗi"
          rules={[
            { required: true, message: "Nhập SL hỏng" },
            {
              validator: validateQuantityDefect,
            },
          ]}
          validateTrigger={["onChange", "onBlur"]}
        >
          <InputNumber
            type="number"
            min={0}
            max={maxDefectWhileEditingMissing}
            style={{ width: "100%" }}
            placeholder="0"
            disabled={disabledDefectMissing}
          />
        </Form.Item>
      </Col>
      <Col xs={8} sm={4} md={3}>
        <Form.Item
          {...field}
          name={[name, "quantityMissing"]}
          fieldKey={[fieldKey, "quantityMissing"]}
          label="Thiếu"
          rules={[
            { required: true, message: "Nhập SL thiếu" },
            {
              validator: validateQuantityMissing,
            },
          ]}
          validateTrigger={["onChange", "onBlur"]}
        >
          <InputNumber
            type="number"
            min={0}
            max={maxMissing}
            style={{ width: "100%" }}
            placeholder="0"
            disabled={disabledDefectMissing}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={3}>
        <Form.Item
          {...field}
          name={[name, "notes"]}
          fieldKey={[fieldKey, "notes"]}
          label="Ghi chú"
        >
          <Input
            placeholder="Ghi chú tình trạng thiết bị"
            disabled={disabledNotes}
          />
        </Form.Item>
      </Col>

      <Col xs={2} md={1} style={{ textAlign: "center" }}>
        <Form.Item label="Xóa">
          {isRemovable ? (
            <Tooltip title="Xóa thiết bị này">
              <MinusCircleOutlined
                onClick={() => remove(name)}
                style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Chỉ được xóa ở trạng thái Dự thảo">
              <MinusCircleOutlined style={{ color: "#bfbfbf", fontSize: 18 }} />
            </Tooltip>
          )}
        </Form.Item>
      </Col>
    </Row>
  );
};

const UpdateRoom: React.FC = () => {
  usePageTitle('Cập nhật phòng học - Cá Heo Xanh');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [form] = Form.useForm();
  const [roomDetail, setRoomDetail] = useState<RoomRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);
  const isHRStaff = !user?.isTeacher || user?.isAdmin;
  const isTeacher = user?.isTeacher || user?.isAdmin;

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [isDataDirty, setIsDataDirty] = useState(false);

  const [initialValues, setInitialValues] = useState<any>(null);

  const cleanDataForComparison = (values: any) => {
    return JSON.parse(
      JSON.stringify({
        roomName: values.roomName,
        roomType: values.roomType,
        capacity: values.capacity,
        notes: values.notes || "",
        notesHRA: values.notesHRA || "",
        facilities: values.facilities
          ? values.facilities
            .filter((f: any) => f)
            .map((f: any) => ({
              facilityName: f.facilityName,
              facilityType: f.facilityType,
              quantity: f.quantity,
              quantityDefect: f.quantityDefect || 0,
              quantityMissing: f.quantityMissing || 0,
              notes: f.notes || "",
            }))
          : [],
      })
    );
  };

  const onFieldsChange = useCallback(() => {
    if (!isEditing || !initialValues) {
      setIsDataDirty(false);
      return;
    }

    const currentValues = form.getFieldsValue(true);

    const cleanCurrent = cleanDataForComparison(currentValues);
    const cleanInitial = cleanDataForComparison(initialValues);

    const areDataDifferent =
      JSON.stringify(cleanCurrent) !== JSON.stringify(cleanInitial);

    setIsDataDirty(areDataDifferent);
  }, [form, isEditing, initialValues]);

  const fetchRoomDetail = useCallback(
    async (roomId: string) => {
      setLoading(true);
      try {
        const response: RoomRecord = await roomApis.getRoomById(roomId || "");

        const initial = cleanDataForComparison({
          ...response,
          facilities: response.facilities || [],
          notes: response.notes || "",
          notesHRA: response.notesHRA || "",
        });

        setRoomDetail(response);
        setInitialValues(initial);

        form.setFieldsValue({ ...initial, state: response.state });

        setIsEditing(false);
        setIsDataDirty(false);
      } catch (error) {
        typeof error === "string" ? toast.info(error) : toast.error("Tải chi tiết phòng học thất bại.");
        setRoomDetail(null);
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  useEffect(() => {
    if (id) {
      fetchRoomDetail(id);
    }
  }, [id, fetchRoomDetail]);

  const handleSubmit = async (
    values: any,
    newState: RoomState | null = null,
    hraNotes: string | null = null
  ) => {
    if (!roomDetail || !id) return;

    setIsSaving(true);
    const currentState = roomDetail.state;
    let nextState: RoomState = currentState;

    if (newState) {
      nextState = newState;
    }

    try {
      const cleanedFacilities: RoomFacility[] = values.facilities
        ? values.facilities
          .filter(
            (facility: any) =>
              facility.facilityName &&
              facility.facilityName.trim() !== "" &&
              facility.quantity &&
              facility.quantity > 0
          )
          .map((facility: any) => {
            const totalQuantity = facility.quantity;
            let quantityDefect = facility.quantityDefect || 0;
            let quantityMissing = facility.quantityMissing || 0;

            if (quantityDefect + quantityMissing > totalQuantity) {
              if (quantityDefect > totalQuantity) {
                quantityDefect = totalQuantity;
                quantityMissing = 0;
              } else {
                quantityMissing = totalQuantity - quantityDefect;
              }
            }

            return {
              facilityName: facility.facilityName,
              facilityType: facility.facilityType,
              quantity: totalQuantity,
              quantityDefect: quantityDefect,
              quantityMissing: quantityMissing,
              notes: facility.notes || "",
            };
          })
        : [];

      if (cleanedFacilities.length === 0) {
        toast.warn("Vui lòng thêm ít nhất một Thiết bị/Tài sản hợp lệ.");
        setIsSaving(false);
        return;
      }

      const payload = {
        roomName: values.roomName,
        roomType: values.roomType,
        capacity: values.capacity,
        facilities: cleanedFacilities,
        state: nextState,
        notes: values.notes || "",
        notesHRA:
          nextState === "Chờ giáo viên duyệt" &&
            currentState === "Chờ nhân sự xác nhận" &&
            hraNotes
            ? hraNotes
            : values.notesHRA || "",
        createdBy: roomDetail.createdBy,
        updatedBy: "Admin",
      };

      await roomApis.updateRoom(id, payload);
      toast.success(`Cập nhật Phòng học "${payload.roomName}" thành công! `);

      const newInitial = cleanDataForComparison({
        ...payload,
        facilities: cleanedFacilities,
      });

      setInitialValues(newInitial);
      setIsDataDirty(false);
      setIsEditing(false);

      await fetchRoomDetail(id);

      setIsRejectModalVisible(false);
      setRejectReason("");
    } catch (error: any) {
      typeof error === "string" ? toast.info(error) : toast.error("Cập nhật phòng học thất bại. Vui lòng kiểm tra dữ liệu và thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (isDataDirty) {
      setIsCancelConfirmVisible(true);
    } else {
      setIsEditing(false);
      setIsDataDirty(false);
    }
  };

  const handleConfirmCancel = () => {
    setIsCancelConfirmVisible(false);
    setIsEditing(false);
    setIsDataDirty(false);
    if (initialValues) {
      form.setFieldsValue({ ...initialValues, state: roomDetail?.state });
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    handleSubmit(
      form.getFieldsValue(),
      "Chờ giáo viên duyệt",
      rejectReason.trim()
    );
  };

  const isRoomInfoEditable = roomDetail?.state === "Dự thảo";
  const isFacilityGeneralEditable = roomDetail?.state === "Dự thảo";

  const renderActionButtons = () => {
    const currentState = roomDetail?.state;

    if (isEditing) {
      let confirmButton: React.ReactNode = null;

      const confirmDisabled = isSaving;

      if (currentState === "Dự thảo") {
        confirmButton = (
          <Tooltip
            title={
              isSaving
                ? "Đang lưu..."
                : "Chuyển trạng thái sang Chờ giáo viên duyệt"
            }
          >
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() =>
                handleSubmit(form.getFieldsValue(), "Chờ giáo viên duyệt")
              }
              disabled={confirmDisabled}
              loading={isSaving}
            >
              Xác Nhận & Chờ GV Duyệt
            </Button>
          </Tooltip>
        );
      }
      return isHRStaff ? <Space>{confirmButton}</Space> : null;
    }

    switch (currentState) {
      case "Dự thảo":
        return (
          <Space>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => {
                setIsEditing(true);
              }}
              disabled={isSaving}
            >
              Chỉnh Sửa Hồ sơ
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() =>
                handleSubmit(form.getFieldsValue(), "Chờ giáo viên duyệt")
              }
              loading={isSaving}
              disabled={isSaving}
            >
              Xác Nhận & Chờ GV Duyệt
            </Button>
          </Space>
        );
      case "Chờ giáo viên duyệt":
        return isTeacher ? (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setIsEditing(true);
              }}
              disabled={isSaving}
            >
              Chỉnh Sửa Hỏng/Thiếu
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleSubmit(form.getFieldsValue(), "Hoàn thành")}
              loading={isSaving}
              disabled={isSaving}
            >
              Xác nhận hoàn thành
            </Button>
          </Space>
        ) : null;
      case "Chờ nhân sự xác nhận":
        return isHRStaff ? (
          <Space>
            <Button
              type="primary"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setIsRejectModalVisible(true)}
              disabled={isSaving}
            >
              Từ Chối
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleSubmit(form.getFieldsValue(), "Chờ xử lý")}
              loading={isSaving}
              disabled={isSaving}
            >
              Xác Nhận
            </Button>
          </Space>
        ) : null;
      case "Hoàn thành":
        return null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <Spin tip="Đang tải chi tiết phòng học..." size="large" />
      </div>
    );
  }

  if (!roomDetail) {
    return (
      <div style={{ padding: "24px" }}>
        <Title level={3}>
          <ArrowLeftOutlined
            onClick={() => navigate(`${constants.APP_PREFIX}/rooms`)}
            style={{ marginRight: 16, cursor: "pointer" }}
          />
          Không tìm thấy Phòng Học
        </Title>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 24px" }}>
      <Title level={3} style={{ marginBottom: 20 }}>
        <ArrowLeftOutlined
          onClick={() => navigate(`${constants.APP_PREFIX}/rooms`)}
          style={{ marginRight: 16, cursor: "pointer", color: "#0050b3" }}
        />
        Chỉnh Sửa Phòng Học: {roomDetail.roomName}
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => handleSubmit(values, null)}
        onFieldsChange={onFieldsChange}
      >
        <Card
          title={
            <Title level={4} style={{ margin: 0, padding: "10px 0" }}>
              <FormOutlined style={{ marginRight: 8 }} /> Hồ sơ Phòng học
            </Title>
          }
          bordered={false}
          extra={renderActionButtons()}
          style={{
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            marginBottom: 24,
            borderRadius: 8,
          }}
        >
          <Title
            level={5}
            style={{
              marginBottom: 16,
              borderLeft: "3px solid #1890ff",
              paddingLeft: 8,
            }}
          >
            <HomeOutlined /> Thông tin cơ bản
          </Title>
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item
                label={
                  <Space>
                    <TagOutlined /> Tên Phòng
                  </Space>
                }
                name="roomName"
                rules={[{ required: true, message: "Vui lòng nhập tên phòng" }, noSpecialCharactersRule]}
              >
                <Input disabled={!isEditing || !isRoomInfoEditable} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label={
                  <Space>
                    <ToolOutlined /> Loại Phòng
                  </Space>
                }
                name="roomType"
                rules={[
                  { required: true, message: "Vui lòng nhập loại phòng" }, noSpecialCharactersRule,
                ]}
              >
                <Input disabled={!isEditing || !isRoomInfoEditable} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label={
                  <Space>
                    <UsergroupAddOutlined /> Sức Chứa Tối Đa
                  </Space>
                }
                name="capacity"
                rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
              >
                <InputNumber
                  type="number"
                  min={1}
                  style={{ width: "100%" }}
                  disabled={!isEditing || !isRoomInfoEditable}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label={
                  <Space>
                    <CheckCircleOutlined /> Trạng Thái
                  </Space>
                }
                name="state"
              >
                <Tag
                  color={getStateTagColor(roomDetail.state)}
                  icon={<CheckCircleOutlined />}
                  style={{ fontSize: 13, padding: "4px 8px" }}
                >
                  {roomDetail.state}
                </Tag>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    <ReadOutlined /> Ghi Chú (Chung)
                  </Space>
                }
                name="notes"
              >
                <TextArea
                  rows={2}
                  disabled={!isEditing || !isRoomInfoEditable}
                />
              </Form.Item>
            </Col>

            {roomDetail.notesHRA && (
              <Col span={24}>
                <Form.Item
                  label={
                    <Space>
                      <CloseCircleOutlined style={{ color: "red" }} /> Lý Do Từ
                      Chối (NS)
                    </Space>
                  }
                  name="notesHRA"
                >
                  <TextArea
                    rows={2}
                    disabled={true}
                    style={{ backgroundColor: "#fff2f0" }}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
          <Descriptions column={3} size="small" style={{ marginTop: 10 }}>
            <Item label={<Text strong>Người Cập Nhật Cuối</Text>}>
              {roomDetail.updatedBy}
            </Item>
            <Item label={<Text strong>Ngày Cập Nhật</Text>}>
              {dayjs(roomDetail.updatedAt).format("DD/MM/YYYY HH:mm")}
            </Item>
          </Descriptions>

          <Title
            level={5}
            style={{
              marginTop: 30,
              marginBottom: 16,
              borderLeft: "3px solid #faad14",
              paddingLeft: 8,
            }}
          >
            <ToolOutlined /> Chi tiết Thiết bị/Tài sản
          </Title>
          <Form.List name="facilities">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <FacilityInputRow
                    key={field.key}
                    field={field}
                    remove={remove}
                    isEditing={isEditing}
                    roomState={roomDetail.state}
                  />
                ))}
                {isEditing && isFacilityGeneralEditable && (
                  <Button
                    type="dashed"
                    onClick={() =>
                      add({
                        facilityName: undefined,
                        facilityType: undefined,
                        quantity: undefined,
                        quantityDefect: 0,
                        quantityMissing: 0,
                        notes: "",
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    Thêm Thiết bị/Tài sản
                  </Button>
                )}
                {fields.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 0",
                      color: "#8c8c8c",
                    }}
                  >
                    Chưa có thiết bị nào được thêm.
                  </div>
                )}
              </>
            )}
          </Form.List>

          {isEditing && (
            <Row
              justify="end"
              style={{
                marginTop: 30,
                paddingTop: 16,
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Space>
                <Button
                  icon={<RollbackOutlined />}
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Hủy Chỉnh Sửa
                </Button>
                {roomDetail?.state === "Dự thảo" ? (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() =>
                      handleSubmit(form.getFieldsValue(), "Dự thảo")
                    }
                    loading={isSaving}
                    disabled={isSaving || !isDataDirty}
                  >
                    Lưu chỉnh sửa
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() =>
                      handleSubmit(
                        form.getFieldsValue(),
                        "Chờ nhân sự xác nhận"
                      )
                    }
                    loading={isSaving}
                    disabled={isSaving || !isDataDirty}
                  >
                    Gửi & Chờ NS Xác Nhận
                  </Button>
                )}
              </Space>
            </Row>
          )}
        </Card>
      </Form>

      <Modal
        title="Bạn có chắc muốn hủy?"
        open={isCancelConfirmVisible}
        onOk={handleConfirmCancel}
        onCancel={() => setIsCancelConfirmVisible(false)}
        okText="Đồng ý"
        cancelText="Không"
        zIndex={1001}
      >
        <p>Các thay đổi chưa được gửi sẽ bị mất.</p>
      </Modal>

      <Modal
        title="Từ Chối Xác Nhận (Nhân Sự)"
        open={isRejectModalVisible}
        onOk={handleReject}
        onCancel={() => setIsRejectModalVisible(false)}
        okText="Gửi Từ Chối"
        cancelText="Hủy"
        confirmLoading={isSaving}
        zIndex={1002}
      >
        <p style={{ marginBottom: 15 }}>
          Vui lòng nhập lý do từ chối. Hồ sơ sẽ được chuyển lại về trạng thái{" "}
          <Tag color="orange">Chờ giáo viên duyệt</Tag> để chỉnh sửa.
        </p>
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối và yêu cầu chỉnh sửa..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default UpdateRoom;
