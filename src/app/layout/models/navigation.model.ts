export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  route?: string;
  children?: MenuItem[];
}

export interface MenuGroup {
  label: string;
  icon: string;
  adminOnly?: boolean;
  items: MenuItem[];
}
