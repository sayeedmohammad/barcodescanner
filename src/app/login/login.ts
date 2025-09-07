import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.username === 'user' && this.password === 'password') {
      this.error = '';
      this.router.navigate(['/home']);
    } else {
      this.error = 'Invalid credentials. Use user/password';
    }
  }
}
