"use client" 
import { use } from 'react';
import { usePosts } from '@/api/post/post-fetcher';
import { useApiContext } from '@/components/context/ApiContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';


export default function ArticlePage(
  { params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); 

    const { httpGet } = useApiContext();
    const {data: posts} = usePosts(httpGet);

    if (!posts) return 'Loading...';

    const article = posts?.find(y => y.postId === Number(id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{article?.title}</CardTitle>
        <CardDescription>
          <b>Posted By:</b> {article?.createdBy}, on {article?.createdDate}
        </CardDescription>
      </CardHeader>
      <CardContent>{article?.body}</CardContent>
      <CardFooter><b>Views:</b>{article?.viewCount}</CardFooter>
    </Card>
  );
}
