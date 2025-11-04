import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse, User, ChangePasswordRequest, ChangePasswordResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginRequest)
      .pipe(map(response => {
        if (response.token) {
          // Store user details and jwt token in local storage
          const user: User = {
            id: 0, // Will be updated when we fetch profile
            username: response.username,
            email: response.email,
            role: response.role,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(user);
        }
        return response;
      }));
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerRequest)
      .pipe(map(response => {
        if (response.token) {
          // Store user details and jwt token in local storage
          const user: User = {
            id: 0, // Will be updated when we fetch profile
            username: response.username,
            email: response.email,
            role: response.role,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(user);
        }
        return response;
      }));
  }

  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<User>(`${this.apiUrl}/api/user/profile`, { headers })
      .pipe(map(user => {
        // Update stored user with complete profile data
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !!this.currentUserValue;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN';
  }

  changePassword(changePasswordRequest: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // IMPORTANT: Never log passwords or sensitive data
    return this.http.post<ChangePasswordResponse>(
      `${this.apiUrl}/user/change-password`,
      changePasswordRequest,
      { headers }
    );
  }
}

