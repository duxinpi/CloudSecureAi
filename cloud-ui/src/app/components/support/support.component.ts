import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  supportData = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  };

  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    // Reset messages
    this.successMessage = '';
    this.errorMessage = '';

    // Validate all fields are filled
    if (!this.supportData.firstName || !this.supportData.lastName || 
        !this.supportData.phone || !this.supportData.email || 
        !this.supportData.message) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.isSubmitting = true;

    // Send to backend
    this.http.post('http://localhost:8080/api/support/send', this.supportData)
      .subscribe({
        next: (response: any) => {
          this.successMessage = 'Your message has been sent successfully! We will get back to you soon.';
          // Reset form
          this.supportData = {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            message: ''
          };
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to send message. Please try again later.';
          console.error('Error sending support message:', error);
          this.isSubmitting = false;
        }
      });
  }
}

