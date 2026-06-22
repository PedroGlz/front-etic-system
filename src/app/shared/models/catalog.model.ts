export interface CatalogField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'reference' | 'password';
  required: boolean;
  maxLength: number | null;
  referenceCatalog: string | null;
  writeOnly: boolean;
}

export interface CatalogSchema {
  key: string;
  title: string;
  fields: CatalogField[];
}

export interface CatalogRecord {
  values: Record<string, unknown>;
}
