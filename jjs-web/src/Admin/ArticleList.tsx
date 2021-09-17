import React from 'react';
import { Typography, Paper, Icon, Container, makeStyles,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
//import { makeStyles } from '@material-ui/core/styles';
// import Paper from '@material-ui/core/Paper';
// import Icon from '@material-ui/core/Icon';
// import Container from '@material-ui/core/Container';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';

import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';
import { useArticleList } from '../Data/ArticleFetcher';
import { PostCategorySummary } from '../Model/Api/ArticleApi';


// const useStyles = makeStyles({
//    root: {
//      width: 230,
//    },
//    table: {
//       minWidth: 650,
//     },
//  });

const AdminIndex: React.FC = () => {

   const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();

   //const classes = useStyles();

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
        Admin Article List  
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

export default AdminIndex;
