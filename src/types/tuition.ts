export interface TuitionListItem {
    _id: string;
    tuitionName: string;
    totalAmount: number;
    month: number;
    schoolYear: string;
    studentName: string;
    state: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface TuitionListResponse {
    data: TuitionListItem[];
    totalAmount: number;
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface TuitionDetailItem {
    tuitionId: string;
    tuitionName: string;
    totalAmount: number;
    month: number;
    state: string;
    studentId: string;
    studentName: string;
    schoolYear: string;
    receiptCode: string;
    receiptName: string;
    createdBy: string;
    createdAt: string;
    revenueList: {
        revenueId: string;
        revenueCode: string;
        revenueName: string;
        amount: number;
        source: string;
    }[];
}

export interface TuitionDetailResponse {
    message: string;
    data: TuitionDetailItem[];
    totalAmount: number;
}

export interface ConfirmTuitionPayload {
    parentId: string;
    totalAmount: number;
}

export interface ConfirmTuitionResponse {
    success: boolean;
    message: string;
    data: {
        paymentUrl: string;
        transactionCode: number;
        qrCode: string;
    };
}

export interface CheckStatusTuitionResponse {
    success: boolean;
    status: "PAID" | "PENDING" | "FAILED";
    message: string;
}

export interface RevenueItem {
    revenueId: string;
    revenueCode: string;
    revenueName: string;
    amount: number;
    source: string;
}

export interface HistoryFeeItem {
    tuitionId: string;
    tuitionName: string;
    month: number;
    totalAmount: number;
    state: string;
    studentId: string;
    studentName: string;
    schoolYear: string;
    receiptCode: string;
    receiptName: string;
    createdBy: string;
    createdAt: string;
    revenueList: RevenueItem[];
}

export interface GetHistoryFeeResponse {
    message: string;
    data: HistoryFeeItem[];
    totalAmount: number;
}
