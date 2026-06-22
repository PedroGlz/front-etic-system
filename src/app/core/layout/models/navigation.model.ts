export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

export interface MenuGroup {
  label: string;
  icon: string;
  adminOnly?: boolean;
  items: MenuItem[];
}
