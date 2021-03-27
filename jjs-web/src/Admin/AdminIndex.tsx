import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';

const AdminIndex: React.FC = () => {

   const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();
   const html = (
       <Box my={4}>
         <img src="/images/logopig.png" className="App-logo" alt="logo" />
         <Typography variant="h4" component="h1" gutterBottom>
            Here is AdminIndex {googleUser?.profileObj?.name}
         </Typography>
      </Box>
   )

   return html;
}

export default AdminIndex;
