import useSWR, { SWRResponse, SWRConfiguration } from 'swr'
import { httpGet } from './httpClient';
import { Folder, File } from '../Model/Api/AlbumApi';
import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';


const albumBaseUrl: string = `${process.env.REACT_APP_API_URL}/api/Album`;
const albumGetUrl: string = `${albumBaseUrl}/get`;


const swrOptions = {
   refreshInterval: 0,
   revalidateOnFocus: false,
   dedupingInterval: 3000     //default 2000
};

export const useAlbumList = () => {

  const { isSignedIn, getToken } = useGoogleAuth();

  const { data, error } = useSWR<Folder>(
     [albumGetUrl, isSignedIn ? getToken : undefined ],
     httpGet,
     { ...swrOptions, dedupingInterval: 60000 }
 );

 return {
  data: data,
     isLoading: !error && !data,
     error: error
 };
}
