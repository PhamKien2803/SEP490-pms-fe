import React, { useState, useEffect, useCallback } from "react";
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
    Select,
} from "antd";
import {
    SaveOutlined,
    RollbackOutlined,
    PlusOutlined,
    MinusCircleOutlined,
    UserOutlined,
    HeartOutlined,
    LineChartOutlined,
    MedicineBoxOutlined,
    WarningOutlined,
    BulbOutlined,
    CheckCircleOutlined,
    FormOutlined,
    ReadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { constants } from "../../../constants";
import { medicalApis, studentApis } from "../../../services/apiServices";
import { HealthCertCreateData, StudentInfo } from "../../../types/medical-management";

const { Title } = Typography;
const { Option } = Select;

const calculateBMI = (height: number | undefined, weight: number | undefined): number | undefined => {
    if (height && weight && height > 0 && weight > 0) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return parseFloat(bmi.toFixed(2));
    }
    return undefined;
};

const ArrayItemInput: React.FC<{
    field: any;
    remove: (index: number) => void;
    label: string;
    placeholder: string;
    icon: React.ReactNode;
}> = ({ field, remove, label, placeholder, icon }) => {
    return (
        <Space style={{ display: 'flex', marginBottom: 8 }} align="start">
            <Form.Item
                {...field}
                validateTrigger={['onChange', 'onBlur']}
                noStyle
                rules={[
                    {
                        required: true,
                        whitespace: true,
                        message: `Vui lòng nhập ${label.toLowerCase()}`,
                    },
                ]}
            >
                <Input
                    placeholder={placeholder}
                    prefix={icon}
                    style={{ width: '90%' }}
                />
            </Form.Item>
            <Tooltip title={`Xóa ${label.toLowerCase()}`}>
                <MinusCircleOutlined onClick={() => remove(field.name)} style={{ fontSize: 18, color: '#ff4d4f' }} />
            </Tooltip>
        </Space>
    );
};

const CreateMedical: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);
    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [studentLoading, setStudentLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await studentApis.getListStudent({
                    page: 1,
                    limit: 1000,
                });
                setStudents(response.data);
            } catch (error) {
                toast.error("Không thể tải danh sách học sinh.");
            } finally {
                setStudentLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handlePhysicalChange = useCallback(() => {
        const height = form.getFieldValue(['physicalDevelopment', 'height']);
        const weight = form.getFieldValue(['physicalDevelopment', 'weight']);
        const bmi = calculateBMI(height, weight);
        if (bmi !== undefined) {
            form.setFieldsValue({
                physicalDevelopment: { bodyMassIndex: bmi },
            });
        } else {
            form.setFieldsValue({
                physicalDevelopment: { bodyMassIndex: undefined },
            });
        }
    }, [form]);

    const handleSubmit = async (values: any) => {
        setLoading(true);

        const studentId = values.studentId;
        if (!studentId) {
            toast.warn("Vui lòng chọn một Học sinh.");
            setLoading(false);
            return;
        }

        try {
            const getCleanArray = (arr: any[] | undefined) =>
                arr ? arr.filter(item => item && item.trim() !== "") : [];

            const payload: HealthCertCreateData = {
                student: studentId,
                physicalDevelopment: {
                    height: values.physicalDevelopment.height,
                    weight: values.physicalDevelopment.weight,
                    bodyMassIndex: values.physicalDevelopment.bodyMassIndex,
                    evaluation: values.physicalDevelopment.evaluation || "",
                },
                comprehensiveExamination: {
                    mentalDevelopment: values.comprehensiveExamination.mentalDevelopment || "",
                    motorDevelopment: values.comprehensiveExamination.motorDevelopment || "",
                    diseasesDetected: getCleanArray(values.comprehensiveExamination.diseasesDetected),
                    abnormalSigns: getCleanArray(values.comprehensiveExamination.abnormalSigns),
                    diseaseRisk: getCleanArray(values.comprehensiveExamination.diseaseRisk),
                    notes: values.comprehensiveExamination.notes || "",
                },
                conclusion: {
                    healthStatus: values.conclusion.healthStatus, // Được nhập từ Input
                    advice: values.conclusion.advice || "",
                },
                createdBy: "Admin",
                updatedBy: "Admin",
            };

            await medicalApis.createMedical(payload);
            toast.success(`Tạo Hồ sơ Sức khỏe cho học sinh thành công!`);
            navigate(`${constants.APP_PREFIX}/medicals`);
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                "Tạo hồ sơ sức khỏe thất bại. Vui lòng kiểm tra dữ liệu và thử lại.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCancel = () => {
        setIsCancelConfirmVisible(false);
        navigate(`${constants.APP_PREFIX}/medicals`);
    };

    return (
        <div style={{ padding: "16px 24px" }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handlePhysicalChange}
                initialValues={{
                    physicalDevelopment: {
                        height: undefined,
                        weight: undefined,
                        bodyMassIndex: undefined,
                        evaluation: "",
                    },
                    comprehensiveExamination: {
                        diseasesDetected: [""],
                        abnormalSigns: [""],
                        diseaseRisk: [""],
                    },
                    conclusion: {
                        healthStatus: "", // Đặt giá trị khởi tạo là chuỗi rỗng cho Input
                        advice: "",
                    },
                }}
            >
                <Card
                    title={
                        <Title level={3} style={{ margin: 0, padding: "10px 0" }}>
                            <FormOutlined style={{ marginRight: 8 }} /> Tạo Hồ sơ Sức khỏe Mới
                        </Title>
                    }
                    bordered={false}
                    style={{
                        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                        marginBottom: 24,
                        borderRadius: 8,
                    }}
                >
                    <Title
                        level={4}
                        style={{
                            marginBottom: 16,
                            borderLeft: "3px solid #1890ff",
                            paddingLeft: 8,
                        }}
                    >
                        <UserOutlined /> Thông tin Cơ bản
                    </Title>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={
                                    <Space>
                                        <UserOutlined /> Chọn Học sinh
                                    </Space>
                                }
                                name="studentId"
                                rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
                            >
                                <Select
                                    placeholder="Tìm kiếm và chọn Học sinh"
                                    showSearch
                                    loading={studentLoading}
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                                    }
                                    onChange={(value) => {
                                        const student = students.find(s => s._id === value);
                                        setSelectedStudent(student || null);
                                    }}
                                >
                                    {students.map(student => (
                                        <Option key={student._id} value={student._id}>
                                            {`${student.fullName} - ${student.studentCode}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={
                                    <Space>
                                        <CheckCircleOutlined /> Trạng Thái Hồ sơ
                                    </Space>
                                }
                                name={['conclusion', 'healthStatus']}
                                rules={[{ required: true, message: "Vui lòng nhập Trạng thái" }]}
                            >
                                <Input placeholder="Ví dụ: Bình thường, Cần theo dõi,..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title
                        level={4}
                        style={{
                            marginTop: 24,
                            marginBottom: 16,
                            borderLeft: "3px solid #faad14",
                            paddingLeft: 8,
                        }}
                    >
                        <LineChartOutlined /> Phát Triển Thể Chất
                    </Title>
                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item
                                label="Chiều Cao (cm)"
                                name={['physicalDevelopment', 'height']}
                                rules={[{ required: true, message: "Nhập chiều cao" }]}
                            >
                                <InputNumber
                                    formatter={value => `${value} cm`}
                                    parser={value => value!.replace(' cm', '').replace(/,/g, '.').replace(/\s/g, '')}
                                    style={{ width: "100%" }}
                                    placeholder="Ví dụ: 98.5 hoặc 98,5"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                label="Cân Nặng (kg)"
                                name={['physicalDevelopment', 'weight']}
                                rules={[{ required: true, message: "Nhập cân nặng" }]}
                            >
                                <InputNumber
                                    formatter={value => `${value} kg`}
                                    parser={value => value!.replace(' kg', '').replace(/,/g, '.').replace(/\s/g, '')}
                                    style={{ width: "100%" }}
                                    placeholder="Ví dụ: 14.2 hoặc 14,2"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                label="Chỉ Số BMI"
                                name={['physicalDevelopment', 'bodyMassIndex']}
                            >
                                <InputNumber
                                    readOnly
                                    style={{ width: "100%", color: "#000", fontWeight: "bold" }}
                                    placeholder="Tự động tính"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                label="Đánh Giá Thể Chất"
                                name={['physicalDevelopment', 'evaluation']}
                            >
                                <Input placeholder="Ví dụ: Phát triển bình thường" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title
                        level={4}
                        style={{
                            marginTop: 24,
                            marginBottom: 16,
                            borderLeft: "3px solid #f5222d",
                            paddingLeft: 8,
                        }}
                    >
                        <MedicineBoxOutlined /> Khám Tổng Quát
                    </Title>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Phát Triển Tinh Thần"
                                name={['comprehensiveExamination', 'mentalDevelopment']}
                            >
                                <Input.TextArea rows={1} placeholder="Ví dụ: Phát triển tốt, giao tiếp linh hoạt" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Phát Triển Vận Động"
                                name={['comprehensiveExamination', 'motorDevelopment']}
                            >
                                <Input.TextArea rows={1} placeholder="Ví dụ: Đi, chạy, leo cầu thang tốt" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label={<Space><MedicineBoxOutlined /> Bệnh Đã Phát Hiện</Space>}>
                                <Form.List name={['comprehensiveExamination', 'diseasesDetected']}>
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map((field) => (
                                                <ArrayItemInput
                                                    key={field.key}
                                                    field={field}
                                                    remove={remove}
                                                    label="Bệnh"
                                                    placeholder="Ví dụ: Viêm mũi nhẹ"
                                                    icon={<HeartOutlined style={{ color: '#1890ff' }} />}
                                                />
                                            ))}
                                            <Button
                                                type="dashed"
                                                onClick={() => add("")}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm Bệnh
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label={<Space><WarningOutlined /> Dấu Hiệu Bất Thường</Space>}>
                                <Form.List name={['comprehensiveExamination', 'abnormalSigns']}>
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map((field) => (
                                                <ArrayItemInput
                                                    key={field.key}
                                                    field={field}
                                                    remove={remove}
                                                    label="Dấu hiệu"
                                                    placeholder="Ví dụ: Hơi gầy, Lớp mỏng"
                                                    icon={<WarningOutlined style={{ color: '#faad14' }} />}
                                                />
                                            ))}
                                            <Button
                                                type="dashed"
                                                onClick={() => add("")}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm Dấu hiệu
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label={<Space><WarningOutlined /> Nguy Cơ Bệnh</Space>}>
                                <Form.List name={['comprehensiveExamination', 'diseaseRisk']}>
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map((field) => (
                                                <ArrayItemInput
                                                    key={field.key}
                                                    field={field}
                                                    remove={remove}
                                                    label="Nguy cơ"
                                                    placeholder="Ví dụ: Dễ mắc bệnh hô hấp"
                                                    icon={<BulbOutlined style={{ color: '#722ed1' }} />}
                                                />
                                            ))}
                                            <Button
                                                type="dashed"
                                                onClick={() => add("")}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm Nguy cơ
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label={<Space><ReadOutlined /> Ghi Chú Cận Lâm Sàng</Space>}
                                name={['comprehensiveExamination', 'notes']}
                            >
                                <Input.TextArea
                                    rows={2}
                                    placeholder="Thêm ghi chú chi tiết về khám cận lâm sàng (Ví dụ: Khuyên phụ huynh tăng cường dinh dưỡng...)"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title
                        level={4}
                        style={{
                            marginTop: 24,
                            marginBottom: 16,
                            borderLeft: "3px solid #52c41a",
                            paddingLeft: 8,
                        }}
                    >
                        <BulbOutlined /> Lời Khuyên Y Tế
                    </Title>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item
                                label="Lời Khuyên và Đề xuất"
                                name={['conclusion', 'advice']}
                            >
                                <Input.TextArea
                                    rows={2}
                                    placeholder="Ví dụ: Theo dõi dinh dưỡng và tái khám sau 6 tháng"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

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
                                Lưu Hồ sơ Sức khỏe
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

export default CreateMedical;