import { Food } from '@/types/nutrition';

const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

interface USDAFood {
    fdcId: number;
    description: string;
    foodNutrients: Array<{
        nutrientId: number;
        nutrientName: string;
        value: number;
        unitName: string;
    }>;
    servingSize?: number;
    servingSizeUnit?: string;
    brandOwner?: string;
}

interface USDASearchResult {
    foods: USDAFood[];
    totalHits: number;
}

// Nutrient ID mapping from USDA to our app
const NUTRIENT_MAP: Record<number, keyof Food> = {
    1008: 'calories', // Energy (kcal)
    1003: 'protein', // Protein
    1005: 'carbs', // Carbohydrate
    1004: 'fats', // Total lipid (fat)
    1079: 'fiber', // Fiber, total dietary
    2000: 'sugar', // Sugars, total
    1258: 'saturatedFat', // Fatty acids, total saturated
    1089: 'iron', // Iron
    1087: 'calcium', // Calcium
    1090: 'magnesium', // Magnesium
    1095: 'zinc', // Zinc
    1092: 'potassium', // Potassium
    1093: 'sodium', // Sodium
    1106: 'vitaminA', // Vitamin A
    1175: 'vitaminB6', // Vitamin B-6
    1178: 'vitaminB12', // Vitamin B-12
    1162: 'vitaminC', // Vitamin C
    1114: 'vitaminD', // Vitamin D
    1109: 'vitaminE', // Vitamin E
    1185: 'vitaminK', // Vitamin K
    1177: 'folate', // Folate, total
    1165: 'thiamin', // Thiamin
    1166: 'riboflavin', // Riboflavin
    1167: 'niacin', // Niacin
};

// Search foods from USDA API
export async function searchUSDAFoods(query: string, pageSize: number = 20): Promise<Food[]> {
    try {
        const response = await fetch(
            `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${USDA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from USDA API');
        }

        const data: USDASearchResult = await response.json();

        return data.foods.map(usdaFood => convertUSDAToFood(usdaFood));
    } catch (error) {
        console.error('USDA API Error:', error);
        return [];
    }
}

// Get food details by ID
export async function getUSDAFoodById(fdcId: number): Promise<Food | null> {
    try {
        const response = await fetch(
            `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch food details');
        }

        const data: USDAFood = await response.json();
        return convertUSDAToFood(data);
    } catch (error) {
        console.error('USDA API Error:', error);
        return null;
    }
}

// Convert USDA food format to our Food type
function convertUSDAToFood(usdaFood: USDAFood): Food {
    const food: Partial<Food> = {
        id: `usda-${usdaFood.fdcId}`,
        name: usdaFood.description,
        servingSize: usdaFood.servingSize || 100,
        category: 'api', // Mark as API-sourced
        brand: usdaFood.brandOwner,
        // Initialize all nutrients to 0
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

    // Map USDA nutrients to our format
    usdaFood.foodNutrients.forEach(nutrient => {
        const fieldName = NUTRIENT_MAP[nutrient.nutrientId];
        if (fieldName) {
            // Convert all values to per 100g basis
            let value = nutrient.value;

            // If serving size is different from 100g, scale the value
            if (usdaFood.servingSize && usdaFood.servingSize !== 100) {
                value = (value / usdaFood.servingSize) * 100;
            }

            // Handle unit conversions
            if (nutrient.unitName === 'MG' && fieldName === 'calcium') {
                // Calcium is already in mg, no conversion needed
            } else if (nutrient.unitName === 'UG') {
                // Convert micrograms to milligrams for some vitamins
                if (['vitaminA', 'vitaminD', 'vitaminK', 'folate', 'vitaminB12'].includes(fieldName)) {
                    value = value / 1000; // Keep as mcg for these
                }
            }

            (food as any)[fieldName] = value;
        }
    });

    return food as Food;
}

// Get autocomplete suggestions
export async function getUSDAAutocomplete(query: string): Promise<string[]> {
    try {
        const response = await fetch(
            `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch autocomplete');
        }

        const data: USDASearchResult = await response.json();
        return data.foods.map(food => food.description);
    } catch (error) {
        console.error('USDA API Error:', error);
        return [];
    }
}

// Get popular foods
export async function getPopularFoods(): Promise<Food[]> {
    const popularQueries = ['chicken', 'rice', 'banana', 'egg', 'milk'];
    const allFoods: Food[] = [];

    for (const query of popularQueries) {
        const foods = await searchUSDAFoods(query, 5);
        allFoods.push(...foods);
    }

    return allFoods;
}
