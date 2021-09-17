import React from 'react';
import { Route, BrowserRouter as Router, Switch, RouteProps } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import ProTip from '../Shared/ProTip';
import Copyright from '../Layout/Copyright';

const LinkIndex: React.FC<RouteProps> = (props) => {

   const html = (
       <Box my={4}>
         <img src="/images/logopig.png" className="App-logo" alt="logo" />
         <Typography variant="h4" component="h1" gutterBottom>
            Here is LinkIndex
        </Typography>
         <ProTip />
         <Copyright />
      </Box>
   )

   return html;
}

export default LinkIndex;
