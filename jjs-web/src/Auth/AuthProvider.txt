import React, { useContext } from 'react'
import { useGoogleLogin, GoogleLoginHookReturnValue } from 'react-use-googlelogin'

/**
 * https://github.com/asyarb/react-use-googlelogin
 * https://github.com/asyarb/react-use-googlelogin/blob/master/examples/minimal-context/src/index.tsx
 * 
 * A helper to create a `context` and `Provider` with no upfront default value. Avoids
 * and having to check for undefined all the time in TS-land.
 *
 * In JS-Land, you could just use `React.createContext` as normal.
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

const [useGoogleAuth, AuthProvider] = createContext<
   GoogleLoginHookReturnValue
>()

export const GoogleAuthProvider: React.FC = ({ children }) => {
   console.log(`clientId: ${process.env.REACT_APP_CLIENT_ID}`)
   const hookData = useGoogleLogin({
      clientId: `${process.env.REACT_APP_CLIENT_ID}`,
      //clientId: `341131754174-cbaa5qsi8g59g9qvg44mrr11enopnhip.apps.googleusercontent.com`,
   })

   return <AuthProvider value={hookData}>{children}</AuthProvider>
}
export { useGoogleAuth }