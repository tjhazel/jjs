// TypeScript definitions matching `JJS.Api.Models.Album` model JSON shape.
// Note: `FullName` is excluded because it's marked `[JsonIgnore]` in the C# model.
export const IMAGE_PREFIX = '/Image';
export const POST_IMAGES_FOLDER = 'PostImages';
export interface File {
  title: string;
  comment: string;
  name: string;
  relativePath: string;
  httpPath: string;
  thumbHttpPath: string;
  createdOn: string;     // ISO date string
  modifiedOn: string;    // ISO date string
  lastAccessTime: string;// ISO date string
}

export interface Folder {
  folders: Folder[];
  files: File[];
  name: string;
  relativePath: string;
  createdOn: string;     // ISO date string
  modifiedOn: string;    // ISO date string
  lastAccessTime: string;// ISO date string
}