

export type UserRole = "Admin" | "Guest";

export interface JJSUser {
   email: string;
   name: string;
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
}