import { MenuGroup } from '@layout/models/navigation.model';

export const APP_MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Operación',
    icon: 'pi-briefcase',
    items: [
      { key: 'inspecciones', label: 'Inspecciones', icon: 'pi-search', route: '/inspecciones', adminOnly: true },
      { key: 'plantillas-reportes', label: 'Plantillas de reportes', icon: 'pi-folder-open', route: '/plantillas-reportes', adminOnly: true },
    ],
  },
  {
    label: 'Catálogos',
    icon: 'pi-copy',
    items: [
      { key: 'causas-principales', label: 'Causas principales', icon: 'pi-sitemap' },
      { key: 'categorias-equipos', label: 'Categorías de equipos', icon: 'pi-tags' },
      { key: 'clientes', label: 'Clientes', icon: 'pi-briefcase', adminOnly: true },
      // { key: 'equipos', label: 'Equipos', icon: 'pi-desktop' },
      { key: 'estatus-inspeccion', label: 'Estatus de inspección', icon: 'pi-check-circle', adminOnly: true },
      { key: 'fabricantes', label: 'Fabricantes', icon: 'pi-building' },
      { key: 'fallas', label: 'Fallas', icon: 'pi-bolt' },
      { key: 'fases', label: 'Fases', icon: 'pi-list' },
      { key: 'grupos-sitios', label: 'Grupos de sitios', icon: 'pi-objects-column', adminOnly: true },
      { key: 'observaciones-linea-base', label: 'Observaciones BL', icon: 'pi-comment' },
      { key: 'recomendaciones', label: 'Recomendaciones', icon: 'pi-lightbulb' },
      { key: 'recomendaciones-generales', label: 'Recomendaciones generales', icon: 'pi-file-edit' },
      { key: 'referencias-generales', label: 'Referencias generales', icon: 'pi-book' },
      { key: 'sitios', label: 'Sitios', icon: 'pi-map-marker', adminOnly: true },
      // { key: 'tipos-falla', label: 'Tipos de falla', icon: 'pi-tags' },
      { key: 'tipos-inspeccion', label: 'Tipos de inspección', icon: 'pi-search', adminOnly: true },
      { key: 'tipos-prioridad', label: 'Tipos de prioridad', icon: 'pi-flag', adminOnly: true },
      { key: 'ubicaciones', label: 'Ubicaciones', icon: 'pi-map-marker' },
    ],
  },
  {
    label: 'Sistema',
    icon: 'pi-cog',
    adminOnly: true,
    items: [
      { key: 'usuarios', label: 'Usuarios', icon: 'pi-user' },
      { key: 'grupos', label: 'Grupos', icon: 'pi-users' },
    ],
  },
];
