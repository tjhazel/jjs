"use client" 

import * as React from 'react';
import { ApiContextProvider } from './ApiContext';
import { useState } from 'react';

interface IRootContext {
  message: string;
  updateMessage: (newMessage: string) => void;
}
export const RootContext = React.createContext<IRootContext>({} as IRootContext);
export const useRootContext = () => React.useContext(RootContext);

interface IRootContextProviderProps {
   children: React.ReactNode;
}

export const RootContextProvider: React.FC<IRootContextProviderProps> = (props) => {
   
   const [message, setMessage] = useState<string>("Hello from Context!");

  const updateMessage = (newMessage: string) => {
    setMessage(newMessage);
  };
  
   return <RootContext.Provider 
      value={{
        message,
        updateMessage
}}>
      <ApiContextProvider>
      { props.children }
     </ApiContextProvider>
    </RootContext.Provider>;
};
