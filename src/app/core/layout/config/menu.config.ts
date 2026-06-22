import { MenuGroup } from '@core/layout/models/navigation.model';

export const APP_MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Catálogos',
    icon: 'pi-copy',
    items: [
      { key: 'clientes', label: 'Clientes', icon: 'pi-briefcase', adminOnly: true },
      { key: 'grupos-sitios', label: 'Grupos de sitios', icon: 'pi-objects-column', adminOnly: true },
      { key: 'sitios', label: 'Sitios', icon: 'pi-map-marker', adminOnly: true },
      { key: 'tipos-inspeccion', label: 'Tipos de inspección', icon: 'pi-search', adminOnly: true },
      { key: 'causas-principales', label: 'Causas principales', icon: 'pi-sitemap' },
      { key: 'estatus-inspeccion', label: 'Estatus de inspección', icon: 'pi-check-circle', adminOnly: true },
      { key: 'fabricantes', label: 'Fabricantes', icon: 'pi-building' },
      { key: 'observaciones-linea-base', label: 'Observaciones BL', icon: 'pi-comment' },
      { key: 'fallas', label: 'Fallas', icon: 'pi-bolt' },
      { key: 'recomendaciones', label: 'Recomendaciones', icon: 'pi-lightbulb' },
      { key: 'referencias-generales', label: 'Referencias generales', icon: 'pi-book' },
      { key: 'recomendaciones-generales', label: 'Recomendaciones generales', icon: 'pi-file-edit' },
      { key: 'tipos-prioridad', label: 'Tipos de prioridad', icon: 'pi-flag', adminOnly: true },
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
