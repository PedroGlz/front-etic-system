export interface GrupoSitios {
  id: string;
  clientId: string;
  clientName: string | null;
  name: string;
  status: string;
}

export interface GrupoSitiosRequest {
  clientId: string;
  name: string;
}
