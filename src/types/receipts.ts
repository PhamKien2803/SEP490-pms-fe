export interface ReceiptItem {
    _id: string;
    receiptCode: string;
    receiptName: string;
    schoolYear: string;
    month: number;
    createdBy: string;
    state: string;
}


export interface ReceiptListResponse {
    data: ReceiptItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}


export interface RevenueInReceipt {
    revenue: string;
    revenueName: string;
    amount: number;
}


export interface ReceiptDetailResponse {
    receiptCode: string;
    receiptName: string;
    schoolYearId: string;
    schoolYear: string;
    month: number;
    totalAmount: number;
    state: string;
    revenueList: RevenueInReceipt[];
    disabledMonth?: boolean;
    isAdmissionFee?: boolean;
    isEnroll?: boolean;
}


export interface CreateOrUpdateReceiptPayload {
    receiptName: string;
    revenueList: {
        revenue: string;
        amount: number;
    }[];
    schoolYear: string;
    month: number;
    totalAmount: number;
    isAdmissionFee?: boolean;
    isEnroll?: boolean;
    createdBy?: string;
    updatedBy?: string;
}


export interface RevenueForReceiptItem {
    _id: string;
    revenueCode: string;
    revenueName: string;
    unit: string;
    amount: number;
    createdBy: string;
    updatedBy: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}