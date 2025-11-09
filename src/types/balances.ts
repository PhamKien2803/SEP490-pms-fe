export interface BalanceTransaction {
    _id: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    source: string;
    transactionCode: string;
    note: string;
    createdAt: string;
    updatedAt: string;
}

export interface BalanceDetailResponse {
    currentBalance: number;
    transactions: BalanceTransaction[];
}
