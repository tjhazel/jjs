import React from 'react';
import { Route, BrowserRouter as Router, Switch, useHistory, useLocation, useRouteMatch 
  // , RouteComponentProps 
} from 'react-router-dom';
//import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
//import Box from '@material-ui/core/Box';
import Header from './Layout/Header';
import RecipeIndex from './Recipe/RecipeIndex';
import LinkIndex from './Link/LinkIndex';
import AlbumIndex from './Album/AlbumIndex';
import DashboardIndex from './Dashboard/DashboardIndex';
import AdminIndex from './Admin/AdminIndex';
import Box from '@material-ui/core/Box';

import PrivateRoute from './Auth/PrivateRoute';
import { GoogleAuthProvider, useGoogleAuth } from './Auth/AuthProvider';

//const useStyles = makeStyles((theme) => ({
//   markdown: {
//      ...theme.typography.body2,
//      padding: theme.spacing(3, 0),
//   },
//}));

const App: React.FC = () => {

  

  // const classes = useStyles();
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
            <PrivateRoute
               path='/Admin'
               render={() => (
                isSignedIn ?
                <AdminIndex />:
                <button onClick={signIn}>Login</button>
               )}
            />
            <Route exact path='/' component={DashboardIndex} />
         </Switch>
     </Container>
  </Router>
  );
}

export default App;
