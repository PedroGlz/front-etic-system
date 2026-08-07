import { environment } from '../../../environments/environment';

export const API_BASE_URL = `${environment.apiBaseUrl}/api`;
export const CATALOGS_API_URL = `${API_BASE_URL}/catalogos`;
export const INSPECTIONS_API_URL = `${API_BASE_URL}/inspecciones`;
export const USERS_API_URL = `${API_BASE_URL}/usuarios`;
export const CLIENTS_API_URL = `${API_BASE_URL}/clientes`;
export const SITE_GROUPS_API_URL = `${API_BASE_URL}/grupos-sitios`;
export const SITES_API_URL = `${API_BASE_URL}/sitios`;
