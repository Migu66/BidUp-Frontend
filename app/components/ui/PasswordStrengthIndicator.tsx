'use client';

import type { PasswordStrength } from '@/app/types/auth';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  show: boolean;
}

export default function PasswordStrengthIndicator({ 
  strength, 
  show 
}: PasswordStrengthIndicatorProps) {
  const colors = {
    0: 'bg-gray-600',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-green-500',
    5: 'bg-green-500',
  };

  const requirements = [
    { key: 'length', label: 'Mínimo 8 caracteres', met: strength.requirements.length },
    { key: 'uppercase', label: 'Una letra mayúscula', met: strength.requirements.uppercase },
    { key: 'lowercase', label: 'Una letra minúscula', met: strength.requirements.lowercase },
    { key: 'number', label: 'Un número', met: strength.requirements.number },
    { key: 'symbol', label: 'Un símbolo', met: strength.requirements.symbol },
  ];

  return (
    <div
      className={`
        overflow-hidden transition-all duration-500 ease-out
        ${show ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'}
      `}
    >
      <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
        {/* Barra de fuerza */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Seguridad de la contraseña</span>
            <span 
              className={`text-xs font-medium transition-colors duration-300`}
              style={{ color: strength.color }}
            >
              {strength.label}
            </span>
          </div>
          
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`
                  h-1.5 flex-1 rounded-full transition-all duration-500
                  ${index < strength.score 
                    ? colors[strength.score as keyof typeof colors] 
                    : 'bg-gray-700'
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* Requisitos */}
        <div className="grid grid-cols-2 gap-2">
          {requirements.map(({ key, label, met }) => (
            <div
              key={key}
              className={`
                flex items-center gap-2 text-xs transition-all duration-300
                ${met ? 'text-green-400' : 'text-gray-500'}
              `}
            >
              <div className={`
                w-4 h-4 rounded-full flex items-center justify-center
                transition-all duration-300
                ${met 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-700 text-gray-500'
                }
              `}>
                {met ? (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
