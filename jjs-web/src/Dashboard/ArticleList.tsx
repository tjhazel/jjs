import React from 'react';
//import * as Model from '../Model/Article';
import Article from './Article';
//import { useArticleList } from './DataFetcher';
import { PostCategorySummary, sortPostCategorySummary } from '../Model/Api/ArticleApi';
import { SortDirection } from '../Model/comparer.functions';

import { Container } from '@mui/material';

//import { WithHttpClient } from '../Data/WithHttpClient';
import { useArticleList } from '../Data/ArticleFetcher';

const ArticleList: React.FC = (props) => {

   const { data, isLoading, error } = useArticleList();
   const [filteredItems, setFilteredItems] = React.useState<PostCategorySummary[]>([]);

   React.useEffect(() => {
      if (data && !isLoading) {
         const articles = sortPostCategorySummary(data, 'createdDate', 'descending').slice(0, (data?.length ?? 0) > 10 ? 10 : (data?.length ?? 0));
         if (articles && articles?.length > 0) {
            setFilteredItems(articles);
         }
      }

   }, [data, isLoading]);

   if (isLoading)
      return <>loading...</>;
   if (!data)
      return <>data  is not...</>;
   if (error)
      return <>error: {error}</>;

   const html = (
      <>
         {filteredItems.map((article: PostCategorySummary, index: number) => {
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
