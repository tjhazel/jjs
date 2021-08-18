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

import { makeStyles } from '@material-ui/core/styles';

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
            Here is AlbumIndex!
         </Typography>
      </Box>
      
      {data && data.folders &&

         data.folders.map((folder) => (
            <div>{folder.name}</div>
         ))         
      }

      <hr />
      {data && data.files &&

         <div className={classes.root}>
            <ImageList className={classes.imageList} cols={2.5}>
               {data.files.map((file, idx)  => (
                  <ImageListItem key={file.relativePath??idx}>
                  <img src={file.httpPath} alt={file.title} />
                  <ImageListItemBar
                  title={file.title}
                  classes={{
                     root: classes.titleBar,
                     title: classes.title,
                  }}
                  actionIcon={
                     <IconButton aria-label={`star ${file.title}`}>
                        <StarBorderIcon className={classes.title} />
                     </IconButton>
                  }
                  />
               </ImageListItem>
               ))}
            </ImageList>
         </div>
      }

      <hr />
      </>
   )

   return html;
}

export default AlbumIndex;
