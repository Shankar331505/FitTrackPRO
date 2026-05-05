'use client';

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    glass = false,
    onClick
}) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-300';
    const hoverStyles = hover ? 'hover:shadow-lifted hover:border-primary-200 dark:hover:border-primary-800/50 cursor-pointer' : '';
    const glassStyles = glass
        ? 'glass'
        : 'bg-white dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/50 shadow-soft';

    return (
        <div
            className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
    return (
        <h3 className={`text-lg font-bold text-surface-900 dark:text-surface-50 tracking-tight ${className}`}>
            {children}
        </h3>
    );
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
    return (
        <div className={className}>
            {children}
        </div>
    );
};
