import { NutritionGoals } from './nutrition';
import { WorkoutGoal } from './exercise';

export interface BodyMetrics {
    date: string; // ISO date string
    weight: number; // kg
    bodyFat?: number; // percentage
    waist?: number; // cm
    chest?: number; // cm
    arms?: number; // cm
    thighs?: number; // cm
    hips?: number; // cm
}

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    height?: number; // cm
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
    nutritionGoals: NutritionGoals;
    workoutGoal: WorkoutGoal;
    bodyMetrics: BodyMetrics[];
    createdAt: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    darkMode: boolean;
    notifications: {
        mealReminders: boolean;
        workoutReminders: boolean;
        hydrationReminders: boolean;
    };
    units: {
        weight: 'kg' | 'lbs';
        distance: 'km' | 'miles';
        height: 'cm' | 'ft';
    };
}

export interface WeightGoal {
    targetWeight: number; // kg
    targetDate?: string;
    weeklyChange: number; // kg per week
    currentWeight: number;
}

export interface ProgressPhoto {
    id: string;
    date: string;
    url: string;
    notes?: string;
}
