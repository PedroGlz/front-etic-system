import { Component } from '@angular/core';
import { CatalogRoutePageComponent } from '@features/catalogs/pages/catalog-route-page/catalog-route-page.component';

@Component({
  selector: 'app-recomendaciones-list',
  imports: [CatalogRoutePageComponent],
  templateUrl: './recomendaciones-list.component.html',
  styleUrl: './recomendaciones-list.component.scss',
})
export class RecomendacionesListComponent {}
