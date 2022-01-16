import * as React from 'react';
//import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { useCategoryList, useArticleList } from '../Data/ArticleFetcher';
import { PostCategorySummary, sortPostCategorySummary, Category } from '../Model/Api/ArticleApi';


interface CatSummary {
   category: Category;
   count: number;
}

interface SidebarProps {
   archives: ReadonlyArray<{
      url: string;
      title: string;
   }>;
   description: string;
   social: ReadonlyArray<{
      icon: React.ElementType;
      name: string;
   }>;
   title: string;
}

const ArticleNav: React.FunctionComponent = (props) => {

   const { data: catData, isLoading: catLoading, error: catError } = useCategoryList();
   const [catSummary, setCatSummary] = React.useState<CatSummary[]>([]);
   const { data, isLoading, error } = useArticleList();

   React.useEffect(() => {
      if (data && !isLoading && catData && !catLoading) {
         let tempCatSummary: CatSummary[] = [];
         catData.map((cat: Category) => {
            const cnt = data.filter(y => y.categoryId === cat.categoryId)?.length ?? 0;
            if (cnt > 0) {
               tempCatSummary.push({
                  category: cat,
                  count: cnt
               });
            }
         });
         setCatSummary(tempCatSummary);
      }

   }, [data, isLoading, catData, catLoading]);

   const html = (
      <Grid item xs={12} md={4}>
         <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.200' }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
               Categories
            </Typography>
            {catSummary.map((cat: CatSummary, index: number) => {
               return <>
                  <Link display="block" variant="body1" href={'/'} key={cat.category.categoryId}>
                     {cat.category.title}
                  </Link>
                  [{cat.count} Articles]
               </>
            })}
         </Paper>
    </Grid>

   )

   return html;
}

export default ArticleNav;
