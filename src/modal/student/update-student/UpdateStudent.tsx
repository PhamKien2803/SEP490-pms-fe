import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, Select } from 'antd';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { UpdateUserData } from '../../../types/student-management'; 

dayjs.extend(customParseFormat);

export interface UpdateFormValues {
    fullName: string;
    dob: dayjs.Dayjs | null; 
    idCard: string;
    gender: string;
    address: string;
    relationship: string;
    nation: string;
    religion: string;
}

interface UpdateStudentProps {
    open: boolean;
    loading: boolean;
    initialData: UpdateFormValues | null;
    onClose: () => void;
    onSubmit: (values: UpdateUserData) => void;
}

const { Option } = Select;

const UpdateStudent: React.FC<UpdateStudentProps> = ({ open, loading, initialData, onClose, onSubmit }) => {
    const [form] = Form.useForm<UpdateFormValues>();
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    useEffect(() => {
        if (open && initialData) {
            form.setFieldsValue(initialData);
        }
        if (!open) {
            form.resetFields();
        }
    }, [open, initialData, form]);

    const handleFinish = (values: UpdateFormValues) => {
        const formattedDob = values.dob ? values.dob.toISOString() : '';

        const finalValues: UpdateUserData = {
            fullName: values.fullName,
            dob: formattedDob,
            idCard: values.idCard,
            gender: values.gender,
            address: values.address,
            relationship: values.relationship,
            nation: values.nation,
            religion: values.religion,
        };
        onSubmit(finalValues as any);
    };

    const handleFinishFailed = () => {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
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
                title="Cập nhật Hồ sơ Học sinh"
                open={open}
                onCancel={handleCancel}
                confirmLoading={loading}
                width={700}
                destroyOnClose
                styles={{
                    body: {
                        maxHeight: 'calc(100vh - 250px)', 
                        overflowY: 'auto',
                        paddingTop: '16px',
                        paddingBottom: '0px',
                        paddingLeft: '24px', 
                        paddingRight: '24px',
                    }
                }}
                centered
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="fullName"
                            label="Họ và Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        >
                            <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>

                        <Form.Item
                            name="dob"
                            label="Ngày sinh"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                            />
                        </Form.Item>

                        <Form.Item
                            name="idCard"
                            label="CMND/CCCD/Hộ chiếu"
                            rules={[{ required: true, message: 'Vui lòng nhập số định danh!' }]}
                        >
                            <Input placeholder="012345678901" />
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        >
                            <Select placeholder="Chọn giới tính">
                                <Option value="Male">Nam</Option>
                                <Option value="Female">Nữ</Option>
                                <Option value="Other">Khác</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="relationship"
                            label="Mối quan hệ"
                            rules={[{ required: true, message: 'Vui lòng nhập mối quan hệ!' }]}
                        >
                            <Input placeholder="Cha/Mẹ/Người giám hộ" />
                        </Form.Item>

                        <Form.Item
                            name="nation"
                            label="Dân tộc"
                            rules={[{ required: true, message: 'Vui lòng nhập dân tộc!' }]}
                        >
                            <Input placeholder="Kinh/Tày/Thái..." />
                        </Form.Item>

                        <Form.Item
                            name="religion"
                            label="Tôn giáo"
                            rules={[{ required: true, message: 'Vui lòng nhập tôn giáo!' }]}
                        >
                            <Input placeholder="Không/Phật giáo/Công giáo..." />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        style={{ gridColumn: 'span 2' }} 
                    >
                        <Input.TextArea rows={2} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố" />
                    </Form.Item>
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
                <p>Các thay đổi sẽ không được lưu lại.</p>
            </Modal>
        </>
    );
};

export default UpdateStudent;