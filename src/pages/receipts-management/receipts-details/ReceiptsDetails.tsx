import { useEffect, useState } from "react";
import { Descriptions, Spin, Tag, Typography, Table, Button, Space } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { receiptsApis } from "../../../services/apiServices";
import { ReceiptDetailResponse, RevenueInReceipt } from "../../../types/receipts";
import { usePageTitle } from "../../../hooks/usePageTitle";

const { Title } = Typography;

function ReceiptsDetails() {
    usePageTitle("Chi tiết biên lai - Cá Heo Xanh");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<ReceiptDetailResponse | null>(null);

    const fetchReceiptDetail = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await receiptsApis.getReceiptById(id);
            setReceipt(res);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải chi tiết biên lai");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceiptDetail();
    }, [id]);

    const renderStateTag = (state: string) => {
        switch (state) {
            case "CONFIRMED":
                return <Tag color="green">Đã xác nhận</Tag>;
            case "DRAFT":
                return <Tag color="orange">Bản nháp</Tag>;
            case "CANCELLED":
                return <Tag color="red">Đã hủy</Tag>;
            default:
                return <Tag color="default">{state}</Tag>;
        }
    };

    const revenueColumns: ColumnsType<RevenueInReceipt> = [
        {
            title: "Tên khoản thu",
            dataIndex: "revenueName",
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            render: (amount: number) => `${amount.toLocaleString()} VNĐ`,
        },
    ];

    return (
        <div>
            <Space align="center" style={{ marginBottom: 16 }}>
                <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                    Chi tiết biên lai
                </Title>
            </Space>

            {loading ? (
                <Spin />
            ) : receipt ? (
                <>
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Mã biên lai">
                            {receipt.receiptCode}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên biên lai">
                            {receipt.receiptName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm học">
                            {receipt.schoolYear}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tháng">
                            {receipt.month}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền">
                            {receipt.totalAmount.toLocaleString()} VNĐ
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {renderStateTag(receipt.state)}
                        </Descriptions.Item>
                    </Descriptions>

                    <Title level={4} style={{ marginTop: 24 }}>
                        Danh sách khoản thu
                    </Title>
                    <Table
                        columns={revenueColumns}
                        dataSource={receipt.revenueList}
                        rowKey="revenue"
                        pagination={false}
                    />
                </>
            ) : (
                <div>Không tìm thấy dữ liệu</div>
            )}
        </div>
    );
}

export default ReceiptsDetails;
