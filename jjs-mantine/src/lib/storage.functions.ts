const sessionPrefix: string = 'ax';

const keyName = (name: string): string => {
   return `${sessionPrefix}${name}`;
}

export const setSessionItem = (key: string, value: any): void => {
   sessionStorage.setItem(keyName(key), JSON.stringify({ value }));
}


export const getSessionItem = <T>(key: string): T | null => {
   const data: string | null = sessionStorage.getItem(keyName(key));
   if (data !== null) {
      return JSON.parse(data).value;
   }
   return null;
}
