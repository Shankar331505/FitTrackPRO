'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-2 uppercase tracking-wider">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full px-4 py-2.5 rounded-xl 
              border ${error ? 'border-red-400' : 'border-surface-200 dark:border-surface-700'}
              bg-white dark:bg-surface-800 
              text-surface-900 dark:text-surface-100 
              placeholder-surface-400 dark:placeholder-surface-600
              focus:outline-none focus:ring-2 
              ${error ? 'focus:ring-red-500/30 focus:border-red-400' : 'focus:ring-primary-500/20 focus:border-primary-500'}
              transition-all duration-200 text-sm
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, rows = 4, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-2 uppercase tracking-wider">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    rows={rows}
                    className={`
            w-full px-4 py-2.5 rounded-xl 
            border ${error ? 'border-red-400' : 'border-surface-200 dark:border-surface-700'}
            bg-white dark:bg-surface-800 
            text-surface-900 dark:text-surface-100 
            placeholder-surface-400 dark:placeholder-surface-600
            focus:outline-none focus:ring-2 
            ${error ? 'focus:ring-red-500/30 focus:border-red-400' : 'focus:ring-primary-500/20 focus:border-primary-500'}
            transition-all duration-200 text-sm
            ${className}
          `}
                    {...props as any}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
