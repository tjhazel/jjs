import React from 'react';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import IconButton from '@material-ui/core/IconButton';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import { File } from '../Model/Api/AlbumApi';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { BorderStyle } from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles((theme) => ({
   root: {
     display: 'flex',
     flexWrap: 'wrap',
     justifyContent: 'space-around',
     overflow: 'hidden',
     backgroundColor: theme.palette.background.paper,
   },
   imageList: {
      width:  'vw100',
      height: 'vh100',
   //   flexWrap: 'nowrap',
   //   // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
      transform: 'translateZ(0)',
   },
   imagehvr: {
      borderWidth: "5px",
      "&:hover": {
         borderColor:"#008080",
         borderStyle: "solid",
       //  transform: "scale(1.5)"
     }
   },
   title: {
     color: theme.palette.primary.light,
   },
   titleBar: {
     background:
       'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
   },
   media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
   
 }));

interface IProps {
   files: File[];
}


const ImageStrip: React.FC<IProps> = (props) => {
   const classes = useStyles();
   const [previewFile, setPreviewFile] = React.useState<File>(null);

   const files = props.files;

   const handleClick = (file: File) => {
      setPreviewFile(file);
    };

    const handleClose = () => {
      setPreviewFile(undefined);
    }

   return (
     <div className={classes.root}>
         <ImageList rowHeight={200} className={classes.imageList} cols={4}>
            {files.map((file, idx)  => (
               <ImageListItem key={file.relativePath??idx} title={file.comment}
               classes={{
                  root: classes.imagehvr
               }}>
                  <img src={file.httpPath} 
                     alt={file.comment}
                     onClick={() => handleClick(file)} />
                  <ImageListItemBar
                  title={file.comment}
                  classes={{
                     root: classes.titleBar,
                     title: classes.title,
                  }}
                  // actionIcon={
                  //    <IconButton aria-label={`star ${file.title}`}>
                  //       <StarBorderIcon className={classes.title} />
                  //    </IconButton>
                  //
                  // }
               />
            </ImageListItem>
            ))}
         </ImageList>

         <Dialog onClose={handleClose} open={previewFile?true:false}>
            {previewFile &&
            <Card className={classes.root}>
               <img src={previewFile.httpPath} 
                     alt={previewFile.comment}/>
               <CardMedia
               className={classes.media}
               image={previewFile.httpPath}
               title={previewFile.name}
               />
               <CardContent>
                  <Typography variant="body2" color="textSecondary" component="p">
                     {previewFile.comment??''}
                  </Typography>
               </CardContent>
            </Card>
            }
         </Dialog>
      </div>
   )

}

export default ImageStrip;
