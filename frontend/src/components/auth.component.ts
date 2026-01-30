import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { environment } from '../environments';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <div style="text-align: right; color: #666; font-size: 12px; margin-bottom: 10px;">
        Server: {{serverNumber}}
      </div>

      <h2 style="text-align: center;">{{isLogin ? 'Login' : 'Register'}}</h2>

      <form (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px;">Username:</label>
          <input
            type="text"
            [(ngModel)]="username"
            name="username"
            required
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div>
          <label style="display: block; margin-bottom: 5px;">Password:</label>
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            required
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div *ngIf="error" style="color: red; font-size: 14px;">
          {{error}}
        </div>

        <button
          type="submit"
          style="padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          {{isLogin ? 'Login' : 'Register'}}
        </button>
      </form>

      <div style="text-align: center; margin-top: 15px;">
        <button
          (click)="toggleMode()"
          style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline;">
          {{isLogin ? 'Need an account? Register' : 'Have an account? Login'}}
        </button>
      </div>
    </div>
  `
})
export class AuthComponent {
  username = '';
  password = '';
  isLogin = true;
  error = '';
  serverNumber = environment.serverNumber;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.error = '';
  }

  onSubmit(): void {
    this.error = '';

    const auth$ = this.isLogin
      ? this.authService.login(this.username, this.password)
      : this.authService.register(this.username, this.password);

    auth$.subscribe({
      next: () => {
        this.router.navigate(['/todos']);
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'An error occurred';
      }
    });
  }
}