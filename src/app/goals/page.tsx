'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Target, TrendingUp, Activity, Sparkles, Utensils, Calendar, ChefHat, Clock, Users } from 'lucide-react';
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
        const input: GoalInput = {
            currentWeight: parseFloat(weight) || 70,
            targetWeight: parseFloat(targetWeight) || 65,
            timelineWeeks: parseInt(timelineWeeks) || 12,
            activityLevel,
            gender,
            age: parseInt(age) || 25,
            height: parseInt(height) || 170,
        };

        const optimal = calculateOptimalMacros(input);

        setCalories(optimal.calories.toString());
        setProtein(optimal.protein.toString());
        setCarbs(optimal.carbs.toString());
        setFats(optimal.fats.toString());
    };

    const handleGenerateMealPlan = async () => {
        setIsGenerating(true);

        const goals = {
            calories: parseFloat(calories) || 2000,
            protein: parseFloat(protein) || 150,
            carbs: parseFloat(carbs) || 200,
            fats: parseFloat(fats) || 65,
        };

        try {
            const plan = await generateMealPlan(goals);
            setMealPlan(plan);
        } catch (error) {
            console.error('Error generating meal plan:', error);
            alert('Error generating meal plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveGoals = () => {
        if (!userProfile) return;

        const updated = {
            ...userProfile,
            nutritionGoals: {
                ...userProfile.nutritionGoals,
                calories: parseFloat(calories) || 2000,
                protein: parseFloat(protein) || 150,
                carbs: parseFloat(carbs) || 200,
                fats: parseFloat(fats) || 65,
            },
        };

        setUserProfile(updated);
        alert('Goals saved successfully!');
    };

    const handleLogWeight = () => {
        const weightNum = parseFloat(weight);
        if (!weightNum) return;

        addBodyMetric({
            date: new Date().toISOString(),
            weight: weightNum,
        });

        alert('Weight logged successfully!');
    };

    const handleViewRecipe = async (mealType: string, foods: FoodEntry[]) => {
        setIsLoadingRecipe(true);
        setShowRecipeModal(true);

        const foodNames = foods.map(f => f.food.name);
        const totalMacros = foods.reduce((acc, entry) => {
            const multiplier = entry.quantity / 100;
            return {
                calories: acc.calories + entry.food.calories * multiplier,
                protein: acc.protein + entry.food.protein * multiplier,
                carbs: acc.carbs + entry.food.carbs * multiplier,
                fats: acc.fats + entry.food.fats * multiplier,
            };
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        try {
            // Try Gemini AI first
            const aiRecipe = await generateRecipeWithAI(foodNames, mealType, totalMacros);
            if (aiRecipe) {
                setSelectedRecipe(aiRecipe);
            } else {
                // Fallback to simple recipe
                const simpleRecipe = generateSimpleRecipe(foodNames, mealType);
                setSelectedRecipe(simpleRecipe);
            }
        } catch (error) {
            console.error('Error generating recipe:', error);
            const simpleRecipe = generateSimpleRecipe(foodNames, mealType);
            setSelectedRecipe(simpleRecipe);
        } finally {
            setIsLoadingRecipe(false);
        }
    };

    // Get timeline recommendation
    const timeline = getTimelineRecommendation(
        parseFloat(weight) || 70,
        parseFloat(targetWeight) || 65
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Goals & Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Set your fitness goals and get personalized meal plans
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Current Weight (kg)"
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="70"
                                    />

                                    <Input
                                        label="Target Weight (kg)"
                                        type="number"
                                        value={targetWeight}
                                        onChange={(e) => setTargetWeight(e.target.value)}
                                        placeholder="65"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Height (cm)"
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder="170"
                                    />

                                    <Input
                                        label="Age"
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="25"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Gender
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setGender('male')}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${gender === 'male'
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            Male
                                        </button>
                                        <button
                                            onClick={() => setGender('female')}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${gender === 'female'
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            Female
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Activity Level
                                    </label>
                                    <select
                                        value={activityLevel}
                                        onChange={(e) => setActivityLevel(e.target.value as any)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="sedentary">Sedentary (little/no exercise)</option>
                                        <option value="light">Light (1-3 days/week)</option>
                                        <option value="moderate">Moderate (3-5 days/week)</option>
                                        <option value="active">Active (6-7 days/week)</option>
                                        <option value="veryActive">Very Active (2x per day)</option>
                                    </select>
                                </div>

                                <Input
                                    label="Timeline (weeks)"
                                    type="number"
                                    value={timelineWeeks}
                                    onChange={(e) => setTimelineWeeks(e.target.value)}
                                    placeholder="12"
                                />

                                {timeline.warning && (
                                    <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                                        <p className="text-sm text-orange-800 dark:text-orange-200">
                                            ⚠️ {timeline.warning}
                                        </p>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                        <strong>Recommended Timeline:</strong> {timeline.recommended} weeks
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        Range: {timeline.minWeeks}-{timeline.maxWeeks} weeks
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nutrition Goals */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nutrition Goals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input
                                    label="Daily Calories"
                                    type="number"
                                    value={calories}
                                    onChange={(e) => setCalories(e.target.value)}
                                    placeholder="2000"
                                />

                                <Input
                                    label="Protein (g)"
                                    type="number"
                                    value={protein}
                                    onChange={(e) => setProtein(e.target.value)}
                                    placeholder="150"
                                />

                                <Input
                                    label="Carbs (g)"
                                    type="number"
                                    value={carbs}
                                    onChange={(e) => setCarbs(e.target.value)}
                                    placeholder="200"
                                />

                                <Input
                                    label="Fats (g)"
                                    type="number"
                                    value={fats}
                                    onChange={(e) => setFats(e.target.value)}
                                    placeholder="65"
                                />

                                <div className="flex gap-2">
                                    <Button onClick={handleAutoCalculate} variant="ghost" className="flex-1">
                                        <Sparkles className="w-4 h-4" />
                                        Auto Calculate
                                    </Button>
                                    <Button onClick={handleSaveGoals} variant="primary" className="flex-1">
                                        Save Goals
                                    </Button>
                                </div>

                                <Button onClick={handleLogWeight} variant="secondary" className="w-full">
                                    <TrendingUp className="w-4 h-4" />
                                    Log Today's Weight
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Generate Meal Plan */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>AI Meal Plan Generator</CardTitle>
                            <Button
                                onClick={handleGenerateMealPlan}
                                variant="primary"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Generate Daily Meal Plan
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!mealPlan ? (
                            <div className="text-center py-12">
                                <Utensils className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Click "Generate Daily Meal Plan" to get a personalized Indian diet plan
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Based on your goals: {calories} kcal • {protein}g protein • {carbs}g carbs • {fats}g fats
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Meal Plan Summary */}
                                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg border-2 border-green-200 dark:border-green-800">
                                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                        Daily Meal Plan Totals
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {Math.round(mealPlan.totals.calories)} kcal
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                                Goal: {calories} kcal
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {Math.round(mealPlan.totals.protein)}g
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                                Goal: {protein}g
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {Math.round(mealPlan.totals.carbs)}g
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                                Goal: {carbs}g
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Fats:</span>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {Math.round(mealPlan.totals.fats)}g
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                                Goal: {fats}g
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Breakfast */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-orange-600" />
                                            Breakfast
                                        </h3>
                                        <Button
                                            onClick={() => handleViewRecipe('breakfast', mealPlan.breakfast)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <ChefHat className="w-4 h-4" />
                                            View Recipe
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {mealPlan.breakfast.map((entry, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {entry.food.name}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {entry.quantity}g
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {Math.round((entry.food.calories * entry.quantity) / 100)} kcal •
                                                    P: {((entry.food.protein * entry.quantity) / 100).toFixed(1)}g •
                                                    C: {((entry.food.carbs * entry.quantity) / 100).toFixed(1)}g •
                                                    F: {((entry.food.fats * entry.quantity) / 100).toFixed(1)}g
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Lunch */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            Lunch
                                        </h3>
                                        <Button
                                            onClick={() => handleViewRecipe('lunch', mealPlan.lunch)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <ChefHat className="w-4 h-4" />
                                            View Recipe
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {mealPlan.lunch.map((entry, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {entry.food.name}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {entry.quantity}g
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {Math.round((entry.food.calories * entry.quantity) / 100)} kcal •
                                                    P: {((entry.food.protein * entry.quantity) / 100).toFixed(1)}g •
                                                    C: {((entry.food.carbs * entry.quantity) / 100).toFixed(1)}g •
                                                    F: {((entry.food.fats * entry.quantity) / 100).toFixed(1)}g
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dinner */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                            Dinner
                                        </h3>
                                        <Button
                                            onClick={() => handleViewRecipe('dinner', mealPlan.dinner)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <ChefHat className="w-4 h-4" />
                                            View Recipe
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {mealPlan.dinner.map((entry, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {entry.food.name}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {entry.quantity}g
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {Math.round((entry.food.calories * entry.quantity) / 100)} kcal •
                                                    P: {((entry.food.protein * entry.quantity) / 100).toFixed(1)}g •
                                                    C: {((entry.food.carbs * entry.quantity) / 100).toFixed(1)}g •
                                                    F: {((entry.food.fats * entry.quantity) / 100).toFixed(1)}g
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Snacks */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                            Snacks
                                        </h3>
                                        <Button
                                            onClick={() => handleViewRecipe('snacks', mealPlan.snacks)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <ChefHat className="w-4 h-4" />
                                            View Recipe
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {mealPlan.snacks.map((entry, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {entry.food.name}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {entry.quantity}g
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {Math.round((entry.food.calories * entry.quantity) / 100)} kcal •
                                                    P: {((entry.food.protein * entry.quantity) / 100).toFixed(1)}g •
                                                    C: {((entry.food.carbs * entry.quantity) / 100).toFixed(1)}g •
                                                    F: {((entry.food.fats * entry.quantity) / 100).toFixed(1)}g
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Weight History */}
                {userProfile && userProfile.bodyMetrics.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Weight History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {userProfile.bodyMetrics.slice(0, 10).map((metric, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(metric.date).toLocaleDateString()}
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {metric.weight} kg
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Recipe Modal */}
            <Modal
                isOpen={showRecipeModal}
                onClose={() => {
                    setShowRecipeModal(false);
                    setSelectedRecipe(null);
                }}
                title={selectedRecipe?.title || "Recipe"}
                size="lg"
            >
                {isLoadingRecipe ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Generating recipe...</p>
                    </div>
                ) : selectedRecipe ? (
                    <div className="space-y-6">
                        {/* Recipe Info */}
                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{selectedRecipe.prepTime} mins</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{selectedRecipe.servings} serving(s)</span>
                            </div>
                        </div>

                        {/* Nutrition */}
                        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Nutrition</h4>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                                    <span className="ml-1 font-bold text-gray-900 dark:text-white">{Math.round(selectedRecipe.calories)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                                    <span className="ml-1 font-bold text-gray-900 dark:text-white">{Math.round(selectedRecipe.protein)}g</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                                    <span className="ml-1 font-bold text-gray-900 dark:text-white">{Math.round(selectedRecipe.carbs)}g</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Fats:</span>
                                    <span className="ml-1 font-bold text-gray-900 dark:text-white">{Math.round(selectedRecipe.fats)}g</span>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h4>
                            <ul className="space-y-2">
                                {selectedRecipe.ingredients.map((ingredient, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="text-primary-600 mt-1">•</span>
                                        <span>{ingredient}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Instructions */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Instructions</h4>
                            <ol className="space-y-3">
                                {selectedRecipe.instructions.map((instruction, idx) => (
                                    <li key={idx} className="flex gap-3 text-gray-700 dark:text-gray-300">
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1">{instruction}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
