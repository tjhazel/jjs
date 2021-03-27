import React from 'react';
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import ProTip from '../Shared/ProTip';
import Copyright from '../Layout/Copyright';

import ArticleMain from './ArticleMain';
import AdminIndex from '../Admin/AdminIndex';

//import useSWR, { mutate } from 'swr';

const useStyles = makeStyles((theme) => ({
   markdown: {
      ...theme.typography.body2,
      padding: theme.spacing(3, 0),
   },
}));




const DashboardIndex: React.FunctionComponent<RouteComponentProps> = (props) => {
   const classes = useStyles();

  
   const html = (
      <>
         <img src="/images/logopig.png" className="App-logo" alt="logo" />
         <Typography variant="h4" component="h1" gutterBottom>
            DashboardIndex
        </Typography>
         <ArticleMain {...props} />
         <Typography variant="subtitle1" component="h1" gutterBottom>
            End of Articles
        </Typography>
      </>
      );
   return html;
}

export default DashboardIndex;
