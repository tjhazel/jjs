import React from 'react';
import { Route, BrowserRouter as Router, Switch, RouteProps } from 'react-router-dom';
import {Typography, Box} from '@mui/material';

const RecipeIndex: React.SFC<RouteProps> = (props) => {

   const html = (
        <Box my={4}>
         <img src="/images/logopig.png" className="App-logo" alt="logo" />
         <Typography variant="h4" component="h1" gutterBottom>
            Here is RecipeIndex
         </Typography>
      </Box>
   )

   return html;
}

export default RecipeIndex;
