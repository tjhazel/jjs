import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';

import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';
import { useArticleList } from '../Data/ArticleFetcher';


const useStyles = makeStyles({
   root: {
     width: 230,
   },
 });

const AdminIndex: React.FC = () => {

   const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();

   const classes = useStyles();

     return (
      <Container>
        <Typography component="div" style={{ backgroundColor: '#cfe8fc', height: '100vh' }}>
           Admin Album List  
        </Typography>
      </Container>
  );
}

export default AdminIndex;
