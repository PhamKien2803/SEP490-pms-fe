import dayjs from "dayjs";

export interface Item {
  name: string;
  label: string;
}

export interface ParentInfo {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface StudentListItem {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: dayjs.Dayjs | null;
  idCard: string;
  gender: "Nam" | "Nữ" | "Khác" | string;
  name: string;
  label: string;
  nation?: string;
  religion?: string;
}

export interface FeedbackParams {
  studentId: string;
  date: string;
}
interface IStudentInfo {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  gender: string;
}

interface IClassInfo {
  _id: string;
  classCode: string;
  className: string;
}

interface ITeacherInfo {
  _id: string;
  staffCode: string;
  fullName: string;
}

interface IEating {
  breakfast: string;
  lunch: string;
  snack: string;
  note: string;
}

interface ISleeping {
  duration: string;
  quality: string;
  note: string;
}

interface IHygiene {
  toilet: string;
  handwash: string;
  note: string;
}

interface ILearning {
  focus: string;
  participation: string;
  note: string;
}

interface ISocial {
  friendInteraction: string;
  emotionalState: string;
  behavior: string;
  note: string;
}

interface IHealth {
  note: string;
}

export interface FeedbackData {
  _id: string;
  studentId: IStudentInfo;
  classId: IClassInfo;
  teacherId: ITeacherInfo;
  date: string;
  eating: IEating;
  sleeping: ISleeping;
  hygiene: IHygiene;
  learning: ILearning;
  social: ISocial;
  health: IHealth;
  dailyHighlight: string;
  teacherNote: string;
  reminders: string[];
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackResponse {
  success: boolean;
  data: FeedbackData;
}

export interface PageParams {
  page: number;
  limit: number;
}

export interface HealthCheckResponse {
  data: HealthCheckRecord[];
  page: {
    totalCount: number;
    limit: number;
    page: number;
  };
}

export interface HealthCheckRecord {
  _id: string;
  student: Student;
  physicalDevelopment: PhysicalDevelopment;
  comprehensiveExamination: ComprehensiveExamination;
  conclusion: Conclusion;
  createdBy: string;
  updatedBy: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  class: ClassInfo;
  schoolYear: SchoolYear;
  healthCertFiles: HealthCertFile;
}

export interface Student {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  healthCertId: string;
  idCard: string;
  nation: string;
  religion: string;
}

export interface ParentStudentsListResponse {
  success: boolean;
  parent: ParentInfo;
  students: StudentListItem[];
}

export interface ActivityDetail {
  _id: string;
  activityCode: string;
  activityName: string;
  type: string;
  startTime: number;
  endTime: number;
  age?: string;
  category?: string;
}

export interface PhysicalDevelopment {
  height: number;
  weight: number;
  bodyMassIndex: number;
  evaluation: string;
}

export interface ComprehensiveExamination {
  mentalDevelopment: string;
  motorDevelopment: string;
  diseasesDetected: string[];
  abnormalSigns: string[];
  diseaseRisk: string[];
  notes: string;
}

export interface Conclusion {
  healthStatus: string;
  advice: string;
}

export interface ClassInfo {
  _id: string;
  classCode: string;
  className: string;
}

export interface SchoolYear {
  _id: string;
  schoolYear: string;
}

export interface HealthCertFile {
  _id: string;
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
}

interface Parent {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface ChildResponse {
  success: boolean;
  parent: Parent;
  students: Student[];
}

export interface CheckInResponse {
  success: boolean;
  class: ClassInfo;
  schoolYear: SchoolYearInfo;
  teacher: TeacherInfo;
  date: string;
  generalNote: string;
  student: CheckInStudentData;
}

export interface ClassInfo {
  _id: string;
  classCode: string;
  className: string;
}

export interface SchoolYearInfo {
  _id: string;
  schoolyearCode: string;
  schoolYear: string;
}

export interface TeacherInfo {
  _id: string;
  fullName: string;
  phoneNumber: string;
}

export interface CheckInStudentData {
  status: string;
  student: StudentShort;
  note: string;
  timeCheckIn: string;
  timeCheckOut: string;
}

export interface StudentShort {
  _id: string;
  studentCode: string;
  fullName: string;
  gender: string;
}

export interface CheckInParams {
  studentId: string;
  date: string;
}

export interface ClassChildParams {
  studentId: string;
  schoolYearId: string;
}

export interface ClassDetailResponse {
  success: boolean;
  class: ClassDetail;
}

export interface ClassDetail {
  _id: string;
  classCode: string;
  className: string;
  students: StudentInfo[];
  teachers: TeacherInfo[];
  room: RoomInfo;
  schoolYear: SchoolYearInfo;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  age: string;
}

export interface StudentInfo {
  _id: string;
  studentCode: string;
  fullName: string;
  gender: string;
}

export interface TeacherInfo {
  _id: string;
  fullName: string;
  phoneNumber: string;
}

export interface RoomInfo {
  _id: string;
  roomName: string;
}

export interface SchoolYearInfo {
  _id: string;
  schoolyearCode: string;
  schoolYear: string;
}

export interface ScheduleParams {
  classId: string;
  month: string;
}

export interface Activity {
  _id: string;
  activityCode: string;
  activityName: string;
  type: string;
  startTime?: number;
  endTime?: number;
  age?: string;
  category?: string;
}

export interface ScheduleActivity {
  _id: string;
  tittle: string;
  startTime: number;
  endTime: number;
  activityCode: string;
  activityName: string;
  type: string;
}

export interface ScheduleDay {
  _id: string;
  date: string;
  dayName: string;
  activities: ScheduleActivity[];
  isHoliday: boolean;
  notes: string;
}

export interface ClassInfo {
  _id: string;
  classCode: string;
  className: string;
}

export interface ScheduleItem {
  _id: string;
  schoolYear: string;
  class: ClassInfo;
  month: number;
  scheduleDays: ScheduleDay[];
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type ScheduleList = ScheduleItem[];

export interface MenuParams {
  studentId: string;
  date: string;
}

export interface Ingredient {
  name: string;
  gram: number;
  unit: string;
  calories: number;
  protein: number;
  lipid: number;
  carb: number;
}

export interface Food {
  _id: string;
  foodName: string;
  totalCalories: number;
  ingredients: Ingredient[];
}

export interface FoodWrapper {
  food: Food;
}

export interface Meal {
  mealType: string;
  foods: FoodWrapper[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
}

export interface DayMenu {
  date: string;
  meals: Meal[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
}

export interface MenuResponse {
  _id: string;
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  ageGroup: string;
  days: DayMenu[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
  state: string;
  active: boolean;
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  reason?: string;
}
