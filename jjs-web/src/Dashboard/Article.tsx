import * as React from 'react';
import { useParams, RouteComponentProps } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import * as ArticleApi from '../Model/Api/ArticleApi';

const useStyles = makeStyles((theme) => ({
   mainFeaturedPost: {
      position: 'relative',
      backgroundColor: theme.palette.grey[800],
      color: theme.palette.common.white,
      marginBottom: theme.spacing(4),
      backgroundImage: 'url(https://source.unsplash.com/random)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
   },
   overlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,.3)',
   },
   mainFeaturedPostContent: {
      position: 'relative',
      padding: theme.spacing(3),
      [theme.breakpoints.up('md')]: {
         padding: theme.spacing(6),
         paddingRight: 0,
      },
   },
}));

interface OwnProps {
   article: ArticleApi.PostCategorySummary
}

type Props =
   //& RouteComponentProps<ArticleRouteProps>
   & OwnProps;

const Article: React.SFC<Props> = (props) => {

   //const { articleId } = useParams<ArticleRouteProps>();
   //console.log(`${articleId}`);

   const classes = useStyles();

   const html = (
      <Paper className={classes.mainFeaturedPost} style={{ backgroundImage: `url(${props.article.imageUrl})` }}>
         {/* Increase the priority of the hero background image */}
         {<img style={{ display: 'none' }} src={props.article.imageUrl} />}
         <div className={classes.overlay} />
         <Grid container>
            <Grid item md={6}>
               <div className={classes.mainFeaturedPostContent}>
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
