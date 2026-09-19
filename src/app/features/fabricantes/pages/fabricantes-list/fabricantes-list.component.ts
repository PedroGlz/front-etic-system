import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-fabricantes-list',
  imports: [CatalogPageComponent],
  templateUrl: './fabricantes-list.component.html',
  styleUrl: './fabricantes-list.component.scss',
})
export class FabricantesListComponent {}
