import { Food, NutritionGoals, FoodEntry } from '@/types/nutrition';
import { searchUSDAFoods } from '@/services/usdaApi';

export interface GoalInput {
    currentWeight: number; // kg
    targetWeight: number; // kg
    timelineWeeks: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
    gender: 'male' | 'female';
    age: number;
    height: number; // cm
}

export interface MealPlanDay {
    breakfast: FoodEntry[];
    lunch: FoodEntry[];
    dinner: FoodEntry[];
    snacks: FoodEntry[];
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
}

// Calculate BMR using Mifflin-St Jeor Equation
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

// Calculate TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9,
    };
    return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.55);
}

// Calculate optimal macros based on goal
export function calculateOptimalMacros(input: GoalInput): NutritionGoals {
    const bmr = calculateBMR(input.currentWeight, input.height, input.age, input.gender);
    const tdee = calculateTDEE(bmr, input.activityLevel);

    // Determine goal type
    const weightDiff = input.targetWeight - input.currentWeight;
    const weeklyWeightChange = weightDiff / input.timelineWeeks;

    let calories: number;
    let proteinPerKg: number;
    let fatPercentage: number;

    if (weightDiff < -2) {
        // Fat loss
        const weeklyDeficit = Math.abs(weeklyWeightChange) * 7700; // 7700 cal per kg
        const dailyDeficit = weeklyDeficit / 7;
        calories = Math.max(tdee - dailyDeficit, bmr * 1.2); // Don't go below 120% of BMR
        proteinPerKg = 2.2; // High protein for muscle preservation
        fatPercentage = 25; // Moderate fat
    } else if (weightDiff > 2) {
        // Muscle gain
        const weeklySurplus = weeklyWeightChange * 7700;
        const dailySurplus = weeklySurplus / 7;
        calories = tdee + dailySurplus;
        proteinPerKg = 2.0; // High protein for muscle building
        fatPercentage = 25; // Moderate fat
    } else {
        // Maintenance or slight recomp
        calories = tdee;
        proteinPerKg = 1.8;
        fatPercentage = 30;
    }

    // Calculate macros
    const protein = input.currentWeight * proteinPerKg;
    const fats = (calories * (fatPercentage / 100)) / 9; // 9 cal per gram of fat
    const proteinCalories = protein * 4;
    const fatCalories = fats * 9;
    const carbCalories = calories - proteinCalories - fatCalories;
    const carbs = carbCalories / 4; // 4 cal per gram of carbs

    return {
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fats: Math.round(fats),
        fiber: 30,
        sugar: 50,
        saturatedFat: Math.round(fats * 0.3), // ~30% of total fat
    };
}

// Indian meal templates with common foods
const indianMealTemplates = {
    breakfast: [
        { search: 'Poha', portion: 0.3 },
        { search: 'Idli', portion: 0.25 },
        { search: 'Dosa', portion: 0.25 },
        { search: 'Upma', portion: 0.3 },
        { search: 'Paratha', portion: 0.25 },
        { search: 'Oats', portion: 0.2 },
        { search: 'Egg', portion: 0.15 },
        { search: 'Milk', portion: 0.15 },
        { search: 'Banana', portion: 0.1 },
    ],
    lunch: [
        { search: 'Basmati Rice', portion: 0.25 },
        { search: 'Roti', portion: 0.2 },
        { search: 'Dal', portion: 0.2 },
        { search: 'Chicken Curry', portion: 0.2 },
        { search: 'Paneer', portion: 0.15 },
        { search: 'Mixed Vegetables', portion: 0.1 },
        { search: 'Curd', portion: 0.1 },
    ],
    dinner: [
        { search: 'Roti', portion: 0.25 },
        { search: 'Chicken Breast', portion: 0.25 },
        { search: 'Dal', portion: 0.2 },
        { search: 'Vegetable Curry', portion: 0.15 },
        { search: 'Paneer', portion: 0.15 },
    ],
    snacks: [
        { search: 'Almonds', portion: 0.3 },
        { search: 'Banana', portion: 0.2 },
        { search: 'Apple', portion: 0.15 },
        { search: 'Protein Shake', portion: 0.15 },
        { search: 'Chickpeas', portion: 0.2 },
    ],
};

// Generate a balanced meal plan
export async function generateMealPlan(goals: NutritionGoals): Promise<MealPlanDay> {
    const mealPlan: MealPlanDay = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
    };

    // Distribute calories across meals
    const distribution = {
        breakfast: 0.25,
        lunch: 0.35,
        dinner: 0.30,
        snacks: 0.10,
    };

    // Generate all meals in parallel
    const mealPromises = Object.entries(distribution).map(async ([mealType, percentage]) => {
        const mealCalories = goals.calories * percentage;
        const mealProtein = goals.protein * percentage;

        const template = indianMealTemplates[mealType as keyof typeof indianMealTemplates];
        const selectedFoods: FoodEntry[] = [];

        // Select 2-4 foods per meal
        const numFoods = mealType === 'snacks' ? 2 : Math.floor(Math.random() * 2) + 3;
        const shuffled = [...template].sort(() => Math.random() - 0.5);

        // Fetch all foods for this meal in parallel
        const foodPromises = shuffled.slice(0, numFoods).map(async (item) => {
            try {
                // Search for the food
                const foods = await searchUSDAFoods(item.search, 3);
                if (foods.length > 0) {
                    const food = foods[0];

                    // Skip foods with invalid or zero calories
                    if (!food.calories || food.calories <= 0) {
                        console.warn(`Skipping ${food.name} - invalid calories: ${food.calories}`);
                        return null;
                    }

                    // Calculate quantity to meet portion of meal calories
                    const targetCalories = mealCalories * item.portion;
                    const quantity = (targetCalories / food.calories) * 100;

                    // Ensure quantity is reasonable (between 10g and 500g)
                    const finalQuantity = Math.max(10, Math.min(500, Math.round(quantity)));

                    return {
                        food,
                        quantity: finalQuantity,
                        mealType: mealType as any,
                    };
                }
            } catch (error) {
                console.error(`Error fetching ${item.search}:`, error);
            }
            return null;
        });

        const foods = await Promise.all(foodPromises);
        const validFoods = foods.filter((f): f is FoodEntry => f !== null);

        return { mealType, foods: validFoods };
    });

    // Wait for all meals to be generated
    const results = await Promise.all(mealPromises);

    // Assign foods to their respective meals
    results.forEach(({ mealType, foods }) => {
        mealPlan[mealType as keyof typeof indianMealTemplates] = foods;
    });

    // Calculate totals
    const allFoods = [
        ...mealPlan.breakfast,
        ...mealPlan.lunch,
        ...mealPlan.dinner,
        ...mealPlan.snacks,
    ];


    mealPlan.totals = allFoods.reduce(
        (acc, entry) => {
            const multiplier = entry.quantity / 100;
            return {
                calories: acc.calories + entry.food.calories * multiplier,
                protein: acc.protein + entry.food.protein * multiplier,
                carbs: acc.carbs + entry.food.carbs * multiplier,
                fats: acc.fats + entry.food.fats * multiplier,
            };
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // Final adjustment pass to get closer to goals
    if (allFoods.length > 0) {
        const calorieRatio = goals.calories / mealPlan.totals.calories;
        const proteinRatio = goals.protein / mealPlan.totals.protein;

        // Use weighted average favoring calorie accuracy
        const adjustmentRatio = (calorieRatio * 0.6 + proteinRatio * 0.4);

        // Only adjust if ratio is reasonable (between 0.7 and 1.3)
        if (adjustmentRatio > 0.7 && adjustmentRatio < 1.3) {
            allFoods.forEach(entry => {
                entry.quantity = Math.round(entry.quantity * adjustmentRatio);
                // Keep within reasonable bounds (20g to 400g)
                entry.quantity = Math.max(20, Math.min(400, entry.quantity));
            });

            // Recalculate totals after adjustment
            mealPlan.totals = allFoods.reduce(
                (acc, entry) => {
                    const multiplier = entry.quantity / 100;
                    return {
                        calories: acc.calories + entry.food.calories * multiplier,
                        protein: acc.protein + entry.food.protein * multiplier,
                        carbs: acc.carbs + entry.food.carbs * multiplier,
                        fats: acc.fats + entry.food.fats * multiplier,
                    };
                },
                { calories: 0, protein: 0, carbs: 0, fats: 0 }
            );
        }
    }

    console.log('Final totals vs goals:', {
        totals: mealPlan.totals,
        goals: { calories: goals.calories, protein: goals.protein, carbs: goals.carbs, fats: goals.fats },
        accuracy: {
            calories: `${((mealPlan.totals.calories / goals.calories) * 100).toFixed(1)}%`,
            protein: `${((mealPlan.totals.protein / goals.protein) * 100).toFixed(1)}%`,
        }
    });

    return mealPlan;
}

// Generate simple meal plan without API (fallback)
export function generateSimpleMealPlan(goals: NutritionGoals): MealPlanDay {
    // This is a fallback with hardcoded Indian foods
    const simpleFoods = {
        rice: { name: 'Basmati Rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
        roti: { name: 'Whole Wheat Roti', calories: 71, protein: 3, carbs: 15, fats: 0.4 },
        dal: { name: 'Moong Dal', calories: 105, protein: 7, carbs: 19, fats: 0.4 },
        chicken: { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
        paneer: { name: 'Paneer', calories: 265, protein: 18, carbs: 3, fats: 20 },
        egg: { name: 'Boiled Egg', calories: 155, protein: 13, carbs: 1.1, fats: 11 },
        milk: { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fats: 1 },
        banana: { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
        almonds: { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50 },
    };

    return {
        breakfast: [
            { food: simpleFoods.roti as any, quantity: 100, mealType: 'breakfast' },
            { food: simpleFoods.egg as any, quantity: 100, mealType: 'breakfast' },
            { food: simpleFoods.milk as any, quantity: 200, mealType: 'breakfast' },
            { food: simpleFoods.banana as any, quantity: 100, mealType: 'breakfast' },
        ],
        lunch: [
            { food: simpleFoods.rice as any, quantity: 150, mealType: 'lunch' },
            { food: simpleFoods.dal as any, quantity: 150, mealType: 'lunch' },
            { food: simpleFoods.chicken as any, quantity: 150, mealType: 'lunch' },
            { food: simpleFoods.roti as any, quantity: 100, mealType: 'lunch' },
        ],
        dinner: [
            { food: simpleFoods.roti as any, quantity: 150, mealType: 'dinner' },
            { food: simpleFoods.paneer as any, quantity: 100, mealType: 'dinner' },
            { food: simpleFoods.dal as any, quantity: 100, mealType: 'dinner' },
        ],
        snacks: [
            { food: simpleFoods.almonds as any, quantity: 30, mealType: 'snacks' },
            { food: simpleFoods.banana as any, quantity: 100, mealType: 'snacks' },
        ],
        totals: {
            calories: goals.calories,
            protein: goals.protein,
            carbs: goals.carbs,
            fats: goals.fats,
        },
    };
}

// Get timeline recommendation
export function getTimelineRecommendation(currentWeight: number, targetWeight: number): {
    minWeeks: number;
    maxWeeks: number;
    recommended: number;
    warning?: string;
} {
    const weightDiff = Math.abs(targetWeight - currentWeight);

    // Healthy weight loss: 0.5-1 kg per week
    // Healthy weight gain: 0.25-0.5 kg per week

    if (targetWeight < currentWeight) {
        // Fat loss
        const minWeeks = Math.ceil(weightDiff / 1); // Max 1kg per week
        const maxWeeks = Math.ceil(weightDiff / 0.5); // Min 0.5kg per week
        const recommended = Math.ceil(weightDiff / 0.75); // Recommended 0.75kg per week

        return {
            minWeeks,
            maxWeeks,
            recommended,
            warning: weightDiff > 20 ? 'Consider consulting a nutritionist for significant weight loss goals' : undefined,
        };
    } else {
        // Muscle gain
        const minWeeks = Math.ceil(weightDiff / 0.5); // Max 0.5kg per week
        const maxWeeks = Math.ceil(weightDiff / 0.25); // Min 0.25kg per week
        const recommended = Math.ceil(weightDiff / 0.35); // Recommended 0.35kg per week

        return {
            minWeeks,
            maxWeeks,
            recommended,
            warning: weightDiff > 15 ? 'Significant muscle gain takes time. Stay consistent!' : undefined,
        };
    }
}
