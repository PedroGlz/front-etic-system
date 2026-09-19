import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-equipos-list',
  imports: [CatalogPageComponent],
  templateUrl: './equipos-list.component.html',
  styleUrl: './equipos-list.component.scss',
})
export class EquiposListComponent {}
