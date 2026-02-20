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

export default function NutritionPage() {
    const { userProfile, getTodayLog, addDailyLog, updateDailyLog } = useApp();
    const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [quantity, setQuantity] = useState('100');
    const [useAPI, setUseAPI] = useState(true); // API is now default
    const [apiFoods, setApiFoods] = useState<Food[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Popular Indian food suggestions
    const indianFoodSuggestions = [
        'Basmati Rice', 'Roti', 'Chapati', 'Dal', 'Paneer', 'Chicken Curry',
        'Curd', 'Ghee', 'Lentils', 'Chickpeas', 'Potato', 'Onion', 'Tomato',
        'Milk', 'Banana', 'Mango', 'Egg', 'Chicken Breast', 'Mutton'
    ];

    const todayDate = new Date().toISOString().split('T')[0];
    const todayLog = getTodayLog();
    const goals = userProfile?.nutritionGoals;

    // Initialize today's log if it doesn't exist
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

    // Search USDA API when query changes and API mode is enabled
    useEffect(() => {
        if (useAPI && searchQuery.length > 2) {
            setIsSearching(true);
            const timer = setTimeout(async () => {
                const results = await searchUSDAFoods(searchQuery, 20);
                setApiFoods(results);
                setIsSearching(false);
            }, 500); // Debounce

            return () => clearTimeout(timer);
        } else {
            setApiFoods([]);
        }
    }, [searchQuery, useAPI]);

    // Filter foods based on search and category
    const filteredFoods = useMemo(() => {
        if (useAPI) {
            return apiFoods;
        }

        let foods = searchQuery ? searchFoods(searchQuery) : foodDatabase;
        if (selectedCategory !== 'all') {
            foods = foods.filter(f => f.category === selectedCategory);
        }
        return foods.slice(0, 20);
    }, [searchQuery, selectedCategory, useAPI, apiFoods]);

    // Get current meal
    const currentMeal = currentLog.meals.find(m => m.type === selectedMealType);

    const handleAddFood = () => {
        if (!selectedFood) return;

        const qty = parseFloat(quantity) || 100;
        const foodEntry: FoodEntry = {
            food: selectedFood,
            quantity: qty,
            mealType: selectedMealType,
        };

        // Update meal
        const updatedMeals = currentLog.meals.map(meal => {
            if (meal.type === selectedMealType) {
                const updatedFoods = [...meal.foods, foodEntry];
                return {
                    ...meal,
                    foods: updatedFoods,
                    totals: calculateTotalNutrition(updatedFoods),
                };
            }
            return meal;
        });

        const updatedLog: DailyLog = {
            ...currentLog,
            meals: updatedMeals,
            totals: calculateDailyTotals(updatedMeals),
        };

        if (todayLog) {
            updateDailyLog(todayDate, updatedLog);
        } else {
            addDailyLog(updatedLog);
        }

        setShowFoodModal(false);
        setSelectedFood(null);
        setQuantity('100');
        setSearchQuery('');
    };

    const handleRemoveFood = (index: number) => {
        if (!currentMeal) return;

        const updatedFoods = currentMeal.foods.filter((_, i) => i !== index);
        const updatedMeals = currentLog.meals.map(meal => {
            if (meal.type === selectedMealType) {
                return {
                    ...meal,
                    foods: updatedFoods,
                    totals: calculateTotalNutrition(updatedFoods),
                };
            }
            return meal;
        });

        const updatedLog: DailyLog = {
            ...currentLog,
            meals: updatedMeals,
            totals: calculateDailyTotals(updatedMeals),
        };

        updateDailyLog(todayDate, updatedLog);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Nutrition Tracking
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Log your meals and track your daily nutrition
                    </p>
                </div>

                {/* Daily Summary */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ProgressBar
                                current={dailyTotals.calories}
                                target={goals?.calories || 2000}
                                label="Calories"
                                unit=" kcal"
                            />
                            <ProgressBar
                                current={dailyTotals.protein}
                                target={goals?.protein || 150}
                                label="Protein"
                                unit="g"
                            />
                            <ProgressBar
                                current={dailyTotals.carbs}
                                target={goals?.carbs || 200}
                                label="Carbs"
                                unit="g"
                            />
                            <ProgressBar
                                current={dailyTotals.fats}
                                target={goals?.fats || 65}
                                label="Fats"
                                unit="g"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Meal Tabs */}
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map(mealType => (
                        <button
                            key={mealType}
                            onClick={() => setSelectedMealType(mealType)}
                            className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
                ${selectedMealType === mealType
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
              `}
                        >
                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Current Meal */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
                            </CardTitle>
                            <Button onClick={() => setShowFoodModal(true)} size="sm">
                                <Plus className="w-4 h-4" />
                                Add Food
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {currentMeal && currentMeal.foods.length > 0 ? (
                            <div className="space-y-3">
                                {currentMeal.foods.map((entry, idx) => {
                                    const nutrition = calculateFoodNutrition(entry.food, entry.quantity);
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {entry.food.name}
                                                    {entry.food.brand && (
                                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                            ({entry.food.brand})
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {entry.quantity}g • {Math.round(nutrition.calories)} kcal •
                                                    P: {nutrition.protein.toFixed(1)}g •
                                                    C: {nutrition.carbs.toFixed(1)}g •
                                                    F: {nutrition.fats.toFixed(1)}g
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFood(idx)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Meal Totals */}
                                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-200 dark:border-primary-800">
                                    <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                                        Meal Totals
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                                {Math.round(currentMeal.totals.calories)} kcal
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                                {currentMeal.totals.protein.toFixed(1)}g
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                                {currentMeal.totals.carbs.toFixed(1)}g
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Fats:</span>
                                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                                {currentMeal.totals.fats.toFixed(1)}g
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Utensils className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    No foods logged for this meal
                                </p>
                                <Button onClick={() => setShowFoodModal(true)} variant="primary">
                                    <Plus className="w-5 h-5" />
                                    Add Food
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Food Search Modal */}
            <Modal
                isOpen={showFoodModal}
                onClose={() => {
                    setShowFoodModal(false);
                    setSelectedFood(null);
                    setSearchQuery('');
                    setUseAPI(true); // Reset to API default
                }}
                title="Add Food"
                size="lg"
            >
                <div className="space-y-4">
                    {/* API Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                            {useAPI ? <Globe className="w-5 h-5 text-blue-600" /> : <Database className="w-5 h-5 text-gray-600" />}
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {useAPI ? 'USDA API (300,000+ foods)' : 'Local Database (35 foods)'}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {useAPI ? 'Search from comprehensive USDA database' : 'Quick access to common foods'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setUseAPI(!useAPI);
                                setSearchQuery('');
                                setSelectedFood(null);
                            }}
                            className={`
                px-4 py-2 rounded-lg font-medium transition-all text-sm
                ${useAPI
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }
              `}
                        >
                            {useAPI ? 'Switch to Local DB' : 'Switch to API'}
                        </button>
                    </div>

                    {/* Search */}
                    <Input
                        placeholder={useAPI ? "Search 300,000+ foods from USDA..." : "Search foods..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="w-5 h-5" />}
                    />

                    {/* Indian Food Suggestions (when using API) */}
                    {useAPI && !searchQuery && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Popular Indian Foods:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {indianFoodSuggestions.map(food => (
                                    <button
                                        key={food}
                                        onClick={() => setSearchQuery(food)}
                                        className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-green-100 dark:from-orange-900 dark:to-green-900 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium hover:from-orange-200 hover:to-green-200 dark:hover:from-orange-800 dark:hover:to-green-800 transition-all"
                                    >
                                        {food}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Category Filter (only for local database) */}
                    {!useAPI && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${selectedCategory === cat
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }
                  `}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Loading State */}
                    {isSearching && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Searching USDA database...</p>
                        </div>
                    )}

                    {/* Food List */}
                    {!isSearching && (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {filteredFoods.length > 0 ? (
                                filteredFoods.map(food => (
                                    <button
                                        key={food.id}
                                        onClick={() => setSelectedFood(food)}
                                        className={`
                      w-full text-left p-4 rounded-lg transition-all
                      ${selectedFood?.id === food.id
                                                ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500'
                                                : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                                            }
                    `}
                                    >
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {food.name}
                                            {food.brand && (
                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                    - {food.brand}
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                                            <span className="ml-2 text-xs">({food.servingSize}g)</span>
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                                    {searchQuery ? 'No foods found. Try a different search term.' : 'Start typing to search for foods'}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Quantity Input */}
                    {selectedFood && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Input
                                label="Quantity (grams)"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="100"
                            />

                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Nutrition Preview
                                </h4>
                                {(() => {
                                    const nutrition = calculateFoodNutrition(selectedFood, parseFloat(quantity) || 100);
                                    return (
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>Calories: <strong>{Math.round(nutrition.calories)} kcal</strong></div>
                                            <div>Protein: <strong>{nutrition.protein.toFixed(1)}g</strong></div>
                                            <div>Carbs: <strong>{nutrition.carbs.toFixed(1)}g</strong></div>
                                            <div>Fats: <strong>{nutrition.fats.toFixed(1)}g</strong></div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <Button
                                onClick={handleAddFood}
                                variant="primary"
                                className="w-full mt-4"
                            >
                                Add to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

function getEmptyNutrition() {
    return {
        calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, saturatedFat: 0,
        iron: 0, calcium: 0, magnesium: 0, zinc: 0, potassium: 0, sodium: 0,
        vitaminA: 0, vitaminB6: 0, vitaminB12: 0, vitaminC: 0, vitaminD: 0,
        vitaminE: 0, vitaminK: 0, folate: 0, thiamin: 0, riboflavin: 0, niacin: 0,
    };
}
