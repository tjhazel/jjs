import { useSearchParams, useNavigate } from "react-router"; 
import { useApiContext } from "@api/ApiContext";
import { useAlbumByPath } from "@api/album/album-fetcher";
import { IMAGE_PREFIX } from "@api/album/album-models";
import {
   Title,
   Text,
   SimpleGrid,
   Loader,
   Center,
   Anchor,
   Box,
   Image,
   Card,
   Stack,
   Group
} from "@mantine/core";

export default function AlbumPage() {
   const { httpGet } = useApiContext();
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();

   const path = searchParams.get("path") || undefined;

   // Clean up the logical URL path string by clipping the structural IMAGE_PREFIX
   const logicalPath = path?.replace(new RegExp("^" + IMAGE_PREFIX), "") || undefined;

   const { filteredData, isLoading, error } = useAlbumByPath(httpGet, path);

   // Helper to handle link changes cleanly using client side history navigation push triggers
   const navigateToPath = (targetPath?: string) => {
      if (targetPath) {
         navigate(`/album?path=${encodeURIComponent(targetPath)}`);
      } else {
         navigate("/album");
      }
   };

   if (isLoading) {
      return (
         <Center py="xl">
            <Stack align="center" gap="xs">
               <Loader size="lg" type="dots" />
               <Text size="sm" c="dimmed">Loading album...</Text>
            </Stack>
         </Center>
      );
   }

   if (error) {
      return (
         <Center py="xl">
            <Text c="red">Failed to load content. Please try refreshing.</Text>
         </Center>
      );
   }

   return (
      <Stack gap="xl">
         {/* ─── Header & Breadcrumbs Section ─── */}
         <Stack gap="xs">
            <Title order={1} fw={600}>
               {path ? "Album" : "Photos"}
            </Title>

            {/* Responsive horizontal breadcrumb list wrapper layout container */}
            <Group gap="xs" wrap="nowrap" style={{ overflowX: "auto", paddingBottom: "8px" }}>
               {/* Base Root Level Pointer */}
               <Anchor component="button" type="button" size="sm" onClick={() => navigateToPath(IMAGE_PREFIX)}>
                  Photos
               </Anchor>

               {/* 🔴 FIXED: Cleared orphaned duplicate tags. Safely maps path tokens sequentially */}
               {logicalPath && logicalPath.split("/").filter(Boolean).map((segment, index, segments) => {
                  const breadcrumbPath = segments.slice(0, index + 1).join("/");
                  const isLast = index === segments.length - 1;

                  return (
                     <Group gap="xs" key={index} wrap="nowrap">
                        <Text size="sm" c="dimmed">/</Text>
                        {isLast ? (
                           <Text size="sm" fw={500}>{segment}</Text>
                        ) : (
                           <Anchor
                              component="button"
                              type="button"
                              size="sm"
                              onClick={() => navigateToPath(`${IMAGE_PREFIX}${breadcrumbPath}/`)}
                           >
                              {segment}
                           </Anchor>
                        )}
                     </Group>
                  );
               })}
            </Group>
         </Stack>

         {/* ─── Folders View Section ─── */}
         {filteredData?.folders && filteredData.folders.length > 0 && (
            <Stack gap="sm">
               <Title order={2} size="h4" fw={600}>Folders</Title>
               <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                  {filteredData.folders.map((folder, index) => (
                     <Card
                        key={index}
                        withBorder
                        padding="md"
                        radius="sm"
                        shadow="xs"
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => navigateToPath(folder.relativePath)}
                     >
                        <Text size="xl" mb="xs">📁</Text>
                        <Text size="sm" fw={500} truncate>
                           {folder.name}
                        </Text>
                     </Card>
                  ))}
               </SimpleGrid>
            </Stack>
         )}

         {/* ─── Images Grid Section ─── */}
         {filteredData?.files && filteredData.files.length > 0 && (
            <Stack gap="sm">
               <Title order={2} size="h4" fw={600}>
                  Photos {filteredData.files.length > 0 && `(${filteredData.files.length})`}
               </Title>
               <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                  {filteredData.files.map((file, index) => (
                     <Box key={index}>
                        {/* Image Container with fixed Aspect Ratio scaling and clean inline hover definitions */}
                        <Box
                           style={{
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                              borderRadius: "4px",
                              border: "1px solid var(--mantine-color-gray-3)"
                           }}
                        >
                           <Image
                              src={file.httpPath}
                              alt={file.title || file.name}
                              fit="cover"
                              w="100%"
                              h="100%"
                              style={{
                                 transition: "transform 200ms ease",
                              }}
                              // Utilize native mouse handling to cleanly drive micro-animations 
                              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
                           />
                        </Box>
                        <Box mt="xs">
                           <Text size="sm" fw={500} truncate>
                              {file.title || file.name}
                           </Text>
                           {file.comment && (
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                 {file.comment}
                              </Text>
                           )}
                        </Box>
                     </Box>
                  ))}
               </SimpleGrid>
            </Stack>
         )}

         {/* ─── Empty Resource View ─── */}
         {(!filteredData || (!filteredData.files?.length && !filteredData.folders?.length)) && (
            <Center py="xl">
               <Text c="dimmed" size="sm">No albums or photos found.</Text>
            </Center>
         )}
      </Stack>
   );
}
