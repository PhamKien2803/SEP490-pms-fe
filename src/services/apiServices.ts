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
  MenuListParams,
  MenuListResponse,
  MenuRecord,
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

  getMenuById: async (menuId: string): Promise<MenuRecord> => {
    const response = await axiosAuth.get<MenuRecord>(
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

  calculateFoodNutrients: async (foodId: string): Promise<AICalculateResponse> => {
    const response = await axiosAuth.get<AICalculateResponse>(
      apiEndPoint.CALCULATE_FOOD_AI(foodId),
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
