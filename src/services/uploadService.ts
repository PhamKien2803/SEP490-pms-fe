import { UploadProps } from 'antd';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { StudentInClass, TeacherInClass } from '../types/class';
import { classApis } from '../services/apiServices';

export const MAXIMUM_CLASS = {
    TEACHER: 2,
    CLASS: 10,
    CLASS_1: 15,
    CLASS_2: 20,
    CLASS_3: 25,
    CLASS_4: 30,
    CLASS_5: 35
};

const headerMapping = {
    'Mã HS': 'studentCode',
    'Mã GV': 'staffCode',
    'Họ tên': 'fullName',
    'Giới tính': 'gender',
    'Email': 'email',
};

export const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json<any>(worksheet);

                const mappedJson = json.map(row => {
                    const newRow: Record<string, any> = {};
                    for (const key in row) {
                        const newKey = headerMapping[key as keyof typeof headerMapping] || key;
                        newRow[newKey] = row[key];
                    }
                    return newRow;
                });
                resolve(mappedJson);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const downloadExcelTemplate = (fileName: string, sampleData: any[]) => {
    try {
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const headers = Object.keys(sampleData[0]);
        worksheet['!cols'] = headers.map(header => ({ wch: header.length + 10 }));
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
        toast.error("Không thể tạo file mẫu.");
    }
};

interface ExcelUploadConfig<T> {
    entityName: string;
    keyField: keyof T;
    expectedHeaders: string[];
    currentItems: T[];
    allItems: T[];
    onAddItems: (items: T[]) => void;
    limitCheck?: (itemsToAddCount: number) => { valid: boolean; message?: string };
}

const excelUploadHandler = <T extends { _id: string }>(
    options: Parameters<NonNullable<UploadProps['customRequest']>>[0],
    config: ExcelUploadConfig<T> & { currentItems: T[] }
) => {
    const { file, onSuccess, onError } = options;
    const {
        entityName,
        keyField,
        expectedHeaders,
        allItems,
        currentItems,
        onAddItems,
        limitCheck
    } = config;

    const normalize = (v?: string) => v?.trim().toUpperCase();

    readExcelFile(file as File)
        .then(async (jsonData) => {
            if (!jsonData || jsonData.length === 0) {
                toast.warn(`File Excel không có dữ liệu.`);
                return onError?.(new Error('Empty file'));
            }

            const actualHeaders = Object.keys(jsonData[0]);
            if (!expectedHeaders.every(h => actualHeaders.includes(h))) {
                toast.error(
                    `File Excel sai định dạng. Cần có các cột: ${expectedHeaders.join(', ')}`
                );
                return onError?.(new Error('Invalid format'));
            }

            const excelCodes = new Set(
                jsonData
                    .map(row => normalize(row[keyField as string]))
                    .filter(Boolean)
            );

            if (excelCodes.size === 0) {
                toast.warn(`File không chứa mã ${entityName} hợp lệ nào.`);
                return onError?.(new Error('No valid codes'));
            }

            const systemMap = new Map(
                allItems.map(item => [normalize(item[keyField] as any), item])
            );

            const currentCodeSet = new Set(
                currentItems.map(item => normalize(item[keyField] as any))
            );

            const validItems: T[] = [];
            const existedCodes: string[] = [];
            const invalidCodes: string[] = [];

            excelCodes.forEach(code => {
                const systemItem = systemMap.get(code);

                if (!systemItem) {
                    if (typeof code === 'string') {
                        invalidCodes.push(code);
                    }
                } else if (currentCodeSet.has(code)) {
                    if (typeof code === 'string') {
                        existedCodes.push(code); // đã có => KHÔNG thêm
                    }
                } else {
                    validItems.push(systemItem); // mới => thêm
                }
            });

            if (invalidCodes.length > 0) {
                // toast.info(`${invalidCodes.length} ${entityName} không tồn tại và đã bị bỏ qua.`);
                console.warn('Không tồn tại:', invalidCodes);
            }

            if (existedCodes.length > 0) {
                toast.info(`${existedCodes.length} ${entityName} đã tồn tại trong lớp.`);
            }

            if (validItems.length === 0) {
                toast.warn(`Không có ${entityName} mới nào để thêm.`);
                return onError?.(new Error('Nothing to add'));
            }

            if (limitCheck) {
                const { valid, message } = limitCheck(validItems.length);
                if (!valid) {
                    toast.warn(message);
                    return onError?.(new Error('Limit exceeded'));
                }
            }
            onAddItems(validItems);
            toast.success(`Đã thêm ${validItems.length} ${entityName} mới từ file.`);
            onSuccess?.(file);
        })
        .catch((err) => {
            toast.error('Lỗi khi đọc file Excel.');
            onError?.(err);
        });
};


export const handleStudentExcelUpload = async (
    options: Parameters<NonNullable<UploadProps['customRequest']>>[0],
    context: {
        classId: string;
        students: StudentInClass[];
        handleAddStudents: (s: StudentInClass[]) => void;
    }
) => {
    const { classId, students, handleAddStudents } = context;

    try {
        //Lấy thông tin lớp để xác định độ tuổi
        const classDetails = await classApis.getClassById(classId);
        const classAge = parseInt(classDetails.age, 10);
        const allAvailableStudents = await classApis.getAllAvailableStudents(classAge);
        const normalizedAvailable = allAvailableStudents.map((s) => ({
            ...s,
            studentCode: s.studentCode?.trim().toUpperCase(),
        }));

        excelUploadHandler(options, {
            entityName: 'học sinh',
            keyField: 'studentCode',
            expectedHeaders: ['studentCode', 'fullName', 'gender'],
            currentItems: students,
            allItems: normalizedAvailable,
            onAddItems: handleAddStudents,
            limitCheck: (itemsToAddCount: number) => {
                const studentLimitKey = `CLASS_${classAge}` as keyof typeof MAXIMUM_CLASS;
                const studentLimit = MAXIMUM_CLASS[studentLimitKey] || 999;

                if (students.length + itemsToAddCount > studentLimit) {
                    return {
                        valid: false,
                        message: `Lớp ${classAge} tuổi chỉ có tối đa ${studentLimit} học sinh. Hiện tại đã có ${students.length}.`
                    };
                }
                return { valid: true };
            },
        });
    } catch (apiError) {
        toast.error('Không thể xác thực thông tin lớp học hoặc danh sách học sinh.');
        options.onError?.(new Error('Failed to fetch class details or students'));
    }
};



export const handleTeacherExcelUpload = (
    options: Parameters<NonNullable<UploadProps['customRequest']>>[0],
    context: {
        teachers: TeacherInClass[];
        allAvailableTeachers: TeacherInClass[];
        handleAddTeachers: (t: TeacherInClass[]) => void;
    }
) => {
    const { teachers, allAvailableTeachers, handleAddTeachers } = context;
    excelUploadHandler(options, {
        entityName: 'giáo viên',
        keyField: 'staffCode',
        expectedHeaders: ['staffCode', 'fullName', 'email'],
        currentItems: teachers,
        allItems: allAvailableTeachers,
        onAddItems: handleAddTeachers,
        limitCheck: (itemsToAddCount: number) => {
            if (teachers.length + itemsToAddCount > MAXIMUM_CLASS.TEACHER) {
                return {
                    valid: false,
                    message: `Chỉ được có tối đa ${MAXIMUM_CLASS.TEACHER} giáo viên. Hiện tại đã có ${teachers.length}.`
                };
            }
            return { valid: true };
        },
    });
};