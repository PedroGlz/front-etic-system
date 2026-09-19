import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-grupos-list',
  imports: [CatalogPageComponent],
  templateUrl: './grupos-list.component.html',
  styleUrl: './grupos-list.component.scss',
})
export class GruposListComponent {}
