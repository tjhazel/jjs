import { useState, useEffect } from 'react';
import { Center, Paper, Container, Typography, Loader, Alert, Image } from "@mantine/core";
import Markdown from 'react-markdown';

// 1. Point to the public RAW format url of your main branch README.md
//const GITHUB_README_URL = "https://raw.githubusercontent.com/tjhazel/jjs/refs/heads/main/README.md";
const GITHUB_README_URL = "https://raw.githubusercontent.com/tjhazel/jjs/refs/heads/develop/README.md";

export default function AboutPage() {
   const [markdown, setMarkdown] = useState<string>("");
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      // 2. Fetch markdown plain text over HTTP on component initialization
      fetch(GITHUB_README_URL)
         .then((response) => {
            if (!response.ok) {
               throw new Error(`Failed to load repository history (${response.status})`);
            }
            return response.text();
         })
         .then((text) => {
            setMarkdown(text);
            setLoading(false);
         })
         .catch((err) => {
            setError(err.message || "An unexpected error occurred");
            setLoading(false);
         });
   }, []);

   return (
      <Center mih="100vh" bg="var(--mantine-color-gray-0)" p="xl">
         <Container size="lg" w="100%">
             <Image
               radius="md"
               h={200}
               src="/images/panorama.jpg"
            />

            <Paper radius="md" p="xl" withBorder bg="white" shadow="sm">

               {/* State 1: Loading state displays Mantine's theme loader spinner */}
               {loading && (
                  <Center h={200}>
                     <Loader color="blue" size="md" type="dots" />
                  </Center>
               )}

               {/* State 2: Error handling handles bad networks or 404 targets */}
               {error && (
                  <Alert variant="light" color="red" title="Network Error">
                     {error}. Please check the repository availability.
                  </Alert>
               )}

               {/* State 3: Active rendering pipeline parsing Markdown directly into layout tree */}
               {!loading && !error && (
                  <Typography>
                     <Markdown>{markdown}</Markdown>
                  </Typography>
               )}

            </Paper>
         </Container>
      </Center>
   );
}
