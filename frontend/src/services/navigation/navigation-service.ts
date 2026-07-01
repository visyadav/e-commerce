import { apiClient } from "../api-client";
import type { MenuItemResponse } from "@/src/types";

export const navigationService = {
  getSideMenu: () =>
    apiClient.get<MenuItemResponse[]>("/navigation/side-menu"),
};
