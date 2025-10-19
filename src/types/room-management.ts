export type RoomState =
  | "Dự thảo"
  | "Chờ giáo viên duyệt"
  | "Chờ nhân sự xác nhận"
  | "Hoàn thành"
  | "Chờ xử lý";
export interface RoomFacility {
  facilityName: string;
  facilityType: string;
  quantity: number;
  quantityDefect: number;
  quantityMissing: number;
  notes?: string;
}
export interface RoomRecord {
  _id: string;
  roomName: string;
  roomType: string;
  capacity: number;
  facilities: RoomFacility[];
  state: RoomState;
  notes?: string;
  notesTeacher?: string;
  notesHRA?: string;
  active: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface PaginationInfo {
  totalCount: number;
  limit: number;
  page: number;
}
export interface RoomListResponse {
  data: RoomRecord[];
  page: PaginationInfo;
}
export interface CreateRoomFacility {
  facilityName: string;
  facilityType: string;
  quantity: number;
  quantityDefect: number;
  quantityMissing: number;
  notes?: string;
}
export interface CreateRoomData {
  roomName: string;
  roomType: string;
  capacity: number;
  facilities: CreateRoomFacility[];
  state: RoomState;
  notes?: string;
  createdBy: string;
  updatedBy?: string;
}

export type UpdateRoomData = CreateRoomData;
export interface FacilityExportRecord {
  "Mã Phòng": string;
  "Tên Phòng": string;
  "Tên Thiết Bị": string;
  "Loại Thiết Bị": string;
  "SL Tổng": number;
  "SL Hỏng/Lỗi": number;
  "SL Thiếu": number;
  "Ghi Chú GV": string;
  "Trạng Thái Phòng": string;
  "Ngày Cập Nhật": string;
}
