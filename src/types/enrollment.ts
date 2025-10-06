export interface RegisterEnrollmentDto {
    studentName: string;
    studentDob: string;
    studentGender: "Nam" | "Nữ" | "Khác";
    studentIdCard: string;
    studentNation: string;
    studentReligion: string;
    address: string;
    fatherName: string;
    fatherPhoneNumber: string;
    fatherEmail: string;
    fatherIdCard: string;
    fatherJob: string;
    motherName: string;
    motherPhoneNumber: string;
    motherEmail: string;
    motherIdCard: string;
    motherJob: string;
}
