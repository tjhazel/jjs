import React from 'react';
import { Route, BrowserRouter as Router, Switch, RouteProps } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';

const AlbumIndex: React.SFC<RouteProps> = (props) => {

   const html = (
      <Box my={4}>
         <img src="/images/logopig.png" className="App-logo" alt="logo" />
         <Typography variant="h4" component="h1" gutterBottom>
            Here is AlbumIndex
            </Typography>
      </Box>
   )

   return html;
}

export default AlbumIndex;
