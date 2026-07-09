import type { TPatch } from "@/lib/httpClient";

export const blockUser = async (httpPatch: TPatch, email: string, reason: string): Promise<void> => {
   await httpPatch(`api/user/blockuser`, { email, reason });
};
