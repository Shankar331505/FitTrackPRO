// Spoonacular API service for recipes
const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

export interface Recipe {
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    summary: string;
    instructions: string;
    extendedIngredients: {
        id: number;
        name: string;
        amount: number;
        unit: string;
        original: string;
    }[];
    nutrition?: {
        nutrients: {
            name: string;
            amount: number;
            unit: string;
        }[];
    };
}

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

// Search for recipes by ingredients
export async function searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'your_spoonacular_key_here') {
        console.log('Spoonacular API key not configured, using fallback recipes');
        return [];
    }

    try {
        const ingredientString = ingredients.join(',');
        const response = await fetch(
            `${SPOONACULAR_BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientString)}&number=5&apiKey=${SPOONACULAR_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

// Get recipe details including instructions
export async function getRecipeDetails(recipeId: number): Promise<Recipe | null> {
    if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'your_spoonacular_key_here') {
        return null;
    }

    try {
        const response = await fetch(
            `${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information?includeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch recipe details');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

// Generate a simple recipe from food items (fallback when Spoonacular is not available)
export function generateSimpleRecipe(foodNames: string[], mealType: string): SimpleRecipe {
    const indianRecipes: { [key: string]: SimpleRecipe } = {
        breakfast: {
            title: 'Healthy Indian Breakfast',
            ingredients: foodNames.length > 0 ? foodNames : ['Eggs', 'Whole Wheat Bread', 'Milk', 'Banana'],
            instructions: [
                'Heat a non-stick pan on medium heat',
                'Prepare eggs as per your preference (boiled, scrambled, or omelette)',
                'Toast the bread lightly',
                'Serve with a glass of milk and fresh fruit',
                'Optional: Add a pinch of black pepper and herbs for flavor'
            ],
            prepTime: 15,
            servings: 1,
            calories: 400,
            protein: 25,
            carbs: 45,
            fats: 12
        },
        lunch: {
            title: 'Balanced Indian Lunch',
            ingredients: foodNames.length > 0 ? foodNames : ['Rice', 'Dal', 'Chicken', 'Vegetables', 'Roti'],
            instructions: [
                'Cook rice: Rinse 1 cup basmati rice, add 2 cups water, cook until fluffy',
                'Prepare dal: Boil lentils with turmeric, temper with cumin and garlic',
                'Cook chicken curry: Marinate chicken, sauté with onions, tomatoes, and spices',
                'Make roti: Knead wheat flour dough, roll into circles, cook on tawa',
                'Sauté vegetables with minimal oil and Indian spices',
                'Serve hot with a side of curd or raita'
            ],
            prepTime: 45,
            servings: 1,
            calories: 650,
            protein: 40,
            carbs: 75,
            fats: 18
        },
        dinner: {
            title: 'Light Indian Dinner',
            ingredients: foodNames.length > 0 ? foodNames : ['Roti', 'Paneer', 'Dal', 'Vegetables'],
            instructions: [
                'Prepare dal tadka: Boil moong dal, temper with ghee, cumin, and curry leaves',
                'Make paneer curry: Cut paneer into cubes, cook in tomato-onion gravy',
                'Prepare rotis: Make whole wheat dough, roll and cook on tawa',
                'Sauté seasonal vegetables with light spices',
                'Serve warm with a small bowl of curd',
                'Tip: Keep dinner light and avoid heavy gravies'
            ],
            prepTime: 35,
            servings: 1,
            calories: 550,
            protein: 30,
            carbs: 60,
            fats: 20
        },
        snacks: {
            title: 'Healthy Indian Snacks',
            ingredients: foodNames.length > 0 ? foodNames : ['Almonds', 'Banana', 'Yogurt'],
            instructions: [
                'Take a handful of almonds (about 10-12 pieces)',
                'Soak them in water for 2-3 hours for better digestion',
                'Peel and eat with a fresh banana',
                'Optional: Make a smoothie by blending banana with yogurt',
                'Add a pinch of cinnamon for extra flavor and health benefits'
            ],
            prepTime: 5,
            servings: 1,
            calories: 250,
            protein: 8,
            carbs: 30,
            fats: 12
        }
    };

    const baseRecipe = indianRecipes[mealType] || indianRecipes.lunch;

    return {
        ...baseRecipe,
        ingredients: foodNames.length > 0 ? foodNames : baseRecipe.ingredients,
        title: foodNames.length > 0
            ? `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} with ${foodNames.slice(0, 2).join(' & ')}`
            : baseRecipe.title
    };
}

// Generate recipe using Gemini AI (if available)
export async function generateRecipeWithAI(foodNames: string[], mealType: string, macros: { calories: number; protein: number; carbs: number; fats: number }): Promise<SimpleRecipe | null> {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_key_here') {
        console.log('Gemini API key not configured, using simple recipe generator');
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to generate recipe with AI');
        }

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text || '';

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const recipeData = JSON.parse(jsonMatch[0]);
            return {
                ...recipeData,
                calories: macros.calories,
                protein: macros.protein,
                carbs: macros.carbs,
                fats: macros.fats
            };
        }

        return null;
    } catch (error) {
        console.error('Error generating recipe with AI:', error);
        return null;
    }
}
