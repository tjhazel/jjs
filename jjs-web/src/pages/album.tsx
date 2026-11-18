import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useApiContext } from "@api/ApiContext";
import { useAlbumByPath } from "@api/album/album-fetcher";
import { IMAGE_PREFIX, POST_IMAGES_FOLDER } from "@api/album/album-models";
import type { File as AlbumFile } from "@api/album/album-models";
import { useAuth } from "@lib/auth/authContext";
import { ROLE_ADMIN, ROLE_CIRCLE_OF_TRUST } from "@lib/auth/roles";
import {
   Modal,
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
   Group,
   Button
} from "@mantine/core";
import classes from "./album.module.css";

const formatMetadataDate = (value: string) => new Date(value).toLocaleString();

export default function AlbumPage() {
   const { httpGet } = useApiContext();
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const { hasRole } = useAuth();
   const [selectedFile, setSelectedFile] = useState<AlbumFile | null>(null);

   const path = searchParams.get("path") || undefined;

   // Clean up the logical URL path string by clipping the structural IMAGE_PREFIX
   const logicalPath = path?.replace(new RegExp("^" + IMAGE_PREFIX), "") || undefined;

   const { filteredData, isLoading, error } = useAlbumByPath(httpGet, path);
   const albumFiles = useMemo(() => filteredData?.files ?? [], [filteredData?.files]);
   const selectedFileIndex = selectedFile
      ? albumFiles.findIndex(file => file.relativePath === selectedFile.relativePath)
      : -1;

   useEffect(() => {
      if (selectedFileIndex < 0) return;

      const handleKeyDown = (event: KeyboardEvent) => {
         if (event.key === "ArrowLeft" && selectedFileIndex > 0) {
            event.preventDefault();
            setSelectedFile(albumFiles[selectedFileIndex - 1]);
         } else if (event.key === "ArrowRight" && selectedFileIndex < albumFiles.length - 1) {
            event.preventDefault();
            setSelectedFile(albumFiles[selectedFileIndex + 1]);
         }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
   }, [albumFiles, selectedFileIndex]);

   // Only Admin and CircleOfTrust members may browse PostImages.
   const canSeePostImages = hasRole([ROLE_ADMIN, ROLE_CIRCLE_OF_TRUST]);

   // Redirect away if someone navigates directly to the PostImages path without access.
   useEffect(() => {
      if (!canSeePostImages && path?.split('/').includes(POST_IMAGES_FOLDER)) {
         navigate('/album', { replace: true });
      }
   }, [canSeePostImages, path, navigate]);

   // Strip PostImages from the folder list for users without access.
   const visibleFolders = (filteredData?.folders ?? []).filter(
      f => canSeePostImages || f.name !== POST_IMAGES_FOLDER
   );

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
      <>
      <Stack gap="xl">
         {/* ─── Header & Breadcrumbs Section ─── */}
         <Stack gap="xs">
            <Title order={1} fw={600}>
               {path ? (filteredData?.name ?? "Album") : "Album"}
            </Title>

            {/* Responsive horizontal breadcrumb list wrapper layout container */}
            <Group gap="xs" wrap="nowrap" style={{ overflowX: "auto", paddingBottom: "8px" }}>
               {/* Base Root Level Pointer — no path arg so navigateToPath goes to /album */}
               <Anchor component="button" type="button" size="sm" onClick={() => navigateToPath()}>
                  Album
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
                              onClick={() => navigateToPath(`${IMAGE_PREFIX}/${breadcrumbPath}`)}
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
         {visibleFolders.length > 0 && (
            <Stack gap="sm">
               <Title order={2} size="h4" fw={600}>Folders</Title>
               <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                  {visibleFolders.map((folder, index) => (
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
                        <button
                           type="button"
                           className={classes.imageButton}
                           onClick={() => setSelectedFile(file)}
                           aria-label={`View ${file.title || file.name}`}
                        >
                           <Box className={classes.thumbnailFrame}>
                              <Image
                                 src={file.thumbHttpPath}
                                 alt={file.title || file.name}
                                 fit="cover"
                                 w="100%"
                                 h="100%"
                                 loading="lazy"
                                 className={classes.thumbnailImage}
                              />
                           </Box>
                        </button>
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
         {(!filteredData || (!filteredData.files?.length && !visibleFolders.length)) && (
            <Center py="xl">
               <Text c="dimmed" size="sm">No albums or photos found.</Text>
            </Center>
         )}
      </Stack>
      <Modal
         opened={selectedFile !== null}
         onClose={() => setSelectedFile(null)}
         title={selectedFile?.title || selectedFile?.name}
         centered
         size="90vw"
         classNames={{ body: classes.modalBody }}
      >
         {selectedFile && (
            <Stack gap="md">
               <Box className={classes.fullImageFrame}>
                  <Image
                     src={selectedFile.httpPath}
                     alt={selectedFile.title || selectedFile.name}
                     fit="contain"
                     className={classes.fullImage}
                  />
                  <Text className={classes.watermark} aria-hidden="true">
                     © 2006 - {new Date().getFullYear()} johnandjeri.com
                  </Text>
               </Box>
               <Group justify="space-between" align="center">
                  <Button
                     variant="default"
                     onClick={() => setSelectedFile(albumFiles[selectedFileIndex - 1])}
                     disabled={selectedFileIndex <= 0}
                     aria-label="Previous image"
                  >
                     ← Previous
                  </Button>
                  <Text size="sm" c="dimmed" aria-live="polite">
                     {selectedFileIndex + 1} of {albumFiles.length}
                  </Text>
                  <Button
                     variant="default"
                     onClick={() => setSelectedFile(albumFiles[selectedFileIndex + 1])}
                     disabled={selectedFileIndex < 0 || selectedFileIndex >= albumFiles.length - 1}
                     aria-label="Next image"
                  >
                     Next →
                  </Button>
               </Group>
               <dl className={classes.metadata}>
                  <dt>File name</dt>
                  <dd>{selectedFile.name}</dd>
                  <dt>Title</dt>
                  <dd>{selectedFile.title || "—"}</dd>
                  <dt>Description</dt>
                  <dd>{selectedFile.comment || "—"}</dd>
                  <dt>Created</dt>
                  <dd>{formatMetadataDate(selectedFile.createdOn)}</dd>
                  <dt>Modified</dt>
                  <dd>{formatMetadataDate(selectedFile.modifiedOn)}</dd>
                  <dt>Last accessed</dt>
                  <dd>{formatMetadataDate(selectedFile.lastAccessTime)}</dd>
               </dl>
            </Stack>
         )}
      </Modal>
      </>
   );
}
