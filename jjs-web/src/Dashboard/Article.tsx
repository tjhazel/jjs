import * as React from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import * as ArticleApi from '../Model/Api/ArticleApi';


interface OwnProps {
   article: ArticleApi.PostCategorySummary
}

type Props =
   & OwnProps;

const Article: React.FC<Props> = (props) => {

   const html = (
      <Paper 
      //className={classes.mainFeaturedPost} 
      style={{ backgroundImage: `url(${props.article.imageUrl??'./images/heri-bg.png'})` }}>
         {/* Increase the priority of the hero background image */}
         {<img style={{ display: 'none' }} src={props.article.imageUrl} />}
         <div 
         //className={classes.overlay} 
         />
         <Grid container>
            <Grid item>
               <div 
               //className={classes.mainFeaturedPostContent}
               >
                  <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                     {props.article.title}
                  </Typography>
                  <Typography variant="h5" color="inherit" paragraph>
                     <div dangerouslySetInnerHTML={{ __html: `${props.article.body}` }} />
                  </Typography>
               </div>
            </Grid>
         </Grid>
      </Paper>
   )

   return html;
}

export default Article;
