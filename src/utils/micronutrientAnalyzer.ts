import { Macronutrients, Micronutrients, NutrientDeficiency } from '@/types/nutrition';

// RDA (Recommended Daily Allowance) for micronutrients
// Values are for average adult
export const RDA: Micronutrients = {
    iron: 18, // mg
    calcium: 1000, // mg
    magnesium: 400, // mg
    zinc: 11, // mg
    potassium: 3500, // mg
    sodium: 2300, // mg (upper limit)
    vitaminA: 900, // mcg
    vitaminB6: 1.3, // mg
    vitaminB12: 2.4, // mcg
    vitaminC: 90, // mg
    vitaminD: 15, // mcg
    vitaminE: 15, // mg
    vitaminK: 120, // mcg
    folate: 400, // mcg
    thiamin: 1.2, // mg
    riboflavin: 1.3, // mg
    niacin: 16, // mg
};

// Analyze micronutrient intake and identify deficiencies
export const analyzeMicronutrients = (
    current: Partial<Micronutrients>
): NutrientDeficiency[] => {
    const deficiencies: NutrientDeficiency[] = [];

    const nutrientNames: Record<keyof Micronutrients, string> = {
        iron: 'Iron',
        calcium: 'Calcium',
        magnesium: 'Magnesium',
        zinc: 'Zinc',
        potassium: 'Potassium',
        sodium: 'Sodium',
        vitaminA: 'Vitamin A',
        vitaminB6: 'Vitamin B6',
        vitaminB12: 'Vitamin B12',
        vitaminC: 'Vitamin C',
        vitaminD: 'Vitamin D',
        vitaminE: 'Vitamin E',
        vitaminK: 'Vitamin K',
        folate: 'Folate',
        thiamin: 'Thiamin (B1)',
        riboflavin: 'Riboflavin (B2)',
        niacin: 'Niacin (B3)',
    };

    Object.keys(RDA).forEach(key => {
        const nutrientKey = key as keyof Micronutrients;
        const currentValue = current[nutrientKey] || 0;
        const targetValue = RDA[nutrientKey];
        const percentage = (currentValue / targetValue) * 100;

        // Only flag if below 70% of RDA
        if (percentage < 70) {
            let severity: 'low' | 'moderate' | 'high' = 'low';
            if (percentage < 30) severity = 'high';
            else if (percentage < 50) severity = 'moderate';

            deficiencies.push({
                nutrient: nutrientNames[nutrientKey],
                current: currentValue,
                target: targetValue,
                percentage,
                severity,
                recommendations: getFoodRecommendations(nutrientKey),
            });
        }
    });

    return deficiencies.sort((a, b) => a.percentage - b.percentage);
};

// Get food recommendations for specific nutrient deficiencies
const getFoodRecommendations = (nutrient: keyof Micronutrients): string[] => {
    const recommendations: Record<keyof Micronutrients, string[]> = {
        iron: ['Spinach', 'Lentils', 'Red meat', 'Chickpeas', 'Tofu'],
        calcium: ['Paneer', 'Cheese', 'Milk', 'Tofu', 'Spinach', 'Chia seeds'],
        magnesium: ['Spinach', 'Almonds', 'Quinoa', 'Brown rice', 'Avocado'],
        zinc: ['Beef', 'Chickpeas', 'Lentils', 'Pumpkin seeds', 'Cheese'],
        potassium: ['Banana', 'Sweet potato', 'Spinach', 'Avocado', 'Salmon'],
        sodium: ['Reduce processed foods', 'Use less salt'],
        vitaminA: ['Carrots', 'Sweet potato', 'Spinach', 'Bell peppers', 'Mango'],
        vitaminB6: ['Chicken', 'Salmon', 'Banana', 'Chickpeas', 'Sweet potato'],
        vitaminB12: ['Salmon', 'Beef', 'Eggs', 'Greek yogurt', 'Cheese'],
        vitaminC: ['Bell peppers', 'Strawberries', 'Orange', 'Broccoli', 'Mango'],
        vitaminD: ['Salmon', 'Eggs', 'Milk', 'Sunlight exposure'],
        vitaminE: ['Almonds', 'Spinach', 'Avocado', 'Olive oil', 'Sunflower seeds'],
        vitaminK: ['Spinach', 'Broccoli', 'Brussels sprouts', 'Kale'],
        folate: ['Lentils', 'Chickpeas', 'Spinach', 'Broccoli', 'Avocado'],
        thiamin: ['Oats', 'Lentils', 'Sunflower seeds', 'Whole wheat bread'],
        riboflavin: ['Almonds', 'Eggs', 'Spinach', 'Greek yogurt', 'Milk'],
        niacin: ['Chicken', 'Salmon', 'Peanut butter', 'Brown rice', 'Whole wheat bread'],
    };

    return recommendations[nutrient] || [];
};

// Calculate overall nutrition score (0-100)
export const calculateNutritionScore = (
    current: Macronutrients & Partial<Micronutrients>,
    target: Macronutrients & Partial<Micronutrients>
): number => {
    let score = 0;
    let count = 0;

    // Score macros (40% of total)
    const macroKeys: (keyof Macronutrients)[] = ['calories', 'protein', 'carbs', 'fats', 'fiber'];
    macroKeys.forEach(key => {
        const currentValue = current[key] || 0;
        const targetValue = target[key] || 0;
        if (targetValue > 0) {
            const percentage = Math.min((currentValue / targetValue) * 100, 100);
            // Penalize if too far off (either way)
            const deviation = Math.abs(percentage - 100);
            const macroScore = Math.max(0, 100 - deviation);
            score += macroScore;
            count++;
        }
    });

    // Score micros (60% of total)
    const microKeys = Object.keys(RDA) as (keyof Micronutrients)[];
    microKeys.forEach(key => {
        const currentValue = (current as any)[key] || 0;
        const targetValue = RDA[key];
        const percentage = Math.min((currentValue / targetValue) * 100, 100);
        score += percentage;
        count++;
    });

    return count > 0 ? Math.round(score / count) : 0;
};

// Check if diet is balanced
export const isDietBalanced = (
    macros: Macronutrients
): { balanced: boolean; issues: string[] } => {
    const split = getMacroSplit(macros);
    const issues: string[] = [];

    // Check macro balance
    if (split.protein < 15) {
        issues.push('Protein intake is too low (should be 15-35% of calories)');
    } else if (split.protein > 35) {
        issues.push('Protein intake is too high (should be 15-35% of calories)');
    }

    if (split.carbs < 45) {
        issues.push('Carb intake is too low (should be 45-65% of calories)');
    } else if (split.carbs > 65) {
        issues.push('Carb intake is too high (should be 45-65% of calories)');
    }

    if (split.fats < 20) {
        issues.push('Fat intake is too low (should be 20-35% of calories)');
    } else if (split.fats > 35) {
        issues.push('Fat intake is too high (should be 20-35% of calories)');
    }

    // Check fiber
    if (macros.fiber < 25) {
        issues.push('Fiber intake is too low (aim for 25-30g daily)');
    }

    // Check saturated fat
    if (macros.saturatedFat > 20) {
        issues.push('Saturated fat is too high (limit to <20g daily)');
    }

    return {
        balanced: issues.length === 0,
        issues,
    };
};

// Helper to get macro split
const getMacroSplit = (nutrition: Macronutrients): { protein: number; carbs: number; fats: number } => {
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
