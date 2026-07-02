import { useState, useEffect } from 'react';
import { Center, Paper, Container, Loader, Alert, Image } from "@mantine/core";
import Markdown from 'react-markdown';

const GITHUB_README_URL = "https://raw.githubusercontent.com/tjhazel/jjs/refs/heads/develop/README.md";

export default function AboutPage() {
   const [markdown, setMarkdown] = useState<string>("");
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
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

               {loading && (
                  <Center h={200}>
                     <Loader color="blue" size="md" type="dots" />
                  </Center>
               )}

               {error && (
                  <Alert variant="light" color="red" title="Network Error">
                     {error}. Please check the repository availability.
                  </Alert>
               )}

               {!loading && !error && (
                  <div className="mantine-typography">
                     <Markdown
                        components={{
                           a({ href, children }) {
                              return (
                                 <a href={href} target="_blank" rel="noopener noreferrer">
                                    {children}
                                 </a>
                              );
                           },
                           img({ src, alt }) {
                              return (
                                 <img
                                    src={src}
                                    alt={alt}
                                    style={{ maxWidth: '100%', borderRadius: 4 }}
                                 />
                              );
                           },
                        }}
                     >
                        {markdown}
                     </Markdown>
                  </div>
               )}

            </Paper>
         </Container>
      </Center>
   );
}
