import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-estatus-inspeccion-list',
  imports: [CatalogPageComponent],
  templateUrl: './estatus-inspeccion-list.component.html',
  styleUrl: './estatus-inspeccion-list.component.scss',
})
export class EstatusInspeccionListComponent {}
