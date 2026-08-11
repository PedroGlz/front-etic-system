import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ClientesStore } from '@features/clientes/services/clientes.store';

@Component({
  selector: 'app-clientes-form',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './clientes-form.component.html',
  styleUrl: './clientes-form.component.scss',
})
export class ClientesFormComponent {
  readonly store = input.required<ClientesStore>();
}
