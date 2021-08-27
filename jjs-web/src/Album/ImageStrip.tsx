import React from 'react';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import IconButton from '@material-ui/core/IconButton';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import { File } from '../Model/Api/AlbumApi';

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

interface IProps {
   files: File[];
}


const ImageStrip: React.FC<IProps> = (props) => {
   const classes = useStyles();
  
   const files = props.files;

   return (
     <div className={classes.root}>
         <ImageList className={classes.imageList} cols={2.5}>
            {files.map((file, idx)  => (
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
   )

}

export default ImageStrip;
