import React from 'react';
//import * as Model from '../Model/Article';
import Article from './Article';
import { useArticleList } from './DataFetcher';
import { PostCategorySummary } from '../Model/Api/ArticleApi';
import { Container } from '@material-ui/core';
const ArticleList: React.FunctionComponent = (props) => {

   const { data, isLoading, error } = useArticleList();
   
   if (isLoading)
      return <>loading...</>;
   if (!data)
      return <>data  is not...</>;
   if (error)
      return <>error: {error}</>;

   const html = (
      <>
         Here is ArticleList
         {data.map((article: PostCategorySummary, index: number) => {
            return (
               <Container  key={`${index}_${article.postId}`}>
               <div>Article: {article.title}</div>
               <Article article={article} />
               </Container>
           )
         })}
      </>
   )

   return html;
}

export default ArticleList;
