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

    const weightDiff = input.targetWeight - input.currentWeight;

    // Safe limits: max 1 kg/week loss, max 0.5 kg/week gain
    const rawWeeklyChange = weightDiff / Math.max(input.timelineWeeks, 1);
    const weeklyWeightChange = Math.max(-1, Math.min(0.5, rawWeeklyChange));

    // Calorie floor: 1200 for women, 1500 for men (never go below this)
    const calorieFloor = input.gender === 'female' ? 1200 : 1500;
    // Calorie ceiling: TDEE + 500 (moderate surplus for lean bulking)
    const calorieCeiling = tdee + 500;

    let calories: number;
    let proteinPerKg: number;
    let fatPercentage: number;

    if (weightDiff < -1) {
        // WEIGHT LOSS — create a deficit capped at 500-750 kcal/day
        const dailyDeficit = Math.min(Math.abs(weeklyWeightChange) * 7700 / 7, 750);
        calories = Math.max(tdee - dailyDeficit, calorieFloor);
        proteinPerKg = 2.0; // Higher protein to preserve muscle
        fatPercentage = 25;
    } else if (weightDiff > 1) {
        // WEIGHT GAIN — modest surplus of 250-500 kcal/day
        const dailySurplus = Math.min(weeklyWeightChange * 7700 / 7, 500);
        calories = Math.min(tdee + dailySurplus, calorieCeiling);
        proteinPerKg = 1.8;
        fatPercentage = 25;
    } else {
        // MAINTENANCE — within ±1 kg of target
        calories = tdee;
        proteinPerKg = 1.6;
        fatPercentage = 30;
    }

    // Clamp calories to a sane range
    calories = Math.max(calorieFloor, Math.min(calories, 5000));

    const protein = Math.round(input.currentWeight * proteinPerKg);
    const fats = Math.round((calories * (fatPercentage / 100)) / 9);
    const proteinCalories = protein * 4;
    const fatCalories = fats * 9;
    const carbCalories = Math.max(0, calories - proteinCalories - fatCalories);
    const carbs = Math.round(carbCalories / 4);

    return {
        calories: Math.round(calories),
        protein,
        carbs,
        fats,
        fiber: 30,
        sugar: 50,
        saturatedFat: Math.round(fats * 0.3),
    };
}

// Multiple meal options per type — one is randomly picked each time
const mealOptions = {
    breakfast: [
        [{ search: 'Oats', portion: 0.30 }, { search: 'Egg', portion: 0.25 }, { search: 'Milk', portion: 0.25 }, { search: 'Banana', portion: 0.20 }],
        [{ search: 'Poha', portion: 0.35 }, { search: 'Curd', portion: 0.25 }, { search: 'Apple', portion: 0.20 }, { search: 'Almonds', portion: 0.20 }],
        [{ search: 'Idli', portion: 0.30 }, { search: 'Sambar', portion: 0.25 }, { search: 'Coconut Chutney', portion: 0.20 }, { search: 'Banana', portion: 0.25 }],
        [{ search: 'Paratha', portion: 0.35 }, { search: 'Curd', portion: 0.25 }, { search: 'Egg', portion: 0.25 }, { search: 'Orange Juice', portion: 0.15 }],
        [{ search: 'Dosa', portion: 0.30 }, { search: 'Potato', portion: 0.25 }, { search: 'Sambar', portion: 0.25 }, { search: 'Milk', portion: 0.20 }],
    ],
    lunch: [
        [{ search: 'Basmati Rice', portion: 0.30 }, { search: 'Dal', portion: 0.25 }, { search: 'Chicken Curry', portion: 0.30 }, { search: 'Curd', portion: 0.15 }],
        [{ search: 'Roti', portion: 0.25 }, { search: 'Rajma', portion: 0.30 }, { search: 'Basmati Rice', portion: 0.25 }, { search: 'Salad', portion: 0.20 }],
        [{ search: 'Basmati Rice', portion: 0.25 }, { search: 'Fish Curry', portion: 0.30 }, { search: 'Dal', portion: 0.25 }, { search: 'Pickle', portion: 0.20 }],
        [{ search: 'Roti', portion: 0.25 }, { search: 'Paneer', portion: 0.30 }, { search: 'Mixed Vegetables', portion: 0.25 }, { search: 'Curd', portion: 0.20 }],
        [{ search: 'Biryani', portion: 0.40 }, { search: 'Raita', portion: 0.25 }, { search: 'Salad', portion: 0.20 }, { search: 'Egg', portion: 0.15 }],
    ],
    dinner: [
        [{ search: 'Roti', portion: 0.30 }, { search: 'Paneer', portion: 0.30 }, { search: 'Dal', portion: 0.25 }, { search: 'Mixed Vegetables', portion: 0.15 }],
        [{ search: 'Basmati Rice', portion: 0.25 }, { search: 'Chicken Breast', portion: 0.35 }, { search: 'Spinach', portion: 0.20 }, { search: 'Curd', portion: 0.20 }],
        [{ search: 'Roti', portion: 0.25 }, { search: 'Egg Curry', portion: 0.30 }, { search: 'Dal', portion: 0.25 }, { search: 'Salad', portion: 0.20 }],
        [{ search: 'Roti', portion: 0.25 }, { search: 'Mushroom', portion: 0.25 }, { search: 'Dal', portion: 0.25 }, { search: 'Paneer', portion: 0.25 }],
        [{ search: 'Khichdi', portion: 0.40 }, { search: 'Curd', portion: 0.25 }, { search: 'Pickle', portion: 0.15 }, { search: 'Salad', portion: 0.20 }],
    ],
    snacks: [
        [{ search: 'Almonds', portion: 0.50 }, { search: 'Apple', portion: 0.50 }],
        [{ search: 'Peanuts', portion: 0.50 }, { search: 'Banana', portion: 0.50 }],
        [{ search: 'Chickpeas', portion: 0.50 }, { search: 'Orange', portion: 0.50 }],
        [{ search: 'Walnuts', portion: 0.50 }, { search: 'Mango', portion: 0.50 }],
        [{ search: 'Protein Shake', portion: 0.60 }, { search: 'Almonds', portion: 0.40 }],
    ],
};

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Calorie split: breakfast 25%, lunch 35%, dinner 30%, snacks 10%
const MEAL_DISTRIBUTION = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snacks: 0.10,
};

// Helper: calculate totals from a flat array of FoodEntry
function calcTotals(entries: FoodEntry[]): { calories: number; protein: number; carbs: number; fats: number } {
    return entries.reduce(
        (acc, entry) => {
            const m = entry.quantity / 100;
            return {
                calories: acc.calories + entry.food.calories * m,
                protein: acc.protein + entry.food.protein * m,
                carbs: acc.carbs + entry.food.carbs * m,
                fats: acc.fats + entry.food.fats * m,
            };
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
}

// Generate a balanced meal plan (uses USDA API, falls back to simple plan if API fails)
export async function generateMealPlan(goals: NutritionGoals): Promise<MealPlanDay> {
    const mealPlan: MealPlanDay = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
    };

    const mealPromises = Object.entries(MEAL_DISTRIBUTION).map(async ([mealType, percentage]) => {
        const mealCalories = goals.calories * percentage;
        const template = pickRandom(mealOptions[mealType as keyof typeof mealOptions]);

        // Normalize portions so they sum to 1.0
        const portionSum = template.reduce((s, t) => s + t.portion, 0);

        const foodPromises = template.map(async (item) => {
            try {
                const foods = await searchUSDAFoods(item.search, 3);
                if (foods.length > 0) {
                    const food = foods[0];
                    if (!food.calories || food.calories <= 0) return null;

                    // Each food gets its normalized share of this meal's calories
                    const normalizedPortion = item.portion / portionSum;
                    const targetCalories = mealCalories * normalizedPortion;
                    const quantity = (targetCalories / food.calories) * 100;
                    const finalQuantity = Math.max(20, Math.min(500, Math.round(quantity)));
                    return { food, quantity: finalQuantity, mealType: mealType as FoodEntry['mealType'] };
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

    const results = await Promise.all(mealPromises);
    results.forEach(({ mealType, foods }) => {
        mealPlan[mealType as keyof typeof mealOptions] = foods;
    });

    // If USDA API returned nothing (e.g. missing key), fall back to built-in plan
    const allFoods = [...mealPlan.breakfast, ...mealPlan.lunch, ...mealPlan.dinner, ...mealPlan.snacks];
    if (allFoods.length === 0) {
        console.warn('USDA API returned no foods — using built-in meal plan');
        return generateSimpleMealPlan(goals);
    }

    // ── CALIBRATION PASS ──
    // Scale all quantities proportionally to hit the calorie target
    let currentTotals = calcTotals(allFoods);

    if (currentTotals.calories > 0) {
        // Pass 1: Scale to match calorie target
        const calorieScale = goals.calories / currentTotals.calories;
        allFoods.forEach(entry => {
            entry.quantity = Math.max(20, Math.min(600, Math.round(entry.quantity * calorieScale)));
        });
        currentTotals = calcTotals(allFoods);

        // Pass 2: If protein is still off by >15%, adjust protein-rich foods
        const proteinRatio = goals.protein / Math.max(currentTotals.protein, 1);
        if (proteinRatio > 1.15 || proteinRatio < 0.85) {
            // Find foods with >15g protein per 100g (protein-rich)
            const proteinFoods = allFoods.filter(e => e.food.protein >= 15);
            if (proteinFoods.length > 0) {
                // Scale only protein-rich foods, capped to avoid extreme portions
                const proteinAdjust = Math.max(0.7, Math.min(1.5, proteinRatio));
                proteinFoods.forEach(entry => {
                    entry.quantity = Math.max(20, Math.min(600, Math.round(entry.quantity * proteinAdjust)));
                });
                currentTotals = calcTotals(allFoods);
            }
        }

        // Pass 3: Final calorie correction (the protein pass may have shifted calories)
        const finalCalScale = goals.calories / Math.max(currentTotals.calories, 1);
        if (finalCalScale < 0.90 || finalCalScale > 1.10) {
            // Only scale non-protein foods to avoid messing up protein again
            const nonProteinFoods = allFoods.filter(e => e.food.protein < 15);
            if (nonProteinFoods.length > 0) {
                nonProteinFoods.forEach(entry => {
                    entry.quantity = Math.max(20, Math.min(600, Math.round(entry.quantity * finalCalScale)));
                });
            }
        }
    }

    mealPlan.totals = calcTotals(allFoods);

    return mealPlan;
}

// Generate simple meal plan without API (fallback with hardcoded Indian foods)
export function generateSimpleMealPlan(goals: NutritionGoals): MealPlanDay {
    const f = {
        rice: { name: 'Basmati Rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
        roti: { name: 'Whole Wheat Roti', calories: 71, protein: 3, carbs: 15, fats: 0.4 },
        dal: { name: 'Moong Dal', calories: 105, protein: 7, carbs: 19, fats: 0.4 },
        chicken: { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
        paneer: { name: 'Paneer', calories: 265, protein: 18, carbs: 3, fats: 20 },
        egg: { name: 'Boiled Egg', calories: 155, protein: 13, carbs: 1.1, fats: 11 },
        milk: { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fats: 1 },
        banana: { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
        oats: { name: 'Oats', calories: 68, protein: 2.4, carbs: 12, fats: 1.4 },
        almonds: { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50 },
        apple: { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
        curd: { name: 'Curd', calories: 61, protein: 3.5, carbs: 4.7, fats: 3.3 },
        poha: { name: 'Poha', calories: 110, protein: 2.5, carbs: 22, fats: 1.2 },
        idli: { name: 'Idli', calories: 39, protein: 2, carbs: 8, fats: 0.1 },
        rajma: { name: 'Rajma', calories: 127, protein: 8.7, carbs: 23, fats: 0.5 },
        peanuts: { name: 'Peanuts', calories: 567, protein: 26, carbs: 16, fats: 49 },
    };

    // 3 different plan templates — randomly pick one
    const plans = [
        { b: [{ fd: f.oats, q: 200 }, { fd: f.egg, q: 100 }, { fd: f.milk, q: 200 }, { fd: f.banana, q: 100 }],
          l: [{ fd: f.rice, q: 200 }, { fd: f.dal, q: 150 }, { fd: f.chicken, q: 150 }, { fd: f.curd, q: 100 }],
          d: [{ fd: f.roti, q: 150 }, { fd: f.paneer, q: 100 }, { fd: f.dal, q: 120 }],
          s: [{ fd: f.almonds, q: 30 }, { fd: f.apple, q: 150 }] },
        { b: [{ fd: f.poha, q: 250 }, { fd: f.curd, q: 150 }, { fd: f.banana, q: 100 }, { fd: f.almonds, q: 20 }],
          l: [{ fd: f.roti, q: 150 }, { fd: f.rajma, q: 200 }, { fd: f.rice, q: 150 }, { fd: f.curd, q: 100 }],
          d: [{ fd: f.rice, q: 150 }, { fd: f.chicken, q: 150 }, { fd: f.dal, q: 100 }],
          s: [{ fd: f.peanuts, q: 30 }, { fd: f.banana, q: 120 }] },
        { b: [{ fd: f.idli, q: 300 }, { fd: f.egg, q: 100 }, { fd: f.milk, q: 200 }, { fd: f.apple, q: 100 }],
          l: [{ fd: f.roti, q: 150 }, { fd: f.paneer, q: 120 }, { fd: f.dal, q: 150 }, { fd: f.curd, q: 100 }],
          d: [{ fd: f.roti, q: 120 }, { fd: f.egg, q: 120 }, { fd: f.dal, q: 150 }],
          s: [{ fd: f.almonds, q: 25 }, { fd: f.banana, q: 120 }] },
    ];

    const plan = pickRandom(plans);
    const toEntries = (items: { fd: any; q: number }[], mt: string): FoodEntry[] =>
        items.map(i => ({ food: i.fd as any, quantity: i.q, mealType: mt as any }));

    const breakfast = toEntries(plan.b, 'breakfast');
    const lunch = toEntries(plan.l, 'lunch');
    const dinner = toEntries(plan.d, 'dinner');
    const snacks = toEntries(plan.s, 'snacks');

    const allFoods = [...breakfast, ...lunch, ...dinner, ...snacks];
    const baseTotals = calcTotals(allFoods);
    const scale = goals.calories / Math.max(baseTotals.calories, 1);
    allFoods.forEach(e => { e.quantity = Math.max(20, Math.round(e.quantity * scale)); });

    return { breakfast, lunch, dinner, snacks, totals: calcTotals(allFoods) };
}

// Get timeline recommendation
export function getTimelineRecommendation(currentWeight: number, targetWeight: number): {
    minWeeks: number;
    maxWeeks: number;
    recommended: number;
    warning?: string;
} {
    const weightDiff = Math.abs(targetWeight - currentWeight);

    if (targetWeight < currentWeight) {
        const minWeeks = Math.ceil(weightDiff / 1);
        const maxWeeks = Math.ceil(weightDiff / 0.5);
        const recommended = Math.ceil(weightDiff / 0.75);
        return {
            minWeeks, maxWeeks, recommended,
            warning: weightDiff > 20 ? 'Consider consulting a nutritionist for significant weight loss goals' : undefined,
        };
    } else {
        const minWeeks = Math.ceil(weightDiff / 0.5);
        const maxWeeks = Math.ceil(weightDiff / 0.25);
        const recommended = Math.ceil(weightDiff / 0.35);
        return {
            minWeeks, maxWeeks, recommended,
            warning: weightDiff > 15 ? 'Significant muscle gain takes time. Stay consistent!' : undefined,
        };
    }
}
