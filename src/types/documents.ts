export interface IDocumentItem {
    _id: string;
    documentCode: string;
    documentName: string;
    documentDate: string;
    schoolYear: string;
    receiver: string;
    numberBank: string;
    bank: string;
    amount: number;
    reason: string;
    method: string;
    documentList: {
        _id?: string;
        document: string;
        amount: number;
    }[];
    createdBy: string;
    status: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IDocumentListResponse {
    data: IDocumentItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface IDocumentDetailResponse extends Omit<IDocumentItem, "schoolYear"> {
    schoolYear: string;
}

export interface ICreateOrUpdateDocumentPayload {
    documentName: string;
    documentDate: string;
    receiver: string;
    numberBank: string;
    bank: string;
    amount: number;
    reason: string;
    method: string;
    documentList: {
        document: string;
        amount: number;
    }[];
    createdBy: string;
    status: string;
}
