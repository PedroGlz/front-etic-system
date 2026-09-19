import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-tipos-inspeccion-list',
  imports: [CatalogPageComponent],
  templateUrl: './tipos-inspeccion-list.component.html',
  styleUrl: './tipos-inspeccion-list.component.scss',
})
export class TiposInspeccionListComponent {}
