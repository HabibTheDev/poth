import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DateTime } from 'luxon';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const DateFormats = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  READABLE: 'MMMM D, YYYY',
  READABLE_DATETIME: 'MMMM D, YYYY h:mm A',
  SHORT: 'MMM D, YYYY',
  SHORT_TIME: 'MMM D, h:mm A',
};

export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format);
};

export const addDays = (date: Date, days: number): Date => {
  return dayjs(date).add(days, 'day').toDate();
};

export const subtractDays = (date: Date, days: number): Date => {
  return dayjs(date).subtract(days, 'day').toDate();
};

export const isExpired = (date: Date): boolean => {
  return dayjs(date).isBefore(dayjs());
};

export const getTimestamp = (): number => {
  return dayjs().valueOf();
};

export const parseDate = (date: string): Date => {
  return dayjs(date).toDate();
};

export const getStartOfDay = (date?: Date): Date => {
  return dayjs(date).startOf('day').toDate();
};

export const getEndOfDay = (date?: Date): Date => {
  return dayjs(date).endOf('day').toDate();
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export const fromNow = (date: Date | string): string => {
  return dayjs(date).fromNow();
};

/**
 * Check if date is after another date
 */
export const isAfter = (date: Date | string, compareDate: Date | string): boolean => {
  return dayjs(date).isAfter(compareDate);
};

/**
 * Check if date is before another date
 */
export const isBefore = (date: Date | string, compareDate: Date | string): boolean => {
  return dayjs(date).isBefore(compareDate);
};

/**
 * Get difference between dates in specified unit
 */
export const diff = (date: Date | string, compareDate: Date | string, unit: 'day' | 'hour' | 'minute' | 'second' = 'day'): number => {
  return dayjs(date).diff(compareDate, unit);
};

/**
 * Convert to ISO string
 */
export const toISOString = (date?: Date | string): string => {
  return dayjs(date).toISOString();
};

/**
 * Get current date/time
 */
export const now = (): Date => {
  return dayjs().toDate();
};

/**
 * Add time to date
 */
export const add = (date: Date | string, value: number, unit: 'day' | 'hour' | 'minute' | 'second' | 'month' | 'year'): Date => {
  return dayjs(date).add(value, unit).toDate();
};

/**
 * Subtract time from date
 */
export const subtract = (date: Date | string, value: number, unit: 'day' | 'hour' | 'minute' | 'second' | 'month' | 'year'): Date => {
  return dayjs(date).subtract(value, unit).toDate();
};


export function formatBookingTimesUTC0(booking: any) {
  return {
    ...booking,
    startTime: DateTime.fromISO(booking.startTime).setZone('UTC').toFormat('HH:mm'),
    endTime: DateTime.fromISO(booking.endTime).setZone('UTC').toFormat('HH:mm'),
  };
}