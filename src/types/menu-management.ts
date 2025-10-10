import { Dayjs } from "dayjs";

export interface FoodItem {
  name: string;
  weight: number;
  calo: number;
  protein: number;
  lipid: number;
  carb: number;
}

interface Meal {
  mealType: string;
  foods: FoodItem[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
}

interface DayMenu {
  date: string;
  meals: Meal[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
}

export interface MenuRecord {
  _id: string;
  weekStart: string;
  weekEnd: string;
  ageGroup: string;
  days: DayMenu[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuListResponse {
  data: MenuRecord[];
  page: {
    totalCount: number;
    limit: number;
    page: number;
  };
}

interface FoodItemPayload {
  name: string;
  weight: number;
}

interface MealPayload {
  mealType: string;
  foods: FoodItemPayload[];
}

export interface DayMenuPayload {
  date: string;
  meals: MealPayload[];
}

export interface MenuPayload {
  weekStart: string;
  weekEnd: string;
  ageGroup: string;
  days: DayMenuPayload[];
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface MenuInitialData {
  _id?: string;
  weekRange?: [Dayjs, Dayjs] | null;
  ageGroup: string;
  days: DayMenuPayload[];
  notes?: string;
}

export interface MenuListParams {
  page: number;
  limit: number;
  weekStart: string;
  weekEnd: string;
  ageGroup: number;
}

export interface CreateMenuParams {
    weekStart: string; 
    weekEnd: string;   
    ageGroup: number;  
    days: DayMenu[];   
    totalCalo: number;
    totalProtein: number;
    totalLipid: number;
    totalCarb: number;
    notes?: string;
}
