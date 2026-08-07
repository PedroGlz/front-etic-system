import { Component, ViewChild, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { UsuariosApi } from '@features/usuarios/data-access/usuarios.api';
import { UsuariosService } from '@features/usuarios/data-access/usuarios.service';
import { UsuariosStore } from '@features/usuarios/data-access/usuarios.store';
import { Usuario } from '@features/usuarios/models/usuario.model';
import { UsuariosFormComponent } from '@features/usuarios/pages/usuarios-form/usuarios-form.component';
import { ModuleTableShellComponent } from '@shared/ui/module-table-shell/module-table-shell.component';
import { InactiveRecordsFilterComponent } from '@shared/ui/inactive-records-filter/inactive-records-filter.component';
import { CatalogColumnFilterInteractionDirective } from '@shared/ui/catalog-column-filter/catalog-column-filter-interaction.directive';

@Component({
  selector: 'app-usuarios-list',
  imports: [ButtonModule, InputTextModule, TableModule, TagModule, ModuleTableShellComponent, UsuariosFormComponent, InactiveRecordsFilterComponent, CatalogColumnFilterInteractionDirective],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss',
  providers: [UsuariosApi, UsuariosService, UsuariosStore],
})
export class UsuariosListComponent {
  @ViewChild('table') table?: Table;
  readonly showInactive = signal(false);
  selectedUsers: Usuario[] = [];
  readonly visibleUsers = computed(() => {
    const users = this.store.users();
    return this.showInactive() ? users : users.filter((user) => user.status.trim().toLowerCase() === 'activo');
  });

  constructor(readonly store: UsuariosStore) {
    this.store.load();
  }

  filterGlobal(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.table?.filterGlobal(value, 'contains');
  }

  statusSeverity(status: string): 'success' | 'secondary' {
    return status === 'Activo' ? 'success' : 'secondary';
  }

  trackById(_: number, user: Usuario): string {
    return user.id;
  }

  groupFilterOptions(): string[] {
    return [...new Set(this.store.users().map((user) => user.groupName).filter((value): value is string => !!value))]
      .sort((left, right) => left.localeCompare(right, 'es'));
  }

  toggleInactive(checked: boolean): void {
    this.showInactive.set(checked);
    if (this.table) this.table.first = 0;
  }

  deactivateSelected(): void {
    void this.store.deactivateMany(this.selectedUsers, () => { this.selectedUsers = []; });
  }
}
