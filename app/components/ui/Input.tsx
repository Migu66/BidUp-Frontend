'use client';

import { forwardRef, useState, useRef, useImperativeHandle, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, onRightIconClick, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = Boolean(props.value);
    const inputRef = useRef<HTMLInputElement>(null);

    // Permite que el ref externo también funcione
    useImperativeHandle(ref, () => inputRef.current!);

    const focusInput = () => {
      inputRef.current?.focus();
    };

    return (
      <div className="relative">
        {/* Container del input */}
        <div
          className={`
            relative flex items-center rounded-xl border-2 transition-all duration-300
            bg-white/5 backdrop-blur-sm cursor-text
            ${isFocused 
              ? 'border-primary shadow-lg shadow-primary/20' 
              : error 
                ? 'border-red-500/50' 
                : 'border-white/10 hover:border-white/20'
            }
          `}
          onClick={focusInput}
        >
          {/* Icono izquierdo */}
          {icon && (
            <div 
              className={`
                pl-4 flex items-center justify-center flex-shrink-0 transition-colors duration-300 cursor-text
                ${isFocused ? 'text-primary' : 'text-gray-400'}
              `}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {icon}
              </span>
            </div>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            {...props}
            className={`
              w-full px-4 py-4 bg-transparent text-white placeholder-transparent
              focus:outline-none peer transition-all duration-300
              ${icon ? 'pl-3' : 'pl-4'}
              ${rightIcon ? 'pr-12' : 'pr-4'}
              ${className}
            `}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            placeholder={label}
          />

          {/* Label flotante */}
          <label
            className={`
              absolute transition-all duration-300 pointer-events-none
              ${icon 
                ? (isFocused || hasValue ? 'left-3' : 'left-12') 
                : 'left-4'
              }
              ${isFocused || hasValue
                ? '-top-2.5 text-xs px-2 bg-[#0a0a0f]'
                : 'top-4 text-base'
              }
              ${isFocused 
                ? 'text-primary' 
                : error 
                  ? 'text-red-400' 
                  : 'text-gray-400'
              }
            `}
          >
            {label}
          </label>

          {/* Icono derecho / botón */}
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={`
                absolute right-4 p-1 rounded-lg transition-all duration-300
                ${isFocused ? 'text-primary' : 'text-gray-400'}
                hover:text-white hover:bg-white/10
                focus:outline-none focus:ring-2 focus:ring-primary/50
              `}
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {/* Mensaje de error */}
        <div className={`
          overflow-hidden transition-all duration-300
          ${error ? 'max-h-10 opacity-100 mt-2' : 'max-h-0 opacity-0'}
        `}>
          <p className="text-red-400 text-sm flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{error}</span>
          </p>
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
