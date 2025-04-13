import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export const formatCurrency = (value: number, options?: { compact?: boolean }) => {
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    notation: options?.compact ? 'compact' : 'standard',
    maximumFractionDigits: 0
  });
  return formatter.format(value);
};

export const formatNumber = (value: number, options?: { compact?: boolean }) => {
  const formatter = new Intl.NumberFormat('pl-PL', {
    notation: options?.compact ? 'compact' : 'standard',
    maximumFractionDigits: 1
  });
  return formatter.format(value);
};

export const formatDate = (date: Date | string) => {
  return format(new Date(date), 'dd MMM yyyy', { locale: pl });
};

export const formatPercentage = (value: number) => {
  return `${value > 0 ? '+' : ''}${value}%`;
};