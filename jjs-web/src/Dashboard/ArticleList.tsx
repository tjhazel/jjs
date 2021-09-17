import React from 'react';
//import * as Model from '../Model/Article';
import Article from './Article';
//import { useArticleList } from './DataFetcher';
import { PostCategorySummary } from '../Model/Api/ArticleApi';
import { Container } from '@mui/material';

//import { WithHttpClient } from '../Data/WithHttpClient';
import { useArticleList } from '../Data/ArticleFetcher';

const ArticleList: React.FC = (props) => {

   const { data, isLoading, error } = useArticleList();
   
   if (isLoading)
      return <>loading...</>;
   if (!data)
      return <>data  is not...</>;
   if (error)
      return <>error: {error}</>;

   const html = (
      <>
         {data.map((article: PostCategorySummary, index: number) => {
            return (
               <Container  key={`${index}_${article.postId}`}>
               <Article article={article} />
               </Container>
           )
         })}
      </>
   )

   return html;
}

export default ArticleList;
