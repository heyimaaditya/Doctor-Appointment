import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// NgZorro Modules
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge'; // For notifications
import { NzSpinModule } from 'ng-zorro-antd/spin'; // For loading indicator

// Services
import { AuthService } from '../../core/services/auth.service';
import { UserStateService, User } from '../../core/services/user-state.service';
import { Observable } from 'rxjs';

interface SideMenuItem {
  label: string;
  path: string;
  icon: string; // Font Awesome class or Ng-Zorro icon name
  active?: boolean;
}

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [
    RouterModule, // For <router-outlet> and routerLink
    NgIf, NgFor, AsyncPipe, // Common directives
    NzLayoutModule, NzMenuModule, NzIconModule,
    NzAvatarModule, NzDropDownModule, NzBadgeModule, NzSpinModule
  ],
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss']
})
export class DefaultLayoutComponent implements OnInit {
  isCollapsed = false;
  currentUser$: Observable<User | null>;
  sideMenu: SideMenuItem[] = [];
  isLoadingUser = true; // Loading indicator for initial user fetch

  // Inject services and Router
  private authService = inject(AuthService);
  private userStateService = inject(UserStateService);
  private router = inject(Router);


  constructor() {
    this.currentUser$ = this.userStateService.currentUser$;
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveMenu(event.urlAfterRedirects);
    });

    // Fetch user data if not already present (e.g., on page refresh)
    if (!this.userStateService.getCurrentUserValue()) {
       this.authService.fetchAndSetUserData().subscribe({
         complete: () => {
            this.setupSideMenu();
            this.updateActiveMenu(this.router.url);
            this.isLoadingUser = false;
         },
         error: () => this.isLoadingUser = false // Handle error case
       });
    } else {
       this.setupSideMenu();
       this.updateActiveMenu(this.router.url);
       this.isLoadingUser = false;
    }
  }

  setupSideMenu(): void {
    const user = this.userStateService.getCurrentUserValue();
    if (!user) {
      this.sideMenu = [];
      return;
    }

    const commonPathPrefix = '/'; // Adjust if your layout is nested differently

    const userMenu: SideMenuItem[] = [
      { label: 'Home', path: `${commonPathPrefix}user`, icon: 'home' },
      { label: 'Appointments', path: `${commonPathPrefix}user/appointments`, icon: 'schedule' },
      { label: 'Apply Doctor', path: `${commonPathPrefix}user/apply-doctor`, icon: 'medicine-box' },
      { label: 'Profile', path: `${commonPathPrefix}user/profile`, icon: 'user' }, // Assuming user profile route
    ];

    const doctorMenu: SideMenuItem[] = [
       { label: 'Home', path: `${commonPathPrefix}doctor`, icon: 'home' },
       { label: 'Appointments', path: `${commonPathPrefix}doctor/appointments`, icon: 'schedule' },
       { label: 'Profile', path: `${commonPathPrefix}doctor/profile/${user._id}`, icon: 'user' }, // Match React version path structure if needed
    ];

    const adminMenu: SideMenuItem[] = [
       { label: 'Home', path: `${commonPathPrefix}admin`, icon: 'home' }, // Example admin home
       { label: 'Users', path: `${commonPathPrefix}admin/users`, icon: 'team' },
       { label: 'Doctors', path: `${commonPathPrefix}admin/doctors`, icon: 'doctor' }, // Use a suitable icon like 'audit' or a custom one
       { label: 'Profile', path: `${commonPathPrefix}admin/profile`, icon: 'user' }, // Assuming admin profile route
    ];


    if (user.isAdmin) {
      this.sideMenu = adminMenu;
    } else if (user.isDoctor) {
      this.sideMenu = doctorMenu;
    } else {
      this.sideMenu = userMenu;
    }
  }

   updateActiveMenu(currentUrl: string): void {
    this.sideMenu = this.sideMenu.map(item => ({
      ...item,
      active: currentUrl === item.path || currentUrl.startsWith(item.path + '/') // Basic active check
    }));
  }

  handleLogout(): void {
    this.authService.logout();
  }

  navigateToNotifications(): void {
     this.router.navigate(['/notifications']); // Adjust path if needed
  }
}
