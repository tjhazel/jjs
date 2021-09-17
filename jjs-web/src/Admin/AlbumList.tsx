import React from 'react';
import { Typography, makeStyles, Container } from '@mui/material';
// import { makeStyles } from '@material-ui/core/styles';
// import Container from '@material-ui/core/Container';

import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';
import { useArticleList } from '../Data/ArticleFetcher';


// const useStyles = makeStyles({
//    root: {
//      width: 230,
//    },
//  });

const AdminIndex: React.FC = () => {

   const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();

   //const classes = useStyles();

     return (
      <Container>
        <Typography component="div" style={{ backgroundColor: '#cfe8fc', height: '100vh' }}>
           Admin Album List  
        </Typography>
      </Container>
  );
}

export default AdminIndex;
