import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';
import { CAUSAS_PRINCIPALES_EXCLUDED_FIELDS } from '@features/causas-principales/config/causas-principales.config';

@Component({
  selector: 'app-causas-principales-list',
  imports: [CatalogPageComponent],
  templateUrl: './causas-principales-list.component.html',
  styleUrl: './causas-principales-list.component.scss',
})
export class CausasPrincipalesListComponent {
  readonly excludedFields = CAUSAS_PRINCIPALES_EXCLUDED_FIELDS;
}
