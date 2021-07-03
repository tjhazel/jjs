import React, { useContext } from 'react'
import {
   useGoogleLogin,
   GoogleLoginHookReturnValue,
} from 'react-use-googlelogin'

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
   signIn: GoogleLoginHookReturnValue['grantOfflineAccess']
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
         }}
      >
         {children}
      </AuthProvider>
   )
}
export { useGoogleAuth }