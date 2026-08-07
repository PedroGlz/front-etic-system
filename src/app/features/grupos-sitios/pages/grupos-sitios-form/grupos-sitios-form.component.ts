import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { GruposSitiosStore } from '@features/grupos-sitios/data-access/grupos-sitios.store';

@Component({
  selector: 'app-grupos-sitios-form',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './grupos-sitios-form.component.html',
  styleUrl: './grupos-sitios-form.component.scss',
})
export class GruposSitiosFormComponent {
  readonly store = input.required<GruposSitiosStore>();
}
