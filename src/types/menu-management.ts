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
  weekStart: string | null;
  weekEnd: string | null;
  ageGroup: string;
  active?: boolean;
}

interface MealPayload {
  mealType: string;
  foods: FoodItemPayload[];
}

export interface DayMenuPayload {
  date: string;
  meals: MealPayload[];
}

export interface MealCreatePayload {
  mealType: string;
  foods: string[];
}

export interface DayMenuCreate {
  date: string;
  meals: MealCreatePayload[];
}

export interface CreateMenuParams {
  weekStart: string;
  weekEnd: string;
  ageGroup: string;
  days: DayMenuCreate[];
  notes?: string;
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

export interface FoodRecord {
  _id: string;
  foodName: string;
  ageGroup: string;
  totalCalories: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
  ingredients: Ingredient[];
}

export interface FoodListResponse {
  data: FoodRecord[];
  page: {
    totalCount: number;
    limit: number;
    page: number;
  };
}

export interface ListFoodParams {
  foodName?: string;
  ageGroup: string;
  page: number;
  limit: number;
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
  ageGroup: string;
  totalCalories: number;
  ingredients: Ingredient[];
}

export interface MealDetail {
  mealType: "sáng" | "trưa" | "xế" | string;
  foods: {
    food: Food;
  }[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
}

export interface DayDetail {
  date: string;
  meals: MealDetail[];
}

export interface MenuDetail {
  _id: string;
  interface: boolean;
  ageGroup: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  state: string;
  notes: string;
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
  weekStart: string;
  weekEnd: string;
  days: DayDetail[];
  reason?: string
}
