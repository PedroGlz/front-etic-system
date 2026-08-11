import { Component } from '@angular/core';
import { CatalogRoutePageComponent } from '@features/catalogs/pages/catalog-route-page/catalog-route-page.component';

@Component({
  selector: 'app-fabricantes-list',
  imports: [CatalogRoutePageComponent],
  templateUrl: './fabricantes-list.component.html',
  styleUrl: './fabricantes-list.component.scss',
})
export class FabricantesListComponent {}
