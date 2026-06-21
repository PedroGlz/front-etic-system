export interface CatalogField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'reference';
  required: boolean;
  maxLength: number | null;
  referenceCatalog: string | null;
}

export interface CatalogSchema {
  key: string;
  title: string;
  fields: CatalogField[];
}

export interface CatalogRecord {
  values: Record<string, unknown>;
}
