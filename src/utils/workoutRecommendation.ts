import {
    WorkoutLog,
    WorkoutGoal,
    WorkoutRecommendation,
    MuscleGroupFrequency,
    MuscleGroup,
    Exercise,
    FitnessGoal,
    DifficultyLevel,
} from '@/types/exercise';
import { exerciseDatabase } from '@/data/exerciseDatabase';
import {
    searchExercisesAPI,
    isApiNinjasConfigured,
    toApiNinjasMuscle,
    fromApiDifficulty,
    getCaloriesBurned,
    ApiNinjasExercise,
    ApiNinjasDifficulty,
} from '@/services/apiNinjas';

// Analyze recent workout history to track muscle group frequency
export const analyzeMuscleGroupFrequency = (
    workoutLogs: WorkoutLog[],
    daysToAnalyze: number = 7
): MuscleGroupFrequency[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToAnalyze);

    const recentWorkouts = workoutLogs.filter(
        log => new Date(log.date) >= cutoffDate
    );

    const muscleGroups: MuscleGroup[] = [
        'chest', 'back', 'shoulders', 'biceps', 'triceps',
        'legs', 'glutes', 'core', 'cardio'
    ];

    const frequencies: MuscleGroupFrequency[] = muscleGroups.map(muscleGroup => {
        let frequency = 0;
        let volume = 0;
        let lastTrained = '';

        recentWorkouts.forEach(workout => {
            workout.exercises.forEach(exerciseLog => {
                const isPrimary = exerciseLog.exercise.primaryMuscles.includes(muscleGroup);
                const isSecondary = exerciseLog.exercise.secondaryMuscles.includes(muscleGroup);

                if (isPrimary || isSecondary) {
                    frequency++;
                    volume += exerciseLog.sets.length;

                    if (!lastTrained || new Date(workout.date) > new Date(lastTrained)) {
                        lastTrained = workout.date;
                    }
                }
            });
        });

        // Determine if muscle needs recovery (trained in last 48 hours)
        const hoursSinceLastTrained = lastTrained
            ? (Date.now() - new Date(lastTrained).getTime()) / (1000 * 60 * 60)
            : 999;

        return {
            muscleGroup,
            lastTrained: lastTrained || new Date(0).toISOString(),
            frequency,
            volume,
            needsRecovery: hoursSinceLastTrained < 48 && frequency > 0,
        };
    });

    return frequencies;
};

// Generate AI-powered workout recommendations
export const generateWorkoutRecommendation = (
    workoutLogs: WorkoutLog[],
    goal: WorkoutGoal
): WorkoutRecommendation => {
    const muscleFrequencies = analyzeMuscleGroupFrequency(workoutLogs, 7);

    // Find muscle groups that need training (not recently trained and low frequency)
    const musclesNeedingWork = muscleFrequencies
        .filter(mf => !mf.needsRecovery && mf.frequency < 2)
        .sort((a, b) => a.frequency - b.frequency);

    // Select target muscle groups based on goal
    let targetMuscles: MuscleGroup[] = [];
    let reasoning = '';

    if (goal.fitnessGoal === 'fatLoss' || goal.fitnessGoal === 'endurance') {
        // Prioritize full body and cardio
        const cardioFreq = muscleFrequencies.find(mf => mf.muscleGroup === 'cardio');
        if (cardioFreq && !cardioFreq.needsRecovery) {
            targetMuscles.push('cardio');
            reasoning = 'Cardio workout recommended for fat loss and endurance goals. ';
        }

        // Add one or two muscle groups for circuit training
        if (musclesNeedingWork.length > 0) {
            targetMuscles.push(musclesNeedingWork[0].muscleGroup);
            if (musclesNeedingWork.length > 1) {
                targetMuscles.push(musclesNeedingWork[1].muscleGroup);
            }
            reasoning += 'Combined with strength training for optimal fat loss.';
        }
    } else if (goal.fitnessGoal === 'muscleGain' || goal.fitnessGoal === 'strength') {
        // Focus on specific muscle groups that haven't been trained recently
        if (musclesNeedingWork.length > 0) {
            targetMuscles.push(musclesNeedingWork[0].muscleGroup);
            reasoning = `Focusing on ${musclesNeedingWork[0].muscleGroup} - hasn't been trained recently. `;

            // Add complementary muscle group
            if (musclesNeedingWork.length > 1) {
                const complementary = findComplementaryMuscle(
                    musclesNeedingWork[0].muscleGroup,
                    musclesNeedingWork
                );
                if (complementary) {
                    targetMuscles.push(complementary);
                    reasoning += `Paired with ${complementary} for balanced development.`;
                }
            }
        }
    } else {
        // General fitness - balanced approach
        if (musclesNeedingWork.length > 0) {
            targetMuscles = musclesNeedingWork.slice(0, 2).map(mf => mf.muscleGroup);
            reasoning = 'Balanced workout targeting undertrained muscle groups.';
        }
    }

    // If no muscles need work, suggest active recovery or deload
    if (targetMuscles.length === 0) {
        const totalVolume = muscleFrequencies.reduce((sum, mf) => sum + mf.volume, 0);
        if (totalVolume > 50) {
            reasoning = 'High training volume detected. Deload week recommended - light cardio or yoga.';
            targetMuscles = ['cardio'];
        } else {
            // Find least recently trained
            const leastRecent = muscleFrequencies
                .filter(mf => !mf.needsRecovery)
                .sort((a, b) => new Date(a.lastTrained).getTime() - new Date(b.lastTrained).getTime())[0];

            if (leastRecent) {
                targetMuscles = [leastRecent.muscleGroup];
                reasoning = `${leastRecent.muscleGroup} hasn't been trained in a while.`;
            }
        }
    }

    // Select exercises based on target muscles, equipment, and difficulty
    const recommendedExercises = selectExercises(
        targetMuscles,
        goal.availableEquipment,
        goal.experienceLevel
    );

    // Determine sets and reps based on goal
    const { suggestedSets, suggestedReps } = getSetsAndReps(goal.fitnessGoal, goal.experienceLevel);

    // Estimate duration
    const estimatedDuration = recommendedExercises.length * suggestedSets * 2; // ~2 min per set

    return {
        exercises: recommendedExercises,
        reasoning,
        muscleGroupsFocused: targetMuscles,
        estimatedDuration,
        difficulty: goal.experienceLevel,
        suggestedSets,
        suggestedReps,
    };
};

// Find complementary muscle group for balanced training
const findComplementaryMuscle = (
    primary: MuscleGroup,
    available: MuscleGroupFrequency[]
): MuscleGroup | null => {
    const pairs: Record<MuscleGroup, MuscleGroup[]> = {
        chest: ['triceps', 'shoulders'],
        back: ['biceps'],
        shoulders: ['triceps'],
        biceps: ['triceps'],
        triceps: ['biceps'],
        legs: ['glutes', 'core'],
        glutes: ['legs'],
        core: ['back'],
        cardio: ['core'],
        fullBody: [],
    };

    const complementary = pairs[primary] || [];
    for (const muscle of complementary) {
        const freq = available.find(mf => mf.muscleGroup === muscle);
        if (freq && !freq.needsRecovery) {
            return muscle;
        }
    }

    return null;
};

// Select appropriate exercises
const selectExercises = (
    targetMuscles: MuscleGroup[],
    availableEquipment: string[],
    difficulty: DifficultyLevel
): Exercise[] => {
    const exercises: Exercise[] = [];

    targetMuscles.forEach(muscle => {
        // Find exercises for this muscle group
        const candidates = exerciseDatabase.filter(ex => {
            const matchesMuscle = ex.primaryMuscles.includes(muscle) || ex.secondaryMuscles.includes(muscle);
            const matchesEquipment = ex.equipment.some(eq => availableEquipment.includes(eq) || eq === 'bodyweight' || eq === 'none');
            const matchesDifficulty =
                difficulty === 'beginner' ? ex.difficulty === 'beginner' :
                    difficulty === 'intermediate' ? ex.difficulty !== 'advanced' :
                        true; // Advanced can do all

            return matchesMuscle && matchesEquipment && matchesDifficulty;
        });

        // Select 2-3 exercises per muscle group
        const selected = candidates
            .sort(() => Math.random() - 0.5) // Randomize for variety
            .slice(0, muscle === 'cardio' ? 1 : 3);

        exercises.push(...selected);
    });

    return exercises.slice(0, 8); // Limit to 8 exercises max
};

// Get recommended sets and reps based on goal
const getSetsAndReps = (
    goal: FitnessGoal,
    level: DifficultyLevel
): { suggestedSets: number; suggestedReps: number } => {
    const baseByGoal: Record<FitnessGoal, { sets: number; reps: number }> = {
        fatLoss: { sets: 3, reps: 15 },
        muscleGain: { sets: 4, reps: 10 },
        strength: { sets: 5, reps: 5 },
        endurance: { sets: 3, reps: 20 },
        recomposition: { sets: 4, reps: 12 },
        general: { sets: 3, reps: 12 },
    };

    const base = baseByGoal[goal];

    // Adjust for experience level
    if (level === 'beginner') {
        return { suggestedSets: Math.max(2, base.sets - 1), suggestedReps: base.reps };
    } else if (level === 'advanced') {
        return { suggestedSets: base.sets + 1, suggestedReps: base.reps };
    }

    return { suggestedSets: base.sets, suggestedReps: base.reps };
};

// Detect if progressive overload is needed
export const suggestProgressiveOverload = (
    exerciseHistory: WorkoutLog[],
    exerciseId: string
): { shouldIncrease: boolean; suggestion: string } => {
    const recentLogs = exerciseHistory
        .slice(-4) // Last 4 workouts
        .flatMap(log => log.exercises)
        .filter(ex => ex.exercise.id === exerciseId);

    if (recentLogs.length < 3) {
        return {
            shouldIncrease: false,
            suggestion: 'Keep current weight to establish baseline',
        };
    }

    // Check if weight has been consistent
    const weights = recentLogs.flatMap(log =>
        log.sets.map(set => set.weight || 0)
    );

    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const isConsistent = weights.every(w => Math.abs(w - avgWeight) < avgWeight * 0.1);

    if (isConsistent) {
        return {
            shouldIncrease: true,
            suggestion: `Increase weight by 2.5-5kg. You've been consistent at ${avgWeight.toFixed(1)}kg.`,
        };
    }

    return {
        shouldIncrease: false,
        suggestion: 'Focus on consistent form before increasing weight',
    };
};

// ─────────────────────────────────────────────────
// API-POWERED RECOMMENDATION (uses API Ninjas)
// Falls back to local database if API key is not set
// ─────────────────────────────────────────────────

/** Convert an API Ninjas exercise to our app's Exercise type */
function convertApiExercise(apiEx: ApiNinjasExercise): Exercise {
    const muscleMap: Record<string, MuscleGroup> = {
        abdominals: 'core', abductors: 'legs', adductors: 'legs',
        biceps: 'biceps', calves: 'legs', chest: 'chest',
        forearms: 'biceps', glutes: 'glutes', hamstrings: 'legs',
        lats: 'back', lower_back: 'back', middle_back: 'back',
        neck: 'shoulders', quadriceps: 'legs', traps: 'shoulders',
        triceps: 'triceps',
    };

    const typeMap: Record<string, 'strength' | 'cardio' | 'stretching'> = {
        strength: 'strength', powerlifting: 'strength', strongman: 'strength',
        olympic_weightlifting: 'strength', plyometrics: 'strength',
        cardio: 'cardio', stretching: 'stretching',
    };

    return {
        id: `api-${apiEx.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: apiEx.name,
        type: typeMap[apiEx.type] || 'strength',
        primaryMuscles: [muscleMap[apiEx.muscle] || 'core'],
        secondaryMuscles: [],
        equipment: (apiEx.equipments || ['bodyweight']) as any,
        difficulty: fromApiDifficulty(apiEx.difficulty),
        instructions: apiEx.instructions,
    };
}

/**
 * Generate workout recommendation using API Ninjas exercises.
 * Falls back to the local generateWorkoutRecommendation() if API is not configured.
 */
export const generateWorkoutRecommendationWithAPI = async (
    workoutLogs: WorkoutLog[],
    goal: WorkoutGoal
): Promise<WorkoutRecommendation & { caloriesEstimate?: number; apiPowered: boolean }> => {
    // Fall back to local if API isn't configured
    if (!isApiNinjasConfigured()) {
        const local = generateWorkoutRecommendation(workoutLogs, goal);
        return { ...local, apiPowered: false };
    }

    const muscleFrequencies = analyzeMuscleGroupFrequency(workoutLogs, 7);

    // Determine target muscles (same logic as local)
    const musclesNeedingWork = muscleFrequencies
        .filter(mf => !mf.needsRecovery && mf.frequency < 2)
        .sort((a, b) => a.frequency - b.frequency);

    let targetMuscles: MuscleGroup[] = [];
    let reasoning = '';

    if (goal.fitnessGoal === 'fatLoss' || goal.fitnessGoal === 'endurance') {
        const cardioFreq = muscleFrequencies.find(mf => mf.muscleGroup === 'cardio');
        if (cardioFreq && !cardioFreq.needsRecovery) {
            targetMuscles.push('cardio');
            reasoning = 'Cardio workout recommended for fat loss and endurance goals. ';
        }
        if (musclesNeedingWork.length > 0) {
            targetMuscles.push(musclesNeedingWork[0].muscleGroup);
            if (musclesNeedingWork.length > 1) targetMuscles.push(musclesNeedingWork[1].muscleGroup);
            reasoning += 'Combined with strength training for optimal results.';
        }
    } else if (goal.fitnessGoal === 'muscleGain' || goal.fitnessGoal === 'strength') {
        if (musclesNeedingWork.length > 0) {
            targetMuscles.push(musclesNeedingWork[0].muscleGroup);
            reasoning = `Targeting ${musclesNeedingWork[0].muscleGroup} — hasn't been trained recently. `;
            if (musclesNeedingWork.length > 1) {
                const complementary = findComplementaryMuscle(musclesNeedingWork[0].muscleGroup, musclesNeedingWork);
                if (complementary) {
                    targetMuscles.push(complementary);
                    reasoning += `Paired with ${complementary} for balanced development.`;
                }
            }
        }
    } else {
        if (musclesNeedingWork.length > 0) {
            targetMuscles = musclesNeedingWork.slice(0, 2).map(mf => mf.muscleGroup);
            reasoning = 'Balanced workout targeting undertrained muscle groups.';
        }
    }

    if (targetMuscles.length === 0) {
        const leastRecent = muscleFrequencies
            .filter(mf => !mf.needsRecovery)
            .sort((a, b) => new Date(a.lastTrained).getTime() - new Date(b.lastTrained).getTime())[0];
        if (leastRecent) {
            targetMuscles = [leastRecent.muscleGroup];
            reasoning = `${leastRecent.muscleGroup} hasn't been trained in a while.`;
        }
    }

    // Map difficulty
    const apiDiff: ApiNinjasDifficulty =
        goal.experienceLevel === 'advanced' ? 'expert' : goal.experienceLevel;

    // Fetch exercises from API Ninjas for each target muscle
    const apiExercises: ApiNinjasExercise[] = [];
    for (const muscle of targetMuscles) {
        if (muscle === 'cardio') {
            // Use type=cardio for cardio exercises
            const cardioEx = await searchExercisesAPI({ type: 'cardio', difficulty: apiDiff });
            apiExercises.push(...cardioEx);
        } else {
            const apiMuscle = toApiNinjasMuscle(muscle);
            if (apiMuscle) {
                const muscleEx = await searchExercisesAPI({ muscle: apiMuscle, difficulty: apiDiff });
                apiExercises.push(...muscleEx);
            }
        }
    }

    // Convert to our Exercise type
    let exercises: Exercise[];
    if (apiExercises.length > 0) {
        exercises = apiExercises
            .slice(0, 8) // Limit to 8
            .map(convertApiExercise);
        reasoning = `[API Ninjas] ${reasoning} Found ${apiExercises.length} exercises from the API.`;
    } else {
        // API returned nothing — fall back to local
        exercises = selectExercises(targetMuscles, goal.availableEquipment, goal.experienceLevel);
        reasoning += ' (using local exercise database)';
    }

    const { suggestedSets, suggestedReps } = getSetsAndReps(goal.fitnessGoal, goal.experienceLevel);
    const estimatedDuration = exercises.length * suggestedSets * 2;

    // Estimate calories burned via API
    let caloriesEstimate: number | undefined;
    try {
        const calResults = await getCaloriesBurned('weight training', 160, estimatedDuration);
        if (calResults.length > 0) {
            caloriesEstimate = Math.round(calResults[0].total_calories);
        }
    } catch { /* ignore */ }

    return {
        exercises,
        reasoning,
        muscleGroupsFocused: targetMuscles,
        estimatedDuration,
        difficulty: goal.experienceLevel,
        suggestedSets,
        suggestedReps,
        caloriesEstimate,
        apiPowered: apiExercises.length > 0,
    };
};

