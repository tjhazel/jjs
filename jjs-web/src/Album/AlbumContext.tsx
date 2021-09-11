import * as React from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { useAlbumList } from '../Data/AlbumFetcher';
import { Folder } from '../Model/Api/AlbumApi';

export interface IAlbumRoute {albumPath: string}
interface IAlbumContextProps {
   isLoading: boolean;
   data?: Folder;
   error?: any;
   currentFolder?: Folder;
   breadcrumbs: IAlbumBreadcrumbs[];
}

interface IAlbumBreadcrumbs {
   title: string;
   link: string;
}

const defaultAlbumContextProps: IAlbumContextProps = {
   isLoading: false,
   breadcrumbs: []
}
export const AlbumContext = React.createContext<IAlbumContextProps>(defaultAlbumContextProps);
export const useAlbum = () => React.useContext(AlbumContext);

interface IAlbumContextProviderProps {
   children: React.ReactNode;
}

export const AlbumContextProvider: React.FC<IAlbumContextProviderProps> = (props) => {
   const [currentFolder, setCurrentFolder] = React.useState<Folder|undefined>(undefined);  
   let { path } = useRouteMatch();
    const {pathname } = useLocation();
    const [breadcrumbs, setBreadcrumbs] = React.useState<IAlbumBreadcrumbs[]>([]);  

   const { data, isLoading, error } = useAlbumList();

   React.useEffect(() => {
      if (data) {     
         const rp = parseRelativePath(pathname, path);
         let match: Folder | null = null;
         if (rp) {
            match = findFolder(rp, data);
         } 
         if (!match) match = data;

         setCurrentFolder(match);
         setBreadcrumbs(getBreadcrumbs(match.relativePath));
      }

   }, [path, pathname, data]);

   return (
      <AlbumContext.Provider
         value={{
            isLoading,
            data,
            error,
            currentFolder,
            breadcrumbs
         }}
      >
         {props.children}
      </AlbumContext.Provider>
   );
};

export const findFolder = (path: string, folder: Folder) : Folder | null => {

   if (folder) {
      if (folder.relativePath === path) {
         return folder;
      }

      if (folder.folders && folder.folders.length > 0) {
         for(let i=0; i < folder.folders.length; i++){
            const found = findFolder(path, folder.folders[i]);
            if (found) {
               return found;
            } 
         }
      } 
   }

   return null;
}

export const parseRelativePath = (path: string, rootName: string) => {
   if (!path || !rootName) return path;
   
   return path.replace(rootName, '');
}

export const getBreadcrumbs = (path: string) : IAlbumBreadcrumbs[] => {
   let currentPath = '/Album'; 
   const breadCrumbs: IAlbumBreadcrumbs[] = [{title: 'Home', link:  currentPath}];
   const pathParts = path.split('/');   

   //NOTE: length-1 to exclude the current folder from breadcrumbs
   for (let i=0; i < pathParts.length-1; i++) {
      if (pathParts[i] && pathParts[i] !== 'Image') {
         currentPath = currentPath + '/' + pathParts[i];
         breadCrumbs.push({title: pathParts[i], link: currentPath});
      }
   }
   return breadCrumbs;
}
