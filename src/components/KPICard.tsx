import React from 'react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  trend, 
  icon, 
  className = '',
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 flex flex-col h-full ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">{title}</h3>
          {icon && (
            <div className="flex-shrink-0 text-blue-500 dark:text-blue-400 opacity-80">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
            {value}
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {trend.isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};