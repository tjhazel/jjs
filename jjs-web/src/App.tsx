// src/App.tsx
import { RouterProvider } from "react-router";
import { MantineProvider, createTheme } from "@mantine/core";
import { RootContextProvider } from "@components/RootContextProvider.tsx";
import { router } from "./routes"; 

// Mantine global structural base styles must load here
import "@mantine/core/styles.css";
// ‼️ import carousel styles after core package styles
import '@mantine/carousel/styles.css';

const theme = createTheme({
   primaryColor: "blue",
   fontFamily: "Inter, sans-serif",
});

export default function App() {
   return (
      <RootContextProvider>
         <MantineProvider theme={theme}>
            <RouterProvider router={router} />
         </MantineProvider>
      </RootContextProvider>
   );
}
