import type { HttpError, TGet, TPatch } from "@/lib/httpClient";
import type { UserSummary } from "./user";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";

export const blockUser = async (httpPatch: TPatch, email: string, reason: string): Promise<void> => {
   await httpPatch(`api/user/blockuser`, { email, reason });
};

export const unblockUser = async (httpPatch: TPatch, email: string): Promise<void> => {
   await httpPatch(`api/user/unblockuser`, { email });
};

export const setUserRole = async (httpPatch: TPatch, email: string, role: string): Promise<void> => {
   await httpPatch(`api/user/setrole`, { email, role });
};

export function useUsers(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<UserSummary[], HttpError>(
      'api/user/getall',
      httpGet,
      { ...swrOptions }
   );

   return {
      data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}
