export interface EventItem {
    _id: string;
    eventCode: string;
    eventName: string;
    holidayStartDate: string;
    holidayEndDate: string;
    note?: string;
    active: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    schoolYear: string;
}


export interface GetEventsParams {
  page: number;
  limit: number;
  schoolYear?: string; 
}

export interface EventsListResponse {
    data: EventItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}


export interface CreateEventDto {
    eventName: string;
    holidayStartDate: string;
    holidayEndDate: string;
    note?: string;
    createdBy?: string;
    updatedBy?: string;
}


export interface UpdateEventDto {
    eventName: string;
    holidayStartDate: string;
    holidayEndDate: string;
    note?: string;
    createdBy?: string;
    updatedBy?: string;
}