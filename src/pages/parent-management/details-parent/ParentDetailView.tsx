import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Descriptions,
    Divider,
    Tag,
    Alert,
    Table,
    Typography,
    Spin,
    Button,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { parentsApis } from "../../../services/apiServices";
import { ParentStudent, StudentRecord } from "../../../types/auth";
import { toast } from "react-toastify";

const { Title } = Typography;

const ParentDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [parentData, setParentData] = useState<ParentStudent | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Không tìm thấy ID phụ huynh trong URL.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await parentsApis.getParentById(id);
                setParentData(data);
            } catch (error) {
                typeof error === "string" ? toast.info(error) : toast.error("Lấy danh sách thất bại")
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatGender = (gender?: string) => {
        if (!gender) return "-";
        if (gender === "Nam") return "Nam";
        if (gender === "Nữ") return "Nữ";
        return "Khác";
    };

    const studentColumns: TableProps<StudentRecord>["columns"] = [
        {
            title: "Mã học sinh",
            dataIndex: "studentCode",
            key: "studentCode",
            render: (text) => <Tag color="cyan">{text}</Tag>,
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
        },
        {
            title: "Ngày sinh",
            dataIndex: "dob",
            key: "dob",
            render: (text) => formatDate(text),
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            render: (text) => formatGender(text),
        },
    ];

    if (loading) {
        return (
            <Spin
                tip="Đang tải dữ liệu..."
                size="large"
                fullscreen
            />
        );
    }

    if (error) {
        return (
            <Card style={{ margin: 24 }}>
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                />
            </Card>
        );
    }

    if (!parentData) {
        return null;
    }

    return (
        <Card style={{ margin: 24 }} bordered={false}>
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16, paddingLeft: 0, fontWeight: 500 }}
            >
                Quay lại
            </Button>

            <Title level={3} style={{ marginTop: 0 }}>
                Thông tin chi tiết phụ huynh: {parentData.fullName}
            </Title>
            <Tag color={parentData.active ? "green" : "red"} style={{ fontSize: 14 }}>
                {parentData.active ? "Đang hoạt động" : "Ngừng hoạt động"}
            </Tag>

            <Divider orientation="left" plain style={{ marginTop: 24 }}>
                Thông tin cá nhân
            </Divider>
            <Descriptions bordered layout="horizontal" column={2}>
                <Descriptions.Item label="Mã phụ huynh">
                    <Tag color="blue">{parentData.parentCode}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Họ và tên">
                    {parentData.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                    {formatGender(parentData.gender)}
                </Descriptions.Item>

                {/* SỬA LỖI DOB: Đây là dòng đúng */}
                <Descriptions.Item label="Ngày sinh">
                    {formatDate(parentData?.dob)}
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                    {parentData.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Email">{parentData.email}</Descriptions.Item>
                <Descriptions.Item label="CMND/CCCD">
                    {parentData.IDCard}
                </Descriptions.Item>
                <Descriptions.Item label="Nghề nghiệp">
                    {parentData.job || "-"}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain style={{ marginTop: 32 }}>
                Danh sách học sinh liên kết
            </Divider>
            <Table
                columns={studentColumns}
                dataSource={parentData.students}
                rowKey="_id"
                pagination={false}
                bordered
            />
        </Card>
    );
};

export default ParentDetailView;