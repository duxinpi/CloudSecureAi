import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginRequest, RegisterRequest } from './models/auth.model';

interface LoginData {
  username: string;
  password: string;
}

interface SignupData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'could-secure-ai-ui';
  showLoginModal = false;
  showSignupModal = false;
  isAuthenticated = false;
  isCollapsed = false;
  errorMessage = '';
  currentUser: any = null;
  isSecurityRoute = false;
  
  loginData: LoginData = {
    username: '',
    password: ''
  };
  
  signupData: SignupData = {
    fullName: '',
    username: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Subscribe to authentication changes
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });

    // Get current user if authenticated
    if (this.isAuthenticated) {
      this.currentUser = this.authService.currentUserValue;
    }

    // Track current route for landing-page conditional rendering
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isSecurityRoute = event.urlAfterRedirects.startsWith('/security');
      }
    });
  }

  showLogin() {
    this.showLoginModal = true;
    this.showSignupModal = false;
  }

  showSignup() {
    this.showSignupModal = true;
    this.showLoginModal = false;
  }

  closeModal(event?: Event) {
    this.showLoginModal = false;
    this.showSignupModal = false;
    this.errorMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    
    const loginRequest: LoginRequest = {
      username: this.loginData.username,
      password: this.loginData.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        if (response.token) {
          this.closeModal();
          this.router.navigate(['/dashboard']);
          // Reset form
          this.loginData = { username: '', password: '' };
        } else {
          this.errorMessage = response.message || 'Login failed';
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  onSignup() {
    this.errorMessage = '';
    
    // Split full name into first and last name
    const nameParts = this.signupData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const registerRequest: RegisterRequest = {
      username: this.signupData.username,
      email: this.signupData.email,
      password: this.signupData.password,
      firstName: firstName,
      lastName: lastName
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        if (response.token) {
          this.closeModal();
          this.router.navigate(['/dashboard']);
          // Reset form
          this.signupData = { fullName: '', username: '', email: '', password: '' };
        } else {
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  startTrial() {
    this.showSignup();
  }

  watchDemo() {
    alert('Demo video coming soon!');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  goDashboard() {
    if (this.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  goToHome() {
    if (this.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  showAbout() {
    // Show about modal or navigate to about page
    alert('About CouldSecureAI - Enterprise Cloud Security Platform');
  }
}
