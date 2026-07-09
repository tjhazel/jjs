

export type UserRole = "Admin" | "Guest";

export interface JJSUser {
   email: string;
   displayName: string;
   picture?: string;
   role: UserRole;
   googleId: string;
}


export interface User {
   id: number;
   email: string;
   displayName: string;
   role: string;
   lastActivityDate: string;
   isDisabled: boolean;
   createdDate?: string;
}