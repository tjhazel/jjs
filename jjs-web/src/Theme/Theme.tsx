import { createTheme } from '@mui/material';
import { red, blue, teal } from '@mui/material/colors';

//see: https://mui.com/customization/theming/#custom-variables
// declare module '@mui/material' {
//   interface Theme {
//     status: {
//       danger: string;
//     };
//   }
//   // allow configuration using `createTheme`
//   interface ThemeOptions {
//     status?: {
//       danger?: string;
//     };
//   }
// }

// A custom theme for this app
const Theme = createTheme({
  palette: {
    primary: {
      main: blue[500], //'#556cd6',
    },
    secondary: {
      main: teal[500], //'#19857b',
    },
    error: {
     main: red.A400,
   },
    background: {
      default: '#fff',
    },
  },
});

export default Theme;
