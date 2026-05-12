// ExerciseDB Service — RapidAPI (replaces API Ninjas)
// Docs: https://edb-docs.up.railway.app/
// API: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb

import { MuscleGroup } from '@/types/exercise';

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_EXERCISEDB_KEY || '';
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

// ─────────────────────────────────────────────────
// Configuration check
// ─────────────────────────────────────────────────

function isConfigured(): boolean {
    return !!RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here';
}

export { isConfigured as isExerciseDBConfigured };

// ─────────────────────────────────────────────────
// Generic fetch helper
// ─────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
    });
    if (!res.ok) throw new Error(`ExerciseDB ${res.status}: ${res.statusText}`);
    return res.json();
}

// ─────────────────────────────────────────────────
// Types — ExerciseDB response schema
// ─────────────────────────────────────────────────

export interface ExerciseDBExercise {
    id: string;
    name: string;
    bodyPart: string;       // e.g. "chest", "upper arms", "back"
    target: string;         // e.g. "pectorals", "biceps", "lats"
    equipment: string;      // e.g. "barbell", "dumbbell", "body weight"
    secondaryMuscles: string[];
    instructions: string[];
    description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    category?: string;      // "strength", "cardio", "stretching", etc.
}

/** Body parts accepted by ExerciseDB /exercises/bodyPart/{bodyPart} */
export type ExerciseDBBodyPart =
    | 'back' | 'cardio' | 'chest' | 'lower arms'
    | 'lower legs' | 'neck' | 'shoulders'
    | 'upper arms' | 'upper legs' | 'waist';

// ─────────────────────────────────────────────────
// 1. SEARCH BY NAME — /exercises/name/{name}
// ─────────────────────────────────────────────────

/**
 * Search exercises by name (partial match).
 * Returns up to 10 results (free tier limit).
 */
export async function searchExercisesByName(name: string): Promise<ExerciseDBExercise[]> {
    if (!isConfigured()) {
        console.log('ExerciseDB key not configured — using local exercise database');
        return [];
    }

    try {
        return await apiFetch<ExerciseDBExercise[]>(
            `/exercises/name/${encodeURIComponent(name.toLowerCase())}?limit=10`
        );
    } catch (err) {
        console.error('ExerciseDB name search error:', err);
        return [];
    }
}

// ─────────────────────────────────────────────────
// 2. SEARCH BY BODY PART — /exercises/bodyPart/{bodyPart}
// ─────────────────────────────────────────────────

/**
 * Get exercises for a specific body part.
 * Returns up to 10 results (free tier limit).
 */
export async function getExercisesByBodyPart(bodyPart: ExerciseDBBodyPart): Promise<ExerciseDBExercise[]> {
    if (!isConfigured()) return [];

    try {
        return await apiFetch<ExerciseDBExercise[]>(
            `/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=10`
        );
    } catch (err) {
        console.error('ExerciseDB bodyPart error:', err);
        return [];
    }
}

// ─────────────────────────────────────────────────
// 3. SEARCH BY TARGET MUSCLE — /exercises/target/{target}
// ─────────────────────────────────────────────────

/**
 * Get exercises targeting a specific muscle.
 * Returns up to 10 results (free tier limit).
 */
export async function getExercisesByTarget(target: string): Promise<ExerciseDBExercise[]> {
    if (!isConfigured()) return [];

    try {
        return await apiFetch<ExerciseDBExercise[]>(
            `/exercises/target/${encodeURIComponent(target)}?limit=10`
        );
    } catch (err) {
        console.error('ExerciseDB target error:', err);
        return [];
    }
}

// ─────────────────────────────────────────────────
// MAPPING UTILITIES
// ─────────────────────────────────────────────────

/** Map our app's MuscleGroup to ExerciseDB bodyPart */
export function toExerciseDBBodyPart(appMuscle: MuscleGroup): ExerciseDBBodyPart | null {
    const map: Partial<Record<MuscleGroup, ExerciseDBBodyPart>> = {
        chest: 'chest',
        back: 'back',
        shoulders: 'shoulders',
        biceps: 'upper arms',
        triceps: 'upper arms',
        legs: 'upper legs',
        glutes: 'upper legs',
        core: 'waist',
        // cardio uses the 'cardio' bodyPart
        cardio: 'cardio',
    };
    return map[appMuscle] ?? null;
}

/** Map ExerciseDB bodyPart to our app's MuscleGroup */
export function fromExerciseDBBodyPart(bodyPart: string): MuscleGroup {
    const map: Record<string, MuscleGroup> = {
        'chest': 'chest',
        'back': 'back',
        'shoulders': 'shoulders',
        'upper arms': 'biceps',
        'lower arms': 'biceps',
        'upper legs': 'legs',
        'lower legs': 'legs',
        'waist': 'core',
        'neck': 'shoulders',
        'cardio': 'cardio',
    };
    return map[bodyPart] || 'core';
}

/** Map ExerciseDB difficulty to our app's difficulty (they match directly) */
export function fromExerciseDBDifficulty(diff?: string): 'beginner' | 'intermediate' | 'advanced' {
    if (diff === 'advanced') return 'advanced';
    if (diff === 'intermediate') return 'intermediate';
    return 'beginner';
}

/** Map ExerciseDB category to our app's ExerciseType */
function mapCategory(category?: string): 'strength' | 'cardio' | 'stretching' {
    if (!category) return 'strength';
    if (category === 'cardio') return 'cardio';
    if (category === 'stretching' || category === 'mobility') return 'stretching';
    return 'strength';
}

/** Map ExerciseDB equipment string to our app's Equipment type */
function mapEquipment(eq: string): string {
    const map: Record<string, string> = {
        'barbell': 'barbell',
        'dumbbell': 'dumbbell',
        'cable': 'cables',
        'body weight': 'bodyweight',
        'band': 'bands',
        'kettlebell': 'kettlebell',
        'leverage machine': 'machine',
        'smith machine': 'machine',
        'assisted': 'machine',
    };
    return map[eq] || eq;
}

/** Estimate calories burned (since ExerciseDB doesn't have a calories endpoint) */
export function estimateCaloriesBurned(durationMin: number, intensity: 'light' | 'moderate' | 'vigorous' = 'moderate'): number {
    // MET-based estimation: Calories = MET × weight(kg) × duration(hours)
    // Using 70kg as default weight
    const metValues = { light: 3.5, moderate: 5.0, vigorous: 8.0 };
    const met = metValues[intensity];
    return Math.round(met * 70 * (durationMin / 60));
}
