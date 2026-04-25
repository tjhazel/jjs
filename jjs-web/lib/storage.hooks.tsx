import { useEffect, useState } from 'react';
import { getSessionItem, setSessionItem } from './storage.functions';

function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
   const [storedValue, setStoredValue] = useState<T>(() => {
      if (typeof window !== 'undefined') {
         const item: T | null = getSessionItem<T>(key);
         return item ?? initialValue;
      }
      return initialValue;
   });

   const setValue = (value: T) => {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
         setSessionItem(key, value);
      }
   };

   useEffect(() => {
      if (typeof window !== 'undefined') {
         const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key) {
               setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
            }
         };

         //effort to tie session storage to the event to account for multiple tabs
         //https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
         window.addEventListener('storage', handleStorageChange);
         return () => window.removeEventListener('storage', handleStorageChange);
      }
   }, [key, initialValue]);

   return [storedValue, setValue];
}

export default useSessionStorage;