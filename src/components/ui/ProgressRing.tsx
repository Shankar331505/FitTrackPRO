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
    strokeWidth = 8,
    color = '#4f46e5',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min((current / target) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;

    // Determine color based on percentage
    let ringColor = color;
    if (percentage >= 90 && percentage <= 110) {
        ringColor = '#059669'; // emerald
    } else if (percentage > 110) {
        ringColor = '#dc2626'; // red
    } else if (percentage >= 70) {
        ringColor = '#d97706'; // amber
    }

    // Track color = ring color at 12% opacity
    const trackOpacity = '1a'; // 10% in hex

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    {/* Background circle — tinted to match ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`${ringColor}${trackOpacity}`}
                        strokeWidth={strokeWidth}
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
                        className="transition-all duration-700 ease-out"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-surface-900 dark:text-surface-50 tabular-nums">
                        {current.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-surface-500 dark:text-surface-400 font-medium">
                        / {target.toFixed(0)}{unit}
                    </span>
                </div>
            </div>
            <span className="mt-2 text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wider">
                {label}
            </span>
            <span className="text-[10px] text-surface-400 dark:text-surface-500 font-medium">
                {percentage.toFixed(0)}%
            </span>
        </div>
    );
};
