import React from 'react';
import { RouteProps } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import { AlbumContextProvider, useAlbum} from './AlbumContext';
import FolderMenu from './FolderMenu';
import ImageStrip from './ImageStrip';

const AlbumIndex: React.FC<RouteProps> = (props) => {
   return (
   <AlbumContextProvider>
      <AlbumFrame {...props} />
   </AlbumContextProvider>
   )
}

export default AlbumIndex;


const AlbumFrame: React.FC<RouteProps> = (props) => {
   const { currentFolder, breadcrumbs } = useAlbum();

   const handleClick = (arg: string) => {
      console.log(`clicked: ${arg}`)
   }

return (
   <>
      <Grid container spacing={1}>
         <Grid  spacing={1}>  
            {/* <img src="/images/logopig.png" className="App-logo" alt="logo" /> */}
            <Typography variant="h4" component="h1" gutterBottom>
               Photo Album
            </Typography>
         </Grid>
         <Grid style={{ paddingLeft: 20, display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
            <Breadcrumbs aria-label="breadcrumb">
               {breadcrumbs && breadcrumbs.length > 0 && breadcrumbs.map((crumb) => (
               <Link color="textPrimary" href={crumb.link} onClick={() => handleClick(crumb.link)}>
               {crumb.title}
               </Link>
               ))}
               <Typography color="textSecondary">{currentFolder?.name}</Typography>
            </Breadcrumbs>
         </Grid>
      </Grid>
      <Grid container spacing={1}>  
         {currentFolder && currentFolder.folders &&
         <Grid item>
            <FolderMenu folder={currentFolder} />
         </Grid>
         }
         <Grid item xs={12} sm container> 
            {currentFolder && currentFolder.files &&
               <ImageStrip files={currentFolder.files} />
            }
         </Grid>  
     </Grid>
  </>
   )
}


