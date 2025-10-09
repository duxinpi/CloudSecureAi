import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  supportForm = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      firstName: this.supportForm.firstName,
      lastName: this.supportForm.lastName,
      phone: this.supportForm.phone,
      email: this.supportForm.email,
      message: this.supportForm.message,
      to: 'sadhwanijosue35@outlook.com',
      from: 'sadhwanijosue35@outlook.com'
    };

    this.http.post('http://localhost:8080/api/support/contact', payload)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.resetForm();
          setTimeout(() => {
            this.submitSuccess = false;
          }, 5000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Failed to send message. Please try again.';
        }
      });
  }

  isFormValid(): boolean {
    return !!(
      this.supportForm.firstName &&
      this.supportForm.lastName &&
      this.supportForm.phone &&
      this.supportForm.email &&
      this.supportForm.message
    );
  }

  resetForm() {
    this.supportForm = {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      message: ''
    };
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

