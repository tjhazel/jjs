"use client" 

import { HttpError, TGet } from "@/lib/httpClient";
import { ArticleSummary } from "./article";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";
import { useMemo } from "react";


export const articleSummaryBaseUrl = `api/articles`;
export const getArticleSummaryUrl = (id: number) => `${articleSummaryBaseUrl}/${id}`;


export function useArticleSummarys(httpGet: TGet) {
  //  const { data, isValidating, error } = useSWR<ArticleSummary[], HttpError>(
  //     articleSummaryBaseUrl,
  //     httpGet,
  //     { ...swrOptions }
  //  );

   const { data, isValidating, error } = useMemo(() => {
      return {
        data: articles,
        isValidating: false,
        error: {} as HttpError
      }
   }, [])

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}


 const articles: ArticleSummary[] = [
    {
      id: 1,
      title: "Exploring New Zealand",
      date: "2025-07-15",
      excerpt:
        "A roundup of our favorite hikes and scenic spots in New Zealand.",
      href: "/article?cat=new%20zealand",
      imageSrc: "/images/articles/nz-hike.jpg",
    },
    {
      id: 2,
      title: "Evergreen Mountain Trails",
      date: "2025-06-10",
      excerpt: "Our go-to local hiking spots in Evergreen, Colorado.",
      href: "/article?cat=evergreen%20trails",
      imageSrc: "/images/articles/evergreen.jpg",
    },
    {
      id: 3,
      title: "Storm Chasers",
      date: "2025-06-10",
      excerpt: "Just a typical Sunday afternoon. Took the dog to the park, watched a little Olympic Water Polo, and saw my first tornado touch down.",
      href: "/article?cat=strom%20chasers",
      imageSrc: "/images/articles/storm-chaser.jpg",
    },
    {
      id: 4,
      title: "Hermosa Beach",
      date: "2017-06-10",
      excerpt: "A beach house with a view of volleyball players that are \"ESPN good\", a lively party crowd - what could possibly go wrong?",
      href: "/article?cat=hermosa-beach",
      imageSrc: "/images/articles/hermosa-beach.jpg",
    },
  ];