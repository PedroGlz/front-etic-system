import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';
import {
  UBICACIONES_CONDITIONAL_REQUIRED_FIELDS,
  UBICACIONES_REFERENCE_TEXT_FILTER_FIELDS,
} from '@features/ubicaciones/config/ubicaciones.config';

@Component({ selector: 'app-ubicaciones-list', imports: [CatalogPageComponent], templateUrl: './ubicaciones-list.component.html', styleUrl: './ubicaciones-list.component.scss' })
export class UbicacionesListComponent {
  readonly conditionalRequiredFields = UBICACIONES_CONDITIONAL_REQUIRED_FIELDS;
  readonly referenceTextFilterFields = UBICACIONES_REFERENCE_TEXT_FILTER_FIELDS;
}
