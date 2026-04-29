import { Injectable } from '@angular/core';
import { Observable, tap, BehaviorSubject, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthResponse, Ninja } from '../interfaces/models';
import * as localDb from '../../missions.json';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserKey = 'ninja_user'; 
  private tokenKey = 'ninja_token';

  private _isAuthenticated = new BehaviorSubject<boolean>(false);

  public isAuthenticated$ = this._isAuthenticated.asObservable();
  
  private db: any;

  constructor() {
    this.db = JSON.parse(JSON.stringify((localDb as any).default || localDb));
    
    // Cerramos sesión automáticamente cada vez que el servicio se inicializa (al recargar la página)
    this.logout();
  }

  //login
  login(credentials: { username: string; password?: string }): Observable<AuthResponse> {
    const ninjas: Ninja[] = this.db.ninjas || [];
    const user = ninjas.find(
      (n: any) => n.username === credentials.username && (n.passwordHash === credentials.password || n.password === credentials.password)
    );

    if (user) {
      const response: AuthResponse = {
        token: 'fake-jwt-token-' + user.id,
        ninja: user
      };
      return of(response).pipe(
        delay(800),
        tap(res => {
          this.saveSession(res);
          this._isAuthenticated.next(true); //Avisamos que entró
        })
      );
    }

    return throwError(() => new Error('Credenciales inválidas')).pipe(delay(800));
  }

  // Registro
  register(data: any): Observable<AuthResponse> {
    const ninjas: Ninja[] = this.db.ninjas || [];
    
    const exists = ninjas.find(n => n.username === data.username);
    if (exists) {
      return throwError(() => new Error('El usuario ya existe')).pipe(delay(800));
    }

    const newUser: any = {
      id: new Date().getTime(),
      username: data.username,
      password: data.password,
      passwordHash: data.password,
      rank: data.rank || 'Academy',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      experiencePoints: 0
    };

    this.db.ninjas.push(newUser);

    const response: AuthResponse = {
      token: 'fake-jwt-token-' + newUser.id,
      ninja: newUser as Ninja
    };

    return of(response).pipe(
      delay(800),
      tap(res => {
        this.saveSession(res);
        this._isAuthenticated.next(true); //Avisamos que entró
      })
    );
  }

  //Cerrar sesión
  logout() {
    localStorage.removeItem(this.currentUserKey);
    localStorage.removeItem(this.tokenKey);
    this._isAuthenticated.next(false); //Avisamos que salió
  }

  //Obtener usuario actual
  getCurrentUser(): Ninja | null {
    const userStr = localStorage.getItem(this.currentUserKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  //Obtener Token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  //Guardar sesión (Privado)
  private saveSession(response: AuthResponse) {
    if (response && response.token) {
      localStorage.setItem(this.tokenKey, response.token);
    }
    if (response && response.ninja) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(response.ninja));
    }
  }
}