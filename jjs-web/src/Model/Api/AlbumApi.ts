

export interface Folder {   
    name: string; 
    relativePath?: string;
    createdOn?: Date;
    modifiedOn?: Date;
    lastAccessTime?: Date;
    folders?: Folder[];
    files?: File[];
 }
 
 export interface File {
    name: string;   
    relativePath?: string;
    httpPath?: string;
    createdOn?: Date;
    modifiedOn?: Date;
    lastAccessTime?: Date;
    title: string; 
    comment?: string;  
 }