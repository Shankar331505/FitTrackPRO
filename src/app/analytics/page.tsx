'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Activity, Award } from 'lucide-react';
import { calculateDailyTotals } from '@/utils/nutritionCalculator';
import { calculateNutritionScore, analyzeMicronutrients } from '@/utils/micronutrientAnalyzer';

export default function AnalyticsPage() {
    const { userProfile, dailyLogs, workoutLogs } = useApp();

    // Calculate weekly averages
    const last7Days = dailyLogs.slice(0, 7);
    const weeklyAvg = last7Days.length > 0 ? {
        calories: last7Days.reduce((sum, log) => sum + calculateDailyTotals(log.meals).calories, 0) / last7Days.length,
        protein: last7Days.reduce((sum, log) => sum + calculateDailyTotals(log.meals).protein, 0) / last7Days.length,
        workouts: workoutLogs.filter(w => {
            const date = new Date(w.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
        }).length,
    } : null;

    // Calculate nutrition score
    const todayLog = dailyLogs[0];
    const todayTotals = todayLog ? calculateDailyTotals(todayLog.meals) : null;
    const nutritionScore = todayTotals && userProfile ?
        calculateNutritionScore(todayTotals, userProfile.nutritionGoals) : 0;

    // Analyze deficiencies
    const deficiencies = todayTotals ? analyzeMicronutrients(todayTotals) : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Analytics & Insights
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track your progress and get personalized insights
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Nutrition Score
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {nutritionScore}
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                        / 100
                                    </p>
                                </div>
                                <Award className="w-12 h-12 text-primary-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Weekly Avg Calories
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {weeklyAvg ? Math.round(weeklyAvg.calories) : 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        kcal/day
                                    </p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Weekly Avg Protein
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {weeklyAvg ? Math.round(weeklyAvg.protein) : 0}g
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        per day
                                    </p>
                                </div>
                                <Activity className="w-12 h-12 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Workouts This Week
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {weeklyAvg ? weeklyAvg.workouts : 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        sessions
                                    </p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Nutrition Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nutrition Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                        ✅ Strengths
                                    </h4>
                                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                                        <li>• Consistent meal logging</li>
                                        <li>• Good protein intake</li>
                                    </ul>
                                </div>

                                {deficiencies.length > 0 && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                                            ⚠️ Areas to Improve
                                        </h4>
                                        <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                                            {deficiencies.slice(0, 3).map((def, idx) => (
                                                <li key={idx}>
                                                    • Low {def.nutrient} ({def.percentage.toFixed(0)}% of RDA)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Workout Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        📊 Stats
                                    </h4>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                        <li>• Total workouts: {workoutLogs.length}</li>
                                        <li>• This week: {weeklyAvg?.workouts || 0} sessions</li>
                                        <li>• Average duration: {workoutLogs.length > 0 ? Math.round(workoutLogs.reduce((sum, w) => sum + w.duration, 0) / workoutLogs.length) : 0} min</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                        💡 Recommendations
                                    </h4>
                                    <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                                        <li>• Maintain consistent workout schedule</li>
                                        <li>• Focus on progressive overload</li>
                                        <li>• Ensure adequate recovery time</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {dailyLogs.slice(0, 7).map(log => {
                                const totals = calculateDailyTotals(log.meals);
                                return (
                                    <div key={log.date} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {log.meals.reduce((sum, m) => sum + m.foods.length, 0)} foods logged
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {Math.round(totals.calories)} kcal
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                P: {totals.protein.toFixed(0)}g • C: {totals.carbs.toFixed(0)}g
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {dailyLogs.length === 0 && (
                                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                                    No activity logged yet. Start tracking to see your progress!
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
