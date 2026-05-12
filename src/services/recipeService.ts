// AI Food Recipe Generator API (RapidAPI)
// Docs: https://rapidapi.com/ltdbilgisam/api/ai-food-recipe-generator-api-custom-diet-quick-meals
// Falls back to hardcoded recipes if API fails or quota exceeded

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_EXERCISEDB_KEY || '';
const API_HOST = 'ai-food-recipe-generator-api-custom-diet-quick-meals.p.rapidapi.com';
const API_URL = `https://${API_HOST}/generate?noqueue=1`;

export interface SimpleRecipe {
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    servings: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

interface AIRecipeResponse {
    status: string;
    result: {
        title: string;
        ingredients: { name: string; amount: string }[];
        instructions: string[];
        nutrition_info: {
            calories: number;
            protein: string;
            carbs: string;
            fats: string;
        };
    };
}

// ─────────────────────────────────────────────────
// Ingredient sets by meal type & diet preference
// ─────────────────────────────────────────────────

const MEAL_INGREDIENTS: Record<string, { veg: string[][]; nonveg: string[][] }> = {
    breakfast: {
        veg: [
            ['oats', 'milk', 'banana', 'almonds', 'honey'],
            ['poha', 'peanuts', 'potato', 'coriander', 'lemon'],
            ['idli', 'sambar', 'coconut chutney', 'ghee'],
            ['dosa', 'potato', 'sambar', 'coconut'],
            ['upma', 'vegetables', 'cashew', 'coriander'],
        ],
        nonveg: [
            ['eggs', 'bread', 'milk', 'banana', 'butter'],
            ['egg', 'paratha', 'curd', 'pickle'],
            ['omelette', 'toast', 'cheese', 'tomato'],
            ['egg bhurji', 'roti', 'onion', 'green chilli'],
        ],
    },
    lunch: {
        veg: [
            ['rice', 'dal', 'paneer', 'vegetables', 'curd'],
            ['roti', 'rajma', 'rice', 'salad', 'curd'],
            ['rice', 'sambar', 'vegetables', 'papad', 'pickle'],
            ['roti', 'palak paneer', 'rice', 'raita'],
            ['chole', 'rice', 'onion', 'lemon', 'curd'],
        ],
        nonveg: [
            ['rice', 'chicken curry', 'dal', 'curd', 'salad'],
            ['roti', 'mutton curry', 'rice', 'raita'],
            ['rice', 'fish curry', 'dal', 'vegetables'],
            ['chicken biryani', 'raita', 'salad', 'egg'],
        ],
    },
    dinner: {
        veg: [
            ['roti', 'paneer butter masala', 'dal', 'salad'],
            ['rice', 'dal tadka', 'aloo gobi', 'curd'],
            ['roti', 'mixed vegetables', 'dal', 'raita'],
            ['khichdi', 'curd', 'papad', 'pickle'],
        ],
        nonveg: [
            ['roti', 'chicken', 'dal', 'vegetables'],
            ['rice', 'egg curry', 'dal', 'salad'],
            ['roti', 'fish', 'vegetables', 'dal'],
            ['chicken tikka', 'roti', 'salad', 'raita'],
        ],
    },
    snacks: {
        veg: [
            ['almonds', 'banana', 'milk'],
            ['peanuts', 'apple', 'jaggery'],
            ['sprouts', 'lemon', 'onion', 'tomato'],
            ['fruit salad', 'curd', 'honey'],
        ],
        nonveg: [
            ['boiled eggs', 'banana', 'almonds'],
            ['chicken sandwich', 'apple'],
            ['egg salad', 'bread', 'cucumber'],
        ],
    },
};

/** Pick a random item from an array */
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Parse a string like "35g" to number 35 */
function parseNutrient(val: string | number): number {
    if (typeof val === 'number') return val;
    return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
}

/**
 * Scale a recipe's macros to match target macros within ±5%.
 * Uses calorie-based scaling: adjusts all macros proportionally.
 */
function scaleRecipeToTarget(
    recipe: SimpleRecipe,
    targetCalories: number,
    targetProtein: number,
    targetCarbs: number,
    targetFats: number
): SimpleRecipe {
    if (recipe.calories <= 0) return recipe;

    // Scale based on calories (primary target)
    const scale = targetCalories / recipe.calories;

    return {
        ...recipe,
        calories: Math.round(targetCalories),
        protein: Math.round(recipe.protein * scale),
        carbs: Math.round(recipe.carbs * scale),
        fats: Math.round(recipe.fats * scale),
        // Scale ingredient amounts in the text (approximate)
        ingredients: recipe.ingredients.map(ing => {
            if (scale === 1) return ing;
            // Try to find and scale numeric values in ingredient strings
            return ing.replace(/(\d+\.?\d*)\s*(g|kg|ml|cup|tbsp|tsp|pieces?|nos?\.?)/gi, (match, num, unit) => {
                const scaled = Math.round(parseFloat(num) * scale * 10) / 10;
                return `${scaled} ${unit}`;
            });
        }),
    };
}

// ─────────────────────────────────────────────────
// AI RECIPE API — generates recipes via RapidAPI
// ─────────────────────────────────────────────────

function isConfigured(): boolean {
    return !!RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here';
}

/**
 * Generate a recipe using the AI Recipe API.
 * Macros are scaled to match the target within ±5%.
 */
export async function generateRecipeFromAPI(
    mealType: string,
    isVeg: boolean,
    targetMacros: { calories: number; protein: number; carbs: number; fats: number },
    customIngredients?: string[]
): Promise<SimpleRecipe | null> {
    if (!isConfigured()) {
        console.log('RapidAPI key not configured for recipes');
        return null;
    }

    // Pick ingredients for the meal
    const mealIngredients = MEAL_INGREDIENTS[mealType] || MEAL_INGREDIENTS.lunch;
    const ingredientSet = isVeg ? mealIngredients.veg : mealIngredients.nonveg;
    const ingredients = customIngredients || pickRandom(ingredientSet);

    const dietaryRestrictions = isVeg ? ['vegetarian'] : [];

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': API_HOST,
                'x-rapidapi-key': RAPIDAPI_KEY,
            },
            body: JSON.stringify({
                ingredients,
                dietary_restrictions: dietaryRestrictions,
                cuisine: 'Indian',
                meal_type: mealType === 'snacks' ? 'snack' : mealType,
                servings: 1,
                lang: 'en',
            }),
        });

        if (!response.ok) {
            throw new Error(`AI Recipe API ${response.status}: ${response.statusText}`);
        }

        const data: AIRecipeResponse = await response.json();

        if (data.status !== 'success' || !data.result) {
            throw new Error('AI Recipe API returned non-success status');
        }

        const r = data.result;

        // Build the recipe
        let recipe: SimpleRecipe = {
            title: r.title,
            ingredients: r.ingredients.map(i => `${i.name} — ${i.amount}`),
            instructions: r.instructions,
            prepTime: mealType === 'snacks' ? 10 : mealType === 'breakfast' ? 20 : 40,
            servings: 1,
            calories: parseNutrient(r.nutrition_info.calories),
            protein: parseNutrient(r.nutrition_info.protein),
            carbs: parseNutrient(r.nutrition_info.carbs),
            fats: parseNutrient(r.nutrition_info.fats),
        };

        // Scale recipe to match target macros (within ±5%)
        recipe = scaleRecipeToTarget(
            recipe,
            targetMacros.calories,
            targetMacros.protein,
            targetMacros.carbs,
            targetMacros.fats
        );

        return recipe;
    } catch (err) {
        console.error('AI Recipe API error:', err);
        return null;
    }
}

// ─────────────────────────────────────────────────
// FALLBACK — hardcoded Indian recipes
// ─────────────────────────────────────────────────

/**
 * Generate a hardcoded recipe (fallback when API fails).
 * Macros are set to match the target exactly.
 */
export function generateSimpleRecipe(
    foodNames: string[],
    mealType: string,
    isVeg: boolean = false,
    targetMacros?: { calories: number; protein: number; carbs: number; fats: number }
): SimpleRecipe {
    const vegRecipes: Record<string, SimpleRecipe> = {
        breakfast: {
            title: 'Healthy Indian Vegetarian Breakfast',
            ingredients: foodNames.length > 0 ? foodNames : ['Oats', 'Milk', 'Banana', 'Almonds', 'Honey'],
            instructions: [
                'Cook oats in milk on medium heat for 5 minutes until creamy',
                'Slice banana and chop almonds',
                'Top the oats with banana slices and chopped almonds',
                'Drizzle with honey and serve warm',
                'Optional: Add chia seeds or flax seeds for extra nutrition'
            ],
            prepTime: 15, servings: 1,
            calories: targetMacros?.calories || 400,
            protein: targetMacros?.protein || 15,
            carbs: targetMacros?.carbs || 55,
            fats: targetMacros?.fats || 12,
        },
        lunch: {
            title: 'Balanced Vegetarian Indian Thali',
            ingredients: foodNames.length > 0 ? foodNames : ['Rice', 'Dal', 'Paneer', 'Mixed Vegetables', 'Curd', 'Roti'],
            instructions: [
                'Cook rice: Rinse 1 cup basmati rice, add 2 cups water, cook until fluffy',
                'Prepare dal: Boil moong dal with turmeric, temper with cumin and garlic',
                'Make paneer bhurji: Crumble paneer, sauté with onions, tomatoes, and spices',
                'Sauté seasonal vegetables with minimal oil and Indian spices',
                'Make rotis: Knead wheat flour dough, roll and cook on tawa',
                'Serve hot with a side of fresh curd and salad',
            ],
            prepTime: 45, servings: 1,
            calories: targetMacros?.calories || 650,
            protein: targetMacros?.protein || 30,
            carbs: targetMacros?.carbs || 85,
            fats: targetMacros?.fats || 18,
        },
        dinner: {
            title: 'Light Vegetarian Indian Dinner',
            ingredients: foodNames.length > 0 ? foodNames : ['Roti', 'Paneer Butter Masala', 'Dal Tadka', 'Salad'],
            instructions: [
                'Prepare dal tadka: Boil moong dal, temper with ghee, cumin, and curry leaves',
                'Make paneer butter masala: Cook paneer in tomato-cashew gravy',
                'Prepare rotis: Make whole wheat dough, roll and cook on tawa',
                'Toss a fresh salad with cucumber, tomato, and lemon dressing',
                'Serve warm — keep dinner portions light',
            ],
            prepTime: 35, servings: 1,
            calories: targetMacros?.calories || 550,
            protein: targetMacros?.protein || 25,
            carbs: targetMacros?.carbs || 65,
            fats: targetMacros?.fats || 20,
        },
        snacks: {
            title: 'Healthy Vegetarian Snack',
            ingredients: foodNames.length > 0 ? foodNames : ['Sprouts', 'Lemon', 'Onion', 'Tomato', 'Chaat Masala'],
            instructions: [
                'Boil sprouts until tender (about 10 minutes)',
                'Chop onion and tomato finely',
                'Mix sprouts with onion, tomato, and a squeeze of lemon',
                'Sprinkle chaat masala and serve fresh',
            ],
            prepTime: 10, servings: 1,
            calories: targetMacros?.calories || 200,
            protein: targetMacros?.protein || 10,
            carbs: targetMacros?.carbs || 25,
            fats: targetMacros?.fats || 5,
        },
    };

    const nonvegRecipes: Record<string, SimpleRecipe> = {
        breakfast: {
            title: 'Protein-Packed Indian Breakfast',
            ingredients: foodNames.length > 0 ? foodNames : ['Eggs', 'Whole Wheat Bread', 'Milk', 'Banana'],
            instructions: [
                'Heat a non-stick pan on medium heat',
                'Prepare eggs as per your preference (boiled, scrambled, or omelette)',
                'Toast the bread lightly with a touch of butter',
                'Serve with a glass of milk and fresh banana',
                'Optional: Add black pepper and herbs for flavor',
            ],
            prepTime: 15, servings: 1,
            calories: targetMacros?.calories || 400,
            protein: targetMacros?.protein || 25,
            carbs: targetMacros?.carbs || 45,
            fats: targetMacros?.fats || 12,
        },
        lunch: {
            title: 'Balanced Indian Non-Veg Lunch',
            ingredients: foodNames.length > 0 ? foodNames : ['Rice', 'Dal', 'Chicken Curry', 'Vegetables', 'Roti', 'Curd'],
            instructions: [
                'Cook rice: Rinse 1 cup basmati rice, add 2 cups water, cook until fluffy',
                'Prepare dal: Boil lentils with turmeric, temper with cumin and garlic',
                'Cook chicken curry: Marinate chicken, sauté with onions, tomatoes, and spices',
                'Make rotis: Knead wheat flour dough, roll and cook on tawa',
                'Sauté vegetables with minimal oil and Indian spices',
                'Serve hot with a side of curd or raita',
            ],
            prepTime: 45, servings: 1,
            calories: targetMacros?.calories || 650,
            protein: targetMacros?.protein || 40,
            carbs: targetMacros?.carbs || 75,
            fats: targetMacros?.fats || 18,
        },
        dinner: {
            title: 'Light Indian Non-Veg Dinner',
            ingredients: foodNames.length > 0 ? foodNames : ['Roti', 'Chicken Tikka', 'Dal', 'Salad', 'Raita'],
            instructions: [
                'Prepare chicken tikka: Marinate chicken with yogurt and spices, grill or bake',
                'Prepare dal tadka: Boil moong dal, temper with ghee, cumin, and curry leaves',
                'Make rotis: Roll whole wheat dough and cook on tawa',
                'Toss fresh salad and prepare raita with cucumber',
                'Serve warm — keep dinner light and protein-rich',
            ],
            prepTime: 40, servings: 1,
            calories: targetMacros?.calories || 550,
            protein: targetMacros?.protein || 35,
            carbs: targetMacros?.carbs || 55,
            fats: targetMacros?.fats || 18,
        },
        snacks: {
            title: 'High-Protein Snack',
            ingredients: foodNames.length > 0 ? foodNames : ['Boiled Eggs', 'Banana', 'Almonds'],
            instructions: [
                'Boil eggs for 10 minutes, peel and slice',
                'Take a handful of almonds (10-12 pieces)',
                'Serve with a fresh banana',
                'Optional: Sprinkle black salt and pepper on eggs',
            ],
            prepTime: 12, servings: 1,
            calories: targetMacros?.calories || 250,
            protein: targetMacros?.protein || 15,
            carbs: targetMacros?.carbs || 25,
            fats: targetMacros?.fats || 12,
        },
    };

    const recipes = isVeg ? vegRecipes : nonvegRecipes;
    const baseRecipe = recipes[mealType] || recipes.lunch;

    return {
        ...baseRecipe,
        ingredients: foodNames.length > 0 ? foodNames : baseRecipe.ingredients,
        title: foodNames.length > 0
            ? `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} with ${foodNames.slice(0, 2).join(' & ')}`
            : baseRecipe.title,
    };
}

// Keep the old Gemini AI function for backward compatibility
export async function generateRecipeWithAI(
    foodNames: string[],
    mealType: string,
    macros: { calories: number; protein: number; carbs: number; fats: number }
): Promise<SimpleRecipe | null> {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_key_here') {
        return null;
    }

    try {
        const prompt = `Create a detailed Indian recipe for ${mealType} using these ingredients: ${foodNames.join(', ')}.
    
Target nutrition: ${macros.calories} calories, ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fats}g fats.

Provide the recipe in this exact JSON format:
{
  "title": "Recipe name",
  "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity", ...],
  "instructions": ["step 1", "step 2", ...],
  "prepTime": 30,
  "servings": 1
}

Make it authentic Indian cuisine with proper spices and cooking methods.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) throw new Error('Failed to generate recipe with AI');

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const recipeData = JSON.parse(jsonMatch[0]);
            return { ...recipeData, calories: macros.calories, protein: macros.protein, carbs: macros.carbs, fats: macros.fats };
        }
        return null;
    } catch (error) {
        console.error('Error generating recipe with AI:', error);
        return null;
    }
}

// Re-export Recipe type for backward compatibility
export interface Recipe {
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    summary: string;
    instructions: string;
    extendedIngredients: { id: number; name: string; amount: number; unit: string; original: string }[];
    nutrition?: { nutrients: { name: string; amount: number; unit: string }[] };
}
