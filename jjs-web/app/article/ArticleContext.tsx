"use client" 

import * as React from 'react';
import { useState } from 'react';

interface IArticleContext {
  message: string;
  updateMessage: (newMessage: string) => void;
}
export const ArticleContext = React.createContext<IArticleContext>({} as IArticleContext);
export const useArticleContext = () => React.useContext(ArticleContext);

interface IArticleContextProviderProps {
   children: React.ReactNode;
}

export const ArticleContextProvider: React.FC<IArticleContextProviderProps> = (props) => {
   
   const [message, setMessage] = useState<string>("Hello from Context!");

  const updateMessage = (newMessage: string) => {
    setMessage(newMessage);
  };
  
   return <ArticleContext.Provider 
      value={{
        message,
        updateMessage
}}>
      <ArticleContextProvider>
      { props.children }
     </ArticleContextProvider>
    </ArticleContext.Provider>;
};
