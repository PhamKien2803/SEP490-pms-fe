import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, DatePicker, Select, Row, Col, Typography } from 'antd';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { StaffRecord, UpdateStaffData, GenderType } from '../../../types/staff-management';
import { noSpecialCharactersRule, requiredTrimRule } from '../../../utils/format';

dayjs.extend(customParseFormat);

export interface UpdateStaffFormValues {
    fullName: string;
    dob: dayjs.Dayjs | null;
    IDCard: string;
    email: string;
    phoneNumber: string;
    gender: GenderType;
    address: string;
    nation: string;
    religion: string;
    isTeacher: boolean;
}

interface UpdateStaffProps {
    open: boolean;
    loading: boolean;
    initialData: StaffRecord | null;
    onClose: () => void;
    onSubmit: (values: UpdateStaffData & { _id: string; }) => void;
}

const { Option } = Select;
const { Title } = Typography;

const UpdateStaff: React.FC<UpdateStaffProps> = ({ open, loading, initialData, onClose, onSubmit }) => {
    const [form] = Form.useForm<UpdateStaffFormValues>();
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    useEffect(() => {
        if (open && initialData) {
            form.setFieldsValue({
                ...initialData,
                dob: initialData.dob ? dayjs(initialData.dob) : null,
                isTeacher: initialData.isTeacher,
            });
        } else if (!open) {
            form.resetFields();
        }
    }, [open, initialData, form]);

    const handleFinish = (values: UpdateStaffFormValues) => {
        if (!initialData) return;

        const formattedDob = values.dob ? values.dob.toISOString() : '';

        const finalValues: UpdateStaffData = {
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

        onSubmit({ ...finalValues, _id: initialData._id });
    };

    const handleFinishFailed = () => {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
    };

    const handleCancel = () => {
        if (form.isFieldsTouched()) {
            setIsConfirmVisible(true);
        } else {
            form.resetFields();
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setIsConfirmVisible(false);
        form.resetFields();
        onClose();
    }

    const phoneValidationRule = {
        pattern: /^\d{10}$/,
        message: 'Số điện thoại phải có đúng 10 chữ số!',
    };

    const idCardValidationRule = {
        pattern: /^\d{12}$/,
        message: 'CCCD phải có đúng 12 chữ số!',
    };

    const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
            event.preventDefault();
        }
    };

    return (
        <>
            <Modal
                title="Cập nhật Hồ sơ Nhân viên"
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
                    <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
                        Lưu Thay đổi
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
                            <Title level={5} style={{ marginTop: 0, color: '#1890ff' }}>Thông tin Cơ bản</Title>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        name="fullName"
                                        label="Họ và Tên"
                                        rules={[requiredTrimRule("họ và tên"), noSpecialCharactersRule,
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();
                                                if (/^\s|\s$/.test(value)) {
                                                    return Promise.reject(new Error("Không được để khoảng trắng ở đầu hoặc cuối!"));
                                                }
                                                if (/\s{2,}/.test(value)) {
                                                    return Promise.reject(new Error("Không được có nhiều khoảng trắng liên tiếp!"));
                                                }
                                                return Promise.resolve();
                                            },
                                        },]}
                                    >
                                        <Input placeholder="Nguyễn Văn A" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="dob"
                                        label="Ngày sinh"
                                        rules={[
                                            { required: true, message: "Vui lòng chọn ngày sinh" },
                                            {
                                                validator: (_, value) => {
                                                    if (!value) return Promise.resolve();
                                                    const date = dayjs(value);
                                                    const today = dayjs();
                                                    const age = today.diff(date, "year");
                                                    if (date.isAfter(today, "day"))
                                                        return Promise.reject(new Error("Ngày sinh không được trong tương lai!"));
                                                    if (age < 18)
                                                        return Promise.reject(new Error("Nhân viên phải từ 18 tuổi trở lên!"));
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="IDCard"
                                        label="CMND/CCCD"
                                        rules={[{ required: true, message: "Vui lòng nhập CCCD!" }, idCardValidationRule]}
                                    >
                                        <Input type='number' placeholder="012345678901" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="gender"
                                        label="Giới tính"
                                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
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
                            <Title level={5} style={{ marginTop: 0, color: '#1890ff' }}>Thông tin Liên hệ & Chuyên môn</Title>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[requiredTrimRule("email"), { type: 'email', message: "Email không hợp lệ!" }, {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();
                                                if (/^\s|\s$/.test(value)) {
                                                    return Promise.reject(new Error("Không được để khoảng trắng ở đầu hoặc cuối!"));
                                                }
                                                if (/\s{2,}/.test(value)) {
                                                    return Promise.reject(new Error("Không được có nhiều khoảng trắng liên tiếp!"));
                                                }
                                                return Promise.resolve();
                                            },
                                        }]}
                                    >
                                        <Input placeholder="abc@gmail.com" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }, phoneValidationRule]}
                                    >
                                        <Input onKeyPress={allowOnlyNumbers} placeholder="0912345678" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="isTeacher"
                                        label={<span style={{ fontWeight: 'bold' }}>Là Giáo viên? </span>}
                                        rules={[{ required: true, message: 'Vui lòng xác nhận vai trò!' }]}
                                    >
                                        <Select placeholder="Chọn vai trò">
                                            <Option value={true}> Có (Giáo viên)</Option>
                                            <Option value={false}> Không (Nhân viên khác)</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Title level={5} style={{ marginTop: 15, color: '#1890ff' }}>Thông tin Xã hội</Title>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        name="nation"
                                        label="Dân tộc"
                                        rules={[{ required: true, message: "Vui lòng chọn dân tộc!" }]}
                                    >
                                        <Select showSearch placeholder="Chọn dân tộc">
                                            {[
                                                "Kinh", "Tày", "Thái", "Hoa", "Khmer", "Mường", "Nùng", "H'Mông", "Dao", "Gia Rai",
                                                "Ê Đê", "Ba Na", "Chăm", "Sán Chay", "Cơ Ho", "Xê Đăng", "Sán Dìu", "Hrê", "Ra Glai", "Mnông",
                                                "Thổ", "Stiêng", "Khơ Mú", "Bru - Vân Kiều", "Cơ Tu", "Giáy", "Tà Ôi", "Mạ", "Co", "Chơ Ro",
                                                "Xinh Mun", "Hà Nhì", "Chu Ru", "Lào", "La Chí", "La Ha", "Phù Lá", "La Hủ", "Kháng", "Lự",
                                                "Lô Lô", "Chứt", "Mảng", "Pà Thẻn", "Co Lao", "Cống", "Bố Y", "Si La", "Pu Péo", "Brâu",
                                                "Ơ Đu", "Rơ Măm"
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
                                        rules={[{ required: true, message: "Vui lòng chọn tôn giáo!" }]}
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
                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                    >
                                        <Input.TextArea rows={2} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố" />
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
                <p>Các thay đổi sẽ không được lưu lại.</p>
            </Modal>
        </>
    );
};

export default UpdateStaff;