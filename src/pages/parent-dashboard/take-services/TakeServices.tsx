import {
    Form,
    Select,
    Button,
    InputNumber,
    Card,
    Divider,
    Row,
    Col,
    Typography,
    Spin,
    Table,
    Image,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useNavigate, useLocation } from "react-router-dom";
import { servicesApis } from "../../../services/apiServices";
import {
    SchoolYearItem,
    ServiceDetailResponse,
    StudentItem,
} from "../../../types/services";
import { toast } from "react-toastify";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { constants } from "../../../constants";
import { usePagePermission } from "../../../hooks/usePagePermission";

const { Title } = Typography;

function TakeServices() {
    usePageTitle("Đăng ký dịch vụ - Cá Heo Xanh");
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = useCurrentUser();
    const parentId = currentUser?.parent;
    const [schoolYears, setSchoolYears] = useState<SchoolYearItem[]>([]);
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [service, setService] = useState<ServiceDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [selectedQty, setSelectedQty] = useState(1);
    const { canCreate } = usePagePermission();
    const selectedSchoolYearId = Form.useWatch("schoolYearId", form);
    const selectedStudentId = Form.useWatch("student", form);

    const fetchSchoolYears = async () => {
        try {
            const res = await servicesApis.getSchoolYears();

            if (res.data && res.data.length > 0) {
                const filtered = res.data.filter(
                    (y) => y.state !== "Chưa hoạt động"
                );

                const sorted = [...filtered].sort((a, b) => {
                    const startA = parseInt(a.schoolYear.split("-")[0]);
                    const startB = parseInt(b.schoolYear.split("-")[0]);
                    return startB - startA;
                });

                const activeYear = sorted.find(
                    (y) => y.state === "Đang hoạt động"
                )?._id || sorted[0]?._id;

                setSchoolYears(sorted);
                form.setFieldsValue({ schoolYearId: activeYear });
            }
        } catch (error) {
            typeof error === "string"
                ? toast.info(error)
                : toast.error("Không thể tải danh sách năm học");
        }
    };



    const fetchStudents = async () => {
        if (!parentId) return;
        try {
            const res = await servicesApis.getStudentByParent(parentId);
            setStudents(res.students);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải danh sách học sinh");
        }
    };

    const fetchServiceById = async () => {
        const values = form.getFieldsValue();
        const studentId = values.student;
        const schoolYearId = values.schoolYearId;
        const schoolYear = schoolYears.find((s) => s._id === schoolYearId)?.schoolYear;

        if (!studentId || !schoolYear) {
            return;
        }

        try {
            setLoading(true);
            const res = await servicesApis.getServiceById(studentId, schoolYear);
            if (!res || !res._id) {
                setService(null);
                return;
            }
            setService(res);
            setSelectedQty(res.qty || 1);

        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải thông tin dịch vụ");
            setService(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateService = async () => {
        if (!service) return;
        try {
            const values = form.getFieldsValue();

            const total = selectedQty * service.amount;

            setUpdating(true);
            await servicesApis.updateService(service._id, {
                schoolYearId: values.schoolYearId,
                schoolYear:
                    schoolYears.find((s) => s._id === values.schoolYearId)?.schoolYear ||
                    "",
                student: values.student,
                revenue: service.revenue,
                revenueName: service.revenueName,
                amount: service.amount,
                imageUniform: service.imageUniform,
                qty: selectedQty,
                totalAmount: total,
                updatedBy: currentUser?.email || "parent",
            });
            toast.success("Cập nhật dịch vụ thành công");
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Cập nhật thất bại");
        } finally {
            setUpdating(false);
        }
    };

    const handleRedirectToRegisterPage = () => {
        const values = form.getFieldsValue();
        if (!values.student || !values.schoolYearId) {
            toast.warning("Vui lòng chọn đủ thông tin để đăng ký");
            return;
        }

        navigate(`${constants.APP_PREFIX}/services/register`, {
            state: {
                studentId: values.student,
                schoolYearId: values.schoolYearId,
            },
        });
    };
    useEffect(() => {
        if (schoolYears.length > 0 && students.length > 0) {
            const navState = location.state as {
                studentId?: string;
                schoolYearId?: string;
            };

            if (navState?.studentId && navState?.schoolYearId) {
                form.setFieldsValue({
                    student: navState.studentId,
                    schoolYearId: navState.schoolYearId,
                });

                navigate(location.pathname, { state: {}, replace: true });
            }
        }
    }, [location.state, schoolYears, students, form, navigate]);
    useEffect(() => {
        fetchSchoolYears();
        fetchStudents();
    }, [parentId]);

    useEffect(() => {
        if (selectedSchoolYearId && selectedStudentId) {
            fetchServiceById();
        }
    }, [selectedSchoolYearId, selectedStudentId]);

    const columns: ColumnsType<ServiceDetailResponse> = [
        {
            title: "Hình ảnh",
            dataIndex: "imageUniform",
            key: "image",
            width: 100,
            render: (imageUrl: string) => (
                <Image
                    width={80}
                    height={80}
                    src={imageUrl}
                    alt="uniform"
                    style={{ objectFit: "cover" }}
                />
            ),
        },
        {
            title: "Đơn giá",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number, record) => (
                `${typeof amount === "number" ? amount.toLocaleString() : "0"}đ / ${record.unit || ""
                }`
            ),
        },
        {
            title: "Số lượng",
            key: "quantity",
            render: () => (
                <InputNumber
                    min={1}
                    max={10}
                    value={selectedQty}
                    onChange={(val) => setSelectedQty(val || 1)}
                />
            ),
        },
        {
            title: "Tổng tiền",
            key: "total",
            // Hiển thị tổng tiền mới nhất dựa trên selectedQty và đơn giá (amount)
            render: (_, record) => (
                <b>{`${(selectedQty * record.amount).toLocaleString()}đ`}</b>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: () => (
                <Button
                    type="primary"
                    onClick={handleUpdateService}
                    loading={updating}
                >
                    Cập nhật
                </Button>
            ),
        },
    ];

    return (
        <Spin spinning={loading}>
            <Card bordered={false}>
                <Title level={3}>Đăng ký dịch vụ cho con</Title>

                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Năm học"
                                name="schoolYearId"
                                rules={[{ required: true, message: "Vui lòng chọn năm học" }]}
                            >
                                <Select placeholder="Chọn năm học">
                                    {schoolYears.map((item) => (
                                        <Select.Option key={item._id} value={item._id}>
                                            {item?.schoolYear}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Học sinh"
                                name="student"
                                rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
                            >
                                <Select placeholder="Chọn học sinh">
                                    {students.map((stu) => (
                                        <Select.Option key={stu?._id} value={stu._id}>
                                            {stu?.fullName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item label=" ">
                                {canCreate && (
                                    <Button type="primary" onClick={handleRedirectToRegisterPage}>
                                        Đăng ký
                                    </Button>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                {selectedStudentId && selectedSchoolYearId && (
                    <>
                        <Divider />
                        <Title level={4}>Chi tiết dịch vụ đã đăng ký</Title>

                        {service ? (
                            <Table
                                columns={columns}
                                dataSource={[service]}
                                rowKey="_id"
                                pagination={false}
                                bordered
                            />
                        ) : (
                            <p style={{ padding: "12px 0", fontStyle: "italic", color: "#888" }}>
                                Học sinh này chưa có dữ liệu dịch vụ cho năm học đã chọn.
                            </p>
                        )}
                    </>
                )}
            </Card>
        </Spin>
    );
}

export default TakeServices;