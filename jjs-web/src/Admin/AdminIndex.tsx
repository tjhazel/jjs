import React from 'react';
import { Link, Switch, Route, useRouteMatch } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';

import { useGoogleAuth } from '../Auth/AuthProvider';
import AlbumList from './AlbumList';
import ArticleList from './ArticleList';

const useStyles = makeStyles({
   root: {
     width: 230,
   },
 });

const AdminIndex: React.FC = () => {

   const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();
   const match = useRouteMatch;

   const classes = useStyles();
   
     return (
   <Grid container spacing={3}>
      <Grid item xs={2} spacing={3}>
         <Paper className={classes.root}>
            <MenuList>
            <MenuItem>
               <ListItemIcon>
               <Icon className="fa fa-newspaper" />
               </ListItemIcon>
               <Typography variant="inherit">
                  <Link to={`/Admin/ArticleList`}>
                     Articles
                  </Link>
               </Typography>
            </MenuItem>
            <MenuItem>
               <ListItemIcon>
               <Icon className="fa fa-plus-circle" />
               </ListItemIcon>
               <Typography variant="inherit" noWrap>                  
                  <Link to={`/Admin/AlbumList`}>
                     Edit Album
                  </Link>
               </Typography>
            </MenuItem>
            </MenuList>
         </Paper>
      </Grid>
      <Grid item xs={10}>
      <Container>
      <Switch>
         <Route path={`/Admin/ArticleList`} component={ArticleList}/>
         <Route path={`/Admin/AlbumList`} component={AlbumList}/>
        </Switch>
      </Container>
      </Grid>
   </Grid>
  );
}

export default AdminIndex;
