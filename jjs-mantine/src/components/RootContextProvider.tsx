import * as React from 'react';
import { useState } from 'react';
import { ApiContextProvider } from '@api/ApiContextProvider';
import { JJSAuthProvider } from '@lib/auth/authProvider';
import { RootContext } from './RootContext'; // Import context definition from Step 1

interface IRootContextProviderProps {
   children: React.ReactNode;
}

export const RootContextProvider: React.FC<IRootContextProviderProps> = (props) => {
   const [message, setMessage] = useState<string>("Hello from Context!");

   const updateMessage = (newMessage: string) => {
      setMessage(newMessage);
   };

   return (
      <JJSAuthProvider>
         <RootContext.Provider value={{ message, updateMessage }}>
            <ApiContextProvider>
               {props.children}
            </ApiContextProvider>
         </RootContext.Provider>
      </JJSAuthProvider>
   );
};
