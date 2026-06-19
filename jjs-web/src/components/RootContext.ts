import * as React from 'react';

export interface IRootContext {
   message: string;
   updateMessage: (newMessage: string) => void;
}

// Exporting only raw data objects/hooks allows Fast Refresh to track usage safely
export const RootContext = React.createContext<IRootContext>({} as IRootContext);

export const useRootContext = () => React.useContext(RootContext);
