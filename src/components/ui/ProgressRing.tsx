'use client';

import React from 'react';

interface ProgressRingProps {
    current: number;
    target: number;
    label: string;
    unit?: string;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    current,
    target,
    label,
    unit = '',
    size = 120,
    strokeWidth = 10,
    color = '#0ea5e9',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min((current / target) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;

    // Determine color based on percentage
    let ringColor = color;
    if (percentage >= 90 && percentage <= 110) {
        ringColor = '#10b981'; // green
    } else if (percentage > 110) {
        ringColor = '#ef4444'; // red
    } else if (percentage >= 70) {
        ringColor = '#f59e0b'; // yellow
    }

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                        style={{
                            filter: 'drop-shadow(0 0 6px rgba(14, 165, 233, 0.4))',
                        }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {current.toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        / {target.toFixed(0)}{unit}
                    </span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
                {percentage.toFixed(0)}%
            </span>
        </div>
    );
};
