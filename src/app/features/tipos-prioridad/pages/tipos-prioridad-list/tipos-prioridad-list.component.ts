import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-tipos-prioridad-list',
  imports: [CatalogPageComponent],
  templateUrl: './tipos-prioridad-list.component.html',
  styleUrl: './tipos-prioridad-list.component.scss',
})
export class TiposPrioridadListComponent {}
