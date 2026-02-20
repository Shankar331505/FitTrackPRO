'use client';

import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
    current: number;
    target: number;
    label: string;
    unit?: string;
    showValues?: boolean;
    color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    target,
    label,
    unit = '',
    showValues = true,
    color = 'primary',
}) => {
    const percentage = Math.min((current / target) * 100, 100);
    const remaining = Math.max(target - current, 0);

    const colorClasses = {
        primary: 'bg-primary-600',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
    };

    // Determine color based on percentage
    let barColor = colorClasses[color];
    if (color === 'primary') {
        if (percentage >= 90 && percentage <= 110) {
            barColor = colorClasses.success;
        } else if (percentage > 110) {
            barColor = colorClasses.danger;
        } else if (percentage >= 70) {
            barColor = colorClasses.warning;
        }
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </span>
                {showValues && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {current.toFixed(1)}{unit} / {target.toFixed(1)}{unit}
                    </span>
                )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showValues && (
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(0)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {remaining > 0 ? `${remaining.toFixed(1)}${unit} remaining` : 'Goal reached!'}
                    </span>
                </div>
            )}
        </div>
    );
};
