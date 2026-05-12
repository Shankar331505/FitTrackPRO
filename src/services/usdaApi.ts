import { Food } from '@/types/nutrition';

const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

interface USDAFood {
    fdcId: number;
    description: string;
    dataType?: string; // "Branded", "Survey (FNDDS)", "SR Legacy", "Foundation"
    foodNutrients: Array<{
        nutrientId: number;
        nutrientName: string;
        value: number;
        unitName: string;
    }>;
    servingSize?: number;
    servingSizeUnit?: string;
    brandOwner?: string;
    foodCategory?: string;
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

/**
 * Preferred data types in order of accuracy/consistency:
 * 1. "Survey (FNDDS)" — USDA's most curated dataset, lab-verified, per-100g
 * 2. "SR Legacy" — Standard Reference, comprehensive, per-100g
 * 3. "Foundation" — Detailed analytical data, per-100g
 * 4. "Branded" — Manufacturer-reported (less consistent, per-serving)
 */
const PREFERRED_DATA_TYPES = ['Survey (FNDDS)', 'SR Legacy', 'Foundation'];

/** Convert "CHICKEN BREAST, ROASTED" to "Chicken Breast, Roasted" */
function titleCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/(?:^|\s|,\s*|-)\w/g, match => match.toUpperCase());
}

/** Clean up USDA food descriptions for readability */
function cleanFoodName(description: string, dataType?: string): string {
    let name = titleCase(description);

    // Remove USDA-style parenthetical codes like "(Nfs)" or "(Ns As For Whole Wheat)"
    name = name.replace(/\s*\(Nfs\)/gi, '');
    name = name.replace(/\s*\(Ns As.*?\)/gi, '');

    // Trim trailing commas and whitespace
    name = name.replace(/,\s*$/, '').trim();

    return name;
}

// Search foods from USDA API — prioritizes standard reference data over branded
export async function searchUSDAFoods(query: string, pageSize: number = 20): Promise<Food[]> {
    try {
        // Request more results so we can filter and still return enough
        const fetchSize = Math.min(pageSize * 3, 50);

        const response = await fetch(
            `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=${fetchSize}&dataType=Survey%20(FNDDS),SR%20Legacy,Foundation,Branded&api_key=${USDA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from USDA API');
        }

        const data: USDASearchResult = await response.json();

        // Sort: preferred data types first, then by relevance
        const sorted = data.foods.sort((a, b) => {
            const aPreferred = PREFERRED_DATA_TYPES.includes(a.dataType || '') ? 0 : 1;
            const bPreferred = PREFERRED_DATA_TYPES.includes(b.dataType || '') ? 0 : 1;
            return aPreferred - bPreferred;
        });

        // Deduplicate by food name (keep the preferred data type version)
        const seen = new Set<string>();
        const unique = sorted.filter(food => {
            const key = food.description.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Filter out foods with no calorie data
        const withCalories = unique.filter(food =>
            food.foodNutrients.some(n => n.nutrientId === 1008 && n.value > 0)
        );

        return withCalories.slice(0, pageSize).map(usdaFood => convertUSDAToFood(usdaFood));
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
    const isBranded = usdaFood.dataType === 'Branded';

    const food: Partial<Food> = {
        id: `usda-${usdaFood.fdcId}`,
        name: cleanFoodName(usdaFood.description, usdaFood.dataType),
        servingSize: 100, // Always normalize to per-100g
        category: 'api', // Mark as API-sourced
        brand: isBranded ? usdaFood.brandOwner : undefined,
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
            let value = nutrient.value;

            // For BRANDED foods, USDA reports values per-serving, not per-100g.
            // We need to normalize to per-100g for consistency.
            if (isBranded && usdaFood.servingSize && usdaFood.servingSize !== 100) {
                value = (value / usdaFood.servingSize) * 100;
            }
            // For Survey (FNDDS), SR Legacy, Foundation — values are already per 100g.
            // No conversion needed.

            // Handle unit conversions
            if (nutrient.unitName === 'UG') {
                // Convert micrograms to milligrams for vitamins stored in mg
                if (['vitaminA', 'vitaminD', 'vitaminK', 'folate', 'vitaminB12'].includes(fieldName)) {
                    value = value / 1000;
                }
            }

            // Round to reasonable precision
            (food as any)[fieldName] = Math.round(value * 100) / 100;
        }
    });

    return food as Food;
}

// Get autocomplete suggestions
export async function getUSDAAutocomplete(query: string): Promise<string[]> {
    try {
        const response = await fetch(
            `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&dataType=Survey%20(FNDDS),SR%20Legacy&api_key=${USDA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch autocomplete');
        }

        const data: USDASearchResult = await response.json();
        return data.foods.map(food => cleanFoodName(food.description));
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
