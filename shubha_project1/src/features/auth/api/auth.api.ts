// TODO: Replace mock implementations with real API calls when backend is connected.
import type { UserViewModel } from "@/shared/types/domain";
import { MOCK_USER } from "@/shared/lib/mockData";

export async function fetchCurrentUser(): Promise<UserViewModel> {
  return MOCK_USER;
}

export async function changePassword(_oldPassword: string, _newPassword: string): Promise<void> {
  return;
}
