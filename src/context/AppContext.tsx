'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, BodyMetrics } from '@/types/user';
import { DailyLog, Recipe, NutritionGoals } from '@/types/nutrition';
import { WorkoutLog, WorkoutGoal } from '@/types/exercise';

interface AppContextType {
    // User & Profile
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile) => void;

    // Nutrition
    dailyLogs: DailyLog[];
    addDailyLog: (log: DailyLog) => void;
    updateDailyLog: (date: string, log: DailyLog) => void;
    getTodayLog: () => DailyLog | undefined;

    // Recipes
    recipes: Recipe[];
    addRecipe: (recipe: Recipe) => void;

    // Workouts
    workoutLogs: WorkoutLog[];
    addWorkoutLog: (log: WorkoutLog) => void;

    // Body Metrics
    addBodyMetric: (metric: BodyMetrics) => void;

    // Dark Mode
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [darkMode, setDarkMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const loadData = () => {
            try {
                const savedProfile = localStorage.getItem('userProfile');
                const savedLogs = localStorage.getItem('dailyLogs');
                const savedRecipes = localStorage.getItem('recipes');
                const savedWorkouts = localStorage.getItem('workoutLogs');
                const savedDarkMode = localStorage.getItem('darkMode');

                if (savedProfile) setUserProfileState(JSON.parse(savedProfile));
                if (savedLogs) setDailyLogs(JSON.parse(savedLogs));
                if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
                if (savedWorkouts) setWorkoutLogs(JSON.parse(savedWorkouts));
                if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));

                // If no profile exists, create default
                if (!savedProfile) {
                    const defaultProfile: UserProfile = {
                        id: 'user-1',
                        name: 'User',
                        nutritionGoals: {
                            calories: 2000,
                            protein: 150,
                            carbs: 200,
                            fats: 65,
                            fiber: 30,
                            sugar: 50,
                            saturatedFat: 20,
                        },
                        workoutGoal: {
                            fitnessGoal: 'general',
                            experienceLevel: 'beginner',
                            workoutsPerWeek: 3,
                            preferredDuration: 60,
                            availableEquipment: ['bodyweight', 'dumbbell'],
                        },
                        bodyMetrics: [],
                        createdAt: new Date().toISOString(),
                        preferences: {
                            darkMode: false,
                            notifications: {
                                mealReminders: true,
                                workoutReminders: true,
                                hydrationReminders: true,
                            },
                            units: {
                                weight: 'kg',
                                distance: 'km',
                                height: 'cm',
                            },
                        },
                    };
                    setUserProfileState(defaultProfile);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
            setIsLoaded(true);
        };

        loadData();
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (!isLoaded) return;

        try {
            if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile));
            localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
            localStorage.setItem('recipes', JSON.stringify(recipes));
            localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
            localStorage.setItem('darkMode', JSON.stringify(darkMode));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }, [userProfile, dailyLogs, recipes, workoutLogs, darkMode, isLoaded]);

    // Apply dark mode class to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const setUserProfile = (profile: UserProfile) => {
        setUserProfileState(profile);
    };

    const addDailyLog = (log: DailyLog) => {
        setDailyLogs(prev => {
            const filtered = prev.filter(l => l.date !== log.date);
            return [...filtered, log].sort((a, b) => b.date.localeCompare(a.date));
        });
    };

    const updateDailyLog = (date: string, log: DailyLog) => {
        setDailyLogs(prev => {
            const filtered = prev.filter(l => l.date !== date);
            return [...filtered, log].sort((a, b) => b.date.localeCompare(a.date));
        });
    };

    const getTodayLog = (): DailyLog | undefined => {
        const today = new Date().toISOString().split('T')[0];
        return dailyLogs.find(log => log.date === today);
    };

    const addRecipe = (recipe: Recipe) => {
        setRecipes(prev => [...prev, recipe]);
    };

    const addWorkoutLog = (log: WorkoutLog) => {
        setWorkoutLogs(prev => {
            const filtered = prev.filter(l => l.id !== log.id);
            return [...filtered, log].sort((a, b) => b.date.localeCompare(a.date));
        });
    };

    const addBodyMetric = (metric: BodyMetrics) => {
        if (!userProfile) return;

        const updated: UserProfile = {
            ...userProfile,
            bodyMetrics: [...userProfile.bodyMetrics, metric].sort(
                (a, b) => b.date.localeCompare(a.date)
            ),
        };
        setUserProfile(updated);
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const value: AppContextType = {
        userProfile,
        setUserProfile,
        dailyLogs,
        addDailyLog,
        updateDailyLog,
        getTodayLog,
        recipes,
        addRecipe,
        workoutLogs,
        addWorkoutLog,
        addBodyMetric,
        darkMode,
        toggleDarkMode,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
