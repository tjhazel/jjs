import * as React from 'react';
import { Route, Redirect, RouteProps, RouteComponentProps } from 'react-router-dom';
import { //GoogleAuthProvider, 
   useGoogleAuth } from './AuthProvider';


export const PrivateRoute: React.FC<RouteProps> = props => {
   const { isSignedIn } = useGoogleAuth();

   if (isSignedIn) {
      return <Route {...props} />;
   } else {
      const renderComponent = () => <Redirect to='/Admin/AdminLogin' />;
      return <Route {...props} component={renderComponent} render={undefined} />;
   }
};

/* Designed to keep routes protected. Should implement a component to 
 * show the user if they attempted to access a protected page - for now
 * we just redirect to the dashboard.
   <ProtectedRoute
      userRoles={props.roles}
      allowedRoles={props.roles}
      path='/Seekrit'
      component={SeekritComponent}
      />
*/

//export function PrivateRoute({ ...routeProps }: RouteProps) {
//   const { isSignedIn } = useGoogleAuth();
//   if (isSignedIn) {
//      return <Route {...routeProps} />;
//   } else {
//      if (routeProps && routeProps.location)
//         console.error(`User does not have access to ${routeProps.location.pathname}`);
//      return <Redirect to='/' />
//   }
//};


//export class PrivateRoute extends Route<RouteProps> {
//   render() {

//      //const { isSignedIn } = useGoogleAuth();
//      const isSignedIn: boolean = false;
//      return (
//         <Route
//            {...this.props}
//            render={(props: RouteComponentProps) => {
//               if (!isSignedIn) {
//                  if (this.props.location)
//                     console.error(`User does not have access to ${this.props.location.pathname}`);
//                  return <Redirect to='/' />
//               }

//               if (this.props.component) {
//                  return React.createElement(this.props.component);
//               }

//               if (this.props.render) {
//                  return this.props.render(props);
//               }
//            }} />
//      );
//   }
//}

export default PrivateRoute;