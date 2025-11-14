import { toast } from "react-toastify";
import type { RcFile } from 'antd/es/upload/interface';
import { Upload } from "antd";


export const beforeUploadPDF = (file: RcFile) => {
    const isPdf = file.type === 'application/pdf';
    if (!isPdf) {
        toast.error('Bạn chỉ có thể tải lên file có định dạng .pdf!');
    }
    return isPdf || Upload.LIST_IGNORE;
};

export const beforeUploadImage = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        toast.error('Bạn chỉ có thể tải lên file JPG/PNG!');
    }
    return isJpgOrPng || Upload.LIST_IGNORE;
};