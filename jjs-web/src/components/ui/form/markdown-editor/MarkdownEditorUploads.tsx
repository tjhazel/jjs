import AlbumImagePicker from '../AlbumImagePicker';
import CameraCapture from '../CameraCapture';
import ImageUpload from '../ImageUpload';
import { useMarkdownEditorContext } from './MarkdownEditorContext';

export function MarkdownEditorUploads() {
  const {
    uploadEndpoint, imageUploadRef, cameraRef, albumPickerRef, handleImageFile,
    insert, safeAlt, normalizeAlbumPath,
  } = useMarkdownEditorContext();
  if (!uploadEndpoint) return null;

  return (
    <>
      <ImageUpload ref={imageUploadRef} onUpload={handleImageFile} />
      <CameraCapture ref={cameraRef} onCapture={handleImageFile} />
      <AlbumImagePicker
        ref={albumPickerRef}
        onSelect={(httpPath, name) => {
          const rawPath = normalizeAlbumPath(httpPath);
          const pathToInsert = rawPath.includes('%') ? rawPath : encodeURI(rawPath);
          insert(`![${safeAlt(name)} | 500](${pathToInsert})`);
        }}
      />
    </>
  );
}
