import React from 'react';
import { Link, Switch, Route, useRouteMatch } from 'react-router-dom';
import { Typography , MenuList, MenuItem, Paper,
   ListItemIcon, Icon, Grid, Container } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { useGoogleAuth } from '../Auth/AuthProvider';
import AlbumList from './AlbumList';
import PostIndex from './Post/PostIndex';
import PostEditor from './Post/PostEditor';

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
         <Paper 
         //className={classes.root}
         >
            <MenuList>
            <MenuItem>
               <ListItemIcon>
               <Icon className="fa fa-newspaper" />
               </ListItemIcon>
               <Typography variant="inherit">
                  <Link to={`/Admin/Post`}>
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
            <Route exact path='/Admin/Post' component={PostIndex} />                       
            <Route path='/Admin/Post/:postIdProp' component={PostEditor} />
            <Route path={`/Admin/AlbumList`} component={AlbumList}/>
         </Switch>
      </Container>
      </Grid>
   </Grid>
  );
}

export default AdminIndex;
