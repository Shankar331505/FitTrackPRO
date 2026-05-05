'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Dumbbell, Plus, Sparkles, Search, Zap, Flame } from 'lucide-react';
import { exerciseDatabase, searchExercises } from '@/data/exerciseDatabase';
import { Exercise, WorkoutLog, ExerciseLog, WorkoutSet, WorkoutRecommendation } from '@/types/exercise';
import { generateWorkoutRecommendation, generateWorkoutRecommendationWithAPI } from '@/utils/workoutRecommendation';
import { getExerciseIcon, getMuscleGroupColor } from '@/utils/exerciseIcons';
import { searchExercisesAPI, isApiNinjasConfigured, ApiNinjasExercise } from '@/services/apiNinjas';

export default function ExercisePage() {
    const { userProfile, workoutLogs, addWorkoutLog } = useApp();
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentWorkout, setCurrentWorkout] = useState<ExerciseLog[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [sets, setSets] = useState<WorkoutSet[]>([]);
    const [recommendation, setRecommendation] = useState<(WorkoutRecommendation & { caloriesEstimate?: number; apiPowered: boolean }) | null>(null);
    const [isLoadingRec, setIsLoadingRec] = useState(false);
    const [apiExercises, setApiExercises] = useState<Exercise[]>([]);
    const [isSearchingApi, setIsSearchingApi] = useState(false);

    // Fetch API-powered recommendation on mount
    useEffect(() => {
        if (!userProfile) return;
        setIsLoadingRec(true);
        generateWorkoutRecommendationWithAPI(workoutLogs, userProfile.workoutGoal)
            .then(rec => setRecommendation(rec))
            .catch(() => {
                // Fallback to local
                const local = generateWorkoutRecommendation(workoutLogs, userProfile.workoutGoal);
                setRecommendation({ ...local, apiPowered: false });
            })
            .finally(() => setIsLoadingRec(false));
    }, [userProfile, workoutLogs]);

    // Search exercises from API when query changes
    useEffect(() => {
        if (!isApiNinjasConfigured() || searchQuery.length < 2) {
            setApiExercises([]);
            return;
        }
        setIsSearchingApi(true);
        const timer = setTimeout(async () => {
            const results = await searchExercisesAPI({ name: searchQuery });
            setApiExercises(results.map(apiEx => ({
                id: `api-${apiEx.name.toLowerCase().replace(/\s+/g, '-')}`,
                name: apiEx.name,
                type: apiEx.type.includes('cardio') ? 'cardio' as const : 'strength' as const,
                primaryMuscles: [apiEx.muscle as any],
                secondaryMuscles: [],
                equipment: (apiEx.equipments || ['bodyweight']) as any,
                difficulty: apiEx.difficulty === 'expert' ? 'advanced' as const : apiEx.difficulty as any,
                instructions: apiEx.instructions,
            })));
            setIsSearchingApi(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Merge local and API exercises
    const filteredExercises = useMemo(() => {
        const local = searchQuery ? searchExercises(searchQuery) : exerciseDatabase.slice(0, 20);
        if (apiExercises.length > 0) {
            // Put API results first, then local (deduplicated)
            const apiNames = new Set(apiExercises.map(e => e.name.toLowerCase()));
            const uniqueLocal = local.filter(e => !apiNames.has(e.name.toLowerCase()));
            return [...apiExercises, ...uniqueLocal].slice(0, 20);
        }
        return local;
    }, [searchQuery, apiExercises]);

    const handleAddExercise = () => {
        if (!selectedExercise || sets.length === 0) return;
        const exerciseLog: ExerciseLog = { exercise: selectedExercise, sets: sets.map((set, idx) => ({ ...set, setNumber: idx + 1, completed: true })), notes: '' };
        setCurrentWorkout([...currentWorkout, exerciseLog]);
        setSelectedExercise(null); setSets([]); setShowExerciseModal(false);
    };

    const handleSaveWorkout = () => {
        if (currentWorkout.length === 0) return;
        const workout: WorkoutLog = { id: Date.now().toString(), date: new Date().toISOString(), exercises: currentWorkout, duration: 60, notes: '' };
        addWorkoutLog(workout); setCurrentWorkout([]); alert('Workout saved successfully!');
    };

    const addSet = () => { setSets([...sets, { setNumber: sets.length + 1, reps: 10, weight: 0, completed: false }]); };
    const updateSet = (index: number, field: keyof WorkoutSet, value: any) => { const updated = [...sets]; updated[index] = { ...updated[index], [field]: value }; setSets(updated); };

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 bg-grid">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight mb-1">Exercise Tracking</h1>
                    <p className="text-sm text-surface-400 dark:text-surface-500">Log your workouts and get personalized recommendations</p>
                </div>

                {/* AI Recommendations */}
                {isLoadingRec && (
                    <Card className="mb-8 border-primary-200/60 dark:border-primary-800/30 bg-primary-50/30 dark:bg-primary-950/10">
                        <CardContent>
                            <div className="flex items-center gap-3 py-6 justify-center">
                                <div className="animate-spin w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full" />
                                <p className="text-sm text-surface-500 font-medium">Generating personalized recommendations...</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {recommendation && !isLoadingRec && (
                    <Card className="mb-8 border-primary-200/60 dark:border-primary-800/30 bg-primary-50/30 dark:bg-primary-950/10">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary-100 dark:bg-primary-900/40 rounded-lg"><Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" /></div>
                                <CardTitle className="text-primary-900 dark:text-primary-100">Workout Recommendation</CardTitle>
                                {recommendation.apiPowered && (
                                    <span className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                        <Zap className="w-3 h-3" /> API Ninjas
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-surface-600 dark:text-surface-300 mb-4">{recommendation.reasoning}</p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {recommendation.muscleGroupsFocused.map(muscle => (
                                    <span key={muscle} className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold">
                                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                                    </span>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                {[
                                    { l: 'Exercises', v: recommendation.exercises.length },
                                    { l: 'Sets', v: recommendation.suggestedSets },
                                    { l: 'Reps', v: recommendation.suggestedReps },
                                    { l: 'Duration', v: `${recommendation.estimatedDuration}m` },
                                    ...(recommendation.caloriesEstimate ? [{ l: 'Est. Calories', v: recommendation.caloriesEstimate }] : []),
                                ].map(s => (
                                    <div key={s.l} className="p-3 bg-white dark:bg-surface-800 rounded-xl">
                                        <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold">{s.l}</p>
                                        <p className="text-xl font-extrabold text-surface-900 dark:text-surface-50 tabular-nums">{s.v}</p>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={() => setShowRecommendations(!showRecommendations)} variant="primary" size="sm">
                                {showRecommendations ? 'Hide' : 'View'} Exercises
                            </Button>
                            {showRecommendations && (
                                <div className="mt-4 space-y-2">
                                    {recommendation.exercises.map(exercise => {
                                        const ExIcon = getExerciseIcon(exercise.name);
                                        return (
                                            <div key={exercise.id} className="p-3.5 bg-white dark:bg-surface-800 rounded-xl flex items-start gap-3">
                                                <div className="flex-shrink-0 w-9 h-9 bg-primary-50 dark:bg-primary-950/40 rounded-xl flex items-center justify-center">
                                                    <ExIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50 mb-0.5">{exercise.name}</h4>
                                                    <div className="flex flex-wrap gap-1 mb-1">
                                                        {exercise.primaryMuscles.map(muscle => (
                                                            <span key={muscle} className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${getMuscleGroupColor(muscle)}`}>{muscle}</span>
                                                        ))}
                                                    </div>
                                                    <p className="text-[10px] text-surface-400">{exercise.equipment.join(', ')}</p>
                                                    {exercise.instructions && (
                                                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">{exercise.instructions}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Current Workout */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Today&apos;s Workout</CardTitle>
                            <div className="flex gap-2">
                                <Button onClick={() => setShowExerciseModal(true)} size="sm"><Plus className="w-4 h-4" />Add Exercise</Button>
                                {currentWorkout.length > 0 && <Button onClick={handleSaveWorkout} variant="success" size="sm">Save Workout</Button>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {currentWorkout.length > 0 ? (
                            <div className="space-y-3">
                                {currentWorkout.map((exerciseLog, idx) => {
                                    const ExIcon = getExerciseIcon(exerciseLog.exercise.name);
                                    return (
                                        <div key={idx} className="p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-950/40 rounded-xl flex items-center justify-center">
                                                    <ExIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50">{exerciseLog.exercise.name}</h4>
                                            </div>
                                            <div className="space-y-1.5">
                                                {exerciseLog.sets.map((set, si) => (
                                                    <div key={si} className="flex items-center gap-4 text-xs tabular-nums">
                                                        <span className="text-surface-400 w-14">Set {set.setNumber}</span>
                                                        <span className="text-surface-900 dark:text-surface-50 font-medium">{set.reps} reps</span>
                                                        {set.weight && set.weight > 0 && <span className="text-surface-900 dark:text-surface-50 font-medium">@ {set.weight}kg</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-14 h-14 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Dumbbell className="w-7 h-7 text-surface-300 dark:text-surface-600" />
                                </div>
                                <p className="text-sm text-surface-500 mb-4 font-medium">No exercises added yet</p>
                                <Button onClick={() => setShowExerciseModal(true)} variant="primary" size="sm"><Plus className="w-4 h-4" />Add First Exercise</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Workouts */}
                <Card>
                    <CardHeader><CardTitle>Recent Workouts</CardTitle></CardHeader>
                    <CardContent>
                        {workoutLogs.length > 0 ? (
                            <div className="space-y-2">
                                {workoutLogs.slice(0, 5).map(workout => (
                                    <div key={workout.id} className="p-3.5 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-surface-400 font-medium">{new Date(workout.date).toLocaleDateString()}</span>
                                            <span className="text-xs font-bold text-surface-900 dark:text-surface-50 tabular-nums">{workout.duration} min</span>
                                        </div>
                                        <p className="text-sm font-semibold text-surface-700 dark:text-surface-200">{workout.exercises.length} exercises · {workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} total sets</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center text-sm text-surface-400 py-8">No workouts logged yet</p>}
                    </CardContent>
                </Card>
            </main>

            <Modal isOpen={showExerciseModal} onClose={() => { setShowExerciseModal(false); setSelectedExercise(null); setSets([]); }} title="Add Exercise" size="lg">
                <div className="space-y-4">
                    <div className="relative">
                        <Input placeholder="Search exercises..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="w-4 h-4" />} />
                        {isSearchingApi && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full" />}
                    </div>
                    {isApiNinjasConfigured() && searchQuery.length >= 2 && (
                        <p className="text-[10px] text-surface-400 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Searching API Ninjas + local database</p>
                    )}
                    <div className="max-h-64 overflow-y-auto space-y-1.5">
                        {filteredExercises.map(exercise => {
                            const ExIcon = getExerciseIcon(exercise.name);
                            const isFromApi = exercise.id.startsWith('api-');
                            return (
                                <button key={exercise.id} onClick={() => setSelectedExercise(exercise)}
                                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 ${selectedExercise?.id === exercise.id ? 'bg-primary-50 dark:bg-primary-950/30 border-2 border-primary-500' : 'bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 border-2 border-transparent'}`}>
                                    <div className="flex-shrink-0 w-9 h-9 bg-primary-50 dark:bg-primary-950/40 rounded-xl flex items-center justify-center">
                                        <ExIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50">{exercise.name}</h4>
                                            {isFromApi && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold">API</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-1">
                                            {exercise.primaryMuscles.map(muscle => (
                                                <span key={muscle} className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${getMuscleGroupColor(muscle)}`}>{muscle}</span>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-surface-400">{exercise.equipment.join(', ')}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {selectedExercise && (
                        <div className="pt-4 border-t border-surface-200/60 dark:border-surface-700/50">
                            <h4 className="text-xs font-bold text-surface-600 dark:text-surface-300 mb-3 uppercase tracking-wider">Add Sets</h4>
                            <div className="space-y-2 mb-4">
                                {sets.map((set, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input type="number" placeholder="Reps" value={set.reps || ''} onChange={(e) => updateSet(idx, 'reps', parseInt(e.target.value) || 0)} />
                                        <Input type="number" placeholder="Weight (kg)" value={set.weight || ''} onChange={(e) => updateSet(idx, 'weight', parseFloat(e.target.value) || 0)} />
                                    </div>
                                ))}
                            </div>
                            <Button onClick={addSet} variant="ghost" className="w-full mb-4"><Plus className="w-4 h-4" />Add Set</Button>
                            <Button onClick={handleAddExercise} variant="primary" className="w-full" disabled={sets.length === 0}>Add Exercise to Workout</Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
