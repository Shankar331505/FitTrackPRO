'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Search, Plus, X, Utensils, Globe, Database } from 'lucide-react';
import { foodDatabase, searchFoods, getCategories } from '@/data/foodDatabase';
import { searchUSDAFoods } from '@/services/usdaApi';
import { Food, FoodEntry, Meal, MealType, DailyLog } from '@/types/nutrition';
import { calculateFoodNutrition, calculateTotalNutrition, calculateDailyTotals } from '@/utils/nutritionCalculator';

function getEmptyNutrition() {
    return {
        calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, saturatedFat: 0,
        iron: 0, calcium: 0, magnesium: 0, zinc: 0, potassium: 0, sodium: 0,
        vitaminA: 0, vitaminB6: 0, vitaminB12: 0, vitaminC: 0, vitaminD: 0,
        vitaminE: 0, vitaminK: 0, folate: 0, thiamin: 0, riboflavin: 0, niacin: 0,
    };
}

export default function NutritionPage() {
    const { userProfile, getTodayLog, addDailyLog, updateDailyLog } = useApp();
    const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [quantity, setQuantity] = useState('100');
    const [useAPI, setUseAPI] = useState(true);
    const [apiFoods, setApiFoods] = useState<Food[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const indianFoodSuggestions = [
        'Basmati Rice', 'Roti', 'Dal', 'Paneer', 'Chicken Curry',
        'Curd', 'Ghee', 'Lentils', 'Chickpeas', 'Banana', 'Egg', 'Chicken Breast'
    ];

    const todayDate = new Date().toISOString().split('T')[0];
    const todayLog = getTodayLog();
    const goals = userProfile?.nutritionGoals;

    const currentLog: DailyLog = todayLog || {
        date: todayDate,
        meals: [
            { type: 'breakfast', foods: [], totals: getEmptyNutrition() },
            { type: 'lunch', foods: [], totals: getEmptyNutrition() },
            { type: 'dinner', foods: [], totals: getEmptyNutrition() },
            { type: 'snacks', foods: [], totals: getEmptyNutrition() },
        ],
        totals: getEmptyNutrition(),
        waterIntake: 0,
    };

    const dailyTotals = calculateDailyTotals(currentLog.meals);
    const categories = ['all', ...getCategories()];

    useEffect(() => {
        if (useAPI && searchQuery.length > 2) {
            setIsSearching(true);
            const timer = setTimeout(async () => {
                const results = await searchUSDAFoods(searchQuery, 20);
                setApiFoods(results);
                setIsSearching(false);
            }, 500);
            return () => clearTimeout(timer);
        } else { setApiFoods([]); }
    }, [searchQuery, useAPI]);

    const filteredFoods = useMemo(() => {
        if (useAPI) return apiFoods;
        let foods = searchQuery ? searchFoods(searchQuery) : foodDatabase;
        if (selectedCategory !== 'all') foods = foods.filter(f => f.category === selectedCategory);
        return foods.slice(0, 20);
    }, [searchQuery, selectedCategory, useAPI, apiFoods]);

    const currentMeal = currentLog.meals.find(m => m.type === selectedMealType);

    const handleAddFood = () => {
        if (!selectedFood) return;
        const qty = parseFloat(quantity) || 100;
        const foodEntry: FoodEntry = { food: selectedFood, quantity: qty, mealType: selectedMealType };
        const updatedMeals = currentLog.meals.map(meal => {
            if (meal.type === selectedMealType) {
                const updatedFoods = [...meal.foods, foodEntry];
                return { ...meal, foods: updatedFoods, totals: calculateTotalNutrition(updatedFoods) };
            }
            return meal;
        });
        const updatedLog: DailyLog = { ...currentLog, meals: updatedMeals, totals: calculateDailyTotals(updatedMeals) };
        if (todayLog) { updateDailyLog(todayDate, updatedLog); } else { addDailyLog(updatedLog); }
        setShowFoodModal(false); setSelectedFood(null); setQuantity('100'); setSearchQuery('');
    };

    const handleRemoveFood = (index: number) => {
        if (!currentMeal) return;
        const updatedFoods = currentMeal.foods.filter((_, i) => i !== index);
        const updatedMeals = currentLog.meals.map(meal => {
            if (meal.type === selectedMealType) return { ...meal, foods: updatedFoods, totals: calculateTotalNutrition(updatedFoods) };
            return meal;
        });
        const updatedLog: DailyLog = { ...currentLog, meals: updatedMeals, totals: calculateDailyTotals(updatedMeals) };
        updateDailyLog(todayDate, updatedLog);
    };

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 bg-grid">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight mb-1">Nutrition Tracking</h1>
                    <p className="text-sm text-surface-400 dark:text-surface-500">Log your meals and track your daily nutrition</p>
                </div>

                <Card className="mb-8">
                    <CardHeader><CardTitle>Today&apos;s Summary</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ProgressBar current={dailyTotals.calories} target={goals?.calories || 2000} label="Calories" unit=" kcal" />
                            <ProgressBar current={dailyTotals.protein} target={goals?.protein || 150} label="Protein" unit="g" />
                            <ProgressBar current={dailyTotals.carbs} target={goals?.carbs || 200} label="Carbs" unit="g" />
                            <ProgressBar current={dailyTotals.fats} target={goals?.fats || 65} label="Fats" unit="g" />
                        </div>
                    </CardContent>
                </Card>

                {/* Meal Tabs — underline style */}
                <div className="flex space-x-1 mb-6 border-b border-surface-200 dark:border-surface-800">
                    {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map(mt => (
                        <button key={mt} onClick={() => setSelectedMealType(mt)}
                            className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 whitespace-nowrap border-b-2 -mb-px
                                ${selectedMealType === mt
                                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300'}`}
                        >{mt.charAt(0).toUpperCase() + mt.slice(1)}</button>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}</CardTitle>
                            <Button onClick={() => setShowFoodModal(true)} size="sm"><Plus className="w-4 h-4" />Add Food</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {currentMeal && currentMeal.foods.length > 0 ? (
                            <div className="space-y-2">
                                {currentMeal.foods.map((entry, idx) => {
                                    const nutrition = calculateFoodNutrition(entry.food, entry.quantity);
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3.5 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50">
                                                    {entry.food.name}
                                                    {entry.food.brand && <span className="ml-2 text-xs text-surface-400 font-normal">({entry.food.brand})</span>}
                                                </h4>
                                                <p className="text-xs text-surface-400 mt-0.5 tabular-nums">
                                                    {entry.quantity}g · {Math.round(nutrition.calories)} kcal · P: {nutrition.protein.toFixed(1)}g · C: {nutrition.carbs.toFixed(1)}g · F: {nutrition.fats.toFixed(1)}g
                                                </p>
                                            </div>
                                            <button onClick={() => handleRemoveFood(idx)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                                <div className="mt-4 p-4 bg-primary-50/50 dark:bg-primary-950/20 rounded-xl border border-primary-100 dark:border-primary-900/30">
                                    <h4 className="text-xs font-bold text-primary-700 dark:text-primary-300 mb-2 uppercase tracking-wider">Meal Totals</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div><span className="text-xs text-surface-500">Calories</span><span className="ml-2 font-bold text-surface-900 dark:text-surface-50 tabular-nums">{Math.round(currentMeal.totals.calories)} kcal</span></div>
                                        <div><span className="text-xs text-surface-500">Protein</span><span className="ml-2 font-bold text-surface-900 dark:text-surface-50 tabular-nums">{currentMeal.totals.protein.toFixed(1)}g</span></div>
                                        <div><span className="text-xs text-surface-500">Carbs</span><span className="ml-2 font-bold text-surface-900 dark:text-surface-50 tabular-nums">{currentMeal.totals.carbs.toFixed(1)}g</span></div>
                                        <div><span className="text-xs text-surface-500">Fats</span><span className="ml-2 font-bold text-surface-900 dark:text-surface-50 tabular-nums">{currentMeal.totals.fats.toFixed(1)}g</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-14 h-14 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Utensils className="w-7 h-7 text-surface-300 dark:text-surface-600" />
                                </div>
                                <p className="text-sm text-surface-500 mb-4 font-medium">No foods logged for this meal</p>
                                <Button onClick={() => setShowFoodModal(true)} variant="primary" size="sm"><Plus className="w-4 h-4" />Add Food</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Modal isOpen={showFoodModal} onClose={() => { setShowFoodModal(false); setSelectedFood(null); setSearchQuery(''); setUseAPI(true); }} title="Add Food" size="lg">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200/60 dark:border-surface-700/50">
                        <div className="flex items-center gap-2.5">
                            {useAPI ? <Globe className="w-4 h-4 text-primary-600 dark:text-primary-400" /> : <Database className="w-4 h-4 text-surface-500" />}
                            <div>
                                <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{useAPI ? 'USDA API (300,000+ foods)' : 'Local Database (35 foods)'}</p>
                                <p className="text-xs text-surface-400">{useAPI ? 'Comprehensive USDA database' : 'Quick access to common foods'}</p>
                            </div>
                        </div>
                        <button onClick={() => { setUseAPI(!useAPI); setSearchQuery(''); setSelectedFood(null); }}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${useAPI ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300'}`}>
                            {useAPI ? 'Switch to Local' : 'Switch to API'}
                        </button>
                    </div>

                    <Input placeholder={useAPI ? "Search USDA foods..." : "Search foods..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="w-4 h-4" />} />

                    {useAPI && !searchQuery && (
                        <div>
                            <p className="text-xs font-semibold text-surface-500 mb-2 uppercase tracking-wider">Popular Foods</p>
                            <div className="flex flex-wrap gap-1.5">
                                {indianFoodSuggestions.map(food => (
                                    <button key={food} onClick={() => setSearchQuery(food)}
                                        className="px-2.5 py-1 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-lg text-xs font-medium hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950/30 dark:hover:text-primary-300 transition-all">
                                        {food}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!useAPI && (
                        <div className="flex gap-1.5 overflow-x-auto pb-2">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-500'}`}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}

                    {isSearching && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-xs text-surface-400 font-medium">Searching...</p>
                        </div>
                    )}

                    {!isSearching && (
                        <div className="max-h-96 overflow-y-auto space-y-1.5">
                            {filteredFoods.length > 0 ? filteredFoods.map(food => (
                                <button key={food.id} onClick={() => setSelectedFood(food)}
                                    className={`w-full text-left p-3.5 rounded-xl transition-all ${selectedFood?.id === food.id ? 'bg-primary-50 dark:bg-primary-950/30 border-2 border-primary-500' : 'bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 border-2 border-transparent'}`}>
                                    <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50">{food.name}{food.brand && <span className="ml-2 text-xs text-surface-400 font-normal">- {food.brand}</span>}</h4>
                                    <p className="text-xs text-surface-400 mt-0.5 tabular-nums">{food.calories} kcal · P: {food.protein}g · C: {food.carbs}g · F: {food.fats}g <span className="text-[10px]">({food.servingSize}g)</span></p>
                                </button>
                            )) : <p className="text-center text-sm text-surface-400 py-8">{searchQuery ? 'No foods found.' : 'Start typing to search'}</p>}
                        </div>
                    )}

                    {selectedFood && (
                        <div className="pt-4 border-t border-surface-200/60 dark:border-surface-700/50">
                            <Input label="Quantity (grams)" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" />
                            <div className="mt-4 p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
                                <h4 className="text-xs font-bold text-surface-600 dark:text-surface-300 mb-2 uppercase tracking-wider">Nutrition Preview</h4>
                                {(() => {
                                    const n = calculateFoodNutrition(selectedFood, parseFloat(quantity) || 100);
                                    return (<div className="grid grid-cols-2 gap-2 text-sm"><div>Calories: <strong className="tabular-nums">{Math.round(n.calories)} kcal</strong></div><div>Protein: <strong className="tabular-nums">{n.protein.toFixed(1)}g</strong></div><div>Carbs: <strong className="tabular-nums">{n.carbs.toFixed(1)}g</strong></div><div>Fats: <strong className="tabular-nums">{n.fats.toFixed(1)}g</strong></div></div>);
                                })()}
                            </div>
                            <Button onClick={handleAddFood} variant="primary" className="w-full mt-4">Add to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}</Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
