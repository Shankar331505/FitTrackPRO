'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, Activity, Award, Dumbbell, CheckCircle, AlertTriangle, BarChart3, Lightbulb } from 'lucide-react';
import { calculateDailyTotals } from '@/utils/nutritionCalculator';
import { calculateNutritionScore, analyzeMicronutrients } from '@/utils/micronutrientAnalyzer';

export default function AnalyticsPage() {
    const { userProfile, dailyLogs, workoutLogs } = useApp();

    const last7Days = dailyLogs.slice(0, 7);
    const weeklyAvg = last7Days.length > 0 ? {
        calories: last7Days.reduce((sum, log) => sum + calculateDailyTotals(log.meals).calories, 0) / last7Days.length,
        protein: last7Days.reduce((sum, log) => sum + calculateDailyTotals(log.meals).protein, 0) / last7Days.length,
        workouts: workoutLogs.filter(w => { const d = new Date(w.date); const wa = new Date(); wa.setDate(wa.getDate() - 7); return d >= wa; }).length,
    } : null;

    const todayLog = dailyLogs[0];
    const todayTotals = todayLog ? calculateDailyTotals(todayLog.meals) : null;
    const nutritionScore = todayTotals && userProfile ? calculateNutritionScore(todayTotals, userProfile.nutritionGoals) : 0;
    const deficiencies = todayTotals ? analyzeMicronutrients(todayTotals) : [];

    const metrics = [
        { label: 'Nutrition Score', value: nutritionScore, sub: '/ 100', icon: Award, iconBg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400', accent: 'accent-bar-amber' },
        { label: 'Weekly Avg Calories', value: weeklyAvg ? Math.round(weeklyAvg.calories) : 0, sub: 'kcal/day', icon: TrendingUp, iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400', accent: 'accent-bar-emerald' },
        { label: 'Weekly Avg Protein', value: weeklyAvg ? `${Math.round(weeklyAvg.protein)}g` : '0g', sub: 'per day', icon: Activity, iconBg: 'bg-primary-50 dark:bg-primary-950/40', iconColor: 'text-primary-600 dark:text-primary-400', accent: 'accent-bar-indigo' },
        { label: 'Workouts This Week', value: weeklyAvg ? weeklyAvg.workouts : 0, sub: 'sessions', icon: Dumbbell, iconBg: 'bg-rose-50 dark:bg-rose-950/40', iconColor: 'text-rose-600 dark:text-rose-400', accent: 'accent-bar-rose' },
    ];

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 bg-grid">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight mb-1">Analytics & Insights</h1>
                    <p className="text-sm text-surface-400 dark:text-surface-500">Track your progress and get personalized insights</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {metrics.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <Card key={m.label} className={`${m.accent} animate-slide-up stagger-${i + 1}`} hover={false}>
                                <CardContent>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">{m.label}</p>
                                            <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-50 tabular-nums">{m.value}</p>
                                            <p className="text-xs text-surface-400 mt-0.5">{m.sub}</p>
                                        </div>
                                        <div className={`p-2.5 rounded-xl ${m.iconBg}`}><Icon className={`w-5 h-5 ${m.iconColor}`} /></div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader><CardTitle>Nutrition Insights</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Strengths</h4>
                                    </div>
                                    <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1 ml-6">
                                        <li>Consistent meal logging</li>
                                        <li>Good protein intake</li>
                                    </ul>
                                </div>
                                {deficiencies.length > 0 && (
                                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Areas to Improve</h4>
                                        </div>
                                        <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 ml-6">
                                            {deficiencies.slice(0, 3).map((def, idx) => <li key={idx}>Low {def.nutrient} ({def.percentage.toFixed(0)}% of RDA)</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Workout Insights</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="p-4 bg-primary-50/50 dark:bg-primary-950/10 rounded-xl border border-primary-100 dark:border-primary-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                        <h4 className="text-sm font-bold text-primary-800 dark:text-primary-200">Stats</h4>
                                    </div>
                                    <ul className="text-xs text-primary-700 dark:text-primary-300 space-y-1 ml-6">
                                        <li>Total workouts: {workoutLogs.length}</li>
                                        <li>This week: {weeklyAvg?.workouts || 0} sessions</li>
                                        <li>Avg duration: {workoutLogs.length > 0 ? Math.round(workoutLogs.reduce((s, w) => s + w.duration, 0) / workoutLogs.length) : 0} min</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-100 dark:border-rose-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                        <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200">Recommendations</h4>
                                    </div>
                                    <ul className="text-xs text-rose-700 dark:text-rose-300 space-y-1 ml-6">
                                        <li>Maintain consistent workout schedule</li>
                                        <li>Focus on progressive overload</li>
                                        <li>Ensure adequate recovery time</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {dailyLogs.slice(0, 7).map(log => {
                                const totals = calculateDailyTotals(log.meals);
                                return (
                                    <div key={log.date} className="flex items-center justify-between p-3.5 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
                                        <div>
                                            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                            <p className="text-xs text-surface-400 mt-0.5">{log.meals.reduce((s, m) => s + m.foods.length, 0)} foods logged</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-surface-900 dark:text-surface-50 tabular-nums">{Math.round(totals.calories)} kcal</p>
                                            <p className="text-xs text-surface-400 tabular-nums">P: {totals.protein.toFixed(0)}g · C: {totals.carbs.toFixed(0)}g</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {dailyLogs.length === 0 && <p className="text-center text-sm text-surface-400 py-8">No activity logged yet. Start tracking to see your progress!</p>}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
