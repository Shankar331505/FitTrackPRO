import { Food, FoodEntry, Macronutrients, Micronutrients, Meal, DailyLog } from '@/types/nutrition';

// Calculate nutrition totals from a single food with quantity
export const calculateFoodNutrition = (
    food: Food,
    quantity: number // in grams
): Macronutrients & Micronutrients => {
    const multiplier = quantity / food.servingSize;

    return {
        calories: food.calories * multiplier,
        protein: food.protein * multiplier,
        carbs: food.carbs * multiplier,
        fats: food.fats * multiplier,
        fiber: food.fiber * multiplier,
        sugar: food.sugar * multiplier,
        saturatedFat: food.saturatedFat * multiplier,
        iron: food.iron * multiplier,
        calcium: food.calcium * multiplier,
        magnesium: food.magnesium * multiplier,
        zinc: food.zinc * multiplier,
        potassium: food.potassium * multiplier,
        sodium: food.sodium * multiplier,
        vitaminA: food.vitaminA * multiplier,
        vitaminB6: food.vitaminB6 * multiplier,
        vitaminB12: food.vitaminB12 * multiplier,
        vitaminC: food.vitaminC * multiplier,
        vitaminD: food.vitaminD * multiplier,
        vitaminE: food.vitaminE * multiplier,
        vitaminK: food.vitaminK * multiplier,
        folate: food.folate * multiplier,
        thiamin: food.thiamin * multiplier,
        riboflavin: food.riboflavin * multiplier,
        niacin: food.niacin * multiplier,
    };
};

// Calculate totals from multiple food entries
export const calculateTotalNutrition = (
    entries: FoodEntry[]
): Macronutrients & Micronutrients => {
    const initial: Macronutrients & Micronutrients = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        saturatedFat: 0,
        iron: 0,
        calcium: 0,
        magnesium: 0,
        zinc: 0,
        potassium: 0,
        sodium: 0,
        vitaminA: 0,
        vitaminB6: 0,
        vitaminB12: 0,
        vitaminC: 0,
        vitaminD: 0,
        vitaminE: 0,
        vitaminK: 0,
        folate: 0,
        thiamin: 0,
        riboflavin: 0,
        niacin: 0,
    };

    return entries.reduce((totals, entry) => {
        const nutrition = calculateFoodNutrition(entry.food, entry.quantity);

        return {
            calories: totals.calories + nutrition.calories,
            protein: totals.protein + nutrition.protein,
            carbs: totals.carbs + nutrition.carbs,
            fats: totals.fats + nutrition.fats,
            fiber: totals.fiber + nutrition.fiber,
            sugar: totals.sugar + nutrition.sugar,
            saturatedFat: totals.saturatedFat + nutrition.saturatedFat,
            iron: totals.iron + nutrition.iron,
            calcium: totals.calcium + nutrition.calcium,
            magnesium: totals.magnesium + nutrition.magnesium,
            zinc: totals.zinc + nutrition.zinc,
            potassium: totals.potassium + nutrition.potassium,
            sodium: totals.sodium + nutrition.sodium,
            vitaminA: totals.vitaminA + nutrition.vitaminA,
            vitaminB6: totals.vitaminB6 + nutrition.vitaminB6,
            vitaminB12: totals.vitaminB12 + nutrition.vitaminB12,
            vitaminC: totals.vitaminC + nutrition.vitaminC,
            vitaminD: totals.vitaminD + nutrition.vitaminD,
            vitaminE: totals.vitaminE + nutrition.vitaminE,
            vitaminK: totals.vitaminK + nutrition.vitaminK,
            folate: totals.folate + nutrition.folate,
            thiamin: totals.thiamin + nutrition.thiamin,
            riboflavin: totals.riboflavin + nutrition.riboflavin,
            niacin: totals.niacin + nutrition.niacin,
        };
    }, initial);
};

// Calculate daily totals from all meals
export const calculateDailyTotals = (meals: Meal[]): Macronutrients & Micronutrients => {
    const allEntries = meals.flatMap(meal => meal.foods);
    return calculateTotalNutrition(allEntries);
};

// Calculate remaining nutrients to reach goals
export const calculateRemaining = (
    current: Macronutrients & Partial<Micronutrients>,
    target: Macronutrients & Partial<Micronutrients>
): Partial<Macronutrients & Micronutrients> => {
    const remaining: any = {};

    Object.keys(target).forEach(key => {
        const currentValue = (current as any)[key] || 0;
        const targetValue = (target as any)[key] || 0;
        remaining[key] = Math.max(0, targetValue - currentValue);
    });

    return remaining;
};

// Calculate percentage of goal achieved
export const calculatePercentage = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
};

// Check if nutrient goal is met
export const isGoalMet = (current: number, target: number, tolerance: number = 0.1): boolean => {
    const percentage = current / target;
    return percentage >= (1 - tolerance) && percentage <= (1 + tolerance);
};

// Get macro split percentages
export const getMacroSplit = (nutrition: Macronutrients): { protein: number; carbs: number; fats: number } => {
    const proteinCals = nutrition.protein * 4;
    const carbsCals = nutrition.carbs * 4;
    const fatsCals = nutrition.fats * 9;
    const totalCals = proteinCals + carbsCals + fatsCals;

    if (totalCals === 0) {
        return { protein: 0, carbs: 0, fats: 0 };
    }

    return {
        protein: (proteinCals / totalCals) * 100,
        carbs: (carbsCals / totalCals) * 100,
        fats: (fatsCals / totalCals) * 100,
    };
};

// Calculate recommended macros based on goals
export const calculateRecommendedMacros = (
    weight: number, // kg
    goal: 'fatLoss' | 'muscleGain' | 'maintenance',
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
): Macronutrients => {
    // Activity multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9,
    };

    // Base metabolic rate (simplified Harris-Benedict)
    const bmr = 10 * weight + 6.25 * 170 - 5 * 25 + 5; // Assuming average height and age
    const tdee = bmr * activityMultipliers[activityLevel];

    let calories = tdee;
    let proteinPerKg = 1.6;
    let fatPercentage = 25;

    // Adjust based on goal
    if (goal === 'fatLoss') {
        calories = tdee * 0.8; // 20% deficit
        proteinPerKg = 2.0; // Higher protein to preserve muscle
        fatPercentage = 25;
    } else if (goal === 'muscleGain') {
        calories = tdee * 1.1; // 10% surplus
        proteinPerKg = 1.8;
        fatPercentage = 25;
    }

    const protein = weight * proteinPerKg;
    const fats = (calories * (fatPercentage / 100)) / 9;
    const carbs = (calories - (protein * 4) - (fats * 9)) / 4;

    return {
        calories,
        protein,
        carbs,
        fats,
        fiber: 25,
        sugar: 50,
        saturatedFat: 20,
    };
};
