import React from 'react';
import Typography from '@material-ui/core/Typography';

import ArticleList from './ArticleList';
import ArticleNav from './ArticleNav';


const ArticleMain: React.FC = (props) => {

   const html = (
      <>
         <ArticleList  {...props} />
         <ArticleNav {...props} />
      </>
   )

   return html;
}

export default ArticleMain;
