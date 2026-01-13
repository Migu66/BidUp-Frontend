'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-2 font-semibold
      rounded-xl transition-all duration-300 transform
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-primary to-primary-dark text-white
        hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5
        active:translate-y-0 active:shadow-md
        focus:ring-primary
      `,
      secondary: `
        bg-gradient-to-r from-secondary to-secondary-dark text-white
        hover:shadow-lg hover:shadow-secondary/30 hover:-translate-y-0.5
        active:translate-y-0 active:shadow-md
        focus:ring-secondary
      `,
      outline: `
        border-2 border-primary text-primary bg-transparent
        hover:bg-primary/10 hover:-translate-y-0.5
        active:translate-y-0
        focus:ring-primary
      `,
      ghost: `
        text-gray-300 bg-transparent
        hover:bg-white/10 hover:text-white
        focus:ring-white/20
      `,
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loader overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
            <svg
              className="w-5 h-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <span className={`flex items-center gap-2 ${isLoading ? 'invisible' : ''}`}>
          {leftIcon}
          {children}
          {rightIcon}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
