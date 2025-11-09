export interface IServiceReportItem {
    serviceCode: string;
    studentName: string;
    qty: number;
    totalAmount: number;
    createdBy: string;
    updatedBy: string;
}

export interface IServiceReportResponse {
    data: IServiceReportItem[];
    length: number;
}
