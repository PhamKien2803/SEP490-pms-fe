import { apiEndPoint } from "./api";
import axiosAuth from "./axiosAuth";
import { AxiosError } from "axios";
import type {
  CreateFunctionDto,
  CreateParentDto,
  Functions,
  FunctionsResponse,
  LoginRequest,
  LoginResponse,
  Parent,
  ParentsResponse,
  UpdateFunctionDto,
  UpdateParentDto,
} from "../types/auth";
import type { User } from "../types/user";
import { messages } from "../constants/message";
import {
  CreateRoleDto,
  RoleDetails,
  RoleFunctionItem,
  RoleModuleItem,
  RolesListResponse,
  UpdateRoleDto,
} from "../types/role";
import {
  CreateUserData,
  StudentRecord,
  StudentResponse,
  UpdateUserData,
} from "../types/student-management";
import {
  AccountsListResponse,
  RoleNameItem,
  UpdateAccountDto,
} from "../types/account";
import {
  CreateStaffData,
  StaffRecord,
  StaffResponse,
  UpdateStaffData,
} from "../types/staff-management";
import {
  ApproveEnrollmentDto,
  EnrollmentListItem,
  EnrollmentsListResponse,
  RegisterEnrollmentDto,
  RejectEnrollmentDto,
  UpdateEnrollmentDto,
  UploadPDFResponse,
} from "../types/enrollment";
import {
  CreateMenuParams,
  ListFoodParams,
  MenuDetail,
  MenuListParams,
  MenuListResponse,
} from "../types/menu-management";
import {
  CreateSchoolYearDto,
  SchoolYearListItem,
  SchoolYearReportResponses,
  SchoolYearsListResponse,
  UpdateSchoolYearDto,
} from "../types/schoolYear";
import {
  AICalculateResponse,
  AICalculationTriggerResponse,
  CreateFoodParams,
  FoodListParams,
  FoodListResponse,
  FoodRecord,
  UpdateFoodParams,
} from "../types/food-management";
import { CreateCurriculumDto, CurriculumItem, CurriculumsListResponse, GetCurriculumsParams, UpdateCurriculumDto } from "../types/curriculums";
import { CreateEventDto, EventItem, EventsListResponse, GetEventsParams, UpdateEventDto } from "../types/event";
import {
  AvailableClassForStudent,
  AvailableClassForTeacher,
  AvailableRoom,
  ClassDetail,
  ClassListResponse,
  CreateClassDto,
  StudentChangeClassDto,
  StudentInClass,
  TeacherChangeClassDto,
  TeacherInClass,
  UpdateClassDto,
} from "../types/class";
import {
  CreateRoomData,
  RoomListResponse,
  RoomRecord,
  UpdateRoomData,
} from "../types/room-management";
import { AvailableTopicActivitiesResponse, CreateTopicDto, GetAvailableTopicActivitiesParams, GetTopicsParams, TopicDetails, TopicsListResponse, UpdateTopicDto } from "../types/topic";
import { IAttendanceCreatePayload, IAttendanceDetailResponse, IAttendanceListResponse, IAttendanceUpdatePayload, IPaginatedResponse, ITeacherClassStudentResponse } from "../types/teacher";
import { ITeacherClassStudentResponse } from "../types/teacher";
import { AvailableActivityItem, FixActivityResponseItem, IClassBySchoolYearItem, ICreateSchedulePayload, IDailySchedule, TCreateScheduleResponse, TScheduleByIdResponse, TScheduleParamsResponse } from "../types/timetable";
import { HealthCertCreateData, HealthCertListResponse, HealthCertRecord, HealthCertUpdateData } from "../types/medical-management";

export const authApis = {
  login: async (body: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axiosAuth.post<LoginResponse>(
        apiEndPoint.LOGIN,
        body
      );
      return response.data;
    } catch (err: AxiosError | unknown) {
      if (err instanceof AxiosError) {
        const errorResponse = err.response?.data;
        return errorResponse;
      }

      return {
        error: {
          message: messages.AN_UNKNOWN_ERROR_OCCURRED,
        },
      };
    }
  },

  logout: async (): Promise<void> => {
    const response = await axiosAuth.post(apiEndPoint.LOGOUT);
    return response.data;
  },
};

export const userApis = {
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosAuth.get<User>(apiEndPoint.CURRENT_USER);
    return response.data;
  },
};

export const functionsApis = {
  getFunctions: async (params: {
    page: number;
    limit: number;
  }): Promise<FunctionsResponse> => {
    const response = await axiosAuth.get<FunctionsResponse>(
      apiEndPoint.GET_FUNCTION,
      { params }
    );
    return response.data;
  },

  createFunction: async (body: CreateFunctionDto): Promise<Functions> => {
    const response = await axiosAuth.post<Functions>(
      apiEndPoint.CREATE_FUNTION,
      body
    );
    return response.data;
  },

  updateFunction: async (
    id: string,
    body: UpdateFunctionDto
  ): Promise<Functions> => {
    const response = await axiosAuth.put<Functions>(
      apiEndPoint.UPDATE_FUNCTION(id),
      body
    );
    return response.data;
  },

  deleteFunction: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_FUNCTION(id));
  },
};

export const parentsApis = {
  getParents: async (params: {
    page: number;
    limit: number;
  }): Promise<ParentsResponse> => {
    const response = await axiosAuth.get<ParentsResponse>(
      apiEndPoint.GET_PARENT,
      { params }
    );
    return response.data;
  },

  createParents: async (body: CreateParentDto): Promise<Parent> => {
    const response = await axiosAuth.post<Parent>(
      apiEndPoint.CREATE_PARENT,
      body
    );
    return response.data;
  },

  updateParents: async (id: string, body: UpdateParentDto): Promise<Parent> => {
    const response = await axiosAuth.put<Parent>(
      apiEndPoint.UPDATE_PARENT(id),
      body
    );
    return response.data;
  },

  deleteParents: async (id: string): Promise<void> => {
    await axiosAuth.delete(apiEndPoint.DELETE_PARENT(id));
  },
};
export const rolesApis = {
  getRolesList: async (params: {
    page: number;
    limit: number;
    query?: string;
  }): Promise<RolesListResponse> => {
    const response = await axiosAuth.get<RolesListResponse>(
      apiEndPoint.GET_ROLE_LIST,
      { params }
    );
    return response.data;
  },

  getListFunction: async (): Promise<RoleFunctionItem[]> => {
    const response = await axiosAuth.get<RoleFunctionItem[]>(
      apiEndPoint.GET_LIST_FUNCTION
    );
    return response.data;
  },

  getListModule: async (): Promise<RoleModuleItem[]> => {
    const response = await axiosAuth.get<RoleModuleItem[]>(
      apiEndPoint.GET_LIST_MODULE
    );
    return response.data;
  },

  getRoleById: async (id: string): Promise<RoleDetails> => {
    const response = await axiosAuth.get<RoleDetails>(
      apiEndPoint.GET_ROLE_BY_ID(id)
    );
    return response.data;
  },

  createRole: async (body: CreateRoleDto): Promise<RoleDetails> => {
    const response = await axiosAuth.post<RoleDetails>(
      apiEndPoint.CREATE_ROLE,
      body
    );
    return response.data;
  },

  updateRole: async (id: string, body: UpdateRoleDto): Promise<RoleDetails> => {
    const response = await axiosAuth.put<RoleDetails>(
      apiEndPoint.UPDATE_ROLE(id),
      body
    );
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_ROLE(id));
  },
};

export const studentApis = {
  getListStudent: async (params: {
    page: number;
    limit: number;
  }): Promise<StudentResponse> => {
    const response = await axiosAuth.get<StudentResponse>(
      apiEndPoint.GET_LIST_STUDENT,
      { params }
    );
    return response.data;
  },

  createStudent: async (body: CreateUserData): Promise<StudentRecord> => {
    const response = await axiosAuth.post<StudentRecord>(
      apiEndPoint.CREATE_STUDENT,
      body
    );
    return response.data;
  },

  updateStudent: async (
    id: string,
    body: UpdateUserData
  ): Promise<StudentRecord> => {
    const response = await axiosAuth.put<StudentRecord>(
      apiEndPoint.UPDATE_STUDENT(id),
      body
    );
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_STUDENT(id));
  },
};

export const staffApis = {
  getListStaff: async (params: {
    page: number;
    limit: number;
  }): Promise<StaffResponse> => {
    const response = await axiosAuth.get<StaffResponse>(
      apiEndPoint.GET_LIST_STAFF,
      { params }
    );
    return response.data;
  },

  createStaff: async (body: CreateStaffData): Promise<StaffRecord> => {
    const response = await axiosAuth.post<StaffRecord>(
      apiEndPoint.CREATE_STAFF,
      body
    );
    return response.data;
  },

  updateStaff: async (
    id: string,
    body: UpdateStaffData
  ): Promise<StaffRecord> => {
    const response = await axiosAuth.put<StaffRecord>(
      apiEndPoint.UPDATE_STAFF(id),
      body
    );
    return response.data;
  },

  deleteStaff: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_STAFF(id));
  },
};

export const accountsApis = {
  getAccountList: async (params: {
    page: number;
    limit: number;
    query?: string;
  }): Promise<AccountsListResponse> => {
    const response = await axiosAuth.get<AccountsListResponse>(
      apiEndPoint.GET_ACCOUNT_LIST,
      { params }
    );
    return response.data;
  },

  updateAccount: async (id: string, body: UpdateAccountDto): Promise<void> => {
    await axiosAuth.put(apiEndPoint.UPDATE_ACCOUNT(id), body);
  },

  deleteAccount: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_ACCOUNT(id));
  },

  getRoleNameList: async (): Promise<RoleNameItem[]> => {
    const response = await axiosAuth.get<RoleNameItem[]>(
      apiEndPoint.GET_ROLE_NAME_LIST
    );
    return response.data;
  },
};

export const enrollmentApis = {
  registerEnrollment: async (body: RegisterEnrollmentDto): Promise<void> => {
    await axiosAuth.post(apiEndPoint.REGISTER_ENROLLMENT, body);
  },

  getEnrollmentList: async (params: {
    page: number;
    limit: number;
  }): Promise<EnrollmentsListResponse> => {
    const response = await axiosAuth.get<EnrollmentsListResponse>(
      apiEndPoint.GET_ENROLLMENT_LIST,
      { params }
    );
    return response.data;
  },

  getEnrollmentById: async (id: string): Promise<EnrollmentListItem> => {
    const response = await axiosAuth.get<EnrollmentListItem>(
      apiEndPoint.GET_ENROLLMENT_BY_ID(id)
    );
    return response.data;
  },

  uploadPDF: async (file: File): Promise<UploadPDFResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosAuth.post<UploadPDFResponse>(
      apiEndPoint.UPLOAD_PDF,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getPDFById: async (id: string): Promise<ArrayBuffer> => {
    const response = await axiosAuth.get<ArrayBuffer>(
      apiEndPoint.GET_PDF_BY_ID(id),
      {
        responseType: "arraybuffer",
      }
    );
    return response.data;
  },
  approveEnrollment: async (body: ApproveEnrollmentDto): Promise<void> => {
    await axiosAuth.post(apiEndPoint.APPROVE_ENROLLMENT, body);
  },

  updateEnrollment: async (
    id: string,
    body: UpdateEnrollmentDto
  ): Promise<void> => {
    await axiosAuth.put(apiEndPoint.UPDATE_ENROLLMENT(id), body);
  },

  rejectEnrollment: async (
    id: string,
    body: RejectEnrollmentDto
  ): Promise<void> => {
    await axiosAuth.post(apiEndPoint.REJECT_ENROLLMENT(id), body);
  },

  approveAllEnrollments: async (body: { ids: string[] }): Promise<void> => {
    await axiosAuth.post(apiEndPoint.APPROVE_ALL_ENROLLMENT, body);
  },
};

export const menuApis = {
  getListMenu: async (params: MenuListParams): Promise<MenuListResponse> => {
    const response = await axiosAuth.get<MenuListResponse>(
      apiEndPoint.GET_LIST_MENU,
      { params }
    );
    return response.data;
  },

  getMenuById: async (menuId: string): Promise<MenuDetail> => {
    const response = await axiosAuth.get<MenuDetail>(
      apiEndPoint.GET_MENU_BY_ID(menuId)
    );
    return response.data;
  },

  createMenu: async (body: CreateMenuParams): Promise<void> => {
    await axiosAuth.post(apiEndPoint.CREATE_MENU, body);
  },

  deleteMenu: async (menuId: string): Promise<void> => {
    await axiosAuth.delete(apiEndPoint.DELETE_MENU(menuId));
  },

  editMenu: async (menuId: string, body: CreateMenuParams): Promise<void> => {
    await axiosAuth.put(apiEndPoint.EDIT_MENU(menuId), body);
  },

  approveMenu: async (menuId: string): Promise<void> => {
    await axiosAuth.put(apiEndPoint.APPROVE_MENU(menuId));
  },

  rejectMenu: async (
    menuId: string,
    body: { reason: string }
  ): Promise<void> => {
    await axiosAuth.post(apiEndPoint.APPROVE_MENU(menuId), body);
  },

  getListFood: async (params: ListFoodParams): Promise<FoodListResponse> => {
    const response = await axiosAuth.get<FoodListResponse>(
      apiEndPoint.GET_LIST_FOOD,
      { params }
    );
    return response.data;
  },
};

export const schoolYearApis = {
  getSchoolYearList: async (params: {
    page: number;
    limit: number;
  }): Promise<SchoolYearsListResponse> => {
    const response = await axiosAuth.get<SchoolYearsListResponse>(
      apiEndPoint.GET_SCHOOLYEARS_LIST,
      { params }
    );
    return response.data;
  },

  getSchoolYearById: async (id: string): Promise<SchoolYearListItem> => {
    const response = await axiosAuth.get<SchoolYearListItem>(
      apiEndPoint.GET_SCHOOLYEAR_BY_ID(id)
    );
    return response.data;
  },

  createSchoolYear: async (body: CreateSchoolYearDto): Promise<void> => {
    await axiosAuth.post(apiEndPoint.CREATE_SCHOOLYEAR, body);
  },

  updateSchoolYear: async (
    id: string,
    body: UpdateSchoolYearDto
  ): Promise<void> => {
    await axiosAuth.put(apiEndPoint.UPDATE_SCHOOLYEAR(id), body);
  },

  deleteSchoolYear: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_SCHOOLYEAR(id));
  },

  endSchoolYear: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.END_SCHOOLYEAR(id));
  },

  confirmSchoolYear: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.CONFIRM_SCHOOLYEAR(id));
  },

  getStudentGraduatedReport: async (params: {
    year: number;
    page: number;
    limit: number;
  }): Promise<SchoolYearReportResponses> => {
    const response = await axiosAuth.get<SchoolYearReportResponses>(
      apiEndPoint.SCHOOLYEAR_REPORT,
      { params }
    );
    return response.data;
  },
};

export const classApis = {
  getClassList: async (params: {
    year: string;
    page?: number;
    limit?: number;
  }): Promise<ClassListResponse> => {
    const response = await axiosAuth.get<ClassListResponse>(
      apiEndPoint.GET_CLASS_LIST,
      {
        params,
      }
    );
    return response.data;
  },

  getClassById: async (id: string): Promise<ClassDetail> => {
    const response = await axiosAuth.get<ClassDetail>(
      apiEndPoint.GET_CLASS_BY_ID(id)
    );
    return response.data;
  },

  updateClass: async (id: string, data: UpdateClassDto): Promise<void> => {
    await axiosAuth.put(apiEndPoint.UPDATE_CLASS(id), data);
  },

  createClass: async (body: CreateClassDto): Promise<void> => {
    await axiosAuth.post(apiEndPoint.CREATE_CLASS, body);
  },

  getAllAvailableStudents: async (): Promise<StudentInClass[]> => {
    const response = await axiosAuth.get(apiEndPoint.GET_AVAILABEL_STUDENT);
    return response.data;
  },

  getAllAvailableTeachers: async (): Promise<TeacherInClass[]> => {
    const response = await axiosAuth.get(apiEndPoint.GET_AVAILABEL_TEACHER);
    return response.data;
  },

  getAllAvailableRoom: async (): Promise<AvailableRoom[]> => {
    const response = await axiosAuth.get(apiEndPoint.GET_AVAILABEL_ROOM);
    return response.data;
  },

  asyncClass: async (): Promise<void> => {
    await axiosAuth.post(apiEndPoint.ASYNC_CLASS);
  },

  getAvailableClassForStudent: async (params: {
    classAge: number;
  }): Promise<AvailableClassForStudent[]> => {
    const response = await axiosAuth.get<AvailableClassForStudent[]>(
      apiEndPoint.GET_AVAILABEL_CLASS_STUDENT,
      {
        params,
      }
    );
    return response.data;
  },

  getAvailableClassForTeacher: async (params: {
    classAge: number;
  }): Promise<AvailableClassForTeacher[]> => {
    const response = await axiosAuth.get<AvailableClassForTeacher[]>(
      apiEndPoint.GET_AVAILABEL_CLASS_TEACHER,
      {
        params,
      }
    );
    return response.data;
  },

  studentChangeClass: async (body: StudentChangeClassDto): Promise<void> => {
    await axiosAuth.post(apiEndPoint.STUDENT_CHANGE_CLASS, body);
  },

  teacherChangeClass: async (body: TeacherChangeClassDto): Promise<void> => {
    await axiosAuth.post(apiEndPoint.TEACHER_CHANGE_CLASS, body);
  },
};

export const foodApis = {
  getListFood: async (params: FoodListParams): Promise<FoodListResponse> => {
    const response = await axiosAuth.get<FoodListResponse>(
      apiEndPoint.GET_LIST_FOOD,
      { params }
    );
    return response.data;
  },

  createFood: async (body: CreateFoodParams): Promise<FoodRecord> => {
    const response = await axiosAuth.post<FoodRecord>(
      apiEndPoint.CREATE_FOOD,
      body
    );
    return response.data;
  },

  calculateFoodNutrients: async (
    foodId: string
  ): Promise<AICalculateResponse> => {
    const response = await axiosAuth.get<AICalculateResponse>(
      apiEndPoint.CALCULATE_FOOD_AI(foodId)
    );
    return response.data;
  },

  updateFood: async (
    id: string,
    body: UpdateFoodParams
  ): Promise<FoodRecord> => {
    const response = await axiosAuth.put<FoodRecord>(
      apiEndPoint.UPDATE_FOOD(id),
      body
    );
    return response.data;
  },

  deleteFood: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_FOOD(id));
  },

  triggerAICalculation: async (): Promise<AICalculationTriggerResponse> => {
    const response = await axiosAuth.get<AICalculationTriggerResponse>(
      apiEndPoint.CALCULATE_TOTAL_CALO_AI
    );
    return response.data;
  },
};

export const curriculumsApis = {

  getCurriculumsList: async (
    params: GetCurriculumsParams
  ): Promise<CurriculumsListResponse> => {
    const response = await axiosAuth.get<CurriculumsListResponse>(
      apiEndPoint.GET_CURRICULUMS_LIST,
      { params }
    );
    return response.data;
  },

  getCurriculumById: async (id: string): Promise<CurriculumItem> => {
    const response = await axiosAuth.get<CurriculumItem>(
      apiEndPoint.GET_CURRICULUMS_BY_ID(id)
    );
    return response.data;
  },

  createCurriculum: async (
    body: CreateCurriculumDto
  ): Promise<CurriculumItem> => {
    const response = await axiosAuth.post<CurriculumItem>(
      apiEndPoint.CREATE_CURRICULUMS,
      body
    );
    return response.data;
  },

  updateCurriculum: async (
    id: string,
    body: UpdateCurriculumDto
  ): Promise<CurriculumItem> => {
    const response = await axiosAuth.put<CurriculumItem>(
      apiEndPoint.UPDATE_CURRICULUMS(id),
      body
    );
    return response.data;
  },

  deleteCurriculum: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_CURRICULUMS(id));
  },

}

export const eventApis = {
  getEventList: async (
    params: GetEventsParams
  ): Promise<EventsListResponse> => {
    const response = await axiosAuth.get<EventsListResponse>(
      apiEndPoint.GET_EVENT_LIST,
      { params }
    );
    return response.data;
  },


  getEventById: async (id: string): Promise<EventItem> => {
    const response = await axiosAuth.get<EventItem>(
      apiEndPoint.GET_EVENT_BY_ID(id)
    );
    return response.data;
  },


  createEvent: async (body: CreateEventDto): Promise<EventItem> => {
    const response = await axiosAuth.post<EventItem>(
      apiEndPoint.CREATE_EVENT,
      body
    );
    return response.data;
  },

  updateEvent: async (
    id: string,
    body: UpdateEventDto
  ): Promise<EventItem> => {
    const response = await axiosAuth.put<EventItem>(
      apiEndPoint.UPDATE_EVENT(id),
      body
    );
    return response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_EVENT(id));
  },

}

export const topicApis = {
  getTopicsList: async (
    params: GetTopicsParams
  ): Promise<TopicsListResponse> => {
    const response = await axiosAuth.get<TopicsListResponse>(
      apiEndPoint.GET_TOPIC_LIST,
      { params }
    );
    return response.data;
  },


  getTopicById: async (
    id: string
  ): Promise<TopicDetails> => {
    const response = await axiosAuth.get<TopicDetails>(
      apiEndPoint.GET_TOPIC_BY_ID(id)
    );
    return response.data;
  },


  createTopic: async (
    data: CreateTopicDto
  ): Promise<TopicDetails> => {
    const response = await axiosAuth.post<TopicDetails>(
      apiEndPoint.CREATE_TOPIC,
      data
    );
    return response.data;
  },


  updateTopic: async (
    id: string,
    data: UpdateTopicDto
  ): Promise<TopicDetails> => {
    const response = await axiosAuth.put<TopicDetails>(
      apiEndPoint.UPDATE_TOPIC(id),
      data
    );
    return response.data;
  },

  deleteTopic: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_TOPIC(id));
  },

  getAvailableTopicActivities: async (
    params: GetAvailableTopicActivitiesParams
  ): Promise<AvailableTopicActivitiesResponse> => {
    const response = await axiosAuth.get<AvailableTopicActivitiesResponse>(
      apiEndPoint.GET_AVAILABEL_TOPIC,
      { params }
    );
    return response.data;
  },

}

export const teacherApis = {
  getClassAndStudentByTeacher: async (
    id: string
  ): Promise<ITeacherClassStudentResponse> => {
    const response = await axiosAuth.get<ITeacherClassStudentResponse>(
      apiEndPoint.GET_CLASS_AND_STUDENT_BY_TEACHER(id)
    );
    return response.data;
  },


  getSchoolYearList: async (params: {
    page: number;
    limit: number;
  }): Promise<SchoolYearsListResponse> => {
    const response = await axiosAuth.get<SchoolYearsListResponse>(
      apiEndPoint.GET_SCHOOLYEARS_LIST,
      { params }
    );
    return response.data;
  },

  getAttendanceList: async (
    params?: { page: number; limit: number;[key: string]: any }
  ): Promise<IAttendanceListResponse | IPaginatedResponse<IAttendanceListResponse>> => {
    const response = await axiosAuth.get<IAttendanceListResponse | IPaginatedResponse<IAttendanceListResponse>>(
      apiEndPoint.GET_ATTENDANCE_LIST,
      { params }
    );
    return response.data;
  },


  getAttendanceById: async (
    id: string
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.get<IAttendanceDetailResponse>(
      apiEndPoint.GET_ATTENDANCE_BY_ID(id)
    );
    return response.data;
  },

  getAttendanceByClassAndSchoolYear: async (
    classId: string,
    schoolYearId: string
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.get<IAttendanceDetailResponse>(
      apiEndPoint.GET_ATTENDANCE_BY_CLASS_AND_SCHOOLYEAR(classId, schoolYearId)
    );
    return response.data;
  },

  getAttendanceByClassAndDate: async (
    classId: string,
    date: string
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.get<IAttendanceDetailResponse>(
      apiEndPoint.GET_ATTENDANCE_BY_CLASS_AND_DATE(classId, date)
    );
    return response.data;
  },


  createAttendance: async (
    payload: IAttendanceCreatePayload
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.post<IAttendanceDetailResponse>(
      apiEndPoint.CREATE_ATTENDANCE,
      payload
    );
    return response.data;
  },


  updateAttendance: async (
    id: string,
    payload: IAttendanceUpdatePayload
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.put<IAttendanceDetailResponse>(
      apiEndPoint.UPDATE_ATTENDANCE(id),
      payload
    );
    return response.data;
  },


  deleteAttendance: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_ATTENDANCE(id));
  },
}

export const scheduleApis = {
  getScheduleById: async (id: string): Promise<TScheduleByIdResponse> => {
    const response = await axiosAuth.get<TScheduleByIdResponse>(
      apiEndPoint.GET_SCHEDULE_BY_ID(id)
    );
    return response.data;
  },


  createSchedule: async (payload: ICreateSchedulePayload): Promise<TCreateScheduleResponse> => {
    const response = await axiosAuth.post<TCreateScheduleResponse>(
      apiEndPoint.CREATE_SCHEDULE,
      payload
    );
    return response.data;
  },

  getSchoolYearList: async (params: {
    page: number;
    limit: number;
  }): Promise<SchoolYearsListResponse> => {
    const response = await axiosAuth.get<SchoolYearsListResponse>(
      apiEndPoint.GET_SCHOOLYEARS_LIST,
      { params }
    );
    return response.data;
  },

  getClassList: async (params: {
    year: string;
    page?: number;
    limit?: number;
  }): Promise<ClassListResponse> => {
    const response = await axiosAuth.get<ClassListResponse>(
      apiEndPoint.GET_CLASS_LIST,
      {
        params,
      }
    );
    return response.data;
  },

  getClassListByActiveSchoolYear: async (): Promise<IClassBySchoolYearItem[]> => {
    const response = await axiosAuth.get<IClassBySchoolYearItem[]>(
      apiEndPoint.GET_CLASS_BY_SCHOOLYEAR
    );
    return response.data;
  },

 
  getScheduleParams: async (params: {
    schoolYear: string;
    class: string;
    month: number;
  }): Promise<TScheduleParamsResponse> => {
    const response = await axiosAuth.get<TScheduleParamsResponse>(
      apiEndPoint.GET_SCHEDULE_PARAMS,
      { params }
    );
    return response.data;
  },


  getPreviewSchedule: async (params: {
    year: string;
    month: string;
    classId: string;
  }): Promise<{ message: string; schedule: { scheduleDays: IDailySchedule[] } }> => {
    const response = await axiosAuth.get(apiEndPoint.PREVIEWS_SCHEDULE, { params });
    return response.data;
  },

  updateSchedule: async (
    id: string,
    payload: ICreateSchedulePayload
  ): Promise<TCreateScheduleResponse> => {
    const response = await axiosAuth.put<TCreateScheduleResponse>(
      apiEndPoint.UPDATE_SCHEDULE(id),
      payload
    );
    return response.data;
  },

  confirmSchedule: async (id: string): Promise<{ message: string }> => {
    const response = await axiosAuth.put(apiEndPoint.CONFIRM_SCHEDULE(id));
    return response.data;
  },

  getFixActivity: async (params: {
    year: string;
    month: string;
    classId: string;
  }): Promise<FixActivityResponseItem[]> => {
    const response = await axiosAuth.get(apiEndPoint.GET_FIX_ACTIVITY, {
      params,
    });
    return response.data;
  },

  getAvailableActivities: async (params: {
    month: string;
    classId: string;
  }): Promise<AvailableActivityItem[]> => {
    const response = await axiosAuth.get(apiEndPoint.GET_AVAILABEL_ACTIVITY, {
      params,
    });
    return response.data;
  },

}

export const roomApis = {
  getListRoom: async (params: {
    page: number;
    limit: number;
  }): Promise<RoomListResponse> => {
    const response = await axiosAuth.get<RoomListResponse>(
      apiEndPoint.GET_LIST_ROOM,
      { params }
    );
    return response.data;
  },

  getRoomById: async (id: string): Promise<RoomRecord> => {
    const response = await axiosAuth.get<RoomRecord>(
      apiEndPoint.GET_ROOM_BY_ID(id)
    );
    return response.data;
  },

  createRoom: async (body: CreateRoomData): Promise<RoomRecord> => {
    const response = await axiosAuth.post<RoomRecord>(
      apiEndPoint.CREATE_ROOM,
      body
    );
    return response.data;
  },

  updateRoom: async (id: string, body: UpdateRoomData): Promise<RoomRecord> => {
    const response = await axiosAuth.put<RoomRecord>(
      apiEndPoint.UPDATE_ROOM(id),
      body
    );
    return response.data;
  },

  deleteRoom: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_ROOM(id));
  },
};

export const medicalApis = {
  getListMedical: async (params: {
    page: number;
    limit: number;
  }): Promise<HealthCertListResponse> => {
    const response = await axiosAuth.get<HealthCertListResponse>(
      apiEndPoint.GET_LIST_MEDICAL,
      { params }
    );
    return response.data;
  },

  getMedicalById: async (id: string): Promise<HealthCertRecord> => {
    const response = await axiosAuth.get<HealthCertRecord>(
      apiEndPoint.GET_MEDICAL_BY_ID(id)
    );
    return response.data;
  },

  createMedical: async (body: HealthCertCreateData): Promise<HealthCertRecord> => {
    const response = await axiosAuth.post<HealthCertRecord>(
      apiEndPoint.CREATE_MEDICAL,
      body
    );
    return response.data;
  },

  updateMedical: async (id: string, body: HealthCertUpdateData): Promise<HealthCertRecord> => {
    const response = await axiosAuth.put<HealthCertRecord>(
      apiEndPoint.UPDATE_MEDICAL(id),
      body
    );
    return response.data;
  },

  deleteMedical: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_MEDICAL(id));
  },
  
};