import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-recomendaciones-generales-list',
  imports: [CatalogPageComponent],
  templateUrl: './recomendaciones-generales-list.component.html',
  styleUrl: './recomendaciones-generales-list.component.scss',
})
export class RecomendacionesGeneralesListComponent {}
