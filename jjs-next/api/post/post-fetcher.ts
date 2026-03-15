"use client" 

import { HttpError, TGet } from "@/lib/httpClient";
import { Post } from "./post";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";
//import { useMemo } from "react";


export const postBaseUrl = `api/post`;
export const getPostUrl = (id: number) => `${postBaseUrl}/${id}`;

export function usePosts(httpGet: TGet) {
  console.log('posting to this', postBaseUrl, httpGet)
   const { data, isValidating, error } = useSWR<Post[], HttpError>(
      postBaseUrl,
      httpGet,
      { ...swrOptions }
   );

  //  const { data, isValidating, error } = useMemo(() => {
  //     return {
  //       data: posts,
  //       isValidating: false,
  //       error: {} as HttpError
  //     }
  //  }, [])
console.log('result', data, error, isValidating)
   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}


//  const posts: Post[] = [
//     {
//       postId: 1,
//       title: "Exploring New Zealand",
//       previewText:
//         "A roundup of our favorite hikes and scenic spots in New Zealand.",
//       body: "blah, blah, blah",
//       createdDate: "2025-07-15",
//       createdBy: "john",
//       viewCount: 10,
//       categories: ["home", "vacation", "cat"],
//       href: "/article?cat=new%20zealand",
//       imageUrl: "/images/articles/nz-hike.jpg",
//       categoryIds: [],
//     },
//     {
//       postId: 2,
//       title: "Evergreen Mountain Trails",
//       previewText: "Our go-to local hiking spots in Evergreen, Colorado.",
//       body: "blah, blah, blah",
//       createdDate: "2025-06-10",
//       createdBy: "john",
//       viewCount: 10,
//       categories: ["home", "vacation", "cat"],
//       href: "/article?cat=evergreen%20trails",
//       imageSrc: "/images/articles/evergreen.jpg",
//     },
//     {
//       postId: 3,
//       title: "Storm Chasers",
//       previewText: "Just a typical Sunday afternoon. Took the dog to the park, watched a little Olympic Water Polo, and saw my first tornado touch down.",
//       body: "blah, blah, blah",
//       createdDate: "2025-06-10",
//       createdBy: "john",
//       viewCount: 10,
//       categories: ["home", "vacation", "cat"],
//       href: "/article?cat=strom%20chasers",
//       imageSrc: "/images/articles/storm-chaser.jpg",
//     },
//     {
//       postId: 4,
//       title: "Hermosa Beach",
//       previewText: "A beach house with a view of volleyball players that are \"ESPN good\", a lively party crowd - what could possibly go wrong?",
//       body: "blah, blah, blah",
//       createdDate: "2025-06-10",
//       createdBy: "john",
//       viewCount: 10,
//       categories: ["home", "vacation", "cat"],
//       href: "/article?cat=hermosa-beach",
//       imageSrc: "/images/articles/hermosa-beach.jpg",
//     },
//   ];