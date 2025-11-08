import {
    Button,
    InputNumber,
    Card,
    Typography,
    Spin,
    Table,
    Image,
    Row,
    Col,
    Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { CreateOrUpdateServicePayload, PreviewServiceResponse } from "../../../../types/services";
import { constants } from "../../../../constants";
import { servicesApis } from "../../../../services/apiServices";

const { Title } = Typography;

function RegisterServices() {
    usePageTitle("Đăng ký dịch vụ - Cá Heo Xanh");
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = useCurrentUser();

    const { studentId, schoolYearId } = (location.state as {
        studentId: string;
        schoolYearId: string;
    }) || {};

    const [preview, setPreview] = useState<PreviewServiceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedQty, setSelectedQty] = useState(1);

    useEffect(() => {
        if (!studentId || !schoolYearId) {
            toast.error("Thiếu thông tin học sinh hoặc năm học!");
            navigate(-1);
        }
    }, [studentId, schoolYearId, navigate]);

    useEffect(() => {
        const fetchPreview = async () => {
            setLoading(true);
            try {
                const res = await servicesApis.getPreviewService();
                setPreview(res);
            } catch {
                toast.error("Không thể tải thông tin dịch vụ đăng ký");
            } finally {
                setLoading(false);
            }
        };

        if (studentId && schoolYearId) {
            fetchPreview();
        }
    }, [studentId, schoolYearId]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleCreateService = async () => {
        if (!preview || !studentId) {
            toast.warning("Không có thông tin dịch vụ để đăng ký");
            return;
        }

        setCreating(true);
        const total = selectedQty * preview.amount;

        const payload: CreateOrUpdateServicePayload = {
            schoolYearId: preview.schoolYearId,
            student: studentId,
            schoolYear: preview.schoolYear,
            revenue: preview.revenue,
            revenueName: preview.revenueName,
            amount: preview.amount,
            imageUniform: preview.imageUniform,
            qty: selectedQty,
            totalAmount: total,
            createdBy: currentUser?.email || "parent",
        };

        try {
            await servicesApis.createService(payload);
            toast.success("Đăng ký dịch vụ thành công!");
            navigate(`${constants.APP_PREFIX}/services`, {
                replace: true,
                state: {
                    studentId: studentId,
                    schoolYearId: schoolYearId,
                },
            });
        } catch (error) {
            typeof error === "string" ? toast.warn(error) : toast.error("Đăng ký dịch vụ thất bại");
        } finally {
            setCreating(false);
        }
    };

    const columns: ColumnsType<PreviewServiceResponse> = [
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
            title: "Tên dịch vụ",
            dataIndex: "revenueName",
            key: "name",
        },
        {
            title: "Đơn giá",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number) =>
                `${typeof amount === "number" ? amount.toLocaleString() : "0"}đ`,
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
            render: (_, record) => (
                <b>{`${(selectedQty * record.amount).toLocaleString()}đ`}</b>
            ),
        },
    ];

    return (
        <Spin spinning={loading}>
            <Card bordered={false}>
                <Title level={3}>Xác nhận đăng ký dịch vụ</Title>
                <Table
                    columns={columns}
                    dataSource={preview ? [preview] : []}
                    rowKey="_id"
                    pagination={false}
                    bordered
                />
                <Row justify="end" style={{ marginTop: 24 }}>
                    <Space>
                        <Col>
                            <Button onClick={handleBack}>Quay lại</Button>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                onClick={handleCreateService}
                                loading={creating}
                                disabled={!preview}
                            >
                                Xác nhận đăng ký
                            </Button>
                        </Col>
                    </Space>
                </Row>
            </Card>
        </Spin>
    );
}

export default RegisterServices;    