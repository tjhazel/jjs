import React from 'react';
import { Typography, Paper, Icon, Container, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
  import { makeStyles } from '@mui/styles';

import { GoogleAuthProvider, useGoogleAuth } from '../../Auth/AuthProvider';
import { useArticleList } from '../../Data/ArticleFetcher';
import { PostCategorySummary } from '../../Model/Api/ArticleApi';
import { RouteComponentProps, useParams } from 'react-router';


const useStyles = makeStyles({
   root: {
     width: 230,
   },
   table: {
      minWidth: 650,
    },
 });

 export interface IPostEditorProps {  
  postIdProp: string;
}

const PostEditor: React.FC<RouteComponentProps<IPostEditorProps>> = () => {

  const { postIdProp } = useParams<IPostEditorProps>();

   const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();

   const classes = useStyles();

   const { data, isLoading, error } = useArticleList();
   
   if (isLoading)
      return <>loading...</>;
   if (!data)
      return <>data  is not...</>;
   if (error)
      return <>error: {error}</>;

     return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Post Editor  {`articleIdProp: ${postIdProp}`}
        </Typography>
        <TableContainer component={Paper}>
        <Table 
        //className={classes.table} 
        aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="left">Title</TableCell>
              <TableCell align="left">Release Date</TableCell>
              <TableCell align="center">Approved</TableCell>
              <TableCell align="left">View Count</TableCell>
              <TableCell align="left">Created Date</TableCell>
              <TableCell align="left">Modified By</TableCell>
          </TableRow>
          </TableHead>
          <TableBody>
            {data.map((article: PostCategorySummary) => (
              <TableRow  key={article.postId}>
                <TableCell component="th" scope="row">
                <Icon className="fa fa-edit" />
                </TableCell>
                <TableCell align="left">{article.title}</TableCell>
                <TableCell align="left">{article.releaseDate}</TableCell>
                <TableCell align="center">{article.approved}</TableCell>
                <TableCell align="left">{article.viewCount}</TableCell>
                <TableCell align="left">{article.createdDate}</TableCell>
                <TableCell align="left">{article.modifiedBy}</TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default PostEditor;
