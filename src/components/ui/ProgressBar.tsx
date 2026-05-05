'use client';

import React from 'react';

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
        primary: 'bg-primary-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
    };

    const trackClasses = {
        primary: 'bg-primary-100 dark:bg-primary-950',
        success: 'bg-emerald-100 dark:bg-emerald-950',
        warning: 'bg-amber-100 dark:bg-amber-950',
        danger: 'bg-red-100 dark:bg-red-950',
    };

    // Determine color based on percentage
    let barColor = colorClasses[color];
    let trackColor = trackClasses[color];
    if (color === 'primary') {
        if (percentage >= 90 && percentage <= 110) {
            barColor = colorClasses.success;
            trackColor = trackClasses.success;
        } else if (percentage > 110) {
            barColor = colorClasses.danger;
            trackColor = trackClasses.danger;
        } else if (percentage >= 70) {
            barColor = colorClasses.warning;
            trackColor = trackClasses.warning;
        }
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wider">
                    {label}
                </span>
                {showValues && (
                    <span className="text-xs text-surface-500 dark:text-surface-400 tabular-nums font-medium">
                        {current.toFixed(1)}{unit} / {target.toFixed(1)}{unit}
                    </span>
                )}
            </div>
            <div className={`w-full ${trackColor} rounded-full h-2 overflow-hidden`}>
                <div
                    className={`h-full ${barColor} transition-all duration-700 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showValues && (
                <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] text-surface-400 dark:text-surface-500 font-medium tabular-nums">
                        {percentage.toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-surface-400 dark:text-surface-500 font-medium">
                        {remaining > 0 ? `${remaining.toFixed(1)}${unit} remaining` : 'Goal reached!'}
                    </span>
                </div>
            )}
        </div>
    );
};
