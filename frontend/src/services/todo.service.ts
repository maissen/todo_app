import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments';

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface TodosResponse {
  todos: Todo[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getTodos(): Observable<TodosResponse> {
    return this.http.get<TodosResponse>(`${this.apiUrl}/todos`, {
      headers: this.getHeaders()
    });
  }

  getTodo(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/todos/${id}`, {
      headers: this.getHeaders()
    });
  }

  createTodo(title: string, description: string): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos`,
      { title, description },
      { headers: this.getHeaders() }
    );
  }

  updateTodo(id: string, updates: Partial<Todo>): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/todos/${id}`,
      updates,
      { headers: this.getHeaders() }
    );
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/todos/${id}`, {
      headers: this.getHeaders()
    });
  }
}