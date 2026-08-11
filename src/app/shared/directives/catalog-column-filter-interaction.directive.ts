import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'p-columnFilter',
})
export class CatalogColumnFilterInteractionDirective {
  @HostListener('click', ['$event'])
  stopSort(event: Event): void {
    event.stopPropagation();
  }
}
