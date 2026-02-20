'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Dumbbell, Plus, Sparkles, TrendingUp, Search, Filter } from 'lucide-react';
import { exerciseDatabase, searchExercises } from '@/data/exerciseDatabase';
import { Exercise, WorkoutLog, ExerciseLog, WorkoutSet } from '@/types/exercise';
import { generateWorkoutRecommendation } from '@/utils/workoutRecommendation';
import { getExerciseIcon, getMuscleGroupColor } from '@/utils/exerciseIcons';

export default function ExercisePage() {
    const { userProfile, workoutLogs, addWorkoutLog } = useApp();
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [currentWorkout, setCurrentWorkout] = useState<ExerciseLog[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [sets, setSets] = useState<WorkoutSet[]>([]);

    const filteredExercises = searchQuery ? searchExercises(searchQuery) : exerciseDatabase.slice(0, 20);

    // Generate AI recommendations
    const recommendation = userProfile ? generateWorkoutRecommendation(
        workoutLogs,
        userProfile.workoutGoal
    ) : null;

    const handleAddExercise = () => {
        if (!selectedExercise || sets.length === 0) return;

        const exerciseLog: ExerciseLog = {
            exercise: selectedExercise,
            sets: sets.map((set, idx) => ({ ...set, setNumber: idx + 1, completed: true })),
            notes: '',
        };

        setCurrentWorkout([...currentWorkout, exerciseLog]);
        setSelectedExercise(null);
        setSets([]);
        setShowExerciseModal(false);
    };

    const handleSaveWorkout = () => {
        if (currentWorkout.length === 0) return;

        const workout: WorkoutLog = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            exercises: currentWorkout,
            duration: 60, // Default duration
            notes: '',
        };

        addWorkoutLog(workout);
        setCurrentWorkout([]);
        alert('Workout saved successfully!');
    };

    const addSet = () => {
        setSets([...sets, {
            setNumber: sets.length + 1,
            reps: 10,
            weight: 0,
            completed: false,
        }]);
    };

    const updateSet = (index: number, field: keyof WorkoutSet, value: any) => {
        const updated = [...sets];
        updated[index] = { ...updated[index], [field]: value };
        setSets(updated);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Exercise Tracking
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Log your workouts and get AI-powered recommendations
                    </p>
                </div>

                {/* AI Recommendations */}
                {recommendation && (
                    <Card className="mb-8 border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950 dark:to-purple-950">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-primary-600" />
                                <CardTitle className="text-primary-900 dark:text-primary-100">
                                    AI Workout Recommendation
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {recommendation.reasoning}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {recommendation.muscleGroupsFocused.map(muscle => (
                                    <span key={muscle} className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Exercises</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {recommendation.exercises.length}
                                    </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Sets</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {recommendation.suggestedSets}
                                    </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Reps</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {recommendation.suggestedReps}
                                    </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {recommendation.estimatedDuration}m
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowRecommendations(!showRecommendations)}
                                variant="primary"
                            >
                                {showRecommendations ? 'Hide' : 'View'} Recommended Exercises
                            </Button>

                            {showRecommendations && (
                                <div className="mt-4 space-y-2">
                                    {recommendation.exercises.map(exercise => {
                                        const ExerciseIcon = getExerciseIcon(exercise.name);
                                        return (
                                            <div key={exercise.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg flex items-start gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                                                    <ExerciseIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                        {exercise.name}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1 mb-1">
                                                        {exercise.primaryMuscles.map(muscle => (
                                                            <span key={muscle} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMuscleGroupColor(muscle)}`}>
                                                                {muscle}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        {exercise.equipment.join(', ')}
                                                    </p>
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
                            <CardTitle>Today's Workout</CardTitle>
                            <div className="flex gap-2">
                                <Button onClick={() => setShowExerciseModal(true)} size="sm">
                                    <Plus className="w-4 h-4" />
                                    Add Exercise
                                </Button>
                                {currentWorkout.length > 0 && (
                                    <Button onClick={handleSaveWorkout} variant="success" size="sm">
                                        Save Workout
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {currentWorkout.length > 0 ? (
                            <div className="space-y-4">
                                {currentWorkout.map((exerciseLog, idx) => {
                                    const ExerciseIcon = getExerciseIcon(exerciseLog.exercise.name);
                                    return (
                                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                                                    <ExerciseIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {exerciseLog.exercise.name}
                                                </h4>
                                            </div>
                                            <div className="space-y-2">
                                                {exerciseLog.sets.map((set, setIdx) => (
                                                    <div key={setIdx} className="flex items-center gap-4 text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400 w-16">
                                                            Set {set.setNumber}
                                                        </span>
                                                        <span className="text-gray-900 dark:text-white">
                                                            {set.reps} reps
                                                        </span>
                                                        {set.weight && set.weight > 0 && (
                                                            <span className="text-gray-900 dark:text-white">
                                                                @ {set.weight}kg
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Dumbbell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    No exercises added yet
                                </p>
                                <Button onClick={() => setShowExerciseModal(true)} variant="primary">
                                    <Plus className="w-5 h-5" />
                                    Add First Exercise
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Workouts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Workouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workoutLogs.length > 0 ? (
                            <div className="space-y-3">
                                {workoutLogs.slice(0, 5).map(workout => (
                                    <div key={workout.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(workout.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {workout.duration} minutes
                                            </span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {workout.exercises.length} exercises • {workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} total sets
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                                No workouts logged yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Exercise Modal */}
            <Modal
                isOpen={showExerciseModal}
                onClose={() => {
                    setShowExerciseModal(false);
                    setSelectedExercise(null);
                    setSets([]);
                }}
                title="Add Exercise"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="w-5 h-5" />}
                    />

                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredExercises.map(exercise => {
                            const ExerciseIcon = getExerciseIcon(exercise.name);
                            return (
                                <button
                                    key={exercise.id}
                                    onClick={() => setSelectedExercise(exercise)}
                                    className={`
                      w-full text-left p-4 rounded-lg transition-all flex items-start gap-3
                      ${selectedExercise?.id === exercise.id
                                            ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500'
                                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                                        }
                    `}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                                        <ExerciseIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {exercise.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-1 mb-1">
                                            {exercise.primaryMuscles.map(muscle => (
                                                <span key={muscle} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMuscleGroupColor(muscle)}`}>
                                                    {muscle}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            {exercise.equipment.join(', ')}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedExercise && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Add Sets
                            </h4>

                            <div className="space-y-2 mb-4">
                                {sets.map((set, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Reps"
                                            value={set.reps || ''}
                                            onChange={(e) => updateSet(idx, 'reps', parseInt(e.target.value) || 0)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Weight (kg)"
                                            value={set.weight || ''}
                                            onChange={(e) => updateSet(idx, 'weight', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <Button onClick={addSet} variant="ghost" className="w-full mb-4">
                                <Plus className="w-4 h-4" />
                                Add Set
                            </Button>

                            <Button
                                onClick={handleAddExercise}
                                variant="primary"
                                className="w-full"
                                disabled={sets.length === 0}
                            >
                                Add Exercise to Workout
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
