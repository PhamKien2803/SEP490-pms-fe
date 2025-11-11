import React, { useState } from "react";
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
} from "antd";
import {
    SaveOutlined,
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
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { constants } from "../../../constants";
import { roomApis } from "../../../services/apiServices";
import { CreateRoomData, RoomFacility } from "../../../types/room-management";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title } = Typography;

const FacilityInputRow: React.FC<{
    field: any;
    remove: (index: number) => void;
}> = ({ field, remove }) => {
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
                backgroundColor: "#f7f7f7",
            }}
        >
            <Col xs={24} sm={10} md={7}>
                <Form.Item
                    {...field}
                    name={[field.name, "facilityName"]}
                    fieldKey={[field.fieldKey, "facilityName"]}
                    label={
                        <Space>
                            <TagOutlined /> Tên thiết bị
                        </Space>
                    }
                    rules={[{ required: true, message: "Nhập tên thiết bị" }]}
                >
                    <Input placeholder="Ví dụ: Bàn học trẻ em" />
                </Form.Item>
            </Col>

            <Col xs={24} sm={7} md={5}>
                <Form.Item
                    {...field}
                    name={[field.name, "facilityType"]}
                    fieldKey={[field.fieldKey, "facilityType"]}
                    label={
                        <Space>
                            <ToolOutlined /> Loại
                        </Space>
                    }
                    rules={[{ required: true, message: "Nhập loại thiết bị" }]}
                >
                    <Input placeholder="Ví dụ: Nội thất, Thiết bị điện tử" />
                </Form.Item>
            </Col>

            <Col xs={8} sm={3} md={4}>
                <Form.Item
                    {...field}
                    name={[field.name, "quantity"]}
                    fieldKey={[field.fieldKey, "quantity"]}
                    label="Tổng Số Lượng"
                    rules={[{ required: true, message: "Nhập SL" }]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="10" />
                </Form.Item>
            </Col>

            <Col xs={14} md={6}>
                <Form.Item
                    {...field}
                    name={[field.name, "notes"]}
                    fieldKey={[field.fieldKey, "notes"]}
                    label="Ghi chú"
                >
                    <Input placeholder="Ghi chú tình trạng thiết bị" />
                </Form.Item>
                <Form.Item
                    name={[field.name, "quantityDefect"]}
                    initialValue={0}
                    hidden
                >
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item
                    name={[field.name, "quantityMissing"]}
                    initialValue={0}
                    hidden
                >
                    <Input type="hidden" />
                </Form.Item>
            </Col>

            <Col xs={2} md={2} style={{ textAlign: "center" }}>
                <Form.Item label="Xóa">
                    <Tooltip title="Xóa thiết bị này">
                        <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                            style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }}
                        />
                    </Tooltip>
                </Form.Item>
            </Col>
        </Row>
    );
};

const CreateRoom: React.FC = () => {
    usePageTitle('Tạo phòng học - Cá Heo Xanh');
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);

    const DEFAULT_STATE = "Dự thảo";

    const handleSubmit = async (values: any) => {
        setLoading(true);

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
                    .map((facility: any) => ({
                        facilityName: facility.facilityName,
                        facilityType: facility.facilityType,
                        quantity: facility.quantity,
                        quantityDefect: 0,
                        quantityMissing: 0,
                        notes: facility.notes || "",
                    }))
                : [];

            if (cleanedFacilities.length === 0) {
                toast.warn("Vui lòng thêm ít nhất một Thiết bị/Tài sản hợp lệ.");
                setLoading(false);
                return;
            }

            const payload: CreateRoomData = {
                roomName: values.roomName,
                roomType: values.roomType,
                capacity: values.capacity,
                facilities: cleanedFacilities,
                state: DEFAULT_STATE,
                notes: values.notes || "",
                createdBy: values.createdBy || "System",
                updatedBy: values.updatedBy || "System",
            };

            await roomApis.createRoom(payload);
            toast.success(`Tạo Phòng học "${payload.roomName}" thành công!`);
            navigate(`${constants.APP_PREFIX}/rooms`);
        } catch (error: any) {
            typeof error === "string" ? toast.info(error) : toast.error("Tạo phòng học thất bại. Vui lòng kiểm tra dữ liệu và thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCancel = () => {
        setIsCancelConfirmVisible(false);
        navigate(`${constants.APP_PREFIX}/rooms`);
    };

    return (
        <div style={{ padding: "16px 24px" }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    capacity: undefined,
                    state: DEFAULT_STATE,
                    facilities: [],
                    notes: "",
                    createdBy: "Admin",
                    updatedBy: "Admin",
                }}
            >
                <Card
                    title={
                        <Title level={3} style={{ margin: 0, padding: "10px 0" }}>
                            <FormOutlined style={{ marginRight: 8 }} /> Tạo Hồ sơ Phòng học Mới
                        </Title>
                    }
                    bordered={false}
                    style={{
                        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                        marginBottom: 24,
                        borderRadius: 8,
                    }}
                >
                    {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
                    <Title
                        level={4}
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
                                rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
                            >
                                <Input placeholder="Ví dụ: Phòng A1, Phòng Thể chất" />
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
                                    { required: true, message: "Vui lòng nhập loại phòng" },
                                ]}
                            >
                                <Input placeholder="Ví dụ: Phòng học, Phòng chức năng" />
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
                                    min={1}
                                    style={{ width: "100%" }}
                                    placeholder="25"
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
                                <Input
                                    readOnly
                                    placeholder={DEFAULT_STATE}
                                    value={DEFAULT_STATE}
                                    style={{ color: "#000", fontWeight: "bold" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={
                                    <Space>
                                        <ReadOutlined /> Ghi Chú
                                    </Space>
                                }
                                name="notes"
                            >
                                <Input.TextArea
                                    rows={2}
                                    placeholder="Thêm ghi chú về phòng học (Ví dụ: Phòng có cửa sổ hướng Đông)"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* PHẦN 2: DANH SÁCH THIẾT BỊ/TÀI SẢN */}
                    <Title
                        level={4}
                        style={{
                            marginTop: 24,
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
                                    />
                                ))}
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
                                {fields.length === 0 && (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "20px 0",
                                            color: "#8c8c8c",
                                        }}
                                    >
                                        Chưa có thiết bị nào được thêm. Vui lòng nhấn nút "Thêm Thiết bị/Tài sản".
                                    </div>
                                )}
                            </>
                        )}
                    </Form.List>

                    {/* PHẦN 3: ACTIONS */}
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
                                // Thay đổi hành động: mở Modal
                                onClick={() => setIsCancelConfirmVisible(true)}
                                disabled={loading}
                            >
                                Hủy và Quay lại
                            </Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={() => form.submit()}
                                loading={loading}
                            >
                                Lưu Hồ sơ Phòng học
                            </Button>
                        </Space>
                    </Row>
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
                <p>Các thay đổi chưa được lưu sẽ bị mất.</p>
            </Modal>
        </div>
    );
};

export default CreateRoom;