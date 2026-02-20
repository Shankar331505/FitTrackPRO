// Exercise Types
export type MuscleGroup =
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'biceps'
    | 'triceps'
    | 'legs'
    | 'glutes'
    | 'core'
    | 'cardio'
    | 'fullBody';

export type ExerciseType =
    | 'strength'
    | 'cardio'
    | 'hiit'
    | 'yoga'
    | 'sports'
    | 'stretching';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type Equipment =
    | 'barbell'
    | 'dumbbell'
    | 'machine'
    | 'bodyweight'
    | 'cables'
    | 'bands'
    | 'kettlebell'
    | 'none';

export interface Exercise {
    id: string;
    name: string;
    type: ExerciseType;
    primaryMuscles: MuscleGroup[];
    secondaryMuscles: MuscleGroup[];
    equipment: Equipment[];
    difficulty: DifficultyLevel;
    instructions?: string;
    videoUrl?: string;
}

export interface WorkoutSet {
    setNumber: number;
    reps?: number;
    weight?: number; // kg
    duration?: number; // seconds
    distance?: number; // meters
    restTime?: number; // seconds
    completed: boolean;
}

export interface ExerciseLog {
    exercise: Exercise;
    sets: WorkoutSet[];
    notes?: string;
    personalRecord?: boolean;
}

export interface WorkoutLog {
    id: string;
    date: string; // ISO date string
    exercises: ExerciseLog[];
    duration: number; // minutes
    caloriesBurned?: number;
    notes?: string;
    rating?: number; // 1-5
}

export type FitnessGoal =
    | 'fatLoss'
    | 'muscleGain'
    | 'recomposition'
    | 'endurance'
    | 'strength'
    | 'general';

export interface WorkoutGoal {
    fitnessGoal: FitnessGoal;
    experienceLevel: DifficultyLevel;
    workoutsPerWeek: number;
    preferredDuration: number; // minutes
    availableEquipment: Equipment[];
    targetMuscles?: MuscleGroup[];
}

export interface WorkoutRecommendation {
    exercises: Exercise[];
    reasoning: string;
    muscleGroupsFocused: MuscleGroup[];
    estimatedDuration: number;
    difficulty: DifficultyLevel;
    suggestedSets: number;
    suggestedReps: number;
}

export interface MuscleGroupFrequency {
    muscleGroup: MuscleGroup;
    lastTrained: string; // ISO date
    frequency: number; // times in last 7 days
    volume: number; // total sets
    needsRecovery: boolean;
}
