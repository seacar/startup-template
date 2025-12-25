import { apiClient } from "./client";
import type {
  User,
  UserListResponse,
  UserSwitchRequest,
  UserSwitchResponse,
  UserUpdate,
} from "../types/models";

export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>("/users/me");
}

export async function getAllUsers(): Promise<UserListResponse> {
  return apiClient.get<UserListResponse>("/users");
}

export async function switchUser(
  userId: string
): Promise<UserSwitchResponse> {
  return apiClient.post<UserSwitchResponse>("/users/switch", {
    user_id: userId,
  } as UserSwitchRequest);
}

export async function updateUserName(name: string): Promise<User> {
  return apiClient.patch<User>("/users/me", { name } as UserUpdate);
}

