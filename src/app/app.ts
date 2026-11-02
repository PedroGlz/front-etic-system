import { Component } from '@angular/core';
import { NavigationCancel, NavigationError, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LoginTransitionService } from '@core/services/login-transition.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(
    readonly themeService: ThemeService,
    readonly loginTransition: LoginTransitionService,
    router: Router,
  ) {
    router.events
      .pipe(filter((event) => event instanceof NavigationCancel || event instanceof NavigationError))
      .subscribe(() => this.loginTransition.finish());
  }
}
