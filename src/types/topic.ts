export interface TopicListItem {
    _id: string;
    topicCode: string;
    topicName: string;
    month: string;
    age: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    schoolYear?: string;
}

export interface ActivityReference {
    _id: string;
    activityCode: string;
    activityName: string;
    type: "Cố định" | "Bình thường" | "Sự kiện";
    startTime?: number;
    endTime?: number;
    age?: string;
    category?: string;
    eventName?: string;
    active: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface TopicActivityDetail {
    activity: ActivityReference;
    sessionsPerWeek: number;
    _id: string;
}

export interface TopicDetails {
    _id: string;
    topicCode: string;
    topicName: string;
    month: string;
    schoolYear: string;
    age: string;
    activitiFix: TopicActivityDetail[];
    activitiCore: TopicActivityDetail[];
    activitiEvent: TopicActivityDetail[];
    active: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ActivityInput {
    activity: string;
    sessionsPerWeek: number;
}

export interface CreateTopicDto {
    topicName: string;
    month: string;
    age: string;
    activitiFix?: ActivityInput[];
    activitiCore?: ActivityInput[];
    activitiEvent?: ActivityInput[];
    createdBy?: string;
    updatedBy?: string;
    schoolYear?: string;
}

export interface UpdateTopicDto extends Partial<CreateTopicDto> {
    active?: boolean;
}

export interface GetTopicsParams {
    schoolYear: string;
    page?: number;
    limit?: number;
}

export interface TopicsListResponse {
    data: TopicListItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface GetAvailableTopicActivitiesParams {
    month: string;
    age: string;
}

export interface AvailableTopicActivitiesResponse {
    activitiFix: ActivityReference[];
    activitiCore: ActivityReference[];
    activitiEvent: ActivityReference[];
}

export interface ManualActivityRow {
    key: string;
    activityId?: string;
    sessions?: number;
    activityName?: string;
    activityTypeDisplay?: string;
    startTime?: number;
    endTime?: number;
    eventName?: string;
}

export interface UnifiedActivityRow {
    key: string;
    type: 'suggested' | 'manual';
    activityId?: string;
    activityName?: string;
    activityTypeDisplay?: string;
    sessions?: number;
    startTime?: number;
    endTime?: number;
    eventName?: string;
}
