import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'missions',
    loadComponent: () => import('./pages/missions/mission-list/mission-list.page').then( m => m.MissionListPage),
    canActivate: [authGuard]
  },
  {
    path: 'missions/:id', 
    loadComponent: () => import('./pages/missions/mission-detail/mission-detail.page').then( m => m.MissionDetailPage),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];