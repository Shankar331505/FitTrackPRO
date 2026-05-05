'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Flame, Drumstick, Wheat, Droplet, Dumbbell, TrendingUp, Plus, ArrowRight, AlertTriangle, Leaf } from 'lucide-react';
import Link from 'next/link';
import { calculateDailyTotals } from '@/utils/nutritionCalculator';
import { analyzeMicronutrients } from '@/utils/micronutrientAnalyzer';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

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

    const statCards = [
        {
            label: 'Calories',
            value: todayTotals ? Math.round(todayTotals.calories) : 0,
            target: goals?.calories || 2000,
            unit: 'kcal',
            icon: Flame,
            accent: 'accent-bar-amber',
            iconBg: 'bg-amber-50 dark:bg-amber-950/40',
            iconColor: 'text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Protein',
            value: todayTotals ? Math.round(todayTotals.protein) : 0,
            target: goals?.protein || 150,
            unit: 'g',
            icon: Drumstick,
            accent: 'accent-bar-indigo',
            iconBg: 'bg-primary-50 dark:bg-primary-950/40',
            iconColor: 'text-primary-600 dark:text-primary-400',
        },
        {
            label: 'Carbs',
            value: todayTotals ? Math.round(todayTotals.carbs) : 0,
            target: goals?.carbs || 200,
            unit: 'g',
            icon: Wheat,
            accent: 'accent-bar-emerald',
            iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Fats',
            value: todayTotals ? Math.round(todayTotals.fats) : 0,
            target: goals?.fats || 65,
            unit: 'g',
            icon: Droplet,
            accent: 'accent-bar-rose',
            iconBg: 'bg-rose-50 dark:bg-rose-950/40',
            iconColor: 'text-rose-600 dark:text-rose-400',
        },
    ];

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 bg-grid">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-medium text-surface-400 dark:text-surface-500 mb-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
                        {getGreeting()}, {userProfile?.name || 'there'}
                    </h1>
                </div>

                {/* Quick Stats — accent bar cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon;
                        const pct = stat.target > 0 ? Math.round((stat.value / stat.target) * 100) : 0;
                        return (
                            <Card key={stat.label} className={`${stat.accent} animate-slide-up stagger-${idx + 1}`} hover={false}>
                                <CardContent>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-1">
                                                {stat.label}
                                            </p>
                                            <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-50 tabular-nums">
                                                {stat.value}
                                                <span className="text-sm font-medium text-surface-400 dark:text-surface-500 ml-1">{stat.unit}</span>
                                            </p>
                                            <p className="text-xs text-surface-400 dark:text-surface-500 mt-1 tabular-nums">
                                                {pct}% of {stat.target} {stat.unit}
                                            </p>
                                        </div>
                                        <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                                            <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Today's Nutrition */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today&apos;s Nutrition</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {todayTotals && goals ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <ProgressRing
                                        current={todayTotals.calories}
                                        target={goals.calories}
                                        label="Calories"
                                        unit="kcal"
                                        size={130}
                                    />
                                    <ProgressRing
                                        current={todayTotals.protein}
                                        target={goals.protein}
                                        label="Protein"
                                        unit="g"
                                        size={130}
                                        color="#4f46e5"
                                    />
                                    <ProgressRing
                                        current={todayTotals.carbs}
                                        target={goals.carbs}
                                        label="Carbs"
                                        unit="g"
                                        size={130}
                                        color="#059669"
                                    />
                                    <ProgressRing
                                        current={todayTotals.fats}
                                        target={goals.fats}
                                        label="Fats"
                                        unit="g"
                                        size={130}
                                        color="#e11d48"
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-14 h-14 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Flame className="w-7 h-7 text-surface-300 dark:text-surface-600" />
                                    </div>
                                    <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 font-medium">
                                        Start tracking your meals for today
                                    </p>
                                    <Link href="/nutrition">
                                        <Button variant="primary" size="sm">
                                            <Plus className="w-4 h-4" />
                                            Log First Meal
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
                                    <Button variant="ghost" size="sm">
                                        View All
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentWorkout ? (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-surface-400 dark:text-surface-500 font-medium">
                                                {new Date(recentWorkout.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-lg font-bold text-surface-900 dark:text-surface-50">
                                                {recentWorkout.exercises.length} exercises
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-surface-400 dark:text-surface-500 font-medium">Duration</p>
                                            <p className="text-lg font-bold text-surface-900 dark:text-surface-50 tabular-nums">
                                                {recentWorkout.duration} min
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {recentWorkout.exercises.slice(0, 3).map((ex, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
                                                <span className="text-sm font-medium text-surface-800 dark:text-surface-200">
                                                    {ex.exercise.name}
                                                </span>
                                                <span className="text-xs text-surface-400 dark:text-surface-500 font-medium tabular-nums">
                                                    {ex.sets.length} sets
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {recentWorkout.exercises.length > 3 && (
                                        <p className="text-xs text-surface-400 dark:text-surface-500 mt-3 text-center font-medium">
                                            +{recentWorkout.exercises.length - 3} more exercises
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-14 h-14 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Dumbbell className="w-7 h-7 text-surface-300 dark:text-surface-600" />
                                    </div>
                                    <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 font-medium">
                                        No workouts logged yet
                                    </p>
                                    <Link href="/exercise">
                                        <Button variant="primary" size="sm">
                                            <Plus className="w-4 h-4" />
                                            Log a Workout
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Nutrient Alerts */}
                {criticalDeficiencies.length > 0 && (
                    <Card className="mb-8 border-amber-200/60 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <CardTitle className="text-amber-900 dark:text-amber-100">
                                    Nutrient Deficiency Alert
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {criticalDeficiencies.map((def, idx) => (
                                    <div key={idx} className="p-4 bg-white dark:bg-surface-800 rounded-xl">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50">
                                                    {def.nutrient}
                                                </h4>
                                                <p className="text-xs text-surface-500 dark:text-surface-400 tabular-nums">
                                                    {def.current.toFixed(1)} / {def.target.toFixed(1)} ({def.percentage.toFixed(0)}%)
                                                </p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                                                {def.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-surface-600 dark:text-surface-300 mb-2 font-medium">
                                            Recommended foods:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {def.recommendations.map((food, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg font-medium">
                                                    <Leaf className="w-3 h-3" />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            href: '/nutrition',
                            icon: Flame,
                            title: 'Track Nutrition',
                            desc: 'Log meals and monitor your macros',
                            iconBg: 'bg-amber-50 dark:bg-amber-950/40',
                            iconColor: 'text-amber-600 dark:text-amber-400',
                        },
                        {
                            href: '/exercise',
                            icon: Dumbbell,
                            title: 'Log Workout',
                            desc: 'Record your exercises and progress',
                            iconBg: 'bg-primary-50 dark:bg-primary-950/40',
                            iconColor: 'text-primary-600 dark:text-primary-400',
                        },
                        {
                            href: '/analytics',
                            icon: TrendingUp,
                            title: 'View Analytics',
                            desc: 'Track your progress over time',
                            iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
                            iconColor: 'text-emerald-600 dark:text-emerald-400',
                        },
                    ].map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link key={action.href} href={action.href}>
                                <Card hover className="cursor-pointer h-full">
                                    <CardContent className="text-center py-2">
                                        <div className={`w-12 h-12 ${action.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                                            <Icon className={`w-6 h-6 ${action.iconColor}`} />
                                        </div>
                                        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50 mb-1">
                                            {action.title}
                                        </h3>
                                        <p className="text-xs text-surface-400 dark:text-surface-500">
                                            {action.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
