import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';
import { FALLAS_EXCLUDED_FIELDS } from '@features/fallas/config/fallas.config';

@Component({
  selector: 'app-fallas-list',
  imports: [CatalogPageComponent],
  templateUrl: './fallas-list.component.html',
  styleUrl: './fallas-list.component.scss',
})
export class FallasListComponent {
  readonly excludedFields = FALLAS_EXCLUDED_FIELDS;
}
