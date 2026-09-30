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
  status: string;
  contacts: SitioContacto[];
}

export interface SitioContacto {
  id: string | null;
  name: string | null;
  role: string | null;
  status?: string;
  order?: number;
}

export type SitioRequest = Omit<Sitio, 'id' | 'clientName' | 'siteGroupName' | 'status' | 'contacts'> & {
  contacts: SitioContacto[];
};
