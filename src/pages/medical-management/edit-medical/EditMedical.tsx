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
    Modal,
    Spin,
    Descriptions,
} from "antd";
import {
    RollbackOutlined,
    UserOutlined,
    ReadOutlined,
    TagOutlined,
    ArrowLeftOutlined,
    HeartOutlined,
    CalendarOutlined,
    SaveOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { constants } from "../../../constants";
import { medicalApis } from "../../../services/apiServices";
import { ComprehensiveExamination, HealthCertRecord, HealthCertUpdateData } from "../../../types/medical-management";

const { Title, Text: TextAnt } = Typography;
const { TextArea } = Input;
const { Item } = Descriptions;

const calculateBMI = (weight: number, height: number): number => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

const UpdateMedical: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [medicalDetail, setMedicalDetail] = useState<HealthCertRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isEditing] = useState(true);

    const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);
    const [isDataDirty, setIsDataDirty] = useState(false);
    const [initialValues, setInitialValues] = useState<any>(null);
    const [bmi, setBmi] = useState<number>(0);

    const CurrentUserName = "Admin User";

    const updateBMI = useCallback(() => {
        const weight = form.getFieldValue(['physicalDevelopment', 'weight']);
        const height = form.getFieldValue(['physicalDevelopment', 'height']);
        const newBmi = calculateBMI(weight, height);
        setBmi(newBmi);
        form.setFieldsValue({
            physicalDevelopment: {
                ...form.getFieldValue('physicalDevelopment'),
                bodyMassIndex: newBmi,
            },
        });
    }, [form]);

    const cleanDataForComparison = (values: any) => {
        return JSON.parse(
            JSON.stringify({
                physicalDevelopment: {
                    height: values.physicalDevelopment?.height,
                    weight: values.physicalDevelopment?.weight,
                    bodyMassIndex: values.physicalDevelopment?.bodyMassIndex,
                    evaluation: values.physicalDevelopment?.evaluation || "",
                },
                comprehensiveExamination: {
                    mentalDevelopment: values.comprehensiveExamination?.mentalDevelopment || "",
                    motorDevelopment: values.comprehensiveExamination?.motorDevelopment || "",
                    diseasesDetected: values.comprehensiveExamination?.diseasesDetected || [],
                    abnormalSigns: values.comprehensiveExamination?.abnormalSigns || [],
                    diseaseRisk: values.comprehensiveExamination?.diseaseRisk || [],
                    notes: values.comprehensiveExamination?.notes || "",
                },
                conclusion: {
                    healthStatus: values.conclusion?.healthStatus || "",
                    advice: values.conclusion?.advice || "",
                },
            })
        );
    };

    const onFieldsChange = useCallback((changedFields: any, _: any) => {
        const isDimensionChanged = changedFields.some((f: any) =>
            f.name.includes('weight') || f.name.includes('height')
        );
        if (isDimensionChanged) {
            updateBMI();
        }

        if (!initialValues) {
            setIsDataDirty(false);
            return;
        }

        const currentValues = form.getFieldsValue(true);
        const cleanCurrent = cleanDataForComparison(currentValues);
        const cleanInitial = cleanDataForComparison(initialValues);

        const areDataDifferent =
            JSON.stringify(cleanCurrent) !== JSON.stringify(cleanInitial);

        setIsDataDirty(areDataDifferent);
    }, [form, initialValues, updateBMI]);

    const fetchMedicalDetail = useCallback(
        async (medicalId: string) => {
            setLoading(true);
            try {
                const response: HealthCertRecord = await medicalApis.getMedicalById(
                    medicalId || ""
                );

                const initialData = {
                    physicalDevelopment: response.physicalDevelopment,
                    comprehensiveExamination: response.comprehensiveExamination,
                    conclusion: response.conclusion,
                };

                const initialForComparison = cleanDataForComparison(initialData);

                setMedicalDetail(response);
                setInitialValues(initialForComparison);

                setBmi(response.physicalDevelopment.bodyMassIndex);

                // Định dạng ngày sinh chỉ hiển thị DD/MM/YYYY
                const formattedDob = response.student.dob
                    ? dayjs(response.student.dob).format("DD/MM/YYYY")
                    : '';

                form.setFieldsValue({
                    studentName: response.student.fullName,
                    studentCode: response.student.studentCode,
                    dob: formattedDob, // <-- Đã áp dụng định dạng
                    gender: response.student.gender,

                    ...initialData,
                    comprehensiveExamination: {
                        ...response.comprehensiveExamination,
                        diseasesDetected: response.comprehensiveExamination.diseasesDetected.join(', '),
                        abnormalSigns: response.comprehensiveExamination.abnormalSigns.join(', '),
                        diseaseRisk: response.comprehensiveExamination.diseaseRisk.join(', '),
                    }
                });

                setIsDataDirty(false);
            } catch (error) {
                toast.error("Tải chi tiết hồ sơ sức khỏe thất bại.");
                setMedicalDetail(null);
            } finally {
                setLoading(false);
            }
        },
        [form]
    );

    useEffect(() => {
        if (id) {
            fetchMedicalDetail(id);
        }
    }, [id, fetchMedicalDetail]);

    const handleSubmit = async (values: any) => {
        if (!medicalDetail || !id) return;

        setIsSaving(true);

        try {
            const ce = values.comprehensiveExamination;
            const parseToArray = (value: string) =>
                value ? value.split(',').map(item => item.trim()).filter(item => item.length > 0) : [];

            const comprehensiveExaminationPayload: ComprehensiveExamination = {
                ...ce,
                diseasesDetected: parseToArray(ce.diseasesDetected),
                abnormalSigns: parseToArray(ce.abnormalSigns),
                diseaseRisk: parseToArray(ce.diseaseRisk),
            };

            const payload: HealthCertUpdateData = {
                student: medicalDetail.student._id,

                physicalDevelopment: {
                    ...values.physicalDevelopment,
                    bodyMassIndex: calculateBMI(values.physicalDevelopment.weight, values.physicalDevelopment.height),
                },

                comprehensiveExamination: comprehensiveExaminationPayload,

                conclusion: values.conclusion,

                createdBy: medicalDetail.createdBy,
                updatedBy: CurrentUserName,
            };

            await medicalApis.updateMedical(id, payload);
            toast.success(
                `Cập nhật Hồ sơ Sức khỏe của ${medicalDetail.student.fullName} thành công! `
            );

            await fetchMedicalDetail(id);

        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                "Cập nhật hồ sơ sức khỏe thất bại. Vui lòng kiểm tra dữ liệu và thử lại.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (isDataDirty) {
            setIsCancelConfirmVisible(true);
        } else {
            navigate(`${constants.APP_PREFIX}/medicals`);
        }
    };

    const handleConfirmCancel = () => {
        setIsCancelConfirmVisible(false);
        setIsDataDirty(false);
        navigate(`${constants.APP_PREFIX}/medicals`);
    };

    const renderActionButtons = () => {
        return (
            <Space>
                <Button
                    icon={<RollbackOutlined />}
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                >
                    Hủy và Quay lại
                </Button>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={isSaving}
                    disabled={isSaving || !isDataDirty}
                >
                    Lưu Cập Nhật
                </Button>
            </Space>
        );
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
                <Spin tip="Đang tải chi tiết hồ sơ sức khỏe..." size="large" />
            </div>
        );
    }

    if (!medicalDetail) {
        return (
            <div style={{ padding: "24px" }}>
                <Title level={3}>
                    <ArrowLeftOutlined
                        onClick={() => navigate(`${constants.APP_PREFIX}/medicals`)}
                        style={{ marginRight: 16, cursor: "pointer" }}
                    />
                    Không tìm thấy Hồ sơ Sức khỏe
                </Title>
            </div>
        );
    }

    return (
        <div style={{ padding: "16px 24px" }}>
            <Title level={3} style={{ marginBottom: 20 }}>
                <ArrowLeftOutlined
                    onClick={() => handleCancelEdit()}
                    style={{ marginRight: 16, cursor: "pointer", color: "#0050b3" }}
                />
                Chỉnh Sửa Hồ Sơ Sức Khỏe: **{medicalDetail.student.fullName}**
            </Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onFieldsChange={onFieldsChange}
            >
                <Card
                    title={
                        <Title level={4} style={{ margin: 0, padding: "10px 0" }}>
                            <HeartOutlined style={{ marginRight: 8 }} /> Thông tin Hồ sơ Sức khỏe
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
                        level={5}
                        style={{
                            marginBottom: 16,
                            borderLeft: "3px solid #1890ff",
                            paddingLeft: 8,
                        }}
                    >
                        <UserOutlined /> Thông tin Học sinh (Không chỉnh sửa)
                    </Title>
                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item label={<Space><TagOutlined /> Mã HS</Space>} name="studentCode">
                                <Input disabled={true} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label={<Space><UserOutlined /> Tên Học sinh</Space>} name="studentName">
                                <Input disabled={true} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label={<Space><CalendarOutlined /> Ngày sinh</Space>} name="dob">
                                <Input disabled={true} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label="Giới tính" name="gender">
                                <Input disabled={true} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title
                        level={5}
                        style={{
                            marginTop: 30,
                            marginBottom: 16,
                            borderLeft: "3px solid #faad14",
                            paddingLeft: 8,
                        }}
                    >
                        <HeartOutlined /> I. Phát triển thể chất
                    </Title>
                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item
                                label="Cân nặng (kg)"
                                name={['physicalDevelopment', 'weight']}
                                rules={[{ required: true, message: "Nhập cân nặng" }]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: "100%" }}
                                    disabled={!isEditing}
                                    onChange={updateBMI}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                label="Chiều cao (cm)"
                                name={['physicalDevelopment', 'height']}
                                rules={[{ required: true, message: "Nhập chiều cao" }]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: "100%" }}
                                    disabled={!isEditing}
                                    onChange={updateBMI}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                label="BMI"
                                name={['physicalDevelopment', 'bodyMassIndex']}
                            >
                                <Input
                                    value={bmi > 0 ? bmi : undefined}
                                    disabled={true}
                                    addonAfter="kg/m²"
                                    style={{ fontWeight: 'bold' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Đánh giá phát triển thể chất"
                                name={['physicalDevelopment', 'evaluation']}
                            >
                                <TextArea
                                    rows={2}
                                    disabled={!isEditing}
                                    placeholder="Ví dụ: Phát triển bình thường, Cần cải thiện cân nặng..."
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title
                        level={5}
                        style={{
                            marginTop: 30,
                            marginBottom: 16,
                            borderLeft: "3px solid #0050b3",
                            paddingLeft: 8,
                        }}
                    >
                        <ReadOutlined /> II. Khám tổng quát
                    </Title>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Phát triển tinh thần" name={['comprehensiveExamination', 'mentalDevelopment']}>
                                <Input disabled={!isEditing} placeholder="Ví dụ: Bình thường, Cần theo dõi..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Phát triển vận động" name={['comprehensiveExamination', 'motorDevelopment']}>
                                <Input disabled={!isEditing} placeholder="Ví dụ: Bình thường, Hạn chế..." />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={<Space><WarningOutlined style={{ color: '#faad14' }} /> Các bệnh được phát hiện</Space>}
                                name={['comprehensiveExamination', 'diseasesDetected']}
                                tooltip="Nhập các bệnh, cách nhau bằng dấu phẩy (Ví dụ: Cận thị, Sâu răng)"
                            >
                                <TextArea
                                    rows={1}
                                    disabled={!isEditing}
                                    placeholder="Ví dụ: Cận thị, Sâu răng, Bệnh lý hô hấp"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Dấu hiệu bất thường khác"
                                name={['comprehensiveExamination', 'abnormalSigns']}
                                tooltip="Nhập các dấu hiệu, cách nhau bằng dấu phẩy"
                            >
                                <TextArea
                                    rows={1}
                                    disabled={!isEditing}
                                    placeholder="Ví dụ: Da vàng, Hạch cổ sưng nhẹ"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Nguy cơ bệnh tật"
                                name={['comprehensiveExamination', 'diseaseRisk']}
                                tooltip="Nhập các nguy cơ, cách nhau bằng dấu phẩy"
                            >
                                <TextArea
                                    rows={1}
                                    disabled={!isEditing}
                                    placeholder="Ví dụ: Nguy cơ béo phì, Nguy cơ dị ứng"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Ghi chú tổng quát" name={['comprehensiveExamination', 'notes']}>
                                <TextArea
                                    rows={2}
                                    disabled={!isEditing}
                                    placeholder="Ghi chú tổng quát về tình trạng sức khỏe..."
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title
                        level={5}
                        style={{
                            marginTop: 30,
                            marginBottom: 16,
                            borderLeft: "3px solid #52c41a",
                            paddingLeft: 8,
                        }}
                    >
                        <CheckCircleOutlined /> III. Kết luận
                    </Title>
                    <Col span={24}>
                        <Form.Item
                            label="Tình trạng sức khỏe"
                            name={['conclusion', 'healthStatus']}
                            rules={[{ required: true, message: "Vui lòng nhập tình trạng sức khỏe" }]}
                        >
                            <TextArea
                                rows={2}
                                disabled={!isEditing}
                                placeholder="Ví dụ: Sức khỏe loại A / Đủ điều kiện học tập bình thường"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label="Lời khuyên"
                            name={['conclusion', 'advice']}
                        >
                            <TextArea
                                rows={2}
                                disabled={!isEditing}
                                placeholder="Lời khuyên cụ thể từ Bác sĩ/Y tá..."
                            />
                        </Form.Item>
                    </Col>

                    <Descriptions column={3} size="small" style={{ marginTop: 20 }}>
                        <Item label={<TextAnt strong>Người Tạo</TextAnt>}>
                            {medicalDetail.createdBy}
                        </Item>
                        <Item label={<TextAnt strong>Người Cập Nhật Cuối</TextAnt>}>
                            {medicalDetail.updatedBy}
                        </Item>
                        <Item label={<TextAnt strong>Ngày Cập Nhật</TextAnt>}>
                            {dayjs(medicalDetail.updatedAt).format("DD/MM/YYYY HH:mm")}
                        </Item>
                    </Descriptions>

                </Card>

                {isEditing && (
                    <Row
                        justify="end"
                        style={{
                            marginTop: 20,
                            marginBottom: 20,
                        }}
                    >
                        {renderActionButtons()}
                    </Row>
                )}
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

export default UpdateMedical;