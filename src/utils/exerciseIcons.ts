// Exercise icon and category mappings
import {
    Dumbbell, Activity, Heart, Zap, Target, TrendingUp,
    Bike, PersonStanding, Waves, Wind, Flame, Mountain
} from 'lucide-react';

export const exerciseIcons = {
    // Strength exercises
    'Barbell Bench Press': Dumbbell,
    'Dumbbell Bench Press': Dumbbell,
    'Incline Bench Press': Dumbbell,
    'Barbell Squat': Dumbbell,
    'Leg Press': Dumbbell,
    'Deadlift': Dumbbell,
    'Romanian Deadlift': Dumbbell,
    'Barbell Row': Dumbbell,
    'Lat Pulldown': Dumbbell,
    'Pull-ups': Target,
    'Chin-ups': Target,
    'Overhead Press': Dumbbell,
    'Dumbbell Shoulder Press': Dumbbell,
    'Lateral Raises': Dumbbell,
    'Bicep Curls': Dumbbell,
    'Tricep Dips': Target,
    'Tricep Pushdowns': Dumbbell,
    'Leg Curls': Dumbbell,
    'Leg Extensions': Dumbbell,
    'Calf Raises': TrendingUp,
    'Lunges': PersonStanding,
    'Bulgarian Split Squats': PersonStanding,
    'Face Pulls': Dumbbell,
    'Cable Flyes': Dumbbell,

    // Cardio exercises
    'Running': Activity,
    'Cycling': Bike,
    'Swimming': Waves,
    'Jump Rope': Activity,
    'Burpees': Flame,
    'Mountain Climbers': Mountain,
    'High Knees': Activity,
    'Jumping Jacks': Activity,
    'Box Jumps': TrendingUp,
    'Battle Ropes': Waves,

    // Core exercises
    'Plank': Target,
    'Crunches': Target,
    'Russian Twists': Zap,
    'Leg Raises': TrendingUp,
    'Bicycle Crunches': Bike,
    'Ab Wheel Rollouts': Target,
    'Hanging Leg Raises': TrendingUp,
};

export const muscleGroupColors = {
    chest: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    back: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    legs: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    shoulders: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    arms: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    core: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    cardio: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    fullBody: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export const exerciseCategories = {
    strength: { name: 'Strength', icon: Dumbbell, color: 'primary' },
    cardio: { name: 'Cardio', icon: Heart, color: 'pink' },
    flexibility: { name: 'Flexibility', icon: Wind, color: 'purple' },
    core: { name: 'Core', icon: Target, color: 'orange' },
};

export function getExerciseIcon(exerciseName: string) {
    return exerciseIcons[exerciseName as keyof typeof exerciseIcons] || Dumbbell;
}

export function getMuscleGroupColor(muscleGroup: string) {
    const normalized = muscleGroup.toLowerCase().replace(/\s+/g, '');
    return muscleGroupColors[normalized as keyof typeof muscleGroupColors] ||
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}
