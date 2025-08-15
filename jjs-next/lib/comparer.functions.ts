
//pulled from ap to allow sorting on multiple functions
export const compare = <T>(
   a: T,
   b: T,
   funcs: Array<(a: T, b: T) => number>,
): number => funcs.reduce((prev: number, curr: (a: T, b: T) => number) => {

   if (prev !== 0) return prev;

   return curr(a, b);
}, 0);

export const stringComparer = (
   a: string,
   b: string,
): number => {

   if (a === null || a === undefined) return -1;
   if (b === null || b === undefined) return 1;

   const compA = a ? a.toLowerCase() : '';
   const compB = b ? b.toLowerCase() : '';

   return compA.localeCompare(compB);
};

export const numberComparer = (
   a: number,
   b: number,
): number => {
   if (a === null || a === undefined) return -1;
   if (b === null || b === undefined) return 1;

   if (a < b) return -1
   if (a > b) return 1
   return 0
};

export const stringOrNumberComparer = (
   a: string | number,
   b: string | number,
): number => {
   if (a === null || a === undefined) return -1;
   if (b === null || b === undefined) return 1;

   return typeof a === "number" ?
      numberComparer(a as number, b as number) :
      stringComparer(a as string, b as string);
};

export const dateComparer = (
   a: Date,
   b: Date,
): number => {
   if (a === null || a === undefined) return -1;
   if (b === null || b === undefined) return 1;

   if (a < b) return -1
   if (a > b) return 1
   return 0
};

export const boolComparer = (
   a: boolean,
   b: boolean,
): number => {
   if (a === null || a === undefined) return -1;
   if (b === null || b === undefined) return 1;

   if (a < b) return -1
   if (a > b) return 1
   return 0
};

export type SortDirection = 'ascending' | 'descending';
