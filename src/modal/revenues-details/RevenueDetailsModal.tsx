import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Spin, Tag } from "antd";
import { toast } from "react-toastify";
import { revenuesApis } from "../../services/apiServices";
import { RevenueDetailResponse } from "../../types/revenues";

interface Props {
    open: boolean;
    onClose: () => void;
    revenueId: string | null;
}

const RevenueDetailsModal: React.FC<Props> = ({ open, onClose, revenueId }) => {
    const [loading, setLoading] = useState(false);
    const [revenue, setRevenue] = useState<RevenueDetailResponse | null>(null);

    const fetchRevenue = async () => {
        if (!revenueId) return;
        setLoading(true);
        try {
            const res = await revenuesApis.getRevenueById(revenueId);
            setRevenue(res);
        } catch (error) {
            typeof error === "string" ? toast.info(error) : toast.error("Không thể tải chi tiết khoản thu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchRevenue();
    }, [open, revenueId]);

    return (
        <Modal
            open={open}
            title="Chi tiết khoản thu"
            onCancel={onClose}
            footer={null}
            width={700}
        >
            {loading || !revenue ? (
                <div style={{ textAlign: "center", padding: 32 }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Descriptions column={2} size="middle">
                    <Descriptions.Item label="Mã">{revenue.revenueCode}</Descriptions.Item>
                    <Descriptions.Item label="Tên">{revenue.revenueName}</Descriptions.Item>
                    <Descriptions.Item label="Đơn vị">{revenue.unit}</Descriptions.Item>
                    <Descriptions.Item label="Số tiền">
                        {revenue.amount.toLocaleString("vi-VN")}₫
                    </Descriptions.Item>
                    <Descriptions.Item label="Người tạo">{revenue.createdBy}</Descriptions.Item>
                    <Descriptions.Item label="Người cập nhật">{revenue.updatedBy}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {revenue.active ? <Tag color="green">Đang áp dụng</Tag> : <Tag color="red">Ngưng</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {new Date(revenue.createdAt).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                        {new Date(revenue.updatedAt).toLocaleString()}
                    </Descriptions.Item>
                </Descriptions>
            )}
        </Modal>
    );
};

export default RevenueDetailsModal;
