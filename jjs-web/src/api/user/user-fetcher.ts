import type { HttpError, TGet, TPatch } from "@/lib/httpClient";
import type { UserSummary } from "./user";
import useSWR, { mutate } from "swr";
import { swrOptions } from "@/lib/swr.functions";

const USERS_KEY = 'api/user/getall';

export const blockUser = async (httpPatch: TPatch, email: string, reason: string): Promise<void> => {
   await httpPatch(`api/user/blockuser`, { email, reason });
   await mutate(USERS_KEY);
};

export const unblockUser = async (httpPatch: TPatch, email: string): Promise<void> => {
   await httpPatch(`api/user/unblockuser`, { email });
   await mutate(USERS_KEY);
};

export const setUserRole = async (httpPatch: TPatch, email: string, role: string): Promise<void> => {
   await httpPatch(`api/user/setrole`, { email, role });
   await mutate(USERS_KEY);
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
