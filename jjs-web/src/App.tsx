import React from 'react';
import { Route, BrowserRouter as Router, Switch
  // , RouteComponentProps , useHistory, useLocation, useRouteMatch 
} from 'react-router-dom';
import { Container, Box, Theme } from '@mui/material';
//import { makeStyles } from '@mui/styles';

//import Box from '@material-ui/core/Box';
import Header from './Layout/Header';
import RecipeIndex from './Recipe/RecipeIndex';
import LinkIndex from './Link/LinkIndex';
import AlbumIndex from './Album/AlbumIndex';
// import PostIndex from './Admin/Post/PostIndex';
// import PostEditor from './Admin/Post/PostEditor';

import DashboardIndex from './Dashboard/DashboardIndex';
import AdminIndex from './Admin/AdminIndex';
import PrivateRoute from './Auth/PrivateRoute';
import { GoogleAuthProvider, useGoogleAuth } from './Auth/AuthProvider';


const App: React.FC = () => {
  const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();
  //const history = useHistory();
  //const location = useLocation();

//console.log(history.location);
//console.log(location.pathname);

  return (
    <Router>
       <Container maxWidth="xl">
          <Header/>
          <Box my={4}>spacer</Box>
         <Switch>
            <Route path='/Album' component={AlbumIndex} />
            <Route exact path='/Recipe' component={RecipeIndex} />
            <Route exact path='/Link' component={LinkIndex} />
            <Route path='/Admin' component={AdminIndex} />
            {/* <PrivateRoute
               path='/Admin'
               render={() => (
                isSignedIn ?
                <AdminIndex />:
                <button onClick={signIn}>Login</button>
               )}
            > 
            </PrivateRoute>*/}
            <Route exact path='/' component={DashboardIndex} />
         </Switch>
     </Container>
  </Router>
  );
}

export default App;
