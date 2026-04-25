"use client" 

import { HttpError, TGet } from "@/lib/httpClient";
import { Folder, IMAGE_PREFIX } from "./album-models";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";
import { useMemo } from "react";
import { text } from "stream/consumers";


export const albumBaseUrl = `api/album`;

export function useAlbum(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<Folder, HttpError>(
      albumBaseUrl,
      httpGet,
      { ...swrOptions }
   );

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}

export function useAlbumByPath(httpGet: TGet, path?: string) : { filteredData?: Folder | undefined, isLoading: boolean, error?: string } {
   const { data, isLoading, error } = useAlbum(httpGet);

   const filteredData = useMemo((): Folder | undefined => {

      if (data) {

         let currentFolder: Folder = data;
         if (!path || path.length <= 0) 
            return currentFolder;

         let matchedFolder: Folder | undefined;
         const pathParts = path.split('/').filter(part => part.length > 0);
         let currentSearchPath = IMAGE_PREFIX; 

         for (let idx = 0; idx < pathParts.length; idx++) {

            var currentPath = currentSearchPath + '/' + pathParts[idx];
            
            var nextFolder = findFolderByPath(data.folders, currentPath);
            if (!nextFolder) {
             //  console.info(`Folder not found for path: ${currentPath}`);
               continue;
            }
            
            currentSearchPath = currentPath; 
            currentFolder = nextFolder;

            if (currentPath === path) {
               matchedFolder = nextFolder;
               break;
            }
         }         

         return matchedFolder;
      }
      return undefined;
   }, [data, path]);

   return { filteredData, isLoading, error };
}

const findFolderByPath = (folders: Folder[], path: string): Folder | undefined => {
   for (let idx = 0; idx < folders?.length; idx++) {
    if (folders[idx].relativePath === path) {
      return folders[idx];
    }
    const found = findFolderByPath(folders[idx].folders, path);
    if (found) {
      return found;
    }
  }
  return undefined;
};