import React from 'react';
import {  useLocation, useRouteMatch 
   // , RouteComponentProps 
 } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { Folder } from '../Model/Api/AlbumApi';
import { useAlbum } from './AlbumContext';

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
   folder: Folder | undefined;
}

const FolderMenu: React.FC<IProps> = (props) => {
   const classes = useStyles();
   return (<>
      {props.folder &&
         <Paper className={classes.paper}>
            <List dense={true}>
            {props.folder.folders && props.folder.folders.length > 0 && props.folder.folders.map((child) => (              
               <ListItem>
                  <Typography  id="folder" component="div">
                     <Link href={`/Album${child.relativePath}`}>
                        {child.name}
                     </Link>
                  </Typography>
               </ListItem>
            ))}
          </List>
      </Paper>     
      }
   </>)

}

export default FolderMenu;
