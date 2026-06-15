"use client";

import React from "react";
import ArticleCard from "./ArticleCard";
import { PostDetail } from "@/api/post/post";
import Card from "@/components/ui/card";

interface ArticleListProps {
  posts: PostDetail[]|undefined;
}

export default function ArticleList({ posts }: ArticleListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts?.map((post) => (
         <Card
            key={post.postId}
            title={post.title}
            previewText={post.previewText}
            previewLines={3}
            timestamp={new Date(post.createdDate)}
            imageUrl={post.imageUrl}
            link={`/article/post/${post.postId}`}
            footerText="Read more →"
        />
      ))}
    </div>
  );
}
