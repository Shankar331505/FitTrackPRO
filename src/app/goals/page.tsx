'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Target, TrendingUp, Sparkles, Utensils, Calendar, ChefHat, Clock, Users, AlertTriangle, Info, Flame, Beef, Wheat, Droplets, CheckCircle2, CookingPot } from 'lucide-react';
import { calculateOptimalMacros, generateMealPlan, getTimelineRecommendation, MealPlanDay, GoalInput } from '@/utils/mealPlanGenerator';
import { generateSimpleRecipe, generateRecipeWithAI, SimpleRecipe } from '@/services/recipeService';
import { FoodEntry } from '@/types/nutrition';

export default function GoalsPage() {
    const { userProfile, setUserProfile, addBodyMetric } = useApp();
    const [weight, setWeight] = useState(userProfile?.bodyMetrics[0]?.weight?.toString() || '70');
    const [targetWeight, setTargetWeight] = useState('65');
    const [height, setHeight] = useState('170');
    const [age, setAge] = useState('25');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'>('moderate');
    const [timelineWeeks, setTimelineWeeks] = useState('12');
    const [calories, setCalories] = useState(userProfile?.nutritionGoals.calories.toString() || '2000');
    const [protein, setProtein] = useState(userProfile?.nutritionGoals.protein.toString() || '150');
    const [carbs, setCarbs] = useState(userProfile?.nutritionGoals.carbs.toString() || '200');
    const [fats, setFats] = useState(userProfile?.nutritionGoals.fats.toString() || '65');
    const [mealPlan, setMealPlan] = useState<MealPlanDay | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<SimpleRecipe | null>(null);
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

    const handleAutoCalculate = () => {
        const input: GoalInput = { currentWeight: parseFloat(weight) || 70, targetWeight: parseFloat(targetWeight) || 65, timelineWeeks: parseInt(timelineWeeks) || 12, activityLevel, gender, age: parseInt(age) || 25, height: parseInt(height) || 170 };
        const optimal = calculateOptimalMacros(input);
        setCalories(optimal.calories.toString()); setProtein(optimal.protein.toString()); setCarbs(optimal.carbs.toString()); setFats(optimal.fats.toString());
    };

    const handleGenerateMealPlan = async () => {
        setIsGenerating(true);
        const goals = { calories: parseFloat(calories) || 2000, protein: parseFloat(protein) || 150, carbs: parseFloat(carbs) || 200, fats: parseFloat(fats) || 65, fiber: userProfile?.nutritionGoals.fiber ?? 30, sugar: userProfile?.nutritionGoals.sugar ?? 50, saturatedFat: userProfile?.nutritionGoals.saturatedFat ?? 20 };
        try { const plan = await generateMealPlan(goals); setMealPlan(plan); } catch (error) { console.error('Error:', error); alert('Error generating meal plan.'); } finally { setIsGenerating(false); }
    };

    const handleSaveGoals = () => {
        if (!userProfile) return;
        setUserProfile({ ...userProfile, nutritionGoals: { ...userProfile.nutritionGoals, calories: parseFloat(calories) || 2000, protein: parseFloat(protein) || 150, carbs: parseFloat(carbs) || 200, fats: parseFloat(fats) || 65 } });
        alert('Goals saved successfully!');
    };

    const handleLogWeight = () => {
        const w = parseFloat(weight); if (!w) return;
        addBodyMetric({ date: new Date().toISOString(), weight: w }); alert('Weight logged!');
    };

    const handleViewRecipe = async (mealType: string, foods: FoodEntry[]) => {
        setIsLoadingRecipe(true); setShowRecipeModal(true);
        const foodNames = foods.map(f => f.food.name);
        const totalMacros = foods.reduce((acc, entry) => { const m = entry.quantity / 100; return { calories: acc.calories + entry.food.calories * m, protein: acc.protein + entry.food.protein * m, carbs: acc.carbs + entry.food.carbs * m, fats: acc.fats + entry.food.fats * m }; }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
        try { const ai = await generateRecipeWithAI(foodNames, mealType, totalMacros); setSelectedRecipe(ai || generateSimpleRecipe(foodNames, mealType)); } catch { setSelectedRecipe(generateSimpleRecipe(foodNames, mealType)); } finally { setIsLoadingRecipe(false); }
    };

    const timeline = getTimelineRecommendation(parseFloat(weight) || 70, parseFloat(targetWeight) || 65);

    const mealColors: Record<string, { icon: string; color: string }> = {
        breakfast: { icon: 'text-amber-600 dark:text-amber-400', color: 'Breakfast' },
        lunch: { icon: 'text-primary-600 dark:text-primary-400', color: 'Lunch' },
        dinner: { icon: 'text-rose-600 dark:text-rose-400', color: 'Dinner' },
        snacks: { icon: 'text-emerald-600 dark:text-emerald-400', color: 'Snacks' },
    };

    const renderMealSection = (type: string, foods: FoodEntry[]) => (
        <div key={type}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${mealColors[type]?.icon}`} />
                    {mealColors[type]?.color}
                </h3>
                <Button onClick={() => handleViewRecipe(type, foods)} variant="ghost" size="sm"><ChefHat className="w-3.5 h-3.5" />View Recipe</Button>
            </div>
            <div className="space-y-1.5">
                {foods.map((entry, idx) => (
                    <div key={idx} className="p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-surface-800 dark:text-surface-200">{entry.food.name}</span>
                            <span className="text-xs text-surface-400 tabular-nums">{entry.quantity}g</span>
                        </div>
                        <p className="text-[10px] text-surface-400 mt-0.5 tabular-nums">{Math.round((entry.food.calories * entry.quantity) / 100)} kcal · P: {((entry.food.protein * entry.quantity) / 100).toFixed(1)}g · C: {((entry.food.carbs * entry.quantity) / 100).toFixed(1)}g · F: {((entry.food.fats * entry.quantity) / 100).toFixed(1)}g</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 bg-grid">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight mb-1">Goals & Settings</h1>
                    <p className="text-sm text-surface-400 dark:text-surface-500">Set your fitness goals and get personalized meal plans</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Current Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
                                    <Input label="Target Weight (kg)" type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="65" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" />
                                    <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-2 uppercase tracking-wider">Gender</label>
                                    <div className="flex gap-3">
                                        {(['male', 'female'] as const).map(g => (
                                            <button key={g} onClick={() => setGender(g)}
                                                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all ${gender === g ? 'bg-primary-600 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-800 text-surface-500'}`}>
                                                {g.charAt(0).toUpperCase() + g.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-2 uppercase tracking-wider">Activity Level</label>
                                    <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as any)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                                        <option value="sedentary">Sedentary (little/no exercise)</option>
                                        <option value="light">Light (1-3 days/week)</option>
                                        <option value="moderate">Moderate (3-5 days/week)</option>
                                        <option value="active">Active (6-7 days/week)</option>
                                        <option value="veryActive">Very Active (2x per day)</option>
                                    </select>
                                </div>
                                <Input label="Timeline (weeks)" type="number" value={timelineWeeks} onChange={(e) => setTimelineWeeks(e.target.value)} placeholder="12" />
                                {timeline.warning && (
                                    <div className="flex items-start gap-2 p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-amber-700 dark:text-amber-300">{timeline.warning}</p>
                                    </div>
                                )}
                                <div className="flex items-start gap-2 p-3 bg-primary-50/50 dark:bg-primary-950/10 rounded-xl border border-primary-100 dark:border-primary-900/20">
                                    <Info className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-primary-700 dark:text-primary-300"><strong>Recommended:</strong> {timeline.recommended} weeks</p>
                                        <p className="text-[10px] text-primary-500 dark:text-primary-400 mt-0.5">Range: {timeline.minWeeks}-{timeline.maxWeeks} weeks</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nutrition Goals */}
                    <Card>
                        <CardHeader><CardTitle>Nutrition Goals</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input label="Daily Calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="2000" />
                                <Input label="Protein (g)" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="150" />
                                <Input label="Carbs (g)" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="200" />
                                <Input label="Fats (g)" type="number" value={fats} onChange={(e) => setFats(e.target.value)} placeholder="65" />
                                <div className="flex gap-2">
                                    <Button onClick={handleAutoCalculate} variant="ghost" className="flex-1"><Sparkles className="w-4 h-4" />Auto Calculate</Button>
                                    <Button onClick={handleSaveGoals} variant="primary" className="flex-1">Save Goals</Button>
                                </div>
                                <Button onClick={handleLogWeight} variant="secondary" className="w-full"><TrendingUp className="w-4 h-4" />Log Today&apos;s Weight</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Meal Plan Generator */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Meal Plan Generator</CardTitle>
                            <Button onClick={handleGenerateMealPlan} variant="primary" size="sm" disabled={isGenerating}>
                                {isGenerating ? (<><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>Generating...</>) : (<><Sparkles className="w-4 h-4" />Generate Plan</>)}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!mealPlan ? (
                            <div className="text-center py-10">
                                <div className="w-14 h-14 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Utensils className="w-7 h-7 text-surface-300 dark:text-surface-600" />
                                </div>
                                <p className="text-sm text-surface-500 mb-2 font-medium">Generate a personalized Indian diet plan</p>
                                <p className="text-xs text-surface-400 tabular-nums">{calories} kcal · {protein}g protein · {carbs}g carbs · {fats}g fats</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                    <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2 uppercase tracking-wider">Daily Totals</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        {[{ l: 'Calories', v: `${Math.round(mealPlan.totals.calories)} kcal`, g: `${calories} kcal` }, { l: 'Protein', v: `${Math.round(mealPlan.totals.protein)}g`, g: `${protein}g` }, { l: 'Carbs', v: `${Math.round(mealPlan.totals.carbs)}g`, g: `${carbs}g` }, { l: 'Fats', v: `${Math.round(mealPlan.totals.fats)}g`, g: `${fats}g` }].map(x => (
                                            <div key={x.l}>
                                                <span className="text-xs text-surface-500">{x.l}</span>
                                                <div className="font-extrabold text-surface-900 dark:text-surface-50 tabular-nums">{x.v}</div>
                                                <div className="text-[10px] text-surface-400 tabular-nums">Goal: {x.g}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {renderMealSection('breakfast', mealPlan.breakfast)}
                                {renderMealSection('lunch', mealPlan.lunch)}
                                {renderMealSection('dinner', mealPlan.dinner)}
                                {renderMealSection('snacks', mealPlan.snacks)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Weight History */}
                {userProfile && userProfile.bodyMetrics.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Weight History</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-1.5">
                                {userProfile.bodyMetrics.slice(0, 10).map((metric, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
                                        <span className="text-xs text-surface-400 font-medium">{new Date(metric.date).toLocaleDateString()}</span>
                                        <span className="text-sm font-bold text-surface-900 dark:text-surface-50 tabular-nums">{metric.weight} kg</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            <Modal isOpen={showRecipeModal} onClose={() => { setShowRecipeModal(false); setSelectedRecipe(null); }} title="" size="lg">
                {isLoadingRecipe ? (
                    <div className="text-center py-16">
                        <div className="relative w-16 h-16 mx-auto mb-6">
                            <div className="absolute inset-0 animate-spin border-[3px] border-amber-200 dark:border-amber-900/40 border-t-amber-500 dark:border-t-amber-400 rounded-full" />
                            <CookingPot className="absolute inset-0 m-auto w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-sm font-semibold text-surface-600 dark:text-surface-300">Preparing your recipe...</p>
                        <p className="text-xs text-surface-400 mt-1">Calculating nutrition & instructions</p>
                    </div>
                ) : selectedRecipe ? (
                    <div className="-mx-6 -mt-6">
                        {/* ── Hero Header ── */}
                        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/10 border-b border-amber-100/60 dark:border-amber-900/20">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <ChefHat className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-extrabold text-surface-900 dark:text-surface-50 leading-tight mb-2">{selectedRecipe.title}</h2>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 dark:bg-surface-800/50 backdrop-blur-sm rounded-lg text-xs font-semibold text-surface-600 dark:text-surface-300 border border-surface-200/50 dark:border-surface-700/50">
                                            <Clock className="w-3 h-3 text-amber-500" />{selectedRecipe.prepTime} mins
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 dark:bg-surface-800/50 backdrop-blur-sm rounded-lg text-xs font-semibold text-surface-600 dark:text-surface-300 border border-surface-200/50 dark:border-surface-700/50">
                                            <Users className="w-3 h-3 text-primary-500" />{selectedRecipe.servings} serving{selectedRecipe.servings > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Macro Cards ── */}
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Calories', value: Math.round(selectedRecipe.calories), unit: 'kcal', icon: Flame, color: 'from-rose-500 to-orange-500', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/30' },
                                    { label: 'Protein', value: Math.round(selectedRecipe.protein), unit: 'g', icon: Beef, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30' },
                                    { label: 'Carbs', value: Math.round(selectedRecipe.carbs), unit: 'g', icon: Wheat, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30' },
                                    { label: 'Fats', value: Math.round(selectedRecipe.fats), unit: 'g', icon: Droplets, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30' },
                                ].map(macro => (
                                    <div key={macro.label} className={`relative p-3 rounded-xl ${macro.bg} border ${macro.border} overflow-hidden`}>
                                        <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${macro.color} opacity-80`} />
                                        <macro.icon className={`w-4 h-4 ${macro.text} mb-1.5`} />
                                        <p className="text-xl font-extrabold text-surface-900 dark:text-surface-50 tabular-nums leading-none">
                                            {macro.value}<span className="text-xs font-semibold text-surface-400 ml-0.5">{macro.unit}</span>
                                        </p>
                                        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mt-1">{macro.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Ingredients ── */}
                        <div className="px-6 pb-4">
                            <div className="p-4 bg-surface-50 dark:bg-surface-900/40 rounded-2xl border border-surface-100 dark:border-surface-800">
                                <h4 className="flex items-center gap-2 text-xs font-bold text-surface-900 dark:text-surface-100 mb-3 uppercase tracking-wider">
                                    <span className="w-5 h-5 bg-primary-100 dark:bg-primary-900/40 rounded-md flex items-center justify-center"><Utensils className="w-3 h-3 text-primary-600 dark:text-primary-400" /></span>
                                    Ingredients
                                    <span className="ml-auto text-[10px] font-medium text-surface-400 normal-case tracking-normal">{selectedRecipe.ingredients.length} items</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                                    {selectedRecipe.ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 py-1.5 group">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-500 mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-sm text-surface-700 dark:text-surface-300 leading-snug">{ing}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Instructions ── */}
                        <div className="px-6 pb-6">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-surface-900 dark:text-surface-100 mb-4 uppercase tracking-wider">
                                <span className="w-5 h-5 bg-amber-100 dark:bg-amber-900/40 rounded-md flex items-center justify-center"><CookingPot className="w-3 h-3 text-amber-600 dark:text-amber-400" /></span>
                                Instructions
                            </h4>
                            <div className="space-y-3">
                                {selectedRecipe.instructions.map((inst, idx) => (
                                    <div key={idx} className={`flex gap-4 p-3.5 rounded-xl transition-colors ${
                                        idx % 2 === 0
                                            ? 'bg-surface-50 dark:bg-surface-900/30'
                                            : 'bg-white dark:bg-surface-800/30'
                                    }`}>
                                        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                                            idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/20'
                                            : idx === selectedRecipe.instructions.length - 1 ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm shadow-emerald-500/20'
                                            : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
                                        }`}>{idx + 1}</span>
                                        <p className="flex-1 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{inst}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
