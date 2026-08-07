export interface Cliente {
  id: string;
  businessName: string;
  commercialName: string;
  rfc: string;
  status: string;
}

export interface ClienteRequest {
  businessName: string;
  commercialName: string;
  rfc: string;
}
