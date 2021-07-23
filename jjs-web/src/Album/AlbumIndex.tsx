import React from 'react';
import { Route, BrowserRouter as Router, Switch, RouteProps } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import ImageList from '@material-ui/core/ImageList';
import { useAlbumList } from '../Data/AlbumFetcher';

const AlbumIndex: React.SFC<RouteProps> = (props) => {

   const { data, isLoading, error } = useAlbumList();
   
   if (isLoading)
      return <>loading...</>;
   if (!data)
      return <>data  is not...</>;
   if (error)
      return <>error: {error}</>;

   const html = (
      <>
      <Box my={4}>
         <img src="/images/logopig.png" className="App-logo" alt="logo" />
         <Typography variant="h4" component="h1" gutterBottom>
            Here is AlbumIndex
         </Typography>
      </Box>
      {data && data.folders &&

         data.folders.map((folder) => (
            <div>{folder.name}</div>
         ))         
      }

      <hr />

      {data && data.files &&

         data.files.map((file) => (
            <div>{file.name}:{file.title}</div>
         ))         
         }
      </>
   )

   return html;
}

export default AlbumIndex;
