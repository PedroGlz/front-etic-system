import { Component } from '@angular/core';
import { CatalogPageComponent } from '@features/catalogs/public-api';

@Component({
  selector: 'app-tipos-ambiente-list',
  imports: [CatalogPageComponent],
  templateUrl: './tipos-ambiente-list.component.html',
  styleUrl: './tipos-ambiente-list.component.scss',
})
export class TiposAmbienteListComponent {}
