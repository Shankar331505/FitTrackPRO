'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Flame, Drumstick, Wheat, Droplet, Dumbbell, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { calculateDailyTotals } from '@/utils/nutritionCalculator';
import { analyzeMicronutrients } from '@/utils/micronutrientAnalyzer';

export default function HomePage() {
    const { userProfile, getTodayLog, workoutLogs, darkMode } = useApp();

    const todayLog = getTodayLog();
    const todayTotals = todayLog ? calculateDailyTotals(todayLog.meals) : null;
    const goals = userProfile?.nutritionGoals;

    // Get recent workout
    const recentWorkout = workoutLogs.length > 0 ? workoutLogs[0] : null;

    // Analyze micronutrients
    const deficiencies = todayTotals ? analyzeMicronutrients(todayTotals) : [];
    const criticalDeficiencies = deficiencies.filter(d => d.severity === 'high').slice(0, 2);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome back, {userProfile?.name || 'User'}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium mb-1">Calories Today</p>
                                    <p className="text-3xl font-bold">
                                        {todayTotals ? Math.round(todayTotals.calories) : 0}
                                    </p>
                                    <p className="text-orange-100 text-sm mt-1">
                                        / {goals?.calories || 2000} kcal
                                    </p>
                                </div>
                                <Flame className="w-12 h-12 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">Protein</p>
                                    <p className="text-3xl font-bold">
                                        {todayTotals ? Math.round(todayTotals.protein) : 0}g
                                    </p>
                                    <p className="text-blue-100 text-sm mt-1">
                                        / {goals?.protein || 150}g
                                    </p>
                                </div>
                                <Drumstick className="w-12 h-12 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium mb-1">Carbs</p>
                                    <p className="text-3xl font-bold">
                                        {todayTotals ? Math.round(todayTotals.carbs) : 0}g
                                    </p>
                                    <p className="text-green-100 text-sm mt-1">
                                        / {goals?.carbs || 200}g
                                    </p>
                                </div>
                                <Wheat className="w-12 h-12 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium mb-1">Fats</p>
                                    <p className="text-3xl font-bold">
                                        {todayTotals ? Math.round(todayTotals.fats) : 0}g
                                    </p>
                                    <p className="text-purple-100 text-sm mt-1">
                                        / {goals?.fats || 65}g
                                    </p>
                                </div>
                                <Droplet className="w-12 h-12 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Today's Nutrition */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Nutrition</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {todayTotals && goals ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <ProgressRing
                                        current={todayTotals.calories}
                                        target={goals.calories}
                                        label="Calories"
                                        unit="kcal"
                                        size={140}
                                    />
                                    <ProgressRing
                                        current={todayTotals.protein}
                                        target={goals.protein}
                                        label="Protein"
                                        unit="g"
                                        size={140}
                                        color="#3b82f6"
                                    />
                                    <ProgressRing
                                        current={todayTotals.carbs}
                                        target={goals.carbs}
                                        label="Carbs"
                                        unit="g"
                                        size={140}
                                        color="#10b981"
                                    />
                                    <ProgressRing
                                        current={todayTotals.fats}
                                        target={goals.fats}
                                        label="Fats"
                                        unit="g"
                                        size={140}
                                        color="#8b5cf6"
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Flame className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        No meals logged today
                                    </p>
                                    <Link href="/nutrition">
                                        <Button variant="primary">
                                            <Plus className="w-5 h-5" />
                                            Log Your First Meal
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Workout */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Workout</CardTitle>
                                <Link href="/exercise">
                                    <Button variant="ghost" size="sm">View All</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentWorkout ? (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(recentWorkout.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {recentWorkout.exercises.length} exercises
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {recentWorkout.duration} min
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {recentWorkout.exercises.slice(0, 3).map((ex, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {ex.exercise.name}
                                                </span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {ex.sets.length} sets
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {recentWorkout.exercises.length > 3 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                                            +{recentWorkout.exercises.length - 3} more exercises
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Dumbbell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        No workouts logged yet
                                    </p>
                                    <Link href="/exercise">
                                        <Button variant="primary">
                                            <Plus className="w-5 h-5" />
                                            Log Your First Workout
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Nutrient Alerts */}
                {criticalDeficiencies.length > 0 && (
                    <Card className="mt-8 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950">
                        <CardHeader>
                            <CardTitle className="text-orange-900 dark:text-orange-100">
                                ⚠️ Nutrient Deficiency Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {criticalDeficiencies.map((def, idx) => (
                                    <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {def.nutrient}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {def.current.toFixed(1)} / {def.target.toFixed(1)} ({def.percentage.toFixed(0)}%)
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium rounded-full">
                                                {def.severity.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                            <strong>Recommended foods:</strong>
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {def.recommendations.map((food, i) => (
                                                <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                                                    {food}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/nutrition">
                        <Card hover className="cursor-pointer h-full">
                            <CardContent className="pt-6 text-center">
                                <Flame className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Track Nutrition
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Log meals and monitor your macros
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/exercise">
                        <Card hover className="cursor-pointer h-full">
                            <CardContent className="pt-6 text-center">
                                <Dumbbell className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Log Workout
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Record your exercises and progress
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/analytics">
                        <Card hover className="cursor-pointer h-full">
                            <CardContent className="pt-6 text-center">
                                <TrendingUp className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    View Analytics
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Track your progress over time
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </main>
        </div>
    );
}
