export interface MenuItemResponse {
  id: string;
  title: string;
  icon: string | null;
  url: string | null;
  sortOrder: number;
  module: string | null;
  children: MenuItemResponse[];
}
