export interface ClienteLookup {
  id: string;
  businessName: string;
  status: string;
}

export interface GrupoSitioLookup {
  id: string;
  clientId: string;
  name: string;
  status: string;
}

export interface SitioLookup {
  id: string;
  clientId: string;
  siteGroupId: string | null;
  name: string;
  status: string;
}
