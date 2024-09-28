import dayjs from 'dayjs';

export function formatCurrency(amount: number) {
  const isWholeNumber = Number.isInteger(amount);
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: isWholeNumber ? 0 : 0,
    maximumFractionDigits: 2
  });
}

export function formatDate(date: string) {
  const now = dayjs();
  const targetDate = dayjs(date);

  if (targetDate.isSame(now, 'day')) {
    return 'Today';
  } else if (targetDate.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  } else if (targetDate.isSame(now, 'week')) {
    return targetDate.format('ddd, D MMM YYYY');
  } else {
    return targetDate.format('D MMM YYYY');
  }
}
