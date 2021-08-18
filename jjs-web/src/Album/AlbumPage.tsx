import React from 'react';
import { Route, BrowserRouter as Router, Switch, RouteProps } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import { useAlbumList } from '../Data/AlbumFetcher';
import { File, Folder } from '../Model/Api/AlbumApi';

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
    width: 500,
    height: 450,
  },
}));

interface IProps {
   files: File[];
}


const AlbumPage: React.FC<IProps> = (props) => {
   const classes = useStyles();
  
   const files = props.files;

   const html = (      <>
     
      {files && 

         <div className={classes.root}>
            <ImageList rowHeight={160} className={classes.imageList} cols={3}>
               {files.map((file, idx)  => (
                  <ImageListItem key={idx} cols={3 || 1}>
                     <img src={file.httpPath} alt={file.title} title='test' />
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

export default AlbumPage;
