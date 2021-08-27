import React from 'react';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import IconButton from '@material-ui/core/IconButton';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { Folder } from '../Model/Api/AlbumApi';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    title: {
      flex: '1 1 100%',
    },
    titleGrid: {
      background: theme.palette.background.default,
    },
  }),
);

interface IProps {
   folders: Folder[];
}

const FolderMenu: React.FC<IProps> = (props) => {
   const classes = useStyles();
  
   const folders = props.folders;
   const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();
   return (
      <Paper className={classes.paper}>
      {folders.map((folder) => (
         <Grid container spacing={1} className={classes.title}>
            <Typography className={classes.title} variant="h5" id="tableTitle" component="div">
               <Link href="#" onClick={preventDefault}>
                  {folder.name}
               </Link>
            </Typography>
            {folder.folders && folder.folders.length > 0 && folder.folders.map((child) => (              
                <Grid item xs={3} spacing={3}>
                  <Typography  id="folder" component="div">
                     <Link href="#" onClick={preventDefault}>
                        {child.name}
                     </Link>
                  </Typography>
               </Grid>
            ))}

         </Grid>
      ))}
      </Paper>
   )

}

export default FolderMenu;
