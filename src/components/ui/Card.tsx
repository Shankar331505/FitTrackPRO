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
    hover = true,
    glass = false,
    onClick
}) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-300';
    const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
    const glassStyles = glass
        ? 'glass'
        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg';

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
        <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`}>
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
