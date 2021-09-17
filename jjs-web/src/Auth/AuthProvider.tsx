import React, { useContext } from 'react'
import {
   useGoogleLogin,
   GoogleLoginHookReturnValue,
} from 'react-use-googlelogin'
import {User} from '../Model/Api/UserApi';
import {httpGet} from '../Data/httpClient';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

interface ContextValue
   extends Omit<
   GoogleLoginHookReturnValue,
   'signIn' | 'refreshUser' | 'grantOfflineAccess'
   > {
   getToken: () => Promise<string>,
   fetchWithRefresh: (
      inupt: RequestInfo,
      init?: RequestInit
   ) => Promise<Response>
   signIn: GoogleLoginHookReturnValue['grantOfflineAccess'],
   currentUser?: User
}

/**
 * TS helper for using React.createContext() without needing
 * to check for `undefined` all the time. If you are using JS, feel free
 * to just use React.createContext() directly.
 */
const createContext = <A extends {} | null>() => {
   const ctx = React.createContext<A | undefined>(undefined)

   const useCtx = () => {
      const contextValue = useContext(ctx)

      if (contextValue === undefined)
         throw new Error('useCtx must be inside a Provider with a value')

      return contextValue
   }

   return [useCtx, ctx.Provider] as const
}

const [useGoogleAuth, AuthProvider] = createContext<ContextValue>();

export const GoogleAuthProvider: React.FC = ({ children }) => {
   const [currentUser, setCurrentUser] = React.useState<User>();

   const {
      googleUser,
      isInitialized,
      grantOfflineAccess,
      signOut,
      isSignedIn,
      refreshUser,
   } = useGoogleLogin({
      clientId: `${process.env.REACT_APP_CLIENT_ID}`,
   })

   /**
   * A wrapper function to automatically refresh
   * `accessToken` if it is within 5 minutes of expiring.
   */
   const getToken: ContextValue['getToken'] = async () => {
      //let accessToken = googleUser?.accessToken
      let accessToken = googleUser?.tokenId
      console.log(googleUser)

      // The token is within 5 minutes of expiring
      const shouldRefreshToken = googleUser && googleUser.expiresAt ?
         (googleUser.expiresAt - 300 * 1000 - Date.now() <= 0) : 0;

      if (shouldRefreshToken) {
         const tokenObj = await refreshUser()
         accessToken = tokenObj?.accessToken ?? accessToken
      }

      return `${accessToken}`;
   }

   // const __getToken = async () => {
   //    return await getToken();
   // }

   /**
    * A wrapper function around `fetch` that handles automatically refreshing
    * our `accessToken` if it is within 5 minutes of expiring.
    *
    * Behaves identically to `fetch` otherwise.
    */
   const fetchWithRefresh: ContextValue['fetchWithRefresh'] = async (
      input,
      init
   ) => {
      let accessToken = googleUser?.accessToken
      // The token is within 5 minutes of expiring
      const shouldRefreshToken = googleUser && googleUser.expiresAt ?
         (googleUser.expiresAt - 300 * 1000 - Date.now() <= 0) : 0;

      if (shouldRefreshToken) {
         const tokenObj = await refreshUser()
         accessToken = tokenObj?.accessToken ?? accessToken
      }

      return fetch(input, {
         ...init,
         headers: {
            ...init?.headers,
            Authorization: `Bearer ${accessToken}`,
         },
      })
   }

   React.useEffect(() => {  
      if (!currentUser) {    
         setUserInContext();
      }
   }, [googleUser]);

   const setUserInContext = async () => {
      const url: string = `${process.env.REACT_APP_API_URL}/api/Auth/GetCurrentUser`;
      return httpGet<User>(url, getToken).then((response) => {
                           setCurrentUser(response);
                        });      
  }


//    const setUserInContext = async () => {
//       try {
//          const url: string = `${process.env.REACT_APP_API_URL}/api/Auth`;
//          const token = await getToken();
//          const options: AxiosRequestConfig = {
//             headers: {
//                'Content-Type': 'application/json',
//                'Authorization': `Bearer ${token}`
//             }
//          }

//          return new Promise<User>(async(resolve, reject) => {
//             axios
//                .get(url, options)
//                .then((response: any) => {
//                   const theUser = response.data as User;
//                   setCurrentUser(theUser);
//                   resolve(theUser)
//                })
//                .catch((response: AxiosError) => {
//                   console.error("Failed to get current user!");
//                   console.error(response);
//                   reject(response);
//                });
//          })

//     } catch (err) {
//         console.error("Failed to set current user in context!");
//         console.error(err);
//         throw err; 
//     }
//   }

   return (
      <AuthProvider
         value={{
            signIn: grantOfflineAccess,
            isSignedIn,
            isInitialized,
            googleUser,
            signOut,
            getToken,
            fetchWithRefresh,
            currentUser
         }}
      >
         {children}
      </AuthProvider>
   )
}
export { useGoogleAuth }