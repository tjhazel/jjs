import React from 'react';
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import { Container, Grid } from '@mui/material';


//import ArticleMain from './ArticleMain';
import ArticleNav from './ArticleNav';
import ArticleList from './ArticleList';
import MainFeature from './MainFeature';

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
      <>
      <Container >
         <MainFeature />
      </Container>

      <Grid container spacing={2} border={0}>
         <Grid xs={1} />
         <Grid item xs={7}>
            <Grid container
               direction="row"
               justifyContent="space-evenly"
               alignItems="center">
               <DashbaordCarousel {...props} />
            </Grid>
            <Grid alignItems={'center'}>
               <ArticleList  {...props} />
            </Grid>
         </Grid>
         <Grid xs={2}>
            <ArticleNav {...props} />
         </Grid>
      </Grid>
      </>
      );
   return html;
}

export default DashboardIndex;
