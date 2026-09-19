import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-referencias-generales-list',
  imports: [CatalogPageComponent],
  templateUrl: './referencias-generales-list.component.html',
  styleUrl: './referencias-generales-list.component.scss',
})
export class ReferenciasGeneralesListComponent {}
