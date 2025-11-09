import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Space,
    Typography,
    Card,
    Select,
    DatePicker,
    Row,
    Col,
    Divider,
    Modal,
    Checkbox,
    Alert,
} from 'antd';
import {
    UserOutlined,
    IdcardOutlined,
    ManOutlined,
    WomanOutlined,
    PhoneOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { enrollmentApis } from '../../services/apiServices';
import { RegisterEnrollmentDto } from '../../types/enrollment';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const EnrollmentForm: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [formData, setFormData] = useState<Partial<RegisterEnrollmentDto> | null>(null);
    const [isExistingParent, setIsExistingParent] = useState(false);
    const [studentAge, setStudentAge] = useState<number | null>(null);
    const [dobError, setDobError] = useState<string | null>(null);

    // const handleStudentDobChange = (date: dayjs.Dayjs | null) => {
    //     setDobError(null);
    //     setStudentAge(null);

    //     if (!date) return;

    //     const today = dayjs();
    //     const age = today.diff(date, "year");

    //     if (date.isAfter(today, "day")) {
    //         setDobError("Ngày sinh không được trong tương lai!");
    //     } else if (age < 1) {
    //         setDobError("Học sinh phải đủ ít nhất 1 tuổi!");
    //     } else if (age > 5) {
    //         setDobError("Học sinh không được quá 5 tuổi!");
    //     } else {
    //         setDobError(null);
    //         setStudentAge(age);
    //     }
    // };

    const onFinish = (values: any) => {
        let payload: Partial<RegisterEnrollmentDto>;
        const { isExistingParentCheckbox, ...restValues } = values;

        if (isExistingParent) {
            payload = {
                isCheck: true,
                studentName: values.studentName,
                studentDob: values.studentDob ? dayjs(values.studentDob).toISOString() : '',
                studentGender: values.studentGender,
                studentIdCard: values.studentIdCard,
                studentNation: values.studentNation,
                studentReligion: values.studentReligion,
                address: values.address,
                fatherIdCard: values.fatherIdCard,
                motherIdCard: values.motherIdCard,
            };
        } else {
            payload = {
                ...restValues,
                isCheck: false,
                studentDob: values.studentDob ? dayjs(values.studentDob).toISOString() : '',
            };
        }

        setFormData(payload as RegisterEnrollmentDto);
        setIsConfirmModalVisible(true);
    };

    const handleConfirmSubmit = async () => {
        if (!formData) return;
        setLoading(true);
        setIsConfirmModalVisible(false);
        try {
            await enrollmentApis.registerEnrollment(formData as RegisterEnrollmentDto);
            toast.success('Gửi đơn đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
            form.resetFields();
            setIsExistingParent(false);
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setLoading(false);
            setFormData(null);
        }
    };

    const handleCheckboxChange = (e: any) => {
        const checked = e.target.checked;
        setIsExistingParent(checked);
        form.resetFields(['fatherName', 'fatherJob', 'fatherPhoneNumber', 'fatherEmail', 'fatherIdCard', 'motherName', 'motherJob', 'motherPhoneNumber', 'motherEmail', 'motherIdCard']);
    };

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

    const blockSpecialCharactersAndNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const regex = /^[a-zA-ZÀ-ỹà-ỹ\s]*$/;
        if (!regex.test(event.key)) {
            event.preventDefault();
        }
    };

    const handlePasteName = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = event.clipboardData.getData('Text');
        const regex = /^[a-zA-ZÀ-ỹà-ỹ\s]*$/;
        if (!regex.test(pasted)) {
            event.preventDefault();
        }
    };


    return (
        <>
            <Card>
                <Title level={3}>Đơn đăng ký nhập học</Title>
                <Paragraph type="secondary">
                    Vui lòng điền đầy đủ và chính xác các thông tin dưới đây. Các mục có dấu <span style={{ color: 'red' }}>*</span> là bắt buộc.
                </Paragraph>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="isExistingParentCheckbox" valuePropName="checked">
                        <Alert
                            type="info"
                            message={
                                <Checkbox onChange={handleCheckboxChange}>
                                    <Text strong style={{ color: '#006d75' }}>
                                        Phụ huynh đã có con theo học tại trường? (Chọn mục này để đăng ký nhanh)
                                    </Text>
                                </Checkbox>
                            }
                            style={{ marginBottom: '24px' }}
                        />
                    </Form.Item>

                    <Divider orientation="left"><UserOutlined /> Thông tin học sinh</Divider>
                    <Row gutter={24}>
                        <Col xs={24} sm={12}><Form.Item name="studentName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}><Input onKeyPress={blockSpecialCharactersAndNumbers}
                            onPaste={handlePasteName} prefix={<UserOutlined />} placeholder="Nguyễn Văn A" /></Form.Item></Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="studentDob"
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
                                                return Promise.reject(new Error("Ngày sinh không được trong tương lai!"));
                                            if (age < 1)
                                                return Promise.reject(new Error("Học sinh phải đủ ít nhất 1 tuổi!"));
                                            if (age > 5)
                                                return Promise.reject(new Error("Học sinh không được quá 5 tuổi!"));
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày"
                                        onChange={(date) => {
                                            form.setFieldValue("studentDob", date);

                                            if (date) {
                                                const today = dayjs();
                                                const age = today.diff(date, "year");

                                                if (date.isAfter(today, "day")) {
                                                    setDobError("Ngày sinh không được trong tương lai!");
                                                    setStudentAge(null);
                                                } else if (age < 1) {
                                                    setDobError("Học sinh phải đủ ít nhất 1 tuổi!");
                                                    setStudentAge(null);
                                                } else if (age > 5) {
                                                    setDobError("Học sinh không được quá 5 tuổi!");
                                                    setStudentAge(null);
                                                } else {
                                                    setDobError(null);
                                                    setStudentAge(age);
                                                }
                                            } else {
                                                setStudentAge(null);
                                                setDobError(null);
                                            }
                                        }}
                                    />
                                    {studentAge !== null && !dobError && (
                                        <Text type="secondary">→ {studentAge} tuổi</Text>
                                    )}
                                    {dobError && <Text type="danger">{dobError}</Text>}
                                </Space>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}><Form.Item name="studentIdCard" label="CCCD/Mã định danh" rules={[{ required: true, message: "Vui lòng nhập mã định danh!" }, idCardValidationRule]}><Input onKeyPress={allowOnlyNumbers} prefix={<IdcardOutlined />} placeholder="012345678901" /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item name="studentGender" label="Giới tính" rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}>
                            <Select placeholder="Chọn giới tính">
                                <Option value="Nam">Nam</Option>
                                <Option value="Nữ">Nữ</Option>
                                <Option value="Khác">Khác</Option>
                            </Select>
                        </Form.Item></Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="studentNation"
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
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="studentReligion"
                                label="Tôn giáo"
                                rules={[{ required: true, message: "Vui lòng chọn tôn giáo!" }]}
                            >
                                <Select placeholder="Có hoặc Không">
                                    <Option value="Không">Không</Option>
                                    <Option value="Có">Có</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}><Form.Item name="address" label="Địa chỉ thường trú" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}><Input.TextArea rows={2} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" /></Form.Item></Col>
                    </Row>

                    <Divider orientation="left"><ManOutlined /> Thông tin Cha</Divider>
                    <Row gutter={24}>
                        {!isExistingParent && (
                            <>
                                <Col xs={24} sm={12}><Form.Item name="fatherName" label="Họ và tên Cha" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}><Input onKeyPress={blockSpecialCharactersAndNumbers}
                                    onPaste={handlePasteName} placeholder="Nguyễn Văn B" /></Form.Item></Col>
                                <Col xs={24} sm={12}><Form.Item name="fatherJob" label="Nghề nghiệp" rules={[{ required: true }]}><Input placeholder="Kỹ sư" /></Form.Item></Col>
                                <Col xs={24} sm={12}><Form.Item name="fatherPhoneNumber" label="Số điện thoại Cha" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }, phoneValidationRule]}><Input onKeyPress={allowOnlyNumbers} prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" /></Form.Item></Col>
                                <Col xs={24} sm={12}><Form.Item name="fatherEmail" label="Email Cha" rules={[{ required: true, type: 'email', message: "Email không hợp lệ!" }]}><Input placeholder="example@email.com" /></Form.Item></Col>
                            </>
                        )}
                        <Col xs={24} sm={12}><Form.Item name="fatherIdCard" label="CCCD Cha" rules={[{ required: true, message: "Vui lòng nhập CCCD!" }, idCardValidationRule]}><Input onKeyPress={allowOnlyNumbers} prefix={<IdcardOutlined />} placeholder="012345678901" /></Form.Item></Col>
                    </Row>

                    <Divider orientation="left"><WomanOutlined /> Thông tin Mẹ</Divider>
                    <Row gutter={24}>
                        {!isExistingParent && (
                            <>
                                <Col xs={24} sm={12}><Form.Item name="motherName" label="Họ và tên Mẹ" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}><Input onKeyPress={blockSpecialCharactersAndNumbers}
                                    onPaste={handlePasteName} placeholder="Lê Thị C" /></Form.Item></Col>
                                <Col xs={24} sm={12}><Form.Item name="motherJob" label="Nghề nghiệp" rules={[{ required: true }]}><Input placeholder="Giáo viên" /></Form.Item></Col>
                                <Col xs={24} sm={12}><Form.Item name="motherPhoneNumber" label="Số điện thoại Mẹ" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }, phoneValidationRule]}><Input onKeyPress={allowOnlyNumbers} prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" /></Form.Item></Col>
                                <Col xs={24} sm={12}><Form.Item name="motherEmail" label="Email Mẹ" rules={[{ required: true, type: 'email', message: "Email không hợp lệ!" }]}><Input placeholder="example@email.com" /></Form.Item></Col>
                            </>
                        )}
                        <Col xs={24} sm={12}><Form.Item name="motherIdCard" label="CCCD Mẹ" rules={[{ required: true, message: "Vui lòng nhập CCCD!" }, idCardValidationRule]}><Input onKeyPress={allowOnlyNumbers} prefix={<IdcardOutlined />} placeholder="012345678901" /></Form.Item></Col>
                    </Row>

                    <Form.Item style={{ marginTop: 32, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => {
                                form.resetFields();
                                setIsExistingParent(false);
                            }}>Xóa hết</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Gửi đơn đăng ký
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Modal
                title="Xác nhận thông tin"
                open={isConfirmModalVisible}
                onOk={handleConfirmSubmit}
                onCancel={() => setIsConfirmModalVisible(false)}
                okText="Xác nhận"
                cancelText="Quay lại"
                confirmLoading={loading}
            >
                <p>Vui lòng kiểm tra lại các thông tin đã cung cấp. Bạn có chắc chắn muốn gửi đơn đăng ký với các thông tin này không?</p>
            </Modal>
        </>
    );
}

export default EnrollmentForm;