import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, DatePicker, Select, Row, Col } from "antd";
import { toast } from "react-toastify";
import { CreateUserData } from "../../../types/student-management";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface CreateStudentProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (values: CreateUserData) => void;
}

interface FormValues {
    fullName: string;
    dob: dayjs.Dayjs | null;
    idCard: string;
    gender: string;
    address: string;
    relationship: string;
    nation: string;
    religion: string;
}

const { Option } = Select;

const CreateStudent: React.FC<CreateStudentProps> = ({
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
        }
    }, [open, form]);

    const handleFinish = (values: FormValues) => {
        const formattedDob = values.dob ? values.dob.toISOString() : "";

        const finalValues: CreateUserData = {
            fullName: values.fullName,
            dob: formattedDob,
            idCard: values.idCard,
            gender: values.gender,
            address: values.address,
            relationship: values.relationship,
            nation: values.nation,
            religion: values.religion,
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
                title="Tạo mới Hồ sơ Học sinh"
                open={open}
                onCancel={handleCancel}
                confirmLoading={loading}
                width={800}
                centered
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
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ và Tên"
                                rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                            >
                                <Input placeholder="Nguyễn Văn A" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dob"
                                label="Ngày sinh"
                                rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày"
                                    disabledDate={(current) => {
                                        return current && current.isAfter(dayjs().subtract(1, 'year'), 'day');
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="idCard"
                                label="CMND/CCCD/Hộ chiếu"
                                rules={[{ required: true, message: "Vui lòng nhập số định danh!" }]}
                            >
                                <Input placeholder="012345678901" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="gender"
                                label="Giới tính"
                                rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="Nam">Nam</Option>
                                    <Option value="Nữ">Nữ</Option>
                                    <Option value="Khác">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="nation"
                                label="Dân tộc"
                                rules={[{ required: true, message: "Vui lòng nhập dân tộc!" }]}
                            >
                                <Input placeholder="Kinh/Tày/Thái..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="religion"
                                label="Tôn giáo"
                                rules={[{ required: true, message: "Vui lòng nhập tôn giáo!" }]}
                            >
                                <Input placeholder="Không/Phật giáo/Công giáo..." />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                            >
                                <Input.TextArea
                                    rows={2}
                                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                                />
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
                okButtonProps={{ danger: true }}
            >
                <p>Các thay đổi bạn đã nhập sẽ <strong>không</strong> được lưu lại.</p>
            </Modal>
        </>
    );
};

export default CreateStudent;