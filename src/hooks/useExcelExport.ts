import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

type DataForExport = Record<string, any>[];

interface UseExcelExportProps {
    data: DataForExport;
    fileName: string;
    sheetName?: string;
}

export const useExcelExport = ({ data, fileName, sheetName = 'Sheet1' }: UseExcelExportProps) => {
    const [isExporting, setIsExporting] = useState(false);

    const exportToExcel = useCallback(() => {
        if (!data || data.length === 0) {
            toast.warn('Không có dữ liệu để xuất.');
            return;
        }

        setIsExporting(true);
        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            const finalFileName = `${fileName}_${dayjs().format('YYYYMMDD')}.xlsx`;
            XLSX.writeFile(workbook, finalFileName);
        } catch (error) {
            console.error("Lỗi khi xuất Excel:", error);
            toast.error('Đã có lỗi xảy ra khi xuất file Excel.');
        } finally {
            setIsExporting(false);
        }
    }, [data, fileName, sheetName]);

    return { exportToExcel, isExporting };
};