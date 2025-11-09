import { Descriptions, Modal } from "antd";
import { IDocumentDetailResponse } from "../../types/documents";

interface ViewDocumentModalProps {
    open: boolean;
    onClose: () => void;
    data?: IDocumentDetailResponse;
}

function ViewDocumentModal({ open, onClose, data }: ViewDocumentModalProps) {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title="Chi tiết chứng từ"
            width={800}
        >
            <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Mã chứng từ">{data?.documentCode}</Descriptions.Item>
                <Descriptions.Item label="Tên chứng từ">{data?.documentName}</Descriptions.Item>
                <Descriptions.Item label="Ngày lập">
                    {new Date(data?.documentDate || "").toLocaleDateString("vi-VN")}
                </Descriptions.Item>
                <Descriptions.Item label="Năm học">{data?.schoolYear}</Descriptions.Item>
                <Descriptions.Item label="Người nhận">{data?.receiver}</Descriptions.Item>
                <Descriptions.Item label="Số tài khoản">{data?.numberBank}</Descriptions.Item>
                <Descriptions.Item label="Ngân hàng">{data?.bank}</Descriptions.Item>
                <Descriptions.Item label="Hình thức">{data?.method}</Descriptions.Item>
                <Descriptions.Item label="Số tiền">{data?.amount.toLocaleString("vi-VN")} VND</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{data?.status}</Descriptions.Item>
                <Descriptions.Item label="Lý do" span={2}>{data?.reason}</Descriptions.Item>
                <Descriptions.Item label="Danh sách chứng từ" span={2}>
                    {data?.documentList.map((doc, idx) => (
                        <div key={idx}>• {doc.document} - {doc.amount.toLocaleString("vi-VN")} VND</div>
                    ))}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}

export default ViewDocumentModal;
