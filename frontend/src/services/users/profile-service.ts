import { apiClient } from "../api-client";
import { ApiResponse } from "@/src/types";

export const profileService = {
  updateTheme: (themeColor: string) =>
    apiClient.put<ApiResponse>("/profile/theme", { themeColor }),
};
