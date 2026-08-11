import { Component } from '@angular/core';
import { CatalogRoutePageComponent } from '@features/catalogs/pages/catalog-route-page/catalog-route-page.component';

@Component({
  selector: 'app-equipos-list',
  imports: [CatalogRoutePageComponent],
  templateUrl: './equipos-list.component.html',
  styleUrl: './equipos-list.component.scss',
})
export class EquiposListComponent {}
