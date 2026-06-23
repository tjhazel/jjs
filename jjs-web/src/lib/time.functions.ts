import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// setup plugins for dayjs
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);

type GenericDate = Date
   | string
   | number
   | dayjs.Dayjs;

export const getMonth = (monthIndex: string | number): string|undefined => {
   try {
      if (monthIndex) {
         const _month: number = parseInt(String(monthIndex), 10);
         return new Date(2024, _month - 1, 1).toLocaleString('default', { month: 'long' });
      }
   } catch (ex) {
      console.error(`getMonth failed [${monthIndex}]`);
      console.error(ex);
   }  
}

export const isDateValid = (date: GenericDate, stringFormat = 'YYYY-MM-DD'): boolean => {
   if (typeof date === 'string' || date instanceof String)
      // with strings, we need the strict param else 2020-02-31 will be a valid date
      return dayjs(date, stringFormat, true).isValid();
   
   return dayjs(date).isValid();
}

// get functions //
export const getEndOfDay = (date: GenericDate): dayjs.Dayjs => {
   return dayjs(date).endOf('day');
}

export const getStartOfDay = (date: GenericDate): dayjs.Dayjs => {
   return dayjs(date).startOf('day');
}

export const getStartOfDayAsDate = (date: GenericDate): Date => {
   return getStartOfDay(date).toDate();
}

export const getEndOfDayAsDate = (date: GenericDate): Date => {
   return getEndOfDay(date).toDate();
}

export const getDayjs = (date: GenericDate, format?: string): dayjs.Dayjs => {
   if (format)
      dayjs(date, format);

   return dayjs(date); // this is primarily to avoid including direct DayJS dependencies elsewhere
}

// formatting functions //
export const getFromNowDateString = (date: GenericDate): string => {
   return dayjs(date).fromNow();
}
//created to mimic the 'getDaysSinceSent' function in AP used for PendingSignatures
export const getDaysFromNowDateString = (date: GenericDate): string => {
   const today = dayjs(new Date());
   const pastDate = dayjs(date);
   const diff = Math.round(today.diff(pastDate, 'day', true));
   return `${diff} ${diff > 1 ? 'days' : 'day'} ago`
}

export const formatDate = (date: GenericDate, format: string = "MM/DD/YYYY"): string => {
   if (!date)
      return "";

   return dayjs(date).format(format);
}

export const formatDateLong = (date: GenericDate): string => {
   if (!date)
      return "";

   return dayjs(date).format("MM/DD/YYYY HH:mm A");
}

// comparison functions //
export const isDateAfter = (beforeDate: GenericDate, afterDate: GenericDate, units: dayjs.OpUnitType = 'millisecond'): boolean => {
   return dayjs(beforeDate).isAfter(dayjs(afterDate), units);
}

export const compareDates = (firstDate: GenericDate, secondDate: GenericDate): boolean => {
   if (!firstDate || !secondDate)
      return false;

   return dayjs(firstDate).isSame(dayjs(secondDate));
}

export const isSameDayOrBefore = (firstDate: GenericDate, secondDate: GenericDate): boolean => {
   return dayjs(firstDate).isSameOrBefore(dayjs(secondDate), 'day');
}

export const isWithinDaysAgo = (firstDate: GenericDate, days: number): boolean => {
   const maxDate = dayjs(new Date()).add(-(days ?? 0), 'day');
   const result = isSameDayOrBefore(maxDate, firstDate);
   return result;
}

export const DateRangeFormat = 'MM/DD/YYYY';
export const getDateRange = (rangeString: string) => {
   if (rangeString !== null && rangeString?.indexOf('|') > -1) {
      const parts = rangeString.split('|');
      if (parts.length === 2) {
         const dateFrom = getDayjs(parts[0], DateRangeFormat).toDate();
         const dateTo = getDayjs(parts[1], DateRangeFormat).toDate();
         return [dateFrom, dateTo]
      }
   }
   return undefined;
}
export const getDateRangeString = (range: Date[]) => {
   if (range?.length === 2) {
      const range0 = getDayjs(range[0]).format(DateRangeFormat);
      const range1 = getDayjs(range[1]).format(DateRangeFormat);
      const dateRangeString = `${range0}|${range1}`
      return dateRangeString;
   }
   return undefined;
}