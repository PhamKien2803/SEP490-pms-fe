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
    _id: string,
    foodName: string;
    ageGroup: string;
    totalCalories: number;
    ingredients: Ingredient[];
    createdBy: string;
    updatedBy?: string;
    active: boolean;
    createdAt: string; 
    updatedAt: string;
}

export interface FoodListResponse {
    data: FoodRecord[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface FoodListParams {
    page: number;
    limit: number;
    weekStart: string;
    weekEnd: string;
    ageGroup: string;
}

export interface IngredientParam {
    name: string; 
    gram: number;
    unit: string; 
}


export interface CreateFoodParams {
    foodName: string;
    ageGroup: string;
    totalCalories: number; 
    ingredients: IngredientParam[]; 
    createdBy: string; 
    active: boolean; 
}

export type UpdateFoodParams = CreateFoodParams 