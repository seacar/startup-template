import useSWR from "swr";
import {
  getCurrentUser,
  getAllUsers,
  switchUser as switchUserApi,
  updateUserName as updateUserNameApi,
} from "../api/users";
import type { User, UserListResponse } from "../types/models";

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<User>(
    "/api/v1/users/me",
    getCurrentUser,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAllUsers() {
  const { data, error, isLoading, mutate } = useSWR<UserListResponse>(
    "/api/v1/users",
    getAllUsers,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserActions() {
  const { mutate: mutateCurrent } = useCurrentUser();
  const { mutate: mutateAll } = useAllUsers();

  const switchUser = async (userId: string) => {
    await switchUserApi(userId);
    await mutateCurrent();
    await mutateAll();
  };

  const updateUserName = async (name: string) => {
    await updateUserNameApi(name);
    await mutateCurrent();
    await mutateAll();
  };

  return {
    switchUser,
    updateUserName,
  };
}

