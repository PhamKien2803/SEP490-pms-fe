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

interface ExportDetailsParams {
    data: DataForExport;
    fileName: string;
    sheetName?: string;
}

export const useExcelExport = ({ data, fileName, sheetName = 'Sheet1' }: UseExcelExportProps) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingDetails, setIsExportingDetails] = useState(false);

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

    const exportDetailsToExcel = useCallback(
        ({ data: detailsData, fileName: detailsFileName, sheetName: detailsSheetName = 'Sheet1' }: ExportDetailsParams) => {
            if (!detailsData || detailsData.length === 0) {
                toast.warn('Không có dữ liệu chi tiết để xuất.');
                return;
            }

            setIsExportingDetails(true);
            try {
                const worksheet = XLSX.utils.json_to_sheet(detailsData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, detailsSheetName);

                // Tên file đã bao gồm timestamp từ component
                const finalFileName = `${detailsFileName}.xlsx`;
                XLSX.writeFile(workbook, finalFileName);
            } catch (error) {
                console.error("Lỗi khi xuất Excel (Chi tiết):", error);
                toast.error('Đã có lỗi xảy ra khi xuất file Excel chi tiết.');
            } finally {
                setIsExportingDetails(false);
            }
        },
        []
    );

    return { exportToExcel, isExporting, exportDetailsToExcel, isExportingDetails };
};