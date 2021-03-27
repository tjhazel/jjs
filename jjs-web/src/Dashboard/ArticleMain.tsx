import React from 'react';
import Typography from '@material-ui/core/Typography';

import ArticleList from './ArticleList';
import ArticleNav from './ArticleNav';


const ArticleMain: React.FunctionComponent = (props) => {

   const html = (
      <>
         <Typography variant="h4" component="h1" gutterBottom>
            ArticleMain view
        </Typography>
         <ArticleList  {...props} />
         <ArticleNav {...props} />
      </>
   )

   return html;
}

export default ArticleMain;
