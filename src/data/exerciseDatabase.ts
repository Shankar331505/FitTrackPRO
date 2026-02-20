import { Exercise } from '@/types/exercise';

// Comprehensive exercise database with muscle groups, equipment, and difficulty levels
export const exerciseDatabase: Exercise[] = [
    // CHEST EXERCISES
    {
        id: 'bench-press',
        name: 'Barbell Bench Press',
        type: 'strength',
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps', 'shoulders'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: 'Lie on bench, lower bar to chest, press up explosively',
    },
    {
        id: 'push-ups',
        name: 'Push-ups',
        type: 'strength',
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps', 'shoulders', 'core'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: 'Start in plank, lower body, push back up',
    },
    {
        id: 'dumbbell-fly',
        name: 'Dumbbell Fly',
        type: 'strength',
        primaryMuscles: ['chest'],
        secondaryMuscles: ['shoulders'],
        equipment: ['dumbbell'],
        difficulty: 'intermediate',
        instructions: 'Lie on bench, arc dumbbells out and back together',
    },
    {
        id: 'cable-crossover',
        name: 'Cable Crossover',
        type: 'strength',
        primaryMuscles: ['chest'],
        secondaryMuscles: ['shoulders'],
        equipment: ['cables'],
        difficulty: 'intermediate',
        instructions: 'Pull cables across body in arc motion',
    },

    // BACK EXERCISES
    {
        id: 'deadlift',
        name: 'Deadlift',
        type: 'strength',
        primaryMuscles: ['back'],
        secondaryMuscles: ['legs', 'core'],
        equipment: ['barbell'],
        difficulty: 'advanced',
        instructions: 'Lift bar from ground to standing position with straight back',
    },
    {
        id: 'pull-ups',
        name: 'Pull-ups',
        type: 'strength',
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps'],
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        instructions: 'Hang from bar, pull body up until chin over bar',
    },
    {
        id: 'bent-over-row',
        name: 'Bent Over Barbell Row',
        type: 'strength',
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: 'Bend at hips, pull bar to lower chest',
    },
    {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        type: 'strength',
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps'],
        equipment: ['machine'],
        difficulty: 'beginner',
        instructions: 'Pull bar down to upper chest while seated',
    },
    {
        id: 'dumbbell-row',
        name: 'Single Arm Dumbbell Row',
        type: 'strength',
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps'],
        equipment: ['dumbbell'],
        difficulty: 'beginner',
        instructions: 'Support on bench, pull dumbbell to hip',
    },

    // SHOULDER EXERCISES
    {
        id: 'overhead-press',
        name: 'Overhead Press',
        type: 'strength',
        primaryMuscles: ['shoulders'],
        secondaryMuscles: ['triceps', 'core'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: 'Press bar overhead from shoulders',
    },
    {
        id: 'lateral-raise',
        name: 'Lateral Raise',
        type: 'strength',
        primaryMuscles: ['shoulders'],
        secondaryMuscles: [],
        equipment: ['dumbbell'],
        difficulty: 'beginner',
        instructions: 'Raise dumbbells out to sides to shoulder height',
    },
    {
        id: 'front-raise',
        name: 'Front Raise',
        type: 'strength',
        primaryMuscles: ['shoulders'],
        secondaryMuscles: [],
        equipment: ['dumbbell'],
        difficulty: 'beginner',
        instructions: 'Raise dumbbells forward to shoulder height',
    },
    {
        id: 'face-pull',
        name: 'Face Pull',
        type: 'strength',
        primaryMuscles: ['shoulders'],
        secondaryMuscles: ['back'],
        equipment: ['cables'],
        difficulty: 'beginner',
        instructions: 'Pull rope attachment to face level',
    },

    // ARM EXERCISES
    {
        id: 'barbell-curl',
        name: 'Barbell Curl',
        type: 'strength',
        primaryMuscles: ['biceps'],
        secondaryMuscles: [],
        equipment: ['barbell'],
        difficulty: 'beginner',
        instructions: 'Curl bar up to shoulders, lower with control',
    },
    {
        id: 'hammer-curl',
        name: 'Hammer Curl',
        type: 'strength',
        primaryMuscles: ['biceps'],
        secondaryMuscles: [],
        equipment: ['dumbbell'],
        difficulty: 'beginner',
        instructions: 'Curl dumbbells with neutral grip',
    },
    {
        id: 'tricep-dips',
        name: 'Tricep Dips',
        type: 'strength',
        primaryMuscles: ['triceps'],
        secondaryMuscles: ['chest', 'shoulders'],
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        instructions: 'Lower body between parallel bars, push back up',
    },
    {
        id: 'tricep-pushdown',
        name: 'Tricep Pushdown',
        type: 'strength',
        primaryMuscles: ['triceps'],
        secondaryMuscles: [],
        equipment: ['cables'],
        difficulty: 'beginner',
        instructions: 'Push cable attachment down, extend arms fully',
    },
    {
        id: 'skull-crusher',
        name: 'Skull Crushers',
        type: 'strength',
        primaryMuscles: ['triceps'],
        secondaryMuscles: [],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: 'Lower bar to forehead, extend arms',
    },

    // LEG EXERCISES
    {
        id: 'squat',
        name: 'Barbell Squat',
        type: 'strength',
        primaryMuscles: ['legs'],
        secondaryMuscles: ['glutes', 'core'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: 'Lower hips below parallel, drive back up',
    },
    {
        id: 'leg-press',
        name: 'Leg Press',
        type: 'strength',
        primaryMuscles: ['legs'],
        secondaryMuscles: ['glutes'],
        equipment: ['machine'],
        difficulty: 'beginner',
        instructions: 'Push platform away with legs',
    },
    {
        id: 'lunges',
        name: 'Walking Lunges',
        type: 'strength',
        primaryMuscles: ['legs'],
        secondaryMuscles: ['glutes'],
        equipment: ['bodyweight', 'dumbbell'],
        difficulty: 'beginner',
        instructions: 'Step forward, lower back knee, alternate legs',
    },
    {
        id: 'leg-curl',
        name: 'Leg Curl',
        type: 'strength',
        primaryMuscles: ['legs'],
        secondaryMuscles: [],
        equipment: ['machine'],
        difficulty: 'beginner',
        instructions: 'Curl legs up toward glutes',
    },
    {
        id: 'leg-extension',
        name: 'Leg Extension',
        type: 'strength',
        primaryMuscles: ['legs'],
        secondaryMuscles: [],
        equipment: ['machine'],
        difficulty: 'beginner',
        instructions: 'Extend legs to straight position',
    },
    {
        id: 'calf-raise',
        name: 'Calf Raise',
        type: 'strength',
        primaryMuscles: ['legs'],
        secondaryMuscles: [],
        equipment: ['bodyweight', 'machine'],
        difficulty: 'beginner',
        instructions: 'Raise up on toes, lower with control',
    },

    // GLUTE EXERCISES
    {
        id: 'hip-thrust',
        name: 'Hip Thrust',
        type: 'strength',
        primaryMuscles: ['glutes'],
        secondaryMuscles: ['legs'],
        equipment: ['barbell'],
        difficulty: 'intermediate',
        instructions: 'Thrust hips up with upper back on bench',
    },
    {
        id: 'glute-bridge',
        name: 'Glute Bridge',
        type: 'strength',
        primaryMuscles: ['glutes'],
        secondaryMuscles: ['legs'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: 'Lie on back, lift hips toward ceiling',
    },
    {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift',
        type: 'strength',
        primaryMuscles: ['glutes'],
        secondaryMuscles: ['back', 'legs'],
        equipment: ['barbell', 'dumbbell'],
        difficulty: 'intermediate',
        instructions: 'Hinge at hips, lower weight with straight legs',
    },

    // CORE EXERCISES
    {
        id: 'plank',
        name: 'Plank',
        type: 'strength',
        primaryMuscles: ['core'],
        secondaryMuscles: [],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: 'Hold push-up position on forearms',
    },
    {
        id: 'crunches',
        name: 'Crunches',
        type: 'strength',
        primaryMuscles: ['core'],
        secondaryMuscles: [],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: 'Lift shoulders off ground, contract abs',
    },
    {
        id: 'russian-twist',
        name: 'Russian Twist',
        type: 'strength',
        primaryMuscles: ['core'],
        secondaryMuscles: [],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: 'Sit with feet up, rotate torso side to side',
    },
    {
        id: 'leg-raises',
        name: 'Hanging Leg Raises',
        type: 'strength',
        primaryMuscles: ['core'],
        secondaryMuscles: [],
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        instructions: 'Hang from bar, raise legs to 90 degrees',
    },
    {
        id: 'ab-wheel',
        name: 'Ab Wheel Rollout',
        type: 'strength',
        primaryMuscles: ['core'],
        secondaryMuscles: [],
        equipment: ['bodyweight'],
        difficulty: 'advanced',
        instructions: 'Roll wheel forward, return to start',
    },

    // CARDIO EXERCISES
    {
        id: 'running',
        name: 'Running',
        type: 'cardio',
        primaryMuscles: ['cardio'],
        secondaryMuscles: ['legs'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: 'Maintain steady pace for duration',
    },
    {
        id: 'cycling',
        name: 'Cycling',
        type: 'cardio',
        primaryMuscles: ['cardio'],
        secondaryMuscles: ['legs'],
        equipment: ['machine'],
        difficulty: 'beginner',
        instructions: 'Pedal at consistent pace',
    },
    {
        id: 'rowing',
        name: 'Rowing Machine',
        type: 'cardio',
        primaryMuscles: ['cardio'],
        secondaryMuscles: ['back', 'legs'],
        equipment: ['machine'],
        difficulty: 'beginner',
        instructions: 'Pull handle to chest, extend legs',
    },
    {
        id: 'jump-rope',
        name: 'Jump Rope',
        type: 'cardio',
        primaryMuscles: ['cardio'],
        secondaryMuscles: ['legs'],
        equipment: ['none'],
        difficulty: 'beginner',
        instructions: 'Jump continuously over rope',
    },
    {
        id: 'burpees',
        name: 'Burpees',
        type: 'hiit',
        primaryMuscles: ['fullBody'],
        secondaryMuscles: ['cardio'],
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        instructions: 'Drop to push-up, jump feet in, jump up',
    },
    {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        type: 'hiit',
        primaryMuscles: ['core'],
        secondaryMuscles: ['cardio'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: 'In plank, alternate bringing knees to chest',
    },

    // FULL BODY
    {
        id: 'kettlebell-swing',
        name: 'Kettlebell Swing',
        type: 'strength',
        primaryMuscles: ['fullBody'],
        secondaryMuscles: ['glutes', 'back'],
        equipment: ['kettlebell'],
        difficulty: 'intermediate',
        instructions: 'Swing kettlebell between legs and up to shoulder height',
    },
    {
        id: 'clean-and-press',
        name: 'Clean and Press',
        type: 'strength',
        primaryMuscles: ['fullBody'],
        secondaryMuscles: ['shoulders', 'legs'],
        equipment: ['barbell'],
        difficulty: 'advanced',
        instructions: 'Clean bar to shoulders, press overhead',
    },
];

// Helper functions
export const searchExercises = (query: string): Exercise[] => {
    const lowerQuery = query.toLowerCase();
    return exerciseDatabase.filter(exercise =>
        exercise.name.toLowerCase().includes(lowerQuery) ||
        exercise.primaryMuscles.some(m => m.toLowerCase().includes(lowerQuery)) ||
        exercise.type.toLowerCase().includes(lowerQuery)
    );
};

export const getExercisesByMuscleGroup = (muscleGroup: string): Exercise[] => {
    return exerciseDatabase.filter(exercise =>
        exercise.primaryMuscles.includes(muscleGroup as any) ||
        exercise.secondaryMuscles.includes(muscleGroup as any)
    );
};

export const getExercisesByType = (type: string): Exercise[] => {
    return exerciseDatabase.filter(exercise => exercise.type === type);
};

export const getExercisesByEquipment = (equipment: string): Exercise[] => {
    return exerciseDatabase.filter(exercise =>
        exercise.equipment.includes(equipment as any)
    );
};
