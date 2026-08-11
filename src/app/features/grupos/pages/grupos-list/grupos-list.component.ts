import { Component } from '@angular/core';
import { CatalogRoutePageComponent } from '@features/catalogs/pages/catalog-route-page/catalog-route-page.component';

@Component({
  selector: 'app-grupos-list',
  imports: [CatalogRoutePageComponent],
  templateUrl: './grupos-list.component.html',
  styleUrl: './grupos-list.component.scss',
})
export class GruposListComponent {}
