// API Ninjas Service — One key powers Exercises, Nutrition, Calories Burned, and Recipes
// Docs: https://api-ninjas.com/api

const API_NINJAS_KEY = process.env.NEXT_PUBLIC_API_NINJAS_KEY || '';
const BASE_URL = 'https://api.api-ninjas.com';

function isConfigured(): boolean {
    return !!API_NINJAS_KEY && API_NINJAS_KEY !== 'your_api_ninjas_key_here';
}

async function apiFetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'X-Api-Key': API_NINJAS_KEY },
    });
    if (!res.ok) throw new Error(`API Ninjas ${res.status}: ${res.statusText}`);
    return res.json();
}

// ─────────────────────────────────────────────────
// 1. EXERCISES API — /v1/exercises
// ─────────────────────────────────────────────────

export interface ApiNinjasExercise {
    name: string;
    type: string;       // strength, cardio, stretching, etc.
    muscle: string;     // biceps, chest, etc.
    difficulty: string; // beginner, intermediate, expert
    instructions: string;
    equipments?: string[];
    safety_info?: string;
}

/** Muscle group values accepted by the API */
export type ApiNinjasMuscle =
    | 'abdominals' | 'abductors' | 'adductors' | 'biceps'
    | 'calves' | 'chest' | 'forearms' | 'glutes'
    | 'hamstrings' | 'lats' | 'lower_back' | 'middle_back'
    | 'neck' | 'quadriceps' | 'traps' | 'triceps';

export type ApiNinjasType =
    | 'cardio' | 'olympic_weightlifting' | 'plyometrics'
    | 'powerlifting' | 'strength' | 'stretching' | 'strongman';

export type ApiNinjasDifficulty = 'beginner' | 'intermediate' | 'expert';

export interface ExerciseSearchParams {
    name?: string;
    type?: ApiNinjasType;
    muscle?: ApiNinjasMuscle;
    difficulty?: ApiNinjasDifficulty;
}

/**
 * Search exercises from API Ninjas (3000+ exercises).
 * Returns up to 5 results per call.
 */
export async function searchExercisesAPI(params: ExerciseSearchParams): Promise<ApiNinjasExercise[]> {
    if (!isConfigured()) {
        console.log('API Ninjas key not configured — using local exercise database');
        return [];
    }

    const query = new URLSearchParams();
    if (params.name) query.set('name', params.name);
    if (params.type) query.set('type', params.type);
    if (params.muscle) query.set('muscle', params.muscle);
    if (params.difficulty) query.set('difficulty', params.difficulty);

    try {
        return await apiFetch<ApiNinjasExercise[]>(`/v1/exercises?${query.toString()}`);
    } catch (err) {
        console.error('API Ninjas exercises error:', err);
        return [];
    }
}

/**
 * Get exercises for multiple muscle groups (makes parallel requests).
 */
export async function getExercisesForMuscles(
    muscles: ApiNinjasMuscle[],
    difficulty?: ApiNinjasDifficulty
): Promise<ApiNinjasExercise[]> {
    const promises = muscles.map(muscle =>
        searchExercisesAPI({ muscle, difficulty })
    );
    const results = await Promise.all(promises);
    return results.flat();
}

// ─────────────────────────────────────────────────
// 2. CALORIES BURNED API — /v1/caloriesburned
// ─────────────────────────────────────────────────

export interface CaloriesBurnedResult {
    name: string;
    calories_per_hour: number;
    duration_minutes: number;
    total_calories: number;
}

/**
 * Calculate calories burned for an activity.
 * @param activity - Activity name (can be partial, e.g. "running")
 * @param weightLbs - Weight in pounds (default 160)
 * @param durationMin - Duration in minutes (default 60)
 */
export async function getCaloriesBurned(
    activity: string,
    weightLbs: number = 160,
    durationMin: number = 60
): Promise<CaloriesBurnedResult[]> {
    if (!isConfigured()) return [];

    try {
        return await apiFetch<CaloriesBurnedResult[]>(
            `/v1/caloriesburned?activity=${encodeURIComponent(activity)}&weight=${weightLbs}&duration=${durationMin}`
        );
    } catch (err) {
        console.error('API Ninjas calories error:', err);
        return [];
    }
}

// ─────────────────────────────────────────────────
// 3. NUTRITION API — /v1/nutrition
// ─────────────────────────────────────────────────

export interface NutritionResult {
    name: string;
    calories: number;
    serving_size_g: number;
    fat_total_g: number;
    fat_saturated_g: number;
    protein_g: number;
    sodium_mg: number;
    potassium_mg: number;
    cholesterol_mg: number;
    carbohydrates_total_g: number;
    fiber_g: number;
    sugar_g: number;
}

/**
 * Get nutrition info from natural language text.
 * E.g. "200g chicken breast and 1 cup rice"
 */
export async function getNutritionFromText(query: string): Promise<NutritionResult[]> {
    if (!isConfigured()) return [];

    try {
        // Commas must be encoded as %2C per API docs
        const encoded = encodeURIComponent(query).replace(/%2C/gi, '%2C');
        return await apiFetch<NutritionResult[]>(`/v1/nutrition?query=${encoded}`);
    } catch (err) {
        console.error('API Ninjas nutrition error:', err);
        return [];
    }
}

// ─────────────────────────────────────────────────
// 4. RECIPE API — /v3/recipe
// ─────────────────────────────────────────────────

export interface RecipeResult {
    title: string;
    ingredients: string[];
    servings: string;
    instructions: string;
}

/**
 * Search for recipes by title.
 * E.g. "chicken curry", "dal tadka", "protein shake"
 */
export async function searchRecipes(title: string): Promise<RecipeResult[]> {
    if (!isConfigured()) return [];

    try {
        return await apiFetch<RecipeResult[]>(
            `/v3/recipe?title=${encodeURIComponent(title)}`
        );
    } catch (err) {
        console.error('API Ninjas recipe error:', err);
        return [];
    }
}

// ─────────────────────────────────────────────────
// UTILITY: Map API Ninjas muscle names to our app's muscle groups
// ─────────────────────────────────────────────────

import { MuscleGroup } from '@/types/exercise';

/** Convert our app's muscle group to API Ninjas muscle name */
export function toApiNinjasMuscle(appMuscle: MuscleGroup): ApiNinjasMuscle | null {
    const map: Partial<Record<MuscleGroup, ApiNinjasMuscle>> = {
        chest: 'chest',
        back: 'lats',
        shoulders: 'traps',
        biceps: 'biceps',
        triceps: 'triceps',
        legs: 'quadriceps',
        glutes: 'glutes',
        core: 'abdominals',
        // cardio doesn't have a direct mapping — use type=cardio instead
    };
    return map[appMuscle] ?? null;
}

/** Convert API Ninjas difficulty to our app's difficulty */
export function fromApiDifficulty(apiDiff: string): 'beginner' | 'intermediate' | 'advanced' {
    if (apiDiff === 'expert') return 'advanced';
    if (apiDiff === 'intermediate') return 'intermediate';
    return 'beginner';
}

/** Check if API Ninjas is configured */
export { isConfigured as isApiNinjasConfigured };
