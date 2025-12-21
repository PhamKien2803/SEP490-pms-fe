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

// export const beforeUploadPDF = (file: RcFile) => {
//     const isPdf = file.type === 'application/pdf';
//     if (!isPdf) {
//         toast.error('Bạn chỉ có thể tải lên file có định dạng .pdf!');
//         return false;
//     }

//     // Regex kiểm tra tên file có dấu tiếng Việt
//     const hasDiacriticalMarks = /[\u00C0-\u00FF\u0100-\u017F\u1EA0-\u1EFF\u1E00-\u1E7F\u0110\u1E02-\u1E3F]/.test(file.name);
//     if (hasDiacriticalMarks) {
//         toast.error('Tên file không được chứa dấu!');
//         return false;
//     }

//     return true;
// };



export const beforeUploadImage = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        toast.error('Bạn chỉ có thể tải lên file JPG/PNG!');
    }
    return isJpgOrPng || Upload.LIST_IGNORE;
};