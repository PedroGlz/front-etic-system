import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SitiosStore } from '@features/sitios/services/sitios.store';

@Component({
  selector: 'app-sitios-form',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './sitios-form.component.html',
  styleUrl: './sitios-form.component.scss',
})
export class SitiosFormComponent {
  readonly store = input.required<SitiosStore>();
}
