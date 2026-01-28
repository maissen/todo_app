import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../services/todo.service';
import { AuthService } from '../services/auth.service';

declare const window: any;

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="max-width: 800px; margin: 20px auto; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Todo List</h2>
        <div style="display: flex; gap: 15px; align-items: center;">
          <span style="color: #666; font-size: 14px;">Server: {{serverNumber}}</span>
          <button
            (click)="logout()"
            style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Logout
          </button>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="margin-top: 0;">Add New Todo</h3>
        <form (ngSubmit)="createTodo()" style="display: flex; flex-direction: column; gap: 10px;">
          <input
            type="text"
            [(ngModel)]="newTitle"
            name="title"
            placeholder="Title"
            required
            style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <textarea
            [(ngModel)]="newDescription"
            name="description"
            placeholder="Description"
            rows="3"
            style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
          <button
            type="submit"
            style="padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Add Todo
          </button>
        </form>
      </div>

      <div *ngIf="error" style="color: red; margin-bottom: 15px;">
        {{error}}
      </div>

      <div *ngIf="loading" style="text-align: center; padding: 20px;">
        Loading...
      </div>

      <div *ngIf="!loading && todos.length === 0" style="text-align: center; padding: 40px; color: #666;">
        No todos yet. Create one above!
      </div>

      <div *ngFor="let todo of todos" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 5px 0; text-decoration: {{todo.completed ? 'line-through' : 'none'}};">
              {{todo.title}}
            </h3>
            <p style="margin: 0 0 10px 0; color: #666;">{{todo.description}}</p>
            <small style="color: #999;">Created: {{formatDate(todo.createdAt)}}</small>
          </div>
          <div style="display: flex; gap: 10px;">
            <button
              (click)="toggleComplete(todo)"
              style="padding: 6px 12px; background-color: {{todo.completed ? '#ffc107' : '#28a745'}}; color: white; border: none; border-radius: 4px; cursor: pointer;">
              {{todo.completed ? 'Undo' : 'Complete'}}
            </button>
            <button
              (click)="deleteTodo(todo.id)"
              style="padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  newTitle = '';
  newDescription = '';
  loading = false;
  error = '';
  serverNumber = window.ENV.SERVER_NUMBER;

  constructor(
    private todoService: TodoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.error = '';
    this.todoService.getTodos().subscribe({
      next: (response) => {
        this.todos = response.todos;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'Failed to load todos';
        this.loading = false;
      }
    });
  }

  createTodo(): void {
    if (!this.newTitle.trim()) return;

    this.error = '';
    this.todoService.createTodo(this.newTitle, this.newDescription).subscribe({
      next: (todo) => {
        this.todos.unshift(todo);
        this.newTitle = '';
        this.newDescription = '';
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'Failed to create todo';
      }
    });
  }

  toggleComplete(todo: Todo): void {
    this.error = '';
    this.todoService.updateTodo(todo.id, { completed: !todo.completed }).subscribe({
      next: (updated) => {
        const index = this.todos.findIndex(t => t.id === todo.id);
        if (index !== -1) {
          this.todos[index] = updated;
        }
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'Failed to update todo';
      }
    });
  }

  deleteTodo(id: string): void {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    this.error = '';
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos = this.todos.filter(t => t.id !== id);
      },
      error: (err) => {
        this.error = err.error?.error?.message || 'Failed to delete todo';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
