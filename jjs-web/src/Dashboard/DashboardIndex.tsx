import React from 'react';
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import { makeStyles, Typography, Grid } from '@mui/material';


//import ArticleMain from './ArticleMain';
import ArticleNav from './ArticleNav';
import ArticleList from './ArticleList';

import DashbaordCarousel from './DashbaordCarousel';

//import useSWR, { mutate } from 'swr';

// const useStyles = makeStyles((theme) => ({
//    markdown: {
//       ...theme.typography.body2,
//       padding: theme.spacing(3, 0),
//    },
// }));

const DashboardIndex: React.FC<RouteComponentProps> = (props) => {

   //const classes = useStyles();
  
   const html = (
      <Grid container spacing={2} border={0}>
         <Grid item xs={9}>
            <Grid container
               direction="row"
               justifyContent="space-evenly"
               alignItems="center">
               <DashbaordCarousel {...props} />
            </Grid>
            <Grid alignItems={'center'}>
               <Typography variant="h4" component="h1" gutterBottom>
                  Welcome to John, Jeri, and Sidney's site
               </Typography>
               <ArticleList  {...props} />
            </Grid>
         </Grid>
         <Grid item xs={3}>
            <ArticleNav {...props} />
         </Grid>
      </Grid>
      );
   return html;
}

export default DashboardIndex;
