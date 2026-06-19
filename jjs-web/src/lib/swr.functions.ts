import { mutate } from "swr";
import { stringComparer } from "./comparer.functions";

export const swrOptions = {
   refreshInterval: 0,
   revalidateOnFocus: false,
   dedupingInterval: 60000,
};

/*
 //mutate keys where the key is in array format, like so:
   const { data, isValidating, error } = useSWR<PagedList<EnrollmentStatusSearchResult>, HttpError>(
      [enrollmentStatusSearchUrl, params], //<--first parameter is a string
      fetcher,
      swrOptions
   );
*/
export const mutateKeysLike = (baseKey: string) => {  
   
   //mutate specific keys with matcher - results in no api calls
   if (baseKey) {
      mutate(
         key => {
            if (Array.isArray(key) && typeof key[0] === 'string') {
               return Array.isArray(key)  && key[0].indexOf(baseKey) > -1
            }
            return typeof key === 'string' && key.indexOf(baseKey) > -1
         },
         undefined,
         { revalidate: true }
      )
   }
}

export const mutateSearch = (baseKey: string, lastFetcheky: string) => {
   //mutate with default validation - should result in one api call
   if (lastFetcheky) {
      mutate(lastFetcheky);
   }
   //mutate specific keys with matcher - results in no api calls
   if (baseKey) {
      mutate(
         key => {
         //   console.log('match', typeof key === 'string' && key !== lastFetcheky && key.indexOf(baseKey) > -1, 'key', key)
            return typeof key === 'string' && key !== lastFetcheky && key.indexOf(baseKey) > -1
         },
         undefined,
         { revalidate: true }
      )
   }
}

export const createKey = (baseKey: string, obj: object) => `${baseKey}/${objectToSortedKey(obj)}`;

const objectToSortedKey = (obj: object): string => {
   if (obj) {
      const map = Object.entries(obj).map(([key, val]) => `${key}=${sortVal(val)}`.toLowerCase());
      const sortedMap = map.sort((a, b) => stringComparer(a, b));
      return sortedMap.join('&');
   }
   return '';
}

const sortVal = (val: any) => {
   if (val && Array.isArray(val)) {
      // Other data types may be fed in here so we need to ensure conversion to String to allow to sort without error
      const sortedVal = val.sort((a, b) => stringComparer(String(a), String(b)));
      return sortedVal;
   }
   return val;
}
