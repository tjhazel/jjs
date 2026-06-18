import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@mantine/core/styles.css';
// ‼️ import carousel styles after core package styles
import '@mantine/carousel/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { RootContextProvider } from "@components/RootContext.tsx";

const theme = createTheme({
   primaryColor: 'blue',
   fontFamily: 'Inter, sans-serif',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="light">
         <RootContextProvider>
            <App />
         </RootContextProvider>
    </MantineProvider>
  </StrictMode>,
)
