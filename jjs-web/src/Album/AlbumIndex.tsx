import React from 'react';
import { Route, BrowserRouter as Router, Switch, RouteProps } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import IconButton from '@material-ui/core/IconButton';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import { useAlbumList } from '../Data/AlbumFetcher';
import FolderMenu from './FolderMenu';
import ImageStrip from './ImageStrip';

import { makeStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
   root: {
     display: 'flex',
     flexWrap: 'wrap',
     justifyContent: 'space-around',
     overflow: 'hidden',
     backgroundColor: theme.palette.background.paper,
   },
   imageList: {
     flexWrap: 'nowrap',
     // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
     transform: 'translateZ(0)',
   },
   title: {
     color: theme.palette.primary.light,
   },
   titleBar: {
     background:
       'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
   },
 }));

const AlbumIndex: React.FC<RouteProps> = (props) => {
   const classes = useStyles();
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
               Photo Album
            </Typography>
         </Box>
         {data && data.folders &&
            <FolderMenu folders={data.folders} />
         }
         <hr />
         {data && data.files &&
            <ImageStrip files={data.files} />
         }
      </>
   )

   return html;
}

export default AlbumIndex;
