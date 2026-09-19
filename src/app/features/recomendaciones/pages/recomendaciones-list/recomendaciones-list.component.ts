import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';
import { RECOMENDACIONES_EXCLUDED_FIELDS } from '@features/recomendaciones/config/recomendaciones.config';

@Component({
  selector: 'app-recomendaciones-list',
  imports: [CatalogPageComponent],
  templateUrl: './recomendaciones-list.component.html',
  styleUrl: './recomendaciones-list.component.scss',
})
export class RecomendacionesListComponent {
  readonly excludedFields = RECOMENDACIONES_EXCLUDED_FIELDS;
}
