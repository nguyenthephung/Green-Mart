import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
  suffix?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  className = '',
  label,
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  // Format number with thousands separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('vi-VN');
  };

  // Parse formatted string back to number
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/[.,\s]/g, '');
    const parsed = parseInt(cleaned) || 0;
    return Math.min(Math.max(parsed, min), max);
  };

  // Update display value when value prop changes
  useEffect(() => {
    setDisplayValue(value > 0 ? formatNumber(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only numbers, commas, dots, and spaces
    if (!/^[\d.,\s]*$/.test(inputValue)) {
      return;
    }

    setDisplayValue(inputValue);

    // Parse and update the actual value
    const numericValue = parseNumber(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Reformat on blur
    setDisplayValue(value > 0 ? formatNumber(value) : '');
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${className}`}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
      {/* Helper text showing formatted value */}
      {value > 0 && (
        <div className="text-xs text-gray-500">
          Giá trị: {formatNumber(value)}
          {suffix}
          {value >= 1000000 && (
            <span className="ml-2 text-green-600">({(value / 1000000).toFixed(1)} triệu)</span>
          )}
          {value >= 1000 && value < 1000000 && (
            <span className="ml-2 text-blue-600">({(value / 1000).toFixed(1)} nghìn)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default NumberInput;
