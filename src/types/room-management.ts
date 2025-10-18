export interface RoomFacility {
    _id?: string;
    facilityName: string;
    facilityType: string;
    quantity: number;
    condition: string;
    price: number;
    notes?: string;
}

export interface RoomRecord {
    _id: string;
    roomName: string;
    roomType: string;
    capacity: number;
    facilities: RoomFacility[];
    notes?: string;
    active: boolean;
    createdBy: string;
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
    condition: string;
    price: number;
    notes?: string;
}


export interface CreateRoomData {
    roomName: string;
    roomType: string;
    capacity: number;
    facilities: CreateRoomFacility[];
    notes?: string;
    createdBy: string;
}

export type UpdateRoomData = CreateRoomData 