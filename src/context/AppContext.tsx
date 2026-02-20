'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, BodyMetrics } from '@/types/user';
import { DailyLog, Recipe, NutritionGoals } from '@/types/nutrition';
import { WorkoutLog, WorkoutGoal } from '@/types/exercise';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    doc, getDoc, setDoc, collection,
    getDocs, addDoc, updateDoc, query, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Firestore does not accept `undefined` values — replace them with null recursively
function sanitize<T>(obj: T): T {
    if (Array.isArray(obj)) return obj.map(sanitize) as unknown as T;
    if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : sanitize(v)])
        ) as T;
    }
    return obj;
}

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

const DEFAULT_PROFILE = (uid: string): UserProfile => ({
    id: uid,
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
        units: { weight: 'kg', distance: 'km', height: 'cm' },
    },
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [darkMode, setDarkMode] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Redirect to auth page if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
        }
    }, [user, authLoading, router]);

    // Load all user data from Firestore when the user logs in
    useEffect(() => {
        if (!user) {
            setUserProfileState(null);
            setDailyLogs([]);
            setRecipes([]);
            setWorkoutLogs([]);
            setDataLoaded(false);
            return;
        }

        const loadData = async () => {
            try {
                const uid = user.uid;

                // Load profile
                const profileRef = doc(db, 'users', uid, 'data', 'profile');
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    setUserProfileState(profileSnap.data() as UserProfile);
                } else {
                    // First time user — write default profile
                    const def = DEFAULT_PROFILE(uid);
                    await setDoc(profileRef, def);
                    setUserProfileState(def);
                }

                // Load daily logs
                const logsRef = collection(db, 'users', uid, 'dailyLogs');
                const logsSnap = await getDocs(query(logsRef, orderBy('date', 'desc')));
                setDailyLogs(logsSnap.docs.map(d => d.data() as DailyLog));

                // Load workout logs
                const workoutsRef = collection(db, 'users', uid, 'workoutLogs');
                const workoutsSnap = await getDocs(query(workoutsRef, orderBy('date', 'desc')));
                setWorkoutLogs(workoutsSnap.docs.map(d => d.data() as WorkoutLog));

                // Load recipes
                const recipesRef = collection(db, 'users', uid, 'recipes');
                const recipesSnap = await getDocs(recipesRef);
                setRecipes(recipesSnap.docs.map(d => d.data() as Recipe));

            } catch (err) {
                console.error('Error loading data from Firestore:', err);
            }
            setDataLoaded(true);
        };

        loadData();
    }, [user]);

    // Apply dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const setUserProfile = async (profile: UserProfile) => {
        setUserProfileState(profile);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid, 'data', 'profile'), sanitize(profile));
    };

    const addDailyLog = async (log: DailyLog) => {
        setDailyLogs(prev => {
            const filtered = prev.filter(l => l.date !== log.date);
            return [...filtered, log].sort((a, b) => b.date.localeCompare(a.date));
        });
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid, 'dailyLogs', log.date), sanitize(log));
    };

    const updateDailyLog = async (date: string, log: DailyLog) => {
        setDailyLogs(prev => {
            const filtered = prev.filter(l => l.date !== date);
            return [...filtered, log].sort((a, b) => b.date.localeCompare(a.date));
        });
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid, 'dailyLogs', date), sanitize(log));
    };

    const getTodayLog = (): DailyLog | undefined => {
        const today = new Date().toISOString().split('T')[0];
        return dailyLogs.find(log => log.date === today);
    };

    const addRecipe = async (recipe: Recipe) => {
        setRecipes(prev => [...prev, recipe]);
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid, 'recipes', recipe.id), sanitize(recipe));
    };

    const addWorkoutLog = async (log: WorkoutLog) => {
        setWorkoutLogs(prev => {
            const filtered = prev.filter(l => l.id !== log.id);
            return [...filtered, log].sort((a, b) => b.date.localeCompare(a.date));
        });
        if (!user) return;
        await setDoc(doc(db, 'users', user.uid, 'workoutLogs', log.id), sanitize(log));
    };

    const addBodyMetric = async (metric: BodyMetrics) => {
        if (!userProfile || !user) return;
        const updated: UserProfile = {
            ...userProfile,
            bodyMetrics: [...userProfile.bodyMetrics, metric].sort(
                (a, b) => b.date.localeCompare(a.date)
            ),
        };
        setUserProfileState(updated);
        await setDoc(doc(db, 'users', user.uid, 'data', 'profile'), sanitize(updated));
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

    // Don't render the app until auth state is known
    if (authLoading || (user && !dataLoaded)) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#0f172a',
            }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Loading...</div>
            </div>
        );
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
