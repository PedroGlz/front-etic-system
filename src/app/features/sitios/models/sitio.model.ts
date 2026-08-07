export interface Sitio {
  id: string;
  clientId: string;
  clientName: string | null;
  siteGroupId: string | null;
  siteGroupName: string | null;
  name: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  state: string | null;
  municipality: string | null;
  contact1: string | null;
  contactRole1: string | null;
  contact2: string | null;
  contactRole2: string | null;
  contact3: string | null;
  contactRole3: string | null;
  status: string;
}

export type SitioRequest = Omit<Sitio, 'id' | 'clientName' | 'siteGroupName' | 'status'>;
