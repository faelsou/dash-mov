import React from 'react';
import { ChartData } from '../../types';

interface BarChartProps {
  data: ChartData[];
  title: string;
  color?: string;
  showPercentage?: boolean;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  color = 'bg-blue-500',
  showPercentage = true,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 dark:text-white font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(item.value)}
                </span>
                {showPercentage && item.percentage && (
                  <span className="text-gray-500 dark:text-gray-400">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${color} transition-all duration-1000 ease-out`}
                style={{
                  width: `${(item.value / maxValue) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};