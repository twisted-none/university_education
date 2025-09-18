// frontend/src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Хук для "отложенного" значения. Полезен для полей ввода,
 * чтобы не отправлять запрос на каждое нажатие клавиши.
 * @param value - Значение, которое нужно отложить
 * @param delay - Задержка в миллисекундах
 * @returns Отложенное значение
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем таймер, который обновит значение после задержки
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при каждом изменении значения или при размонтировании компонента
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}