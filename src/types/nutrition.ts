// Nutrition Types
export interface Micronutrients {
    iron: number; // mg
    calcium: number; // mg
    magnesium: number; // mg
    zinc: number; // mg
    potassium: number; // mg
    sodium: number; // mg
    vitaminA: number; // mcg
    vitaminB6: number; // mg
    vitaminB12: number; // mcg
    vitaminC: number; // mg
    vitaminD: number; // mcg
    vitaminE: number; // mg
    vitaminK: number; // mcg
    folate: number; // mcg
    thiamin: number; // mg
    riboflavin: number; // mg
    niacin: number; // mg
}

export interface Macronutrients {
    calories: number;
    protein: number; // g
    carbs: number; // g
    fats: number; // g
    fiber: number; // g
    sugar: number; // g
    saturatedFat: number; // g
}

export interface Food extends Macronutrients, Micronutrients {
    id: string;
    name: string;
    servingSize: number; // grams
    category: string;
    brand?: string;
    isCustom?: boolean;
}

export interface FoodEntry {
    food: Food;
    quantity: number; // grams
    mealType: MealType;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface Meal {
    type: MealType;
    foods: FoodEntry[];
    totals: Macronutrients & Micronutrients;
}

export interface DailyLog {
    date: string; // ISO date string
    meals: Meal[];
    totals: Macronutrients & Micronutrients;
    waterIntake: number; // ml
    notes?: string;
}

export interface NutritionGoals extends Macronutrients, Partial<Micronutrients> {
    // All fields inherited from Macronutrients and Micronutrients
}

export interface Recipe {
    id: string;
    name: string;
    ingredients: FoodEntry[];
    servings: number;
    totals: Macronutrients & Micronutrients;
    perServing: Macronutrients & Micronutrients;
    instructions?: string;
    createdAt: string;
}

export interface NutrientDeficiency {
    nutrient: string;
    current: number;
    target: number;
    percentage: number;
    severity: 'low' | 'moderate' | 'high';
    recommendations: string[];
}
