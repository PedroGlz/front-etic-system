import { Component, input } from '@angular/core';

@Component({
  selector: 'app-module-table-shell',
  standalone: true,
  templateUrl: './module-table-shell.component.html',
  styleUrl: './module-table-shell.component.scss',
})
export class ModuleTableShellComponent {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly total = input<number | null>(null);
  readonly totalLabel = input('registros totales');
}
